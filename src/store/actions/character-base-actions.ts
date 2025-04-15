import { nanoid } from "nanoid"
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { db, type Character, DEFAULT_CHARACTER } from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import { networkStatus } from "@/lib/network-utils"
import type { CharacterState } from "../character-store"

// Base character actions for CRUD operations
export const createCharacterBaseActions = (set: any, get: () => CharacterState) => ({
  fetchCharacters: async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      set({ error: "User not authenticated" })
      return
    }

    set({ loading: true, error: null })

    try {
      // First try to get characters from IndexedDB
      const localCharacters = await db.characters.where("userId").equals(currentUser.uid).toArray()

      // Set characters from local DB first for instant loading
      if (localCharacters.length > 0) {
        set({ characters: localCharacters })
      }

      // Then fetch from Firebase if online
      if (networkStatus.isOnline()) {
        try {
          const charactersRef = collection(db.firebase, "characters")
          const q = query(charactersRef, where("userId", "==", currentUser.uid))
          const querySnapshot = await getDocs(q)

          const firebaseCharacters: Character[] = []
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Partial<Character>

            // Ensure all required fields exist and correct type for syncStatus
            const character: Character = {
              ...(DEFAULT_CHARACTER as Character),
              ...data,
              syncStatus: "synced" as const,
              lastSyncedAt: Date.now(),
            }

            firebaseCharacters.push(character)
          })

          // Merge with local data, prioritizing local changes
          const mergedCharacters = await mergeCharacters(localCharacters, firebaseCharacters)

          // Update local DB with merged data
          await Promise.all(mergedCharacters.map((character) => db.characters.put(character)))

          // Update state with merged data
          set({ characters: mergedCharacters })
        } catch (error) {
          console.error("Error fetching characters from Firebase:", error)
          // Continue with local data
        }
      }

      set({ loading: false })

      // Check if there are pending changes
      get().checkPendingChanges()
    } catch (error) {
      console.error("Error fetching characters:", error)
      set({ error: "Failed to fetch characters", loading: false })
    }
  },

  fetchCharacter: async (id: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      set({ error: "User not authenticated" })
      return null
    }

    try {
      // First try to get character from local state
      const { characters } = get()
      let character = characters.find((c) => c.id === id)

      if (character) {
        set({ currentCharacter: character })
        return character
      }

      // If not in state, try to get from IndexedDB
      character = await db.characters.get(id)

      if (character && character.userId === currentUser.uid) {
        set({ currentCharacter: character })
        return character
      }

      // If not in IndexedDB and we're online, try to get from Firebase
      if (networkStatus.isOnline()) {
        try {
          const characterDoc = await getDoc(doc(db.firebase, "characters", id))

          if (characterDoc.exists() && characterDoc.data().userId === currentUser.uid) {
            const data = characterDoc.data() as Partial<Character>

            // Ensure all required fields exist and correct type for syncStatus
            character = {
              ...(DEFAULT_CHARACTER as Character),
              ...data,
              syncStatus: "synced" as const,
              lastSyncedAt: Date.now(),
            }

            // Update local DB
            await db.characters.put(character)

            set({ currentCharacter: character })
            return character
          }
        } catch (error) {
          console.error("Error fetching character from Firebase:", error)
          // Continue with local data or return null
        }
      }

      return null
    } catch (error) {
      console.error("Error fetching character:", error)
      set({ error: "Failed to fetch character" })
      return null
    }
  },

  createCharacter: async (characterData: Partial<Character>) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    // Check if user already has 3 characters
    const { characters } = get()
    if (characters.length >= 3) {
      throw new Error("Maximum of 3 characters allowed")
    }

    const timestamp = Date.now()

    // Create a properly typed character object
    const newCharacter: Character = {
      ...(DEFAULT_CHARACTER as Character),
      ...characterData,
      id: nanoid(),
      userId: currentUser.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastModified: timestamp,
      syncStatus: "local" as const,
      lastSyncedAt: null,
    }

    try {
      // Save to local DB first
      await db.characters.put(newCharacter)

      // Update state
      set({
        characters: [...get().characters, newCharacter],
        currentCharacter: newCharacter,
      })

      // Then save to Firebase if online
      if (networkStatus.isOnline()) {
        set({ isSaving: true })
        try {
          await setDoc(doc(db.firebase, "characters", newCharacter.id), newCharacter)

          // Update sync status
          const updatedCharacter: Character = {
            ...newCharacter,
            syncStatus: "synced" as const,
            lastSyncedAt: Date.now(),
          }

          await db.characters.update(newCharacter.id, {
            syncStatus: "synced" as const,
            lastSyncedAt: Date.now(),
          })

          set({
            characters: get().characters.map((c) => (c.id === newCharacter.id ? updatedCharacter : c)),
            currentCharacter: updatedCharacter,
          })
        } catch (error) {
          console.error("Error saving to Firebase:", error)

          // Add to sync queue for later
          await syncQueue.addToQueue({
            type: "create",
            collection: "characters",
            documentId: newCharacter.id,
            data: newCharacter,
          })

          // Update pending changes flag
          get().checkPendingChanges()
        }
        set({ isSaving: false })
      } else {
        // Add to sync queue for later
        await syncQueue.addToQueue({
          type: "create",
          collection: "characters",
          documentId: newCharacter.id,
          data: newCharacter,
        })

        // Update pending changes flag
        get().checkPendingChanges()
      }

      return newCharacter
    } catch (error) {
      console.error("Error creating character:", error)
      set({ isSaving: false })
      throw new Error("Failed to create character")
    }
  },

  updateCharacter: async (id: string, characterData: Partial<Character>) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    try {
      const { characters, currentCharacter } = get()
      const characterIndex = characters.findIndex((c) => c.id === id)

      if (characterIndex === -1) {
        throw new Error("Character not found")
      }

      const timestamp = Date.now()
      const updatedCharacter: Character = {
        ...characters[characterIndex],
        ...characterData,
        updatedAt: timestamp,
        lastModified: timestamp,
        syncStatus: "local" as const,
      }

      // Update in local DB
      await db.characters.update(id, {
        ...characterData,
        updatedAt: timestamp,
        lastModified: timestamp,
        syncStatus: "local" as const,
      })

      // Update state
      const updatedCharacters = [...characters]
      updatedCharacters[characterIndex] = updatedCharacter

      set({
        characters: updatedCharacters,
        currentCharacter: currentCharacter?.id === id ? updatedCharacter : currentCharacter,
      })

      // Add to sync queue for later
      await syncQueue.addToQueue({
        type: "update",
        collection: "characters",
        documentId: id,
        data: updatedCharacter,
      })

      // Update pending changes flag
      get().checkPendingChanges()
    } catch (error) {
      console.error("Error updating character:", error)
      throw new Error("Failed to update character")
    }
  },

  deleteCharacter: async (id: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    try {
      // Delete from local DB first
      await db.characters.delete(id)

      // Update state
      const { characters, currentCharacter } = get()
      set({
        characters: characters.filter((c) => c.id !== id),
        currentCharacter: currentCharacter?.id === id ? null : currentCharacter,
      })

      // Then delete from Firebase if online
      if (networkStatus.isOnline()) {
        try {
          await deleteDoc(doc(db.firebase, "characters", id))
        } catch (error) {
          console.error("Error deleting from Firebase:", error)

          // Add to sync queue for later
          await syncQueue.addToQueue({
            type: "delete",
            collection: "characters",
            documentId: id,
          })
        }
      } else {
        // Add to sync queue for later
        await syncQueue.addToQueue({
          type: "delete",
          collection: "characters",
          documentId: id,
        })
      }

      // Update pending changes flag
      get().checkPendingChanges()
    } catch (error) {
      console.error("Error deleting character:", error)
      throw new Error("Failed to delete character")
    }
  },

  setCurrentCharacter: (character: Character | null) => {
    set({ currentCharacter: character })
  },

  saveCharacter: async (id: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    const { characters } = get()
    const character = characters.find((c) => c.id === id)

    if (!character) {
      throw new Error("Character not found")
    }

    try {
      set({ isSaving: true })

      // Update sync status to syncing
      await db.characters.update(id, { syncStatus: "syncing" as const })

      // Create a properly typed character for state updates
      const syncingCharacter: Character = {
        ...character,
        syncStatus: "syncing" as const,
      }

      set({
        characters: get().characters.map((c) => (c.id === id ? syncingCharacter : c)),
        currentCharacter: get().currentCharacter?.id === id ? syncingCharacter : get().currentCharacter,
      })

      if (networkStatus.isOnline()) {
        try {
          // Save to Firebase
          await setDoc(doc(db.firebase, "characters", id), {
            ...character,
            syncStatus: "synced",
            lastSyncedAt: Date.now(),
          })

          // Update local DB and state
          await db.characters.update(id, {
            syncStatus: "synced" as const,
            lastSyncedAt: Date.now(),
          })

          // Create a properly typed character for state updates
          const syncedCharacter: Character = {
            ...character,
            syncStatus: "synced" as const,
            lastSyncedAt: Date.now(),
          }

          set({
            isSaving: false,
            characters: get().characters.map((c) => (c.id === id ? syncedCharacter : c)),
            currentCharacter: get().currentCharacter?.id === id ? syncedCharacter : get().currentCharacter,
          })

          // Update pending changes flag
          get().checkPendingChanges()

          return
        } catch (error) {
          console.error("Error saving to Firebase:", error)
          // Fall through to offline handling
        }
      }

      // If we're offline or the Firebase save failed, add to sync queue
      await syncQueue.addToQueue({
        type: "update",
        collection: "characters",
        documentId: id,
        data: character,
      })

      // Revert sync status to local
      await db.characters.update(id, { syncStatus: "local" as const })

      // Create a properly typed character for state updates
      const localCharacter: Character = {
        ...character,
        syncStatus: "local" as const,
      }

      set({
        isSaving: false,
        characters: get().characters.map((c) => (c.id === id ? localCharacter : c)),
        currentCharacter: get().currentCharacter?.id === id ? localCharacter : get().currentCharacter,
      })

      // Update pending changes flag
      get().checkPendingChanges()
    } catch (error) {
      console.error("Error saving character:", error)

      // Revert sync status
      await db.characters.update(id, { syncStatus: "local" as const })

      // Create a properly typed character for state updates
      const localCharacter: Character = {
        ...character,
        syncStatus: "local" as const,
      }

      set({
        isSaving: false,
        characters: get().characters.map((c) => (c.id === id ? localCharacter : c)),
        currentCharacter: get().currentCharacter?.id === id ? localCharacter : get().currentCharacter,
      })

      throw new Error("Failed to save character")
    }
  },

  checkNetworkStatus: () => {
    const isOnline = networkStatus.isOnline()
    set({ isOnline })
    return isOnline
  },

  checkPendingChanges: async () => {
    const hasPendingChanges = await syncQueue.hasPendingOperations()
    set({ hasPendingChanges })
    return hasPendingChanges
  },
})

// Helper function to merge local and remote characters
// Prioritizes local changes in case of conflicts
export async function mergeCharacters(
  localCharacters: Character[],
  remoteCharacters: Character[],
): Promise<Character[]> {
  const mergedCharacters: Character[] = []
  const localMap = new Map(localCharacters.map((char) => [char.id, char]))
  const remoteMap = new Map(remoteCharacters.map((char) => [char.id, char]))

  // Process all local characters
  for (const localChar of localCharacters) {
    const remoteChar = remoteMap.get(localChar.id)

    if (!remoteChar) {
      // Character exists only locally
      mergedCharacters.push(localChar)
      continue
    }

    // Character exists both locally and remotely
    if (localChar.syncStatus === "local") {
      // Local changes take precedence
      mergedCharacters.push(localChar)
    } else if (localChar.lastModified > remoteChar.lastModified) {
      // Local is newer
      mergedCharacters.push(localChar)
    } else {
      // Remote is newer or same age
      mergedCharacters.push(remoteChar)
    }

    // Remove from remote map to track processed characters
    remoteMap.delete(localChar.id)
  }

  // Add remaining remote characters (ones that don't exist locally)
  for (const [_, remoteChar] of remoteMap) {
    mergedCharacters.push(remoteChar)
  }

  return mergedCharacters
}
