"use client"

import { useState } from "react"
import { Heart, AlertCircle, Shield, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConditionsDrawer } from "./conditions-drawer"
import { ResistancesDrawer } from "./resistances-drawer"
import { ExhaustionDrawer } from "./exhaustion-drawer"

interface HitPointsProps {
  current: number
  maximum: number
  temporary: number
  onUpdateCurrent: (value: number) => void
  onUpdateMaximum: (value: number) => void
  onUpdateTemporary: (value: number) => void
}

export function HitPoints({
  current,
  maximum,
  temporary,
  onUpdateCurrent,
  onUpdateMaximum,
  onUpdateTemporary,
}: HitPointsProps) {
  const [isConditionsDrawerOpen, setIsConditionsDrawerOpen] = useState(false)
  const [isResistancesDrawerOpen, setIsResistancesDrawerOpen] = useState(false)
  const [isExhaustionDrawerOpen, setIsExhaustionDrawerOpen] = useState(false)

  const healthPercentage = Math.max(0, Math.min(100, (current / maximum) * 100))

  // Quick actions for hit points
  const handleHeal = () => {
    const newValue = Math.min(current + 1, maximum)
    onUpdateCurrent(newValue)
  }

  const handleDamage = () => {
    // First reduce temporary hit points
    if (temporary > 0) {
      onUpdateTemporary(temporary - 1)
      return
    }

    // Then reduce current hit points
    const newValue = Math.max(0, current - 1)
    onUpdateCurrent(newValue)
  }

  const handleAddTemp = () => {
    onUpdateTemporary(temporary + 1)
  }

  const handleRemoveTemp = () => {
    const newValue = Math.max(0, temporary - 1)
    onUpdateTemporary(newValue)
  }

  return (
    <>
      <div className="p-3 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Heart className="h-5 w-5 text-red-500" />
            <span className="font-semibold">Hit Points</span>
          </div>
          <div className="text-sm text-muted-foreground">{temporary > 0 && `+${temporary} temp`}</div>
        </div>

        <div className="relative h-8 bg-muted rounded-md overflow-hidden mb-3">
          <div
            className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-300"
            style={{ width: `${healthPercentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
            {current} / {maximum}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <Button variant="outline" size="sm" onClick={handleHeal}>
            + Heal
          </Button>
          <Button variant="outline" size="sm" onClick={handleDamage}>
            - Damage
          </Button>
          <Button variant="outline" size="sm" onClick={handleAddTemp}>
            + Temp HP
          </Button>
          <Button variant="outline" size="sm" onClick={handleRemoveTemp}>
            - Temp HP
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setIsConditionsDrawerOpen(true)}
          >
            <AlertCircle className="h-4 w-4 mb-1" />
            <span className="text-xs">Conditions</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setIsResistancesDrawerOpen(true)}
          >
            <Shield className="h-4 w-4 mb-1" />
            <span className="text-xs">Resistances</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex flex-col items-center h-auto py-2"
            onClick={() => setIsExhaustionDrawerOpen(true)}
          >
            <Battery className="h-4 w-4 mb-1" />
            <span className="text-xs">Exhaustion</span>
          </Button>
        </div>
      </div>

      <ConditionsDrawer open={isConditionsDrawerOpen} onOpenChange={setIsConditionsDrawerOpen} />

      <ResistancesDrawer open={isResistancesDrawerOpen} onOpenChange={setIsResistancesDrawerOpen} />

      <ExhaustionDrawer open={isExhaustionDrawerOpen} onOpenChange={setIsExhaustionDrawerOpen} />
    </>
  )
}
