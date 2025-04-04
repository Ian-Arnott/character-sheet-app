import { Condition } from "@/lib/types";
import { CharacterState } from "@/types/character";
import { GetFn, SetFn } from "@/types/zustand-utils";


export const conditionHandlers = (set: SetFn, get: GetFn) => ({
    addCondition: (condition: Condition) =>
        set((state: CharacterState) => ({
            conditions: state.conditions.includes(condition)
                ? state.conditions
                : [...state.conditions, condition],
        })),

    removeCondition: (condition: Condition) =>
        set((state: CharacterState) => ({
            conditions: state.conditions.filter((c) => c !== condition),
        })),

    addConditionImmunity: (condition: Condition) =>
        set((state: CharacterState) => ({
            conditionImmunities: state.conditionImmunities.includes(condition)
                ? state.conditionImmunities
                : [...state.conditionImmunities, condition],
        })),

    removeConditionImmunity: (condition: Condition) =>
        set((state: CharacterState) => ({
            conditionImmunities: state.conditionImmunities.filter((c) => c !== condition),
        })),

    hasCondition: (condition: Condition) => get().conditions.includes(condition)
})