import { create } from "zustand"
import type { Character } from "@/lib/db"
import { networkStatus } from "@/lib/network-utils"
import { createCharacterBaseActions } from "./actions/character-base-actions"
import { createAbilityScoreActions } from "./actions/ability-score-actions"
import { createSkillActions } from "./actions/skill-actions"
import { createCharacterStatsActions } from "./actions/character-stats-actions"
import { createCombatActions, type CombatState } from "./actions/combat-actions"

// Update the Character interface to include combatState
declare module "@/lib/db" {
  interface Character {
    combatState?: CombatState | null
  }
}

export interface CharacterState {
  characters: Character[]
  currentCharacter: Character | null
  loading: boolean
  error: string | null
  isSaving: boolean
  isOnline: boolean
  hasPendingChanges: boolean

  // Base actions
  fetchCharacters: () => Promise<void>
  fetchCharacter: (id: string) => Promise<Character | null>
  createCharacter: (characterData: Partial<Character>) => Promise<Character>
  updateCharacter: (id: string, characterData: Partial<Character>) => Promise<void>
  deleteCharacter: (id: string) => Promise<void>
  setCurrentCharacter: (character: Character | null) => void
  saveCharacter: (id: string) => Promise<void>
  checkNetworkStatus: () => boolean
  checkPendingChanges: () => Promise<boolean>

  // Ability score actions
  updateAbilityScore: (ability: keyof Character["abilityScores"], value: number) => void
  toggleSavingThrowProficiency: (ability: keyof Character["abilityScores"]) => void

  // Skill actions
  toggleSkillProficiency: (skillName: string) => void
  toggleSkillExpertise: (skillName: string) => void

  // Character stats actions
  updateHitPoints: (type: keyof Character["hitPoints"], value: number) => void
  updateArmorClass: (value: number) => void
  updateSpeed: (value: number) => void
  toggleInspiration: () => void

  // Combat actions
  toggleCombatMode: () => void
  startTurn: () => void
  endTurn: () => void
  nextRound: () => void
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  currentCharacter: null,
  loading: false,
  error: null,
  isSaving: false,
  isOnline: networkStatus.isOnline(),
  hasPendingChanges: false,

  // Combine all actions
  ...createCharacterBaseActions(set, get),
  ...createAbilityScoreActions(set, get),
  ...createSkillActions(set, get),
  ...createCharacterStatsActions(set, get),
  ...createCombatActions(set, get),
}))

// Helper function to merge local and remote characters
// Prioritizes local changes in case of conflicts
async function mergeCharacters(localCharacters: Character[], remoteCharacters: Character[]): Promise<Character[]> {
  const mergedCharacters: Character[] = []
  const localMap = new Map(localCharacters.map((char) => [char.id, char]))
  const remoteMap = new Map(remoteCharacters.map((char) => [char.id, char]))

  // Process all local characters
  for (const localChar of localCharacters) {
    const remoteChar = remoteMap.get(localChar.id)

    if (!remoteChar) {
      // Character exists only locally
      mergedCharacters.push(localChar)
      continue
    }

    // Character exists both locally and remotely
    if (localChar.syncStatus === "local") {
      // Local changes take precedence
      mergedCharacters.push(localChar)
    } else if (localChar.lastModified > remoteChar.lastModified) {
      // Local is newer
      mergedCharacters.push(localChar)
    } else {
      // Remote is newer or same age
      mergedCharacters.push(remoteChar)
    }

    // Remove from remote map to track processed characters
    remoteMap.delete(localChar.id)
  }

  // Add remaining remote characters (ones that don't exist locally)
  for (const [_, remoteChar] of remoteMap) {
    mergedCharacters.push(remoteChar)
  }

  return mergedCharacters
}
