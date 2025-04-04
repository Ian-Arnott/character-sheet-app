import { SetFn, GetFn } from '@/types/zustand-utils';
import { Ability, ProficiencyLevel } from '@/lib/types';

export const abilityHandlers = (set: SetFn, get: GetFn) => ({
    setAbilityScore: (ability: Ability, value: number) =>
        set((state) => ({
            abilityScores: { ...state.abilityScores, [ability]: value },
        })),

    setProficiency: (ability: Ability, level: ProficiencyLevel) =>
        set((state) => ({
            proficiencies: { ...state.proficiencies, [ability]: level },
        })),

    getModifier: (ability: Ability) => {
        const score = get().abilityScores[ability];
        return Math.floor((score - 10) / 2);
    },

    getProficiencyBonus: () => {
        const level = get().level;
        return Math.ceil(level / 4) + 1;
    },

    getProficientBonus: (ability: Ability) => {
        const profLevel = get().proficiencies[ability] || 'none';
        const baseBonus = get().getProficiencyBonus();

        switch (profLevel) {
            case 'double': return baseBonus * 2;
            case 'full': return baseBonus;
            case 'half': return Math.floor(baseBonus / 2);
            default: return 0;
        }
    },
});
