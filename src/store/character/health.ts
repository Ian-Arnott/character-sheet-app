import { DamageType } from "@/lib/types";
import { GetFn, SetFn } from "@/types/zustand-utils";

export const healthHandlers = (set: SetFn, get: GetFn) => ({
    addResistance: (type: DamageType) =>
        set((state) => ({
            resistances: state.resistances.includes(type)
                ? state.resistances
                : [...state.resistances, type],
        })),

    removeResistance: (type: DamageType) =>
        set((state) => ({
            resistances: state.resistances.filter((t) => t !== type),
        })),

    addVulnerability: (type: DamageType) =>
        set((state) => ({
            vulnerabilities: state.vulnerabilities.includes(type)
                ? state.vulnerabilities
                : [...state.vulnerabilities, type],
        })),

    removeVulnerability: (type: DamageType) =>
        set((state) => ({
            vulnerabilities: state.vulnerabilities.filter((t) => t !== type),
        })),

    addImmunity: (type: DamageType) =>
        set((state) => ({
            immunities: state.immunities.includes(type)
                ? state.immunities
                : [...state.immunities, type],
        })),

    removeImmunity: (type: DamageType) =>
        set((state) => ({
            immunities: state.immunities.filter((t) => t !== type),
        })),

    setMaxHp: (hp: number) => set({ maxHp: hp }),

    setCurrentHp: (hp: number) => set({ currentHp: hp }),

    setTempHp: (hp: number) => set({ tempHp: hp }),

    takeDamage: (amount: number, type: DamageType) => {
        const { tempHp, currentHp } = get();
        let remainingDamage = amount;
        let multiplier = 1;
        if (get().resistances.includes(type)) {
            multiplier = 0.5;
        } else if (get().vulnerabilities.includes(type)) {
            multiplier = 2;
        } else if (get().immunities.includes(type)) {
            multiplier = 0;
        }

        remainingDamage = Math.floor(remainingDamage * multiplier);

        if (tempHp > 0) {
            const tempUsed = Math.min(tempHp, amount);
            set({ tempHp: tempHp - tempUsed });
            remainingDamage -= tempUsed;
        }

        if (remainingDamage > 0) {
            set({ currentHp: Math.max(currentHp - remainingDamage, 0) });
        }
    },

    heal: (amount: number) => {
        const { currentHp, maxHp } = get();
        set({ currentHp: Math.min(currentHp + amount, maxHp) });
    },

    clearTempHp: () => set({ tempHp: 0 }),
})