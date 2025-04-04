import { Ability, AbilityScores, Condition, DamageType, Proficiencies, ProficiencyLevel } from '@/lib/types';
import { create } from 'zustand';

interface CharacterState {
    name: string;
    race: string;
    class: string;
    subclass: string;
    level: number;
    inspiration: boolean;

    abilityScores: AbilityScores;
    proficiencies: Proficiencies;

    maxHp: number;
    currentHp: number;
    tempHp: number;

    armorBase: number;
    conditions: Condition[];
    conditionImmunities: Condition[];

    resistances: DamageType[];
    vulnerabilities: DamageType[];
    immunities: DamageType[];

    setName: (name: string) => void;
    setRace: (race: string) => void;
    setClass: (charClass: string) => void;
    setSubclass: (subclass: string) => void;
    setLevel: (level: number) => void;

    setAbilityScore: (ability: Ability, value: number) => void;
    setProficiency: (ability: Ability, level: ProficiencyLevel) => void;

    getModifier: (ability: Ability) => number;
    getProficientBonus: (ability: Ability) => number;
    getProficiencyBonus: () => number;

    getArmorClass: () => number;
    setArmorBase: (base: number) => void;

    addCondition: (condition: Condition) => void;
    removeCondition: (condition: Condition) => void;
    hasCondition: (condition: Condition) => boolean;

    addResistance: (type: DamageType) => void;
    removeResistance: (type: DamageType) => void;
    addVulnerability: (type: DamageType) => void;
    removeVulnerability: (type: DamageType) => void;
    addImmunity: (type: DamageType) => void;
    removeImmunity: (type: DamageType) => void;

    setMaxHp: (hp: number) => void;
    setCurrentHp: (hp: number) => void;
    setTempHp: (hp: number) => void;

    takeDamage: (amount: number) => void;
    heal: (amount: number) => void;
    clearTempHp: () => void;

    // New setter for inspiration
    setInspiration: (value: boolean) => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
    name: '',
    race: '',
    class: '',
    subclass: '',
    level: 1,
    inspiration: false,

    maxHp: 10,
    currentHp: 10,
    tempHp: 0,

    abilityScores: {
        STR: 10,
        DEX: 10,
        CON: 10,
        INT: 10,
        WIS: 10,
        CHA: 10,
    },

    proficiencies: {},

    armorBase: 10,
    conditions: [],
    conditionImmunities: [],

    resistances: [],
    vulnerabilities: [],
    immunities: [],

    setName: (name) => set({ name }),
    setRace: (race) => set({ race }),
    setClass: (charClass) => set({ class: charClass }),
    setSubclass: (subclass) => set({ subclass }),
    setLevel: (level) => set({ level }),

    setInspiration: (value: boolean) => set({ inspiration: value }),

    setAbilityScore: (ability, value) =>
        set((state) => ({
            abilityScores: { ...state.abilityScores, [ability]: value },
        })),

    setProficiency: (ability, level) =>
        set((state) => ({
            proficiencies: { ...state.proficiencies, [ability]: level },
        })),

    getModifier: (ability) => {
        const score = get().abilityScores[ability];
        return Math.floor((score - 10) / 2);
    },

    getProficiencyBonus: () => {
        const level = get().level;
        return Math.ceil(level / 4) + 1;
    },

    getProficientBonus: (ability) => {
        const profLevel = get().proficiencies[ability] || 'none';
        const baseBonus = get().getProficiencyBonus();

        switch (profLevel) {
            case 'double':
                return baseBonus * 2;
            case 'full':
                return baseBonus;
            case 'half':
                return Math.floor(baseBonus / 2);
            default:
                return 0;
        }
    },

    getArmorClass: () => {
        return get().armorBase + get().getModifier('DEX');
    },

    setArmorBase: (base) => set({ armorBase: base }),

    addCondition: (condition) =>
        set((state) => ({
            conditions: state.conditions.includes(condition)
                ? state.conditions
                : [...state.conditions, condition],
        })),

    removeCondition: (condition) =>
        set((state) => ({
            conditions: state.conditions.filter((c) => c !== condition),
        })),

    hasCondition: (condition) => get().conditions.includes(condition),

    addResistance: (type) =>
        set((state) => ({
            resistances: state.resistances.includes(type)
                ? state.resistances
                : [...state.resistances, type],
        })),

    removeResistance: (type) =>
        set((state) => ({
            resistances: state.resistances.filter((t) => t !== type),
        })),

    addVulnerability: (type) =>
        set((state) => ({
            vulnerabilities: state.vulnerabilities.includes(type)
                ? state.vulnerabilities
                : [...state.vulnerabilities, type],
        })),

    removeVulnerability: (type) =>
        set((state) => ({
            vulnerabilities: state.vulnerabilities.filter((t) => t !== type),
        })),

    addImmunity: (type) =>
        set((state) => ({
            immunities: state.immunities.includes(type)
                ? state.immunities
                : [...state.immunities, type],
        })),

    removeImmunity: (type) =>
        set((state) => ({
            immunities: state.immunities.filter((t) => t !== type),
        })),
    setMaxHp: (hp) => set({ maxHp: hp }),
    setCurrentHp: (hp) => set({ currentHp: hp }),
    setTempHp: (hp) => set({ tempHp: hp }),

    takeDamage: (amount) => {
        const { tempHp, currentHp } = get();
        let remainingDamage = amount;

        if (tempHp > 0) {
            const tempUsed = Math.min(tempHp, amount);
            set({ tempHp: tempHp - tempUsed });
            remainingDamage -= tempUsed;
        }

        if (remainingDamage > 0) {
            set({ currentHp: Math.max(currentHp - remainingDamage, 0) });
        }
    },

    heal: (amount) => {
        const { currentHp, maxHp } = get();
        set({ currentHp: Math.min(currentHp + amount, maxHp) });
    },

    clearTempHp: () => set({ tempHp: 0 }),
}));
