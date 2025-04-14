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
  syncStatus: "synced" | "local" | "syncing"
  lastSyncedAt: number | null
  lastModified: number // For conflict resolution
  inspiration: boolean
  combatMode: boolean

  // Character stats
  abilityScores: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  proficiencyBonus?: number // Calculated from level
  hitPoints: {
    maximum: number
    current: number
    temporary: number
  }
  armorClass: number
  initiative?: number // Calculated from dexterity
  speed: number
  proficientSavingThrows: Array<keyof Character["abilityScores"]>
  skills: {
    [key: string]: {
      ability: keyof Character["abilityScores"]
      proficient: boolean
      expertise: boolean
    }
  }
  passivePerception?: number // Calculated
}

// Define the sync queue item interface
export interface SyncQueueItem {
  id?: number
  type: "create" | "update" | "delete"
  collection: string
  documentId: string
  data?: any
  timestamp: number
  retryCount: number
  userId: string
}

// Default character values
export const DEFAULT_CHARACTER: Partial<Character> = {
  name: "New Character",
  level: 1,
  class: "",
  subclass: null,
  abilityScores: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  hitPoints: {
    maximum: 10,
    current: 10,
    temporary: 0,
  },
  armorClass: 10,
  speed: 30,
  proficientSavingThrows: [],
  skills: {
    acrobatics: { ability: "dexterity", proficient: false, expertise: false },
    animalHandling: { ability: "wisdom", proficient: false, expertise: false },
    arcana: { ability: "intelligence", proficient: false, expertise: false },
    athletics: { ability: "strength", proficient: false, expertise: false },
    deception: { ability: "charisma", proficient: false, expertise: false },
    history: { ability: "intelligence", proficient: false, expertise: false },
    insight: { ability: "wisdom", proficient: false, expertise: false },
    intimidation: { ability: "charisma", proficient: false, expertise: false },
    investigation: { ability: "intelligence", proficient: false, expertise: false },
    medicine: { ability: "wisdom", proficient: false, expertise: false },
    nature: { ability: "intelligence", proficient: false, expertise: false },
    perception: { ability: "wisdom", proficient: false, expertise: false },
    performance: { ability: "charisma", proficient: false, expertise: false },
    persuasion: { ability: "charisma", proficient: false, expertise: false },
    religion: { ability: "intelligence", proficient: false, expertise: false },
    sleightOfHand: { ability: "dexterity", proficient: false, expertise: false },
    stealth: { ability: "dexterity", proficient: false, expertise: false },
    survival: { ability: "wisdom", proficient: false, expertise: false },
  },
  syncStatus: "synced",
  lastSyncedAt: null,
  lastModified: Date.now(),
  inspiration: false,
  combatMode: false,
}

// Create a Dexie database class
export class CharacterDatabase extends Dexie {
  characters!: Table<Character>
  syncQueue!: Table<SyncQueueItem>
  firebase: typeof firestore

  constructor() {
    super("DndCharacterSheet")

    this.version(1).stores({
      characters: "id, userId, name, level, class, subclass, createdAt, updatedAt, syncStatus",
    })

    // Add syncQueue table in version 2
    this.version(2).stores({
      syncQueue: "++id, type, collection, documentId, timestamp, userId",
    })

    // Update characters table in version 3 to include lastModified
    this.version(3).stores({
      characters: "id, userId, name, level, class, subclass, createdAt, updatedAt, syncStatus, lastModified",
    })

    this.firebase = firestore
  }
}

// Create and export a database instance
export const db = new CharacterDatabase()

// Helper functions for character calculations
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

export function calculateSavingThrow(abilityScore: number, isProficient: boolean, proficiencyBonus: number): number {
  const abilityModifier = getAbilityModifier(abilityScore)
  return abilityModifier + (isProficient ? proficiencyBonus : 0)
}

export function calculateSkillBonus(
  abilityScore: number,
  isProficient: boolean,
  hasExpertise: boolean,
  proficiencyBonus: number,
): number {
  const abilityModifier = getAbilityModifier(abilityScore)
  let bonus = abilityModifier

  if (isProficient) {
    bonus += proficiencyBonus
  }

  if (hasExpertise) {
    bonus += proficiencyBonus
  }

  return bonus
}

export function calculatePassivePerception(
  wisdomScore: number,
  isProficient: boolean,
  hasExpertise: boolean,
  proficiencyBonus: number,
): number {
  const perceptionBonus = calculateSkillBonus(wisdomScore, isProficient, hasExpertise, proficiencyBonus)
  return 10 + perceptionBonus
}
