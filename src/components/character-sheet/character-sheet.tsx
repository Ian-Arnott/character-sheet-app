"use client"

import { useEffect } from "react"
import { useCharacterStore } from "@/store/character-store"
import { getProficiencyBonus, calculatePassivePerception } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { SyncStatusIndicator } from "@/components/sync-status-indicator"
import { AbilityScore } from "@/components/character-sheet/ability-score"
import { SavingThrow } from "@/components/character-sheet/saving-throw"
import { Skill } from "@/components/character-sheet/skill"
import { Header } from "@/components/character-sheet/header"
import { HitPoints } from "@/components/character-sheet/hit-points"
import { Speed } from "@/components/character-sheet/speed"
import {
  CharacterTabs,
  CharacterTabsList,
  CharacterTabsTrigger,
  CharacterTabsContent,
} from "@/components/character-sheet/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye } from "lucide-react"

interface CharacterSheetProps {
  characterId: string
}

export function CharacterSheet({ characterId }: CharacterSheetProps) {
  const {
    currentCharacter,
    fetchCharacter,
    updateAbilityScore,
    toggleSavingThrowProficiency,
    toggleSkillProficiency,
    toggleSkillExpertise,
    updateHitPoints,
    updateArmorClass,
    updateSpeed,
    toggleInspiration,
    toggleCombatMode,
    saveCharacter,
    isSaving,
  } = useCharacterStore()
  const { toast } = useToast()

  useEffect(() => {
    fetchCharacter(characterId)
  }, [characterId, fetchCharacter])

  if (!currentCharacter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  const proficiencyBonus = getProficiencyBonus(currentCharacter.level)

  const handleSyncCharacter = async () => {
    try {
      await saveCharacter(currentCharacter.id)
      toast({
        title: "Character saved",
        description: "Your character has been saved to the cloud.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save character to the cloud.",
        variant: "destructive",
      })
    }
  }

  // Calculate passive perception
  const passivePerception = calculatePassivePerception(
    currentCharacter.abilityScores.wisdom,
    currentCharacter.skills.perception.proficient,
    currentCharacter.skills.perception.expertise,
    proficiencyBonus,
  )

  // Map of ability scores to their display names and abbreviations
  const abilityScores = [
    { key: "strength" as const, name: "Strength", abbr: "STR" },
    { key: "dexterity" as const, name: "Dexterity", abbr: "DEX" },
    { key: "constitution" as const, name: "Constitution", abbr: "CON" },
    { key: "intelligence" as const, name: "Intelligence", abbr: "INT" },
    { key: "wisdom" as const, name: "Wisdom", abbr: "WIS" },
    { key: "charisma" as const, name: "Charisma", abbr: "CHA" },
  ]

  // Map of skills to their display names and ability scores
  const skills = [
    { key: "acrobatics", name: "Acrobatics", ability: "dexterity" as const, abbr: "DEX" },
    { key: "animalHandling", name: "Animal Handling", ability: "wisdom" as const, abbr: "WIS" },
    { key: "arcana", name: "Arcana", ability: "intelligence" as const, abbr: "INT" },
    { key: "athletics", name: "Athletics", ability: "strength" as const, abbr: "STR" },
    { key: "deception", name: "Deception", ability: "charisma" as const, abbr: "CHA" },
    { key: "history", name: "History", ability: "intelligence" as const, abbr: "INT" },
    { key: "insight", name: "Insight", ability: "wisdom" as const, abbr: "WIS" },
    { key: "intimidation", name: "Intimidation", ability: "charisma" as const, abbr: "CHA" },
    { key: "investigation", name: "Investigation", ability: "intelligence" as const, abbr: "INT" },
    { key: "medicine", name: "Medicine", ability: "wisdom" as const, abbr: "WIS" },
    { key: "nature", name: "Nature", ability: "intelligence" as const, abbr: "INT" },
    { key: "perception", name: "Perception", ability: "wisdom" as const, abbr: "WIS" },
    { key: "performance", name: "Performance", ability: "charisma" as const, abbr: "CHA" },
    { key: "persuasion", name: "Persuasion", ability: "charisma" as const, abbr: "CHA" },
    { key: "religion", name: "Religion", ability: "intelligence" as const, abbr: "INT" },
    { key: "sleightOfHand", name: "Sleight of Hand", ability: "dexterity" as const, abbr: "DEX" },
    { key: "stealth", name: "Stealth", ability: "dexterity" as const, abbr: "DEX" },
    { key: "survival", name: "Survival", ability: "wisdom" as const, abbr: "WIS" },
  ]

  return (
    <div className="pb-20">
      {/* Character sheet header with sticky stats */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{currentCharacter.name}</h1>
        <div className="flex items-center gap-2">
          <SyncStatusIndicator
            status={currentCharacter.syncStatus}
            lastSynced={currentCharacter.lastSyncedAt}
            onClick={currentCharacter.syncStatus === "local" ? handleSyncCharacter : undefined}
          />
          {currentCharacter.syncStatus === "local" && (
            <Button size="sm" onClick={handleSyncCharacter} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Level {currentCharacter.level} {currentCharacter.class}
        {currentCharacter.subclass && ` (${currentCharacter.subclass})`}
      </div>

      <Header
        armorClass={currentCharacter.armorClass}
        dexterityScore={currentCharacter.abilityScores.dexterity}
        level={currentCharacter.level}
        inspiration={currentCharacter.inspiration || false}
        combatMode={currentCharacter.combatMode || false}
        onUpdateArmorClass={updateArmorClass}
        onToggleInspiration={toggleInspiration}
        onToggleCombatMode={toggleCombatMode}
      />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <HitPoints
            current={currentCharacter.hitPoints.current}
            maximum={currentCharacter.hitPoints.maximum}
            temporary={currentCharacter.hitPoints.temporary}
            onUpdateCurrent={(value) => updateHitPoints("current", value)}
            onUpdateMaximum={(value) => updateHitPoints("maximum", value)}
            onUpdateTemporary={(value) => updateHitPoints("temporary", value)}
          />
        </div>
        <div>
          <Speed speed={currentCharacter.speed} onUpdateSpeed={updateSpeed} />
        </div>
      </div>

      <CharacterTabs className="mt-6">
        <CharacterTabsList>
          <CharacterTabsTrigger value="abilities">Abilities</CharacterTabsTrigger>
          <CharacterTabsTrigger value="skills">Skills</CharacterTabsTrigger>
          <CharacterTabsTrigger value="combat">Combat</CharacterTabsTrigger>
          <CharacterTabsTrigger value="spells">Spells</CharacterTabsTrigger>
        </CharacterTabsList>

        <CharacterTabsContent value="abilities">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {abilityScores.map((ability) => (
              <AbilityScore
                key={ability.key}
                name={ability.name}
                abbreviation={ability.abbr}
                score={currentCharacter.abilityScores[ability.key]}
                onChange={(value) => updateAbilityScore(ability.key, value)}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Saving Throws</h3>
              <div className="space-y-1">
                {abilityScores.map((ability) => (
                  <SavingThrow
                    key={ability.key}
                    name={ability.name}
                    abbreviation={ability.abbr}
                    abilityScore={currentCharacter.abilityScores[ability.key]}
                    isProficient={currentCharacter.proficientSavingThrows.includes(ability.key)}
                    proficiencyBonus={proficiencyBonus}
                    onToggleProficiency={() => toggleSavingThrowProficiency(ability.key)}
                  />
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Passive Perception</h3>
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>{passivePerception}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Automatically calculated from your Wisdom and Perception skill.
              </p>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Proficiency Bonus</h3>
                <p className="text-sm">
                  +{proficiencyBonus} (based on level {currentCharacter.level})
                </p>
              </div>
            </div>
          </div>
        </CharacterTabsContent>

        <CharacterTabsContent value="skills">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Skills</h3>
            <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm border flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-sm"></div>
                </div>
                <span>Proficient</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm border flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-500 rounded-sm"></div>
                </div>
                <span>Expertise</span>
              </div>
            </div>

            <div className="space-y-1">
              {skills.map((skill) => (
                <Skill
                  key={skill.key}
                  name={skill.key}
                  displayName={skill.name}
                  abilityAbbreviation={skill.abbr}
                  abilityScore={currentCharacter.abilityScores[skill.ability]}
                  isProficient={currentCharacter.skills[skill.key].proficient}
                  hasExpertise={currentCharacter.skills[skill.key].expertise}
                  proficiencyBonus={proficiencyBonus}
                  onToggleProficiency={() => toggleSkillProficiency(skill.key)}
                  onToggleExpertise={() => toggleSkillExpertise(skill.key)}
                />
              ))}
            </div>
          </div>
        </CharacterTabsContent>

        <CharacterTabsContent value="combat">
          <div className="text-center py-12 text-muted-foreground">
            Combat features will be implemented in a future update.
          </div>
        </CharacterTabsContent>

        <CharacterTabsContent value="spells">
          <div className="text-center py-12 text-muted-foreground">
            Spell management will be implemented in a future update.
          </div>
        </CharacterTabsContent>
      </CharacterTabs>
    </div>
  )
}
