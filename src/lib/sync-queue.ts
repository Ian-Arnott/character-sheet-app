import { db } from "./db"
import { networkStatus } from "./network-utils"
import { firestore } from "./firebase"
import { doc, writeBatch } from "firebase/firestore"
import { auth } from "./firebase"

// Define the types of operations that can be queued
export type SyncOperation = {
  id: string
  type: "create" | "update" | "delete"
  collection: string
  documentId: string
  data?: any
  timestamp: number
  retryCount: number
  userId: string
}

// Create a Dexie table for the sync queue if it doesn't exist
db.version(2).stores({
  syncQueue: "++id, type, collection, documentId, timestamp, userId",
})

class SyncQueueManager {
  private isSyncing = false
  private maxRetries = 5
  private syncInterval = 30000 // 30 seconds
  private intervalId: NodeJS.Timeout | null = null
  private maxBatchSize = 500 // Firestore batch limit is 500 operations

  constructor() {
    // Start the sync process when online
    if (typeof window !== "undefined") {
      networkStatus.addListener(this.handleNetworkChange)
    }
  }

  private handleNetworkChange = (online: boolean) => {
    if (online) {
      this.startSync()
    } else {
      this.stopSync()
    }
  }

  // Add an operation to the queue
  public async addToQueue(operation: Omit<SyncOperation, "id" | "timestamp" | "retryCount" | "userId">): Promise<void> {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.warn("Cannot add to sync queue: No user is authenticated")
      return
    }

    try {
      // Check if there's already an operation for this document
      const existingOps = await db.syncQueue
        .where("documentId")
        .equals(operation.documentId)
        .and((op) => op.collection === operation.collection && op.userId === currentUser.uid)
        .toArray()

      if (existingOps.length > 0) {
        // If there's a delete operation, keep it (it takes precedence)
        if (existingOps.some((op) => op.type === "delete")) {
          // If we're also trying to delete, do nothing
          if (operation.type === "delete") {
            return
          }
          // Otherwise, we're trying to update a document marked for deletion
          // This is unusual, so we'll remove the delete operation and add an update
          await db.syncQueue.where("documentId").equals(operation.documentId).delete()
        } else {
          // For other operations, just update the existing one with new data
          const latestOp = existingOps.reduce(
            (latest, op) => (op.timestamp > latest.timestamp ? op : latest),
            existingOps[0],
          )

          await db.syncQueue.update(latestOp.id, {
            type: operation.type, // Use the new operation type
            data: operation.data, // Use the new data
            timestamp: Date.now(),
            retryCount: 0, // Reset retry count
          })

          // If we're online, start syncing immediately
          if (networkStatus.isOnline()) {
            this.startSync()
          }

          return
        }
      }

      // If we get here, we need to add a new operation
      await db.syncQueue.add({
        ...operation,
        timestamp: Date.now(),
        retryCount: 0,
        userId: currentUser.uid,
      })

      // If we're online, start syncing immediately
      if (networkStatus.isOnline()) {
        this.startSync()
      }
    } catch (error) {
      console.error("Error adding operation to sync queue:", error)
    }
  }

  // Start the sync process
  public startSync(): void {
    if (this.isSyncing || this.intervalId) return

    this.isSyncing = true
    this.processQueue().finally(() => {
      this.isSyncing = false
    })

    // Set up interval for periodic syncing
    this.intervalId = setInterval(() => {
      if (!this.isSyncing) {
        this.isSyncing = true
        this.processQueue().finally(() => {
          this.isSyncing = false
        })
      }
    }, this.syncInterval)
  }

  // Stop the sync process
  public stopSync(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isSyncing = false
  }

  // Process the queue
  private async processQueue(): Promise<void> {
    if (!networkStatus.isOnline()) {
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) {
      return
    }

    try {
      // Get all operations for the current user, ordered by timestamp
      const operations = await db.syncQueue.where("userId").equals(currentUser.uid).sortBy("timestamp")

      if (operations.length === 0) {
        return
      }

      // Group operations by collection for batching
      const operationsByCollection: Record<string, SyncOperation[]> = {}

      for (const operation of operations) {
        if (!operationsByCollection[operation.collection]) {
          operationsByCollection[operation.collection] = []
        }
        operationsByCollection[operation.collection].push({ ...operation, id: String(operation.id) })
      }

      // Process each collection's operations in batches
      for (const [collection, collectionOps] of Object.entries(operationsByCollection)) {
        // Process in batches of maxBatchSize
        for (let i = 0; i < collectionOps.length; i += this.maxBatchSize) {
          const batchOps = collectionOps.slice(i, i + this.maxBatchSize)
          try {
            await this.processBatch(collection, batchOps)

            // If successful, remove processed operations from queue
            await db.syncQueue.bulkDelete(batchOps.map((op) => Number(op.id)))
          } catch (error) {
            console.error(`Error processing batch for collection ${collection}:`, error)

            // Update retry counts for failed operations
            for (const operation of batchOps) {
              const opId = Number(operation.id)
              const op = await db.syncQueue.get(opId)

              if (op) {
                op.retryCount++

                // If we've exceeded max retries, remove from queue
                if (op.retryCount > this.maxRetries) {
                  console.warn(`Operation ${opId} exceeded max retries, removing from queue`)
                  await db.syncQueue.delete(opId)
                } else {
                  // Otherwise update the retry count
                  await db.syncQueue.update(opId, { retryCount: op.retryCount })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error processing sync queue:", error)
    }
  }

  // Process a batch of operations for a single collection
  private async processBatch(collection: string, operations: SyncOperation[]): Promise<void> {
    const batch = writeBatch(firestore)

    // Group operations by document ID to ensure we only apply the latest
    const latestOpsByDocId: Record<string, SyncOperation> = {}

    // Find the latest operation for each document
    for (const operation of operations) {
      const existing = latestOpsByDocId[operation.documentId]
      if (!existing || operation.timestamp > existing.timestamp) {
        latestOpsByDocId[operation.documentId] = operation
      }
    }

    // Apply the latest operations to the batch
    for (const operation of Object.values(latestOpsByDocId)) {
      const { type, documentId, data } = operation
      const docRef = doc(firestore, collection, documentId)

      switch (type) {
        case "create":
        case "update":
          if (!data) {
            throw new Error(`No data provided for ${type} operation`)
          }
          batch.set(docRef, data)
          break
        case "delete":
          batch.delete(docRef)
          break
        default:
          throw new Error(`Unknown operation type: ${type}`)
      }
    }

    // Commit the batch
    await batch.commit()
  }

  // Check if there are any pending operations
  public async hasPendingOperations(): Promise<boolean> {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return false
    }

    const count = await db.syncQueue.where("userId").equals(currentUser.uid).count()
    return count > 0
  }

  // Clean up resources
  public cleanup(): void {
    this.stopSync()
    if (typeof window !== "undefined") {
      networkStatus.cleanup()
    }
  }
}

// Create a singleton instance
export const syncQueue = new SyncQueueManager()
