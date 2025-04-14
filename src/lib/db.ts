import Dexie, { type Table } from "dexie"
import { firestore } from "./firebase"

// Define the Character interface
export interface Character {
  id: string
  userId: string
  name: string
  level: number
  class: string
  subclass: string | null
  createdAt: number
  updatedAt: number
}

// Create a Dexie database class
export class CharacterDatabase extends Dexie {
  characters!: Table<Character>
  firebase: typeof firestore

  constructor() {
    super("DndCharacterSheet")

    this.version(1).stores({
      characters: "id, userId, name, level, class, subclass, createdAt, updatedAt",
    })

    this.firebase = firestore
  }
}

// Create and export a database instance
export const db = new CharacterDatabase()
