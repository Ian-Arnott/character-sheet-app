"use client"

import { Button } from "@/components/ui/button"
import { useCharacterStore } from "@/store/character-store"
import { Swords, Play, Square, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CombatHeaderProps {
  className?: string
}

export function CombatHeader({ className }: CombatHeaderProps) {
  const { currentCharacter, startTurn, endTurn, nextRound } = useCharacterStore()

  if (!currentCharacter || !currentCharacter.combatMode || !currentCharacter.combatState) {
    return null
  }

  const { round, isPlayerTurn } = currentCharacter.combatState

  return (
    <div className={cn("bg-red-50 dark:bg-red-950/30 rounded-lg p-3 mb-4 animate-in fade-in", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-red-500" />
          <span className="font-semibold text-red-700 dark:text-red-400">Combat Mode</span>
          <span className="text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
            Round {round}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
          onClick={nextRound}
        >
          <ChevronRight className="h-4 w-4 mr-1" />
          Next Round
        </Button>
      </div>

      <div className="mt-3 flex justify-center">
        {isPlayerTurn ? (
          <Button variant="destructive" size="sm" className="w-full max-w-xs" onClick={endTurn}>
            <Square className="h-4 w-4 mr-2" />
            End Turn
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full max-w-xs text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
            onClick={startTurn}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Turn
          </Button>
        )}
      </div>
    </div>
  )
}
