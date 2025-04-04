import { CharacterState } from '@/types/character';
import { create } from 'zustand';
import { basicSetters } from './character/basic';
import { abilityHandlers } from './character/abilities';
import { armorHandlers } from './character/armor';
import { conditionHandlers } from './character/conditions';
import { healthHandlers } from './character/health';


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

    ...basicSetters(set),
    ...abilityHandlers(set, get),
    ...armorHandlers(set, get),
    ...conditionHandlers(set, get),
    ...healthHandlers(set, get),
}));
