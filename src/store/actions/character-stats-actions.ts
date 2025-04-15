import { db, type Character } from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import type { CharacterState } from "../character-store"

export const createCharacterStatsActions = (set: any, get: () => CharacterState) => ({
  updateHitPoints: (type: keyof Character["hitPoints"], value: number) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const updatedHitPoints = {
      ...currentCharacter.hitPoints,
      [type]: value,
    }

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      hitPoints: updatedHitPoints,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      hitPoints: updatedHitPoints,
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

  updateArmorClass: (value: number) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      armorClass: value,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      armorClass: value,
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

  updateSpeed: (value: number) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      speed: value,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      speed: value,
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

  toggleInspiration: () => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      inspiration: !currentCharacter.inspiration,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      inspiration: updatedCharacter.inspiration,
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
