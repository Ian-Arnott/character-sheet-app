import { create } from "zustand"
import { type Character, addCharacter, deleteCharacter, getAllCharacters, updateCharacter } from "@/lib/db"

interface CharacterState {
  characters: Character[]
  selectedCharacterId: number | null
  fetchCharacters: () => Promise<void>
  createCharacter: () => Promise<number>
  updateCharacter: (id: number, data: Partial<Character>) => Promise<void>
  deleteCharacter: (id: number | undefined) => Promise<void>
  selectCharacter: (id: number | null) => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  selectedCharacterId: null,

  fetchCharacters: async () => {
    const characters = await getAllCharacters()
    set({ characters })
  },

  createCharacter: async () => {
    // Create a new character with default values
    const defaultCharacter = {
      name: "New Character",
      race: "",
      class: "",
      level: 1,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      hitPoints: 10,
      maxHitPoints: 10,
      armorClass: 10,
    }

    const id = await addCharacter(defaultCharacter)
    await get().fetchCharacters()
    set({ selectedCharacterId: id })
    return id
  },

  updateCharacter: async (id, data) => {
    await updateCharacter(id, data)
    await get().fetchCharacters()
  },

  deleteCharacter: async (id) => {
    if (id === undefined) return
    await deleteCharacter(id)
    await get().fetchCharacters()
    if (get().selectedCharacterId === id) {
      set({ selectedCharacterId: null })
    }
  },

  selectCharacter: (id) => {
    set({ selectedCharacterId: id })
  },
}))
