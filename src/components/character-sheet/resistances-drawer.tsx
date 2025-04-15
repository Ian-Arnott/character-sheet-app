"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"
import {
  type DamageType,
  type ResistanceType,
  type Resistance,
  getDamageTypeName,
  getResistanceTypeName,
} from "@/lib/db"

interface ResistancesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResistancesDrawer({ open, onOpenChange }: ResistancesDrawerProps) {
  const { toast } = useToast()
  const { currentCharacter, addResistance, removeResistance } = useCharacterStore()

  const [selectedDamageType, setSelectedDamageType] = useState<DamageType | null>(null)
  const [selectedResistanceType, setSelectedResistanceType] = useState<ResistanceType>("resistance")

  // All available damage types
  const allDamageTypes: DamageType[] = [
    "acid",
    "bludgeoning",
    "cold",
    "fire",
    "force",
    "lightning",
    "necrotic",
    "piercing",
    "poison",
    "psychic",
    "radiant",
    "slashing",
    "thunder",
  ]

  const handleAddResistance = () => {
    if (!selectedDamageType) return

    const newResistance: Resistance = {
      damageType: selectedDamageType,
      type: selectedResistanceType,
    }

    addResistance(newResistance)
    toast({
      title: "Resistance Added",
      description: `Your character now has ${getResistanceTypeName(selectedResistanceType).toLowerCase()} to ${getDamageTypeName(selectedDamageType).toLowerCase()} damage.`,
    })

    setSelectedDamageType(null)
  }

  const handleRemoveResistance = (damageType: DamageType, resistanceType: ResistanceType) => {
    removeResistance(damageType, resistanceType)
    toast({
      title: "Resistance Removed",
      description: `Your character no longer has ${getResistanceTypeName(resistanceType).toLowerCase()} to ${getDamageTypeName(damageType).toLowerCase()} damage.`,
    })
  }

  if (!currentCharacter) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex justify-between items-center">
          <div>
            <DrawerTitle>Damage Resistances</DrawerTitle>
            <DrawerDescription>
              Manage your character's damage resistances, immunities, and vulnerabilities
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-6">
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Add New Resistance</h3>

            <div className="space-y-2">
              <Label htmlFor="damage-type-select">Damage Type</Label>
              <select
                id="damage-type-select"
                className="w-full p-2 border rounded-md"
                value={selectedDamageType || ""}
                onChange={(e) => setSelectedDamageType(e.target.value as DamageType)}
              >
                <option value="">Select a damage type...</option>
                {allDamageTypes.map((damageType) => (
                  <option key={damageType} value={damageType}>
                    {getDamageTypeName(damageType)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Resistance Type</Label>
              <RadioGroup
                value={selectedResistanceType}
                onValueChange={(value) => setSelectedResistanceType(value as ResistanceType)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resistance" id="resistance" />
                  <Label htmlFor="resistance">Resistance (half damage)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immunity" id="immunity" />
                  <Label htmlFor="immunity">Immunity (no damage)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vulnerability" id="vulnerability" />
                  <Label htmlFor="vulnerability">Vulnerability (double damage)</Label>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleAddResistance} disabled={!selectedDamageType} className="w-full">
              Add Resistance
            </Button>
          </div>

          {currentCharacter.resistances.length > 0 ? (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Current Resistances</h3>
              <div className="space-y-2">
                {currentCharacter.resistances.map((resistance) => (
                  <div
                    key={`${resistance.damageType}-${resistance.type}`}
                    className="flex justify-between items-center p-2 bg-muted rounded-md"
                  >
                    <div>
                      <div className="font-medium">{getDamageTypeName(resistance.damageType)}</div>
                      <div className="text-xs text-muted-foreground">{getResistanceTypeName(resistance.type)}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveResistance(resistance.damageType, resistance.type)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">No resistances added</div>
          )}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
