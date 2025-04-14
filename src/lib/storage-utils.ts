import { Character, db, SyncQueueItem } from "./db"

// In-memory fallback storage
const memoryStorage: Record<string, string> = {}

// Check if storage is available
function isStorageAvailable(type: "localStorage" | "sessionStorage"): boolean {
  try {
    const storage = window[type]
    const testKey = `__storage_test__${Math.random()}`
    storage.setItem(testKey, testKey)
    storage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Session storage with fallback
export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      if (isStorageAvailable("sessionStorage")) {
        return sessionStorage.getItem(key)
      }
      return memoryStorage[key] || null
    } catch (e) {
      console.warn("Error accessing sessionStorage:", e)
      return memoryStorage[key] || null
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (isStorageAvailable("sessionStorage")) {
        sessionStorage.setItem(key, value)
      }
      memoryStorage[key] = value
    } catch (e) {
      console.warn("Error setting sessionStorage:", e)
      memoryStorage[key] = value
    }
  },

  removeItem(key: string): void {
    try {
      if (isStorageAvailable("sessionStorage")) {
        sessionStorage.removeItem(key)
      }
      delete memoryStorage[key]
    } catch (e) {
      console.warn("Error removing from sessionStorage:", e)
      delete memoryStorage[key]
    }
  },

  clear(): void {
    try {
      if (isStorageAvailable("sessionStorage")) {
        sessionStorage.clear()
      }
      Object.keys(memoryStorage).forEach((key) => {
        delete memoryStorage[key]
      })
    } catch (e) {
      console.warn("Error clearing sessionStorage:", e)
      Object.keys(memoryStorage).forEach((key) => {
        delete memoryStorage[key]
      })
    }
  },
}

// Local storage with fallback
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (isStorageAvailable("localStorage")) {
        return localStorage.getItem(key)
      }
      return null
    } catch (e) {
      console.warn("Error accessing localStorage:", e)
      return null
    }
  },

  setItem(key: string, value: string): void {
    try {
      if (isStorageAvailable("localStorage")) {
        localStorage.setItem(key, value)
      }
    } catch (e) {
      console.warn("Error setting localStorage:", e)
    }
  },

  removeItem(key: string): void {
    try {
      if (isStorageAvailable("localStorage")) {
        localStorage.removeItem(key)
      }
    } catch (e) {
      console.warn("Error removing from localStorage:", e)
    }
  },

  clear(): void {
    try {
      if (isStorageAvailable("localStorage")) {
        localStorage.clear()
      }
    } catch (e) {
      console.warn("Error clearing localStorage:", e)
    }
  },
}

// Map of store names to their types
type StoreKeyMap = {
  characters: Character
  syncQueue: SyncQueueItem
}

// IndexedDB wrapper for additional persistence
export const indexedDBStorage = {
  async getItem<K extends keyof StoreKeyMap>(storeName: K, key: string): Promise<StoreKeyMap[K] | null> {
    try {
      return (await db[storeName].get(key)) as StoreKeyMap[K] | null
    } catch (e) {
      console.warn(`Error getting item from IndexedDB (${storeName}):`, e)
      return null
    }
  },

  async setItem<K extends keyof StoreKeyMap>(storeName: K, key: string, value: StoreKeyMap[K]): Promise<void> {
    try {
      await db[storeName].put(value as Character & SyncQueueItem, key)
    } catch (e) {
      console.warn(`Error setting item in IndexedDB (${storeName}):`, e)
    }
  },

  async removeItem<K extends keyof StoreKeyMap>(storeName: K, key: string): Promise<void> {
    try {
      await db[storeName].delete(key)
    } catch (e) {
      console.warn(`Error removing item from IndexedDB (${storeName}):`, e)
    }
  },

  async clear<K extends keyof StoreKeyMap>(storeName: K): Promise<void> {
    try {
      await db[storeName].clear()
    } catch (e) {
      console.warn(`Error clearing IndexedDB (${storeName}):`, e)
    }
  },
}
