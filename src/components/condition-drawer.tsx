"use client"

import { useCharacterStore } from "../store/characterStore"
import { Condition, CONDITIONS, ExhaustionLevel } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Label } from "@radix-ui/react-label"
import { Switch } from "./ui/switch"
import { Separator } from "./ui/separator"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { SizedBox } from "./ui/sized-box"

export default function ConditionDrawer() {
    const {
        conditions,
        conditionImmunities,
        exhaustion,
        addCondition,
        removeCondition,
        addConditionImmunity,
        removeConditionImmunity,
        setExhaustion,
    } = useCharacterStore()

    const toggleCondition = (condition: Condition) => {
        if (conditionImmunities.includes(condition)) {
            toast.error("You are immune to the " + condition + " condition.")
            return
        }
        if (conditions.has(condition)) {
            removeCondition(condition)
        } else {
            addCondition(condition, -1)
        }
    }

    const toggleImmunity = (condition: Condition) => {
        if (conditionImmunities.includes(condition)) {
            removeConditionImmunity(condition)
        } else {
            if (conditions.has(condition)) {
                toast("Removed the " + condition + " condition.")
                removeCondition(condition)
            }
            addConditionImmunity(condition)
        }
    }

    const decreaseExhaustion = () => {
        if (exhaustion > 0) {
            setExhaustion(exhaustion - 1 as ExhaustionLevel)
        }
    }

    const increaseExhaustion = () => {
        if (exhaustion < 6) {
            setExhaustion(exhaustion + 1 as ExhaustionLevel)
        }
    }

    return (
        <Tabs defaultValue="conditions" className="p-4">
            {/* Tab Headers */}
            <TabsList className="grid w-full grid-cols-3 gap-2">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="immunities">Immunities</TabsTrigger>
                <TabsTrigger value="exhaustion">Exhaustion</TabsTrigger>
            </TabsList>

            {/* Conditions Tab */}
            <TabsContent value="conditions" className="max-h-[300px] overflow-y-auto">
                {CONDITIONS.map((condition) => (
                    <div key={condition + "-condition"}>
                        <div className="flex items-center justify-between p-2">
                            <Label htmlFor={condition}>{condition}</Label>
                            <Switch
                                id={condition}
                                checked={conditions.has(condition)}
                                onCheckedChange={() => toggleCondition(condition)} />
                        </div>
                        <Separator />
                    </div>
                ))}
            </TabsContent>

            {/* Immunities Tab */}
            <TabsContent value="immunities" className="max-h-[300px] overflow-y-auto">
                {CONDITIONS.map((condition) => (
                    <div key={condition + "-immunity"}>
                        <div className="flex items-center justify-between p-2">
                            <Label htmlFor={condition}>{condition}</Label>
                            <Switch
                                id={condition}
                                checked={conditionImmunities.includes(condition)}
                                onCheckedChange={() => toggleImmunity(condition)} />
                        </div>
                        <Separator />
                    </div>
                ))}
            </TabsContent>

            {/* Exhaustion Tab */}
            <TabsContent value="exhaustion" className="max-h-[300px] flex flex-col items-center space-y-4">
                <SizedBox className="h-5" />
                <div className="text-lg font-medium">Exhaustion Level: {exhaustion}</div>
                <div className="flex items-center">
                    <Button className="mr-1" onClick={decreaseExhaustion}>
                        -
                    </Button>
                    <div className="flex space-x-1 ">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className={`w-10 h-10 border rounded flex items-center justify-center 
                                    ${index < exhaustion ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"}`}
                            >
                                {index < exhaustion && "✓"}
                            </div>
                        ))}
                    </div>
                    <Button className="ml-1" onClick={increaseExhaustion}>
                        +
                    </Button>
                </div>
                <SizedBox className="h-45" />
            </TabsContent>
        </Tabs>
    )
}