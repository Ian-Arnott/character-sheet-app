"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { calculateSavingThrow } from "@/lib/db"
import { cn } from "@/lib/utils"

interface SavingThrowProps {
  name: string
  abbreviation: string
  abilityScore: number
  isProficient: boolean
  proficiencyBonus: number
  onToggleProficiency: () => void
}

export function SavingThrow({
  name,
  abbreviation,
  abilityScore,
  isProficient,
  proficiencyBonus,
  onToggleProficiency,
}: SavingThrowProps) {
  const savingThrowBonus = calculateSavingThrow(abilityScore, isProficient, proficiencyBonus)
  const bonusText = savingThrowBonus >= 0 ? `+${savingThrowBonus}` : `${savingThrowBonus}`

  return (
    <div className="flex items-center gap-3 py-1">
      <Checkbox id={`save-${abbreviation}`} checked={isProficient} onCheckedChange={() => onToggleProficiency()} />
      <div className={cn("w-8 text-center font-medium", isProficient ? "text-primary" : "text-muted-foreground")}>
        {bonusText}
      </div>
      <label
        htmlFor={`save-${abbreviation}`}
        className={cn("text-sm cursor-pointer flex-1", isProficient ? "font-medium" : "")}
      >
        {name}
      </label>
    </div>
  )
}
