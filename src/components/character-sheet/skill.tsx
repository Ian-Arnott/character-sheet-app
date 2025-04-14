"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { calculateSkillBonus } from "@/lib/db"
import { cn } from "@/lib/utils"

interface SkillProps {
  name: string
  displayName: string
  abilityAbbreviation: string
  abilityScore: number
  isProficient: boolean
  hasExpertise: boolean
  proficiencyBonus: number
  onToggleProficiency: () => void
  onToggleExpertise: () => void
}

export function Skill({
  name,
  displayName,
  abilityAbbreviation,
  abilityScore,
  isProficient,
  hasExpertise,
  proficiencyBonus,
  onToggleProficiency,
  onToggleExpertise,
}: SkillProps) {
  const skillBonus = calculateSkillBonus(abilityScore, isProficient, hasExpertise, proficiencyBonus)
  const bonusText = skillBonus >= 0 ? `+${skillBonus}` : `${skillBonus}`

  return (
    <div className="flex items-center gap-2 py-1">
      <Checkbox id={`skill-${name}`} checked={isProficient} onCheckedChange={() => onToggleProficiency()} />
      <Checkbox
        id={`expertise-${name}`}
        checked={hasExpertise}
        onCheckedChange={() => onToggleExpertise()}
        disabled={!isProficient}
        className={cn(
          "data-[state=checked]:bg-amber-500 data-[state=checked]:text-amber-foreground",
          "data-[state=checked]:border-amber-500",
        )}
      />
      <div
        className={cn(
          "w-8 text-center font-medium",
          isProficient ? (hasExpertise ? "text-amber-500" : "text-primary") : "text-muted-foreground",
        )}
      >
        {bonusText}
      </div>
      <label
        htmlFor={`skill-${name}`}
        className={cn(
          "text-sm cursor-pointer flex-1 flex items-center gap-1",
          isProficient ? (hasExpertise ? "font-bold" : "font-medium") : "",
        )}
      >
        {displayName}
        <span className="text-xs text-muted-foreground">({abilityAbbreviation})</span>
      </label>
    </div>
  )
}
