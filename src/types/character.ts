import { Ability, AbilityScores, Condition, DamageType, ExhaustionLevel, Proficiencies, ProficiencyLevel } from '@/lib/types';

export interface CharacterState {
    name: string;
    race: string;
    class: string;
    subclass: string;
    level: number;
    inspiration: boolean;

    combatMode: boolean;
    combatTurn: number;

    abilityScores: AbilityScores;
    proficiencies: Proficiencies;

    maxHp: number;
    currentHp: number;
    tempHp: number;

    armorBase: number;

    exhaustion: ExhaustionLevel;

    conditions: Map<Condition, number>;
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

    addCondition: (condition: Condition, duration: number) => void;
    removeCondition: (condition: Condition) => void;
    addConditionImmunity: (condition: Condition) => void;
    removeConditionImmunity: (condition: Condition) => void;
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

    takeDamage: (amount: number, type: DamageType) => void;
    heal: (amount: number) => void;
    clearTempHp: () => void;

    setInspiration: (value: boolean) => void;
    setCombatMode: (value: boolean) => void;
    startCombat: () => void;
    endCombat: () => void;
    advanceCombatTurn: () => void;

    setExhaustion: (level: ExhaustionLevel) => void;
    getExhaustionModifier: () => number;
}
