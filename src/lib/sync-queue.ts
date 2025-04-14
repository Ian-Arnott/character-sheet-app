import { db } from "./db"
import { networkStatus } from "./network-utils"
import { firestore } from "./firebase"
import { doc, setDoc, deleteDoc } from "firebase/firestore"
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

      // Process each operation
      for (const operation of operations) {
        try {
          await this.processOperation(operation)
          // If successful, remove from queue
          await db.syncQueue.delete(operation.id)
        } catch (error) {
          console.error(`Error processing operation ${operation.id}:`, error)

          // Increment retry count
          operation.retryCount++

          // If we've exceeded max retries, remove from queue
          if (operation.retryCount > this.maxRetries) {
            console.warn(`Operation ${operation.id} exceeded max retries, removing from queue`)
            await db.syncQueue.delete(operation.id)
          } else {
            // Otherwise update the retry count
            await db.syncQueue.update(operation.id, { retryCount: operation.retryCount })
          }
        }
      }
    } catch (error) {
      console.error("Error processing sync queue:", error)
    }
  }

  // Process a single operation
  private async processOperation(operation: SyncOperation): Promise<void> {
    const { type, collection, documentId, data } = operation

    switch (type) {
      case "create":
      case "update":
        if (!data) {
          throw new Error(`No data provided for ${type} operation`)
        }
        await setDoc(doc(firestore, collection, documentId), data)
        break
      case "delete":
        await deleteDoc(doc(firestore, collection, documentId))
        break
      default:
        throw new Error(`Unknown operation type: ${type}`)
    }
  }

  // Get the current queue length
  public async getQueueLength(): Promise<number> {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return 0
    }

    return await db.syncQueue.where("userId").equals(currentUser.uid).count()
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
