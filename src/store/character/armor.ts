import { GetFn, SetFn } from "@/types/zustand-utils";

export const armorHandlers = (set: SetFn, get: GetFn) => ({
    getArmorClass: () => {
        return get().armorBase + get().getModifier('DEX');
    },
    setArmorBase: (base: number) => set({ armorBase: base }),
})