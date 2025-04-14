"use client"

import type React from "react"

import { useState } from "react"
import { Shield, Zap, Award, Sparkles, Swords } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getAbilityModifier, getProficiencyBonus } from "@/lib/db"
import { cn } from "@/lib/utils"

interface HeaderProps {
  armorClass: number
  dexterityScore: number
  level: number
  inspiration: boolean
  combatMode: boolean
  onUpdateArmorClass: (value: number) => void
  onToggleInspiration: () => void
  onToggleCombatMode: () => void
}

export function Header({
  armorClass,
  dexterityScore,
  level,
  inspiration,
  combatMode,
  onUpdateArmorClass,
  onToggleInspiration,
  onToggleCombatMode,
}: HeaderProps) {
  const [isEditingAC, setIsEditingAC] = useState(false)
  const initiative = getAbilityModifier(dexterityScore)
  const proficiencyBonus = getProficiencyBonus(level)

  const handleArmorClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 30) {
      onUpdateArmorClass(value)
    }
  }

  return (
    <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-3 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">Character Stats</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={inspiration ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 gap-1",
                    inspiration
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "text-amber-500 border-amber-200 dark:border-amber-800",
                  )}
                  onClick={onToggleInspiration}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Inspiration</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{inspiration ? "Remove inspiration" : "Add inspiration"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={combatMode ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-8 gap-1",
                    combatMode
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "text-red-500 border-red-200 dark:border-red-800",
                  )}
                  onClick={onToggleCombatMode}
                >
                  <Swords className="h-4 w-4" />
                  <span className="hidden sm:inline">Combat Mode</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{combatMode ? "Exit combat mode" : "Enter combat mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-3 p-4 gap-4">
        <div className="flex flex-col items-center">
          <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Armor Class</div>
          <div
            className={cn(
              "w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center relative shadow-sm",
              "hover:border-primary cursor-pointer transition-colors",
              isEditingAC ? "border-primary" : "",
            )}
            onClick={() => setIsEditingAC(true)}
          >
            {isEditingAC ? (
              <Input
                type="number"
                value={armorClass}
                onChange={handleArmorClassChange}
                onBlur={() => setIsEditingAC(false)}
                className="absolute inset-0 h-full text-center text-xl font-bold bg-transparent"
                min={0}
                max={30}
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-center">
                <Shield className="h-4 w-4 text-slate-400 absolute top-2" />
                <span className="text-2xl font-bold">{armorClass}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">AC</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Initiative</div>
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm">
            <div className="flex items-center justify-center">
              <Zap className="h-4 w-4 text-slate-400 absolute top-2" />
              <span className="text-2xl font-bold">{initiative >= 0 ? `+${initiative}` : initiative}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">INIT</div>
        </div>

        <div className="flex flex-col items-center">
          <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Proficiency</div>
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-sm">
            <div className="flex items-center justify-center">
              <Award className="h-4 w-4 text-slate-400 absolute top-2" />
              <span className="text-2xl font-bold">+{proficiencyBonus}</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">PROF</div>
        </div>
      </div>
    </div>
  )
}
