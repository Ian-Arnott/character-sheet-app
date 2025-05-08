import { Character } from "@/types/character"
import Dexie, { type Table } from "dexie"


class DndDatabase extends Dexie {
  characters!: Table<Character>

  constructor() {
    super("DndCharacterSheetApp")

    this.version(1).stores({
      characters: "++id, name, race, class, level, createdAt, updatedAt",
    })
  }
}

export const db = new DndDatabase()

// Helper functions for database operations
export async function getAllCharacters(): Promise<Character[]> {
  return await db.characters.orderBy("updatedAt").reverse().toArray()
}

export async function getCharacterById(id: number): Promise<Character | undefined> {
  return await db.characters.get(id)
}

export async function addCharacter(character: Omit<Character, "id" | "createdAt" | "updatedAt">): Promise<number> {
  const now = new Date()
  return await db.characters.add({
    ...character,
    createdAt: now,
    updatedAt: now,
  })
}

export async function updateCharacter(
  id: number,
  character: Partial<Omit<Character, "id" | "createdAt" | "updatedAt">>,
): Promise<number> {
  return await db.characters.update(id, {
    ...character,
    updatedAt: new Date(),
  })
}

export async function deleteCharacter(id: number): Promise<void> {
  await db.characters.delete(id)
}
