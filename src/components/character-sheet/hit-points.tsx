"use client"

import type React from "react"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  const [editing, setEditing] = useState<"current" | "maximum" | "temporary" | null>(null)

  const healthPercentage = Math.max(0, Math.min(100, (current / maximum) * 100))

  const handleChange = (type: "current" | "maximum" | "temporary", e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) return

    switch (type) {
      case "current":
        onUpdateCurrent(Math.max(0, value))
        break
      case "maximum":
        onUpdateMaximum(Math.max(1, value))
        break
      case "temporary":
        onUpdateTemporary(Math.max(0, value))
        break
    }
  }

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Heart className="h-5 w-5 text-red-500" />
          <span className="font-semibold">Hit Points</span>
        </div>
        <div className="text-sm text-muted-foreground">{temporary > 0 && `+${temporary} temp`}</div>
      </div>

      <div className="relative h-8 bg-muted rounded-md overflow-hidden mb-2">
        <div
          className="absolute inset-y-0 left-0 bg-red-500 transition-all duration-300"
          style={{ width: `${healthPercentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {current} / {maximum}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Current</div>
          {editing === "current" ? (
            <Input
              type="number"
              value={current}
              onChange={(e) => handleChange("current", e)}
              onBlur={() => setEditing(null)}
              className="h-8"
              min={0}
              autoFocus
            />
          ) : (
            <div
              className="h-8 border rounded px-2 flex items-center cursor-pointer hover:border-primary"
              onClick={() => setEditing("current")}
            >
              {current}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Maximum</div>
          {editing === "maximum" ? (
            <Input
              type="number"
              value={maximum}
              onChange={(e) => handleChange("maximum", e)}
              onBlur={() => setEditing(null)}
              className="h-8"
              min={1}
              autoFocus
            />
          ) : (
            <div
              className="h-8 border rounded px-2 flex items-center cursor-pointer hover:border-primary"
              onClick={() => setEditing("maximum")}
            >
              {maximum}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Temporary</div>
          {editing === "temporary" ? (
            <Input
              type="number"
              value={temporary}
              onChange={(e) => handleChange("temporary", e)}
              onBlur={() => setEditing(null)}
              className="h-8"
              min={0}
              autoFocus
            />
          ) : (
            <div
              className="h-8 border rounded px-2 flex items-center cursor-pointer hover:border-primary"
              onClick={() => setEditing("temporary")}
            >
              {temporary}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
