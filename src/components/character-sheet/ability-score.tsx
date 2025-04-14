"use client"

import type React from "react"

import { useState } from "react"
import { getAbilityModifier } from "@/lib/db"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AbilityScoreProps {
  name: string
  abbreviation: string
  score: number
  onChange: (value: number) => void
}

export function AbilityScore({ name, abbreviation, score, onChange }: AbilityScoreProps) {
  const [isEditing, setIsEditing] = useState(false)
  const modifier = getAbilityModifier(score)
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 1 && value <= 30) {
      onChange(value)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs uppercase font-semibold text-muted-foreground mb-1">{abbreviation}</div>
      <div
        className={cn(
          "w-16 h-16 rounded-lg border flex flex-col items-center justify-center relative",
          "hover:border-primary cursor-pointer transition-colors",
        )}
        onClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            type="number"
            value={score}
            onChange={handleScoreChange}
            onBlur={handleBlur}
            className="absolute inset-0 h-full text-center text-xl font-bold"
            min={1}
            max={30}
            autoFocus
          />
        ) : (
          <>
            <div className="text-xl font-bold">{score}</div>
            <div className="text-sm">{modifierText}</div>
          </>
        )}
      </div>
      <div className="text-xs mt-1 text-center">{name}</div>
    </div>
  )
}
