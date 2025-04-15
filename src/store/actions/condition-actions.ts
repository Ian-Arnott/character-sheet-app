import {
  db,
  type Character,
  type ConditionType,
  type Condition,
  type Resistance,
  type DamageType,
  type ResistanceType,
} from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import type { CharacterState } from "../character-store"

export const createConditionActions = (set: any, get: () => CharacterState) => ({
  // Condition Immunity Actions
  addConditionImmunity: (conditionType: ConditionType) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    // Check if already immune
    if (currentCharacter.conditionImmunities.includes(conditionType)) return

    const updatedImmunities = [...currentCharacter.conditionImmunities, conditionType]

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      conditionImmunities: updatedImmunities,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      conditionImmunities: updatedImmunities,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },

  removeConditionImmunity: (conditionType: ConditionType) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedImmunities = currentCharacter.conditionImmunities.filter((immunity) => immunity !== conditionType)

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      conditionImmunities: updatedImmunities,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      conditionImmunities: updatedImmunities,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },

  // Active Conditions Actions
  addActiveCondition: (condition: Condition) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return false

    // Check if immune to this condition
    if (currentCharacter.conditionImmunities.includes(condition.type)) {
      return false
    }

    // Check if already has this condition
    const existingConditionIndex = currentCharacter.activeConditions.findIndex((c) => c.type === condition.type)

    const updatedConditions = [...currentCharacter.activeConditions]

    if (existingConditionIndex >= 0) {
      // Replace existing condition
      updatedConditions[existingConditionIndex] = condition
    } else {
      // Add new condition
      updatedConditions.push(condition)
    }

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      activeConditions: updatedConditions,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      activeConditions: updatedConditions,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })

    return true
  },

  removeActiveCondition: (conditionType: ConditionType) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedConditions = currentCharacter.activeConditions.filter((condition) => condition.type !== conditionType)

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      activeConditions: updatedConditions,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      activeConditions: updatedConditions,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },

  // Resistance Actions
  addResistance: (resistance: Resistance) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    // Check if already has this resistance
    const existingResistanceIndex = currentCharacter.resistances.findIndex(
      (r) => r.damageType === resistance.damageType && r.type === resistance.type,
    )

    if (existingResistanceIndex >= 0) return // Already exists

    const updatedResistances = [...currentCharacter.resistances, resistance]

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      resistances: updatedResistances,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      resistances: updatedResistances,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },

  removeResistance: (damageType: DamageType, resistanceType: ResistanceType) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedResistances = currentCharacter.resistances.filter(
      (r) => !(r.damageType === damageType && r.type === resistanceType),
    )

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      resistances: updatedResistances,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      resistances: updatedResistances,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },

  // Exhaustion Actions
  updateExhaustionLevel: (level: number) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    // Ensure level is between 0 and 10 (5e uses 0-5, but some variants go higher)
    const validLevel = Math.max(0, Math.min(10, level))

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      exhaustionLevel: validLevel,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      exhaustionLevel: validLevel,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    })

    // Update state
    set({
      currentCharacter: updatedCharacter,
      characters: get().characters.map((c) => (c.id === currentCharacter.id ? updatedCharacter : c)),
    })

    // Add to sync queue for later
    syncQueue
      .addToQueue({
        type: "update",
        collection: "characters",
        documentId: currentCharacter.id,
        data: updatedCharacter,
      })
      .then(() => {
        // Update pending changes flag
        get().checkPendingChanges()
      })
  },
})
