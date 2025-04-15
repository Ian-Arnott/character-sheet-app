import { db, type Character } from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import type { CharacterState } from "../character-store"

export interface CombatState {
  round: number
  isPlayerTurn: boolean
}

export const createCombatActions = (set: any, get: () => CharacterState) => ({
  toggleCombatMode: () => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const timestamp = Date.now()

    // If turning on combat mode, initialize combat state
    const combatState: CombatState | null = !currentCharacter.combatMode ? { round: 1, isPlayerTurn: false } : null

    const updatedCharacter: Character = {
      ...currentCharacter,
      combatMode: !currentCharacter.combatMode,
      combatState,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      combatMode: updatedCharacter.combatMode,
      combatState: updatedCharacter.combatState,
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

  startTurn: () => {
    const { currentCharacter } = get()
    if (!currentCharacter || !currentCharacter.combatMode || !currentCharacter.combatState) return

    const timestamp = Date.now()
    const updatedCombatState: CombatState = {
      ...currentCharacter.combatState,
      isPlayerTurn: true,
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      combatState: updatedCombatState,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      combatState: updatedCombatState,
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

  endTurn: () => {
    const { currentCharacter } = get()
    if (!currentCharacter || !currentCharacter.combatMode || !currentCharacter.combatState) return

    const timestamp = Date.now()
    const updatedCombatState: CombatState = {
      ...currentCharacter.combatState,
      isPlayerTurn: false,
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      combatState: updatedCombatState,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      combatState: updatedCombatState,
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

  nextRound: () => {
    const { currentCharacter } = get()
    if (!currentCharacter || !currentCharacter.combatMode || !currentCharacter.combatState) return

    const timestamp = Date.now()
    const updatedCombatState: CombatState = {
      round: currentCharacter.combatState.round + 1,
      isPlayerTurn: false,
    }

    const updatedCharacter: Character = {
      ...currentCharacter,
      combatState: updatedCombatState,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      combatState: updatedCombatState,
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
