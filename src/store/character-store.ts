import { create } from "zustand"
import { db, type Character, DEFAULT_CHARACTER } from "@/lib/db"
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import { auth } from "@/lib/firebase"
import { nanoid } from "nanoid"

interface CharacterState {
  characters: Character[]
  currentCharacter: Character | null
  loading: boolean
  error: string | null
  isSaving: boolean

  // Actions
  fetchCharacters: () => Promise<void>
  fetchCharacter: (id: string) => Promise<Character | null>
  createCharacter: (characterData: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, characterData: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  setCurrentCharacter: (character: Character | null) => void
  saveCharacter: (id: string) => Promise<void>

  // Character sheet specific actions
  updateAbilityScore: (ability: keyof Character["abilityScores"], value: number) => void
  toggleSavingThrowProficiency: (ability: keyof Character["abilityScores"]) => void
  toggleSkillProficiency: (skillName: string) => void
  toggleSkillExpertise: (skillName: string) => void
  updateHitPoints: (type: keyof Character["hitPoints"], value: number) => void
  updateArmorClass: (value: number) => void
  updateSpeed: (value: number) => void
  toggleInspiration: () => void
  toggleCombatMode: () => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,
  isSaving: false,

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

      // Update local DB with Firebase data
      await Promise.all(firebaseCharacters.map((character) => db.characters.put(character)))

      // Update state with Firebase data
      set({ characters: firebaseCharacters, loading: false })
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

      // If not in IndexedDB, try to get from Firebase
      const characterSnapshot = await getDocs(
        query(collection(db.firebase, "characters"), where("id", "==", id), where("userId", "==", currentUser.uid)),
      )

      if (!characterSnapshot.empty) {
        const data = characterSnapshot.docs[0].data() as Partial<Character>

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

      return null
    } catch (error) {
      console.error("Error fetching character:", error)
      set({ error: "Failed to fetch character" })
      return null
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

    // Create a properly typed character object
    const newCharacter: Character = {
      ...(DEFAULT_CHARACTER as Character),
      ...characterData,
      id: nanoid(),
      userId: currentUser.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
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

      // Then save to Firebase
      set({ isSaving: true })
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
        isSaving: false,
        characters: get().characters.map((c) => (c.id === newCharacter.id ? updatedCharacter : c)),
        currentCharacter: updatedCharacter,
      })

      return updatedCharacter
    } catch (error) {
      console.error("Error creating character:", error)
      set({ isSaving: false })
      throw new Error("Failed to create character")
    }
  },

  updateCharacter: async (id, characterData) => {
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

      const updatedCharacter: Character = {
        ...characters[characterIndex],
        ...characterData,
        updatedAt: Date.now(),
        syncStatus: "local" as const,
      }

      // Update in local DB
      await db.characters.update(id, {
        ...characterData,
        updatedAt: Date.now(),
        syncStatus: "local",
      })

      // Update state
      const updatedCharacters = [...characters]
      updatedCharacters[characterIndex] = updatedCharacter

      set({
        characters: updatedCharacters,
        currentCharacter: currentCharacter?.id === id ? updatedCharacter : currentCharacter,
      })
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
      const { characters, currentCharacter } = get()
      set({
        characters: characters.filter((c) => c.id !== id),
        currentCharacter: currentCharacter?.id === id ? null : currentCharacter,
      })
    } catch (error) {
      console.error("Error deleting character:", error)
      throw new Error("Failed to delete character")
    }
  },

  setCurrentCharacter: (character) => {
    set({ currentCharacter: character })
  },

  saveCharacter: async (id) => {
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

  // Character sheet specific actions
  updateAbilityScore: (ability, value) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedCharacter: Character = {
      ...currentCharacter,
      abilityScores: {
        ...currentCharacter.abilityScores,
        [ability]: value,
      },
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      abilityScores: updatedCharacter.abilityScores,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  toggleSavingThrowProficiency: (ability) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const isProficient = currentCharacter.proficientSavingThrows.includes(ability)
    let updatedProficiencies: Array<keyof Character["abilityScores"]>

    if (isProficient) {
      updatedProficiencies = currentCharacter.proficientSavingThrows.filter((a) => a !== ability)
    } else {
      updatedProficiencies = [...currentCharacter.proficientSavingThrows, ability]
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      proficientSavingThrows: updatedProficiencies,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      proficientSavingThrows: updatedProficiencies,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  toggleSkillProficiency: (skillName) => {
    const { currentCharacter } = get()
    if (!currentCharacter || !currentCharacter.skills[skillName]) return

    const updatedSkills = {
      ...currentCharacter.skills,
      [skillName]: {
        ...currentCharacter.skills[skillName],
        proficient: !currentCharacter.skills[skillName].proficient,
        // If turning off proficiency, also turn off expertise
        expertise: !currentCharacter.skills[skillName].proficient
          ? false
          : currentCharacter.skills[skillName].expertise,
      },
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  toggleSkillExpertise: (skillName) => {
    const { currentCharacter } = get()
    if (!currentCharacter || !currentCharacter.skills[skillName]) return

    // Can only toggle expertise if already proficient
    if (!currentCharacter.skills[skillName].proficient) return

    const updatedSkills = {
      ...currentCharacter.skills,
      [skillName]: {
        ...currentCharacter.skills[skillName],
        expertise: !currentCharacter.skills[skillName].expertise,
      },
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  updateHitPoints: (type, value) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedHitPoints = {
      ...currentCharacter.hitPoints,
      [type]: value,
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      hitPoints: updatedHitPoints,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      hitPoints: updatedHitPoints,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  updateArmorClass: (value) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedCharacter: Character = {
      ...currentCharacter,
      armorClass: value,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      armorClass: value,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  updateSpeed: (value) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedCharacter: Character = {
      ...currentCharacter,
      speed: value,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      speed: value,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  toggleInspiration: () => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedCharacter: Character = {
      ...currentCharacter,
      inspiration: !currentCharacter.inspiration,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      inspiration: updatedCharacter.inspiration,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },

  toggleCombatMode: () => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedCharacter: Character = {
      ...currentCharacter,
      combatMode: !currentCharacter.combatMode,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      combatMode: updatedCharacter.combatMode,
      syncStatus: "local" as const,
      updatedAt: Date.now(),
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })
  },
}))
