import { db, type Character } from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import type { CharacterState } from "../character-store"

export const createAbilityScoreActions = (set: any, get: () => CharacterState) => ({
  updateAbilityScore: (ability: keyof Character["abilityScores"], value: number) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      abilityScores: {
        ...currentCharacter.abilityScores,
        [ability]: value,
      },
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      abilityScores: updatedCharacter.abilityScores,
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

  toggleSavingThrowProficiency: (ability: keyof Character["abilityScores"]) => {
    const { currentCharacter } = get()
    if (!currentCharacter) return

    const isProficient = currentCharacter.proficientSavingThrows.includes(ability)
    let updatedProficiencies: Array<keyof Character["abilityScores"]>

    if (isProficient) {
      updatedProficiencies = currentCharacter.proficientSavingThrows.filter((a) => a !== ability)
    } else {
      updatedProficiencies = [...currentCharacter.proficientSavingThrows, ability]
    }

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      proficientSavingThrows: updatedProficiencies,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      proficientSavingThrows: updatedProficiencies,
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
