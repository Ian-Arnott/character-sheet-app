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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"
import {
  type ConditionType,
  type Condition,
  type ConditionDurationType,
  getConditionName,
  getConditionDurationName,
} from "@/lib/db"

interface ConditionsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConditionsDrawer({ open, onOpenChange }: ConditionsDrawerProps) {
  const { toast } = useToast()
  const { currentCharacter, addConditionImmunity, removeConditionImmunity, addActiveCondition, removeActiveCondition } =
    useCharacterStore()

  const [activeTab, setActiveTab] = useState("immunities")
  const [selectedCondition, setSelectedCondition] = useState<ConditionType | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<ConditionDurationType>("permanent")
  const [rounds, setRounds] = useState(1)

  // All available conditions
  const allConditions: ConditionType[] = [
    "blinded",
    "charmed",
    "deafened",
    "frightened",
    "grappled",
    "incapacitated",
    "invisible",
    "paralyzed",
    "petrified",
    "poisoned",
    "prone",
    "restrained",
    "stunned",
    "unconscious",
  ]

  const handleAddImmunity = (condition: ConditionType) => {
    addConditionImmunity(condition)
    toast({
      title: "Immunity Added",
      description: `Your character is now immune to the ${getConditionName(condition)} condition.`,
    })
  }

  const handleRemoveImmunity = (condition: ConditionType) => {
    removeConditionImmunity(condition)
    toast({
      title: "Immunity Removed",
      description: `Your character is no longer immune to the ${getConditionName(condition)} condition.`,
    })
  }

  const handleAddCondition = () => {
    if (!selectedCondition) return

    const newCondition: Condition = {
      type: selectedCondition,
      duration: selectedDuration,
      rounds: selectedDuration === "rounds" ? rounds : undefined,
      appliedAt: Date.now(),
    }

    const success = addActiveCondition(newCondition)

    if (success) {
      toast({
        title: "Condition Applied",
        description: `Your character is now affected by the ${getConditionName(selectedCondition)} condition.`,
      })
      setSelectedCondition(null)
      setSelectedDuration("permanent")
      setRounds(1)
    } else {
      toast({
        title: "Cannot Apply Condition",
        description: `Your character is immune to the ${getConditionName(selectedCondition)} condition.`,
        variant: "destructive",
      })
    }
  }

  const handleRemoveCondition = (condition: ConditionType) => {
    removeActiveCondition(condition)
    toast({
      title: "Condition Removed",
      description: `Your character is no longer affected by the ${getConditionName(condition)} condition.`,
    })
  }

  if (!currentCharacter) return null

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex justify-between items-center">
          <div>
            <DrawerTitle>Conditions</DrawerTitle>
            <DrawerDescription>Manage condition immunities and active conditions</DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="immunities">Condition Immunities</TabsTrigger>
              <TabsTrigger value="active">Active Conditions</TabsTrigger>
            </TabsList>

            <TabsContent value="immunities" className="space-y-4">
              <div className="text-sm text-muted-foreground mb-2">Select conditions your character is immune to:</div>

              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {allConditions.map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`immunity-${condition}`}
                      checked={currentCharacter.conditionImmunities.includes(condition)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleAddImmunity(condition)
                        } else {
                          handleRemoveImmunity(condition)
                        }
                      }}
                    />
                    <Label htmlFor={`immunity-${condition}`}>{getConditionName(condition)}</Label>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium">Apply New Condition</h3>

                <div className="space-y-2">
                  <Label htmlFor="condition-select">Select Condition</Label>
                  <select
                    id="condition-select"
                    className="w-full p-2 border rounded-md"
                    value={selectedCondition || ""}
                    onChange={(e) => setSelectedCondition(e.target.value as ConditionType)}
                  >
                    <option value="">Select a condition...</option>
                    {allConditions
                      .filter((condition) => !currentCharacter.conditionImmunities.includes(condition))
                      .map((condition) => (
                        <option key={condition} value={condition}>
                          {getConditionName(condition)}
                        </option>
                      ))}
                  </select>
                </div>

                {selectedCondition && currentCharacter.combatMode && (
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <RadioGroup
                      value={selectedDuration}
                      onValueChange={(value) => setSelectedDuration(value as ConditionDurationType)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="endOfNextTurn" id="end-next-turn" />
                        <Label htmlFor="end-next-turn">Until the end of your next turn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="startOfNextTurn" id="start-next-turn" />
                        <Label htmlFor="start-next-turn">Until the start of your next turn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rounds" id="rounds" />
                        <Label htmlFor="rounds">For a number of rounds</Label>
                      </div>
                      {selectedDuration === "rounds" && (
                        <div className="ml-6 mt-2">
                          <Input
                            type="number"
                            min={1}
                            value={rounds}
                            onChange={(e) => setRounds(Number.parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="saveStart" id="save-start" />
                        <Label htmlFor="save-start">Save at the start of turn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="saveEnd" id="save-end" />
                        <Label htmlFor="save-end">Save at the end of turn</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="permanent" id="permanent" />
                        <Label htmlFor="permanent">Permanent</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}

                <Button onClick={handleAddCondition} disabled={!selectedCondition} className="w-full">
                  Apply Condition
                </Button>
              </div>

              {currentCharacter.activeConditions.length > 0 ? (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Active Conditions</h3>
                  <div className="space-y-2">
                    {currentCharacter.activeConditions.map((condition) => (
                      <div key={condition.type} className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <div className="font-medium">{getConditionName(condition.type)}</div>
                          <div className="text-xs text-muted-foreground">
                            {getConditionDurationName(condition.duration)}
                            {condition.duration === "rounds" && condition.rounds && ` (${condition.rounds} rounds)`}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveCondition(condition.type)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No active conditions</div>
              )}
            </TabsContent>
          </Tabs>
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
