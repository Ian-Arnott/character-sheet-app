"use client"

import { useCharacterStore } from "../store/characterStore"
import { Shield, Moon, Sparkles, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "./ui/card"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import ConditionDrawer from "./condition-drawer"

export default function CharacterPanel() {
  const {
    getModifier,
    getArmorClass,
    currentHp,
    maxHp,
    inspiration,
    setInspiration,
  } = useCharacterStore()

  const dexModifier = getModifier("DEX")
  const armorClass = getArmorClass()
  const initiative = dexModifier
  const hpPercentage = (currentHp / maxHp) * 100

  return (
    <Card className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Column 1: Stats and Buttons */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Armor Class
              </div>
              <div className="text-3xl font-bold flex items-center gap-1">
                <Shield className="h-5 w-5" />
                {armorClass}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                Initiative
              </div>
              <div className="text-3xl font-bold">
                {initiative >= 0 ? `+${initiative}` : initiative}
              </div>
            </div>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Cog className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Settings</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <p className="text-center text-muted-foreground">
                    Settings options will appear here
                  </p>
                </div>
              </DrawerContent>
            </Drawer>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Moon className="h-4 w-4 mr-2" />
                  Rest
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Take a Rest</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <p className="text-center text-muted-foreground">
                    Rest options will appear here
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Column 2: Inspiration */}
        <div className="flex items-center justify-center ">
          <div className="flex flex-col items-center">
            <Button
              variant={inspiration ? "default" : "outline"}
              size="lg"
              className={`h-24 w-24 ${inspiration ? "bg-slate-600 hover:bg-slate-500" : "bg-slate-200 dark:bg-slate-700"
                }`}
              onClick={() => setInspiration(!inspiration)}
            >
              <Sparkles
                className={`h-10 w-10 ${inspiration ? "text-white" : "text-slate-500"}`}
              />
            </Button>
            <span className="mt-2 text-sm font-medium">Inspiration</span>
          </div>
        </div>

        {/* Column 3: Hit Points and Conditions */}
        <div className="flex flex-col gap-4">
          <Drawer>
            <DrawerTrigger asChild>
              <Card className="p-4 cursor-pointer">
                <div className="flex flex-col items-center">
                  <span className="text-sm uppercase font-semibold text-slate-500 dark:text-slate-400">
                    Hit Points
                  </span>
                  <div className="text-2xl font-bold my-2">
                    {currentHp}/{maxHp}
                  </div>
                  <Progress value={hpPercentage} className="h-2 w-full" />
                </div>
              </Card>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Hit Points Details</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <p className="text-center text-muted-foreground">
                  Detailed hit points information will appear here.
                </p>
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full">
                Conditions
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Conditions</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <ConditionDrawer />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </Card>
  )
}

