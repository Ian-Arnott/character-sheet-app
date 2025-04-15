"use client"

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
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { useCharacterStore } from "@/store/character-store"

interface ExhaustionDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExhaustionDrawer({ open, onOpenChange }: ExhaustionDrawerProps) {
  const { toast } = useToast()
  const { currentCharacter, updateExhaustionLevel } = useCharacterStore()

  const handleUpdateExhaustion = (value: number[]) => {
    const level = value[0]
    updateExhaustionLevel(level)

    if (level === 0) {
      toast({
        title: "Exhaustion Removed",
        description: "Your character is no longer exhausted.",
      })
    } else {
      toast({
        title: "Exhaustion Updated",
        description: `Your character now has level ${level} exhaustion.`,
      })
    }
  }

  if (!currentCharacter) return null

  // Exhaustion effects based on level (5e rules)
  const exhaustionEffects = [
    "No effects",
    "Disadvantage on ability checks",
    "Speed halved",
    "Disadvantage on attack rolls and saving throws",
    "Hit point maximum halved",
    "Speed reduced to 0",
    "Death",
  ]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex justify-between items-center">
          <div>
            <DrawerTitle>Exhaustion</DrawerTitle>
            <DrawerDescription>Manage your character's exhaustion level</DrawerDescription>
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
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Current Exhaustion Level</h3>
              <div className="text-2xl font-bold">{currentCharacter.exhaustionLevel}</div>
            </div>

            <Slider
              defaultValue={[currentCharacter.exhaustionLevel]}
              max={6}
              step={1}
              onValueCommit={handleUpdateExhaustion}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>None</span>
              <span>Death</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Effects of Exhaustion</h3>
            <div className="space-y-2">
              {exhaustionEffects.map((effect, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md ${
                    index <= currentCharacter.exhaustionLevel
                      ? "bg-amber-100 dark:bg-amber-900/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="font-bold w-6 h-6 flex items-center justify-center bg-background rounded-full text-sm">
                      {index}
                    </div>
                    <div>{effect}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Exhaustion is measured in six levels. Effects are cumulative; a character with exhaustion level 2
                suffers both level 1 and level 2 effects.
              </p>
            </div>
          </div>
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
