import { SetFn } from "@/types/zustand-utils";

export const combatModeHandlers = (set: SetFn) => ({
    setCombatMode: (combatMode: boolean) => set({ combatMode, combatTurn: 0 }),
    startCombat: () => { },
    endCombat: () => { },
    advanceCombatTurn: () => {
        set((state) => {
            const nextTurn = state.combatTurn + 1;
            return { combatTurn: nextTurn };
        });
    }

})