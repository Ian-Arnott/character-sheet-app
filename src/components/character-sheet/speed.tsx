"use client"

import type React from "react"

import { useState } from "react"
import { Footprints } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SpeedProps {
  speed: number
  onUpdateSpeed: (value: number) => void
}

export function Speed({ speed, onUpdateSpeed }: SpeedProps) {
  const [isEditing, setIsEditing] = useState(false)

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      onUpdateSpeed(value)
    }
  }

  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center gap-1 mb-2">
        <Footprints className="h-5 w-5" />
        <span className="font-semibold">Speed</span>
      </div>

      {isEditing ? (
        <Input
          type="number"
          value={speed}
          onChange={handleSpeedChange}
          onBlur={() => setIsEditing(false)}
          className="h-10 text-center text-lg font-medium"
          min={0}
          autoFocus
        />
      ) : (
        <div
          className="h-10 border rounded flex items-center justify-center text-lg font-medium cursor-pointer hover:border-primary"
          onClick={() => setIsEditing(true)}
        >
          {speed} ft.
        </div>
      )}
    </div>
  )
}
