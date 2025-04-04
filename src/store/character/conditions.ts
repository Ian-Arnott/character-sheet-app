import { Condition, ExhaustionLevel } from "@/lib/types";
import { CharacterState } from "@/types/character";
import { GetFn, SetFn } from "@/types/zustand-utils";


export const conditionHandlers = (set: SetFn, get: GetFn) => ({
    addCondition: (condition: Condition, duration: number) =>
        set((state: CharacterState) => ({
            conditions: state.conditions.has(condition)
                ? state.conditions
                : state.conditions.set(condition, duration),
        })),

    removeCondition: (condition: Condition) =>
        set((state: CharacterState) => ({
            conditions: (() => {
                const updatedConditions = new Map(state.conditions);
                updatedConditions.delete(condition);
                return updatedConditions;
            })(),
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

    hasCondition: (condition: Condition) => get().conditions.has(condition),

    setExhaustion: (level: ExhaustionLevel) => set({ exhaustion: level }),

    getExhaustionModifier: () => {
        const { exhaustion } = get();
        return exhaustion > 0 ? -exhaustion * 2 : 0;
    }
})