import { create } from "zustand"
import type { Character, ConditionType, Condition, Resistance, DamageType, ResistanceType } from "@/lib/db"
import { networkStatus } from "@/lib/network-utils"
import { createCharacterBaseActions } from "./actions/character-base-actions"
import { createAbilityScoreActions } from "./actions/ability-score-actions"
import { createSkillActions } from "./actions/skill-actions"
import { createCharacterStatsActions } from "./actions/character-stats-actions"
import { createCombatActions, type CombatState } from "./actions/combat-actions"
import { createConditionActions } from "./actions/condition-actions"

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

  // Condition actions
  addConditionImmunity: (conditionType: ConditionType) => void
  removeConditionImmunity: (conditionType: ConditionType) => void
  addActiveCondition: (condition: Condition) => boolean
  removeActiveCondition: (conditionType: ConditionType) => void
  addResistance: (resistance: Resistance) => void
  removeResistance: (damageType: DamageType, resistanceType: ResistanceType) => void
  updateExhaustionLevel: (level: number) => void
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
  ...createConditionActions(set, get),
}))
