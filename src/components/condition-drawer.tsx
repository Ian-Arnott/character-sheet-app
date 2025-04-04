"use client"

import { useCharacterStore } from "../store/characterStore"
import { Condition, CONDITIONS } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Label } from "@radix-ui/react-label"
import { Switch } from "./ui/switch"
import { Separator } from "./ui/separator"
import { toast } from "sonner"


export default function ConditionDrawer() {

    const {
        conditions,
        conditionImmunities,
        addCondition,
        removeCondition,
        addConditionImmunity,
        removeConditionImmunity,
    } = useCharacterStore()



    const toggleCondition = (condition: Condition) => {
        if (conditionImmunities.includes(condition)) {
            toast.error(
                "You are immune to the " + condition + " condition.",
            )
            return
        }
        if (conditions.includes(condition)) {
            removeCondition(condition)
        } else {
            addCondition(condition)
        }
    }

    // There are no dedicated functions for condition immunities,
    // so we update the store directly.
    const toggleImmunity = (condition: Condition) => {
        if (conditionImmunities.includes(condition)) {
            removeConditionImmunity(condition)
        } else {
            if (conditions.includes(condition)) {
                toast(
                    "Removed the " + condition + " condition.",
                )
                removeCondition(condition)
            }
            addConditionImmunity(condition)
        }
    }

    return (
        <Tabs defaultValue="conditions" className="p-4">
            {/* Tab Headers */}
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                <TabsTrigger value="immunities">Immunities</TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="conditions" className="max-h-[300px] overflow-y-auto">
                {CONDITIONS.map((condition) => (
                    <div key={condition + "-condition"}>
                        <div key={condition} className="flex items-center justify-between p-2">
                            <Label htmlFor={condition}>{condition}</Label>
                            <Switch
                                id={condition}
                                checked={conditions.includes(condition)}
                                onCheckedChange={() => toggleCondition(condition)} />
                        </div>
                        <Separator key={"separatorD-" + condition} />
                    </div>
                ))}
            </TabsContent>
            <TabsContent value="immunities" className="max-h-[300px] overflow-y-auto">
                {CONDITIONS.map((condition) => (
                    <div key={condition + "-immunity"}>
                        <div key={condition} className="flex items-center justify-between p-2">
                            <Label htmlFor={condition}>{condition}</Label>
                            <Switch
                                id={condition}
                                checked={conditionImmunities.includes(condition)}
                                onCheckedChange={() => toggleImmunity(condition)} />
                        </div>
                        <Separator key={"separatorI-" + condition} />
                    </div>
                ))}
            </TabsContent>
        </Tabs>
    )
}