import { create } from "zustand"
import { db, type Character } from "@/lib/db"
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { nanoid } from "nanoid"

interface CharacterState {
  characters: Character[]
  loading: boolean
  error: string | null

  // Actions
  fetchCharacters: () => Promise<void>
  createCharacter: (characterData: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, characterData: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  loading: false,
  error: null,

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

      // Then fetch from Firebase to ensure we have the latest data
      const charactersRef = collection(db.firebase, "characters")
      const q = query(charactersRef, where("userId", "==", currentUser.uid))
      const querySnapshot = await getDocs(q)

      const firebaseCharacters: Character[] = []
      querySnapshot.forEach((doc) => {
        firebaseCharacters.push(doc.data() as Character)
      })

      // Update local DB with Firebase data
      await Promise.all(firebaseCharacters.map((character) => db.characters.put(character)))

      // Update state with Firebase data
      set({ characters: firebaseCharacters, loading: false })
    } catch (error) {
      console.error("Error fetching characters:", error)
      set({ error: "Failed to fetch characters", loading: false })
    }
  },

  createCharacter: async (characterData) => {
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
    const newCharacter: Character = {
      id: nanoid(),
      userId: currentUser.uid,
      name: characterData.name || "New Character",
      level: characterData.level || 1,
      class: characterData.class || "",
      subclass: characterData.subclass || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    try {
      // Save to Firebase
      await setDoc(doc(db.firebase, "characters", newCharacter.id), newCharacter)

      // Save to local DB
      await db.characters.put(newCharacter)

      // Update state
      set({ characters: [...get().characters, newCharacter] })

      return newCharacter
    } catch (error) {
      console.error("Error creating character:", error)
      throw new Error("Failed to create character")
    }
  },

  updateCharacter: async (id, characterData) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    try {
      const { characters } = get()
      const characterIndex = characters.findIndex((c) => c.id === id)

      if (characterIndex === -1) {
        throw new Error("Character not found")
      }

      const updatedCharacter = {
        ...characters[characterIndex],
        ...characterData,
        updatedAt: Date.now(),
      }

      // Update in Firebase
      await setDoc(doc(db.firebase, "characters", id), updatedCharacter, { merge: true })

      // Update in local DB
      await db.characters.update(id, updatedCharacter)

      // Update state
      const updatedCharacters = [...characters]
      updatedCharacters[characterIndex] = updatedCharacter
      set({ characters: updatedCharacters })
    } catch (error) {
      console.error("Error updating character:", error)
      throw new Error("Failed to update character")
    }
  },

  deleteCharacter: async (id) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("User not authenticated")
    }

    try {
      // Delete from Firebase
      await deleteDoc(doc(db.firebase, "characters", id))

      // Delete from local DB
      await db.characters.delete(id)

      // Update state
      const { characters } = get()
      set({ characters: characters.filter((c) => c.id !== id) })
    } catch (error) {
      console.error("Error deleting character:", error)
      throw new Error("Failed to delete character")
    }
  },
}))
