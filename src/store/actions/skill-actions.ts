import { db, type Character } from "@/lib/db"
import { syncQueue } from "@/lib/sync-queue"
import type { CharacterState } from "../character-store"

export const createSkillActions = (set: any, get: () => CharacterState) => ({
  toggleSkillProficiency: (skillName: string) => {
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

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      skills: updatedSkills,
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

  toggleSkillExpertise: (skillName: string) => {
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

    const timestamp = Date.now()
    const updatedCharacter: Character = {
      ...currentCharacter,
      skills: updatedSkills,
      syncStatus: "local" as const,
      updatedAt: timestamp,
      lastModified: timestamp,
    }

    // Update in local DB
    db.characters.update(currentCharacter.id, {
      skills: updatedSkills,
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
