import { RollState, getEffectiveRollState } from '@/lib/roll-utils';
import { AbilityName, calculateModifier } from './abilities';

export enum SkillProficiency {
    None = 0,
    Half = 0.5,
    Proficient = 1,
    Expertise = 2,
}

export interface Skill {
    ability: AbilityName;
    proficiency: SkillProficiency;
    advantageCount: number;
    disadvantageCount: number;
}

export type SkillName =
    | 'acrobatics'
    | 'animalHandling'
    | 'arcana'
    | 'athletics'
    | 'deception'
    | 'history'
    | 'insight'
    | 'intimidation'
    | 'investigation'
    | 'medicine'
    | 'nature'
    | 'perception'
    | 'performance'
    | 'persuasion'
    | 'religion'
    | 'sleightOfHand'
    | 'stealth'
    | 'survival';

export const skillToAbilityMap: Record<SkillName, AbilityName> = {
    acrobatics: "dexterity",
    animalHandling: "wisdom",
    arcana: "intelligence",
    athletics: "strength",
    deception: "charisma",
    history: "intelligence",
    insight: "wisdom",
    intimidation: "charisma",
    investigation: "intelligence",
    medicine: "wisdom",
    nature: "intelligence",
    perception: "wisdom",
    performance: "charisma",
    persuasion: "charisma",
    religion: "intelligence",
    sleightOfHand: "dexterity",
    stealth: "dexterity",
    survival: "wisdom",
};

export type Skills = Record<SkillName, Skill>;

export function defaultSkills(): Skills {
    return Object.fromEntries(
        Object.entries(skillToAbilityMap).map(([name, ability]) => [
            name,
            {
                ability,
                proficiency: SkillProficiency.None,
                advantageCount: 0,
                disadvantageCount: 0,
            },
        ])
    ) as Skills;
}

export function getSkillModifier(
    skill: Skill,
    abilityScore: number,
    proficiencyBonus: number
): number {
    const baseMod = calculateModifier(abilityScore);
    const profMod = Math.floor(skill.proficiency * proficiencyBonus);
    return baseMod + profMod;
}

// Determine effective roll state for the skill
export function getSkillRollState(skill: Skill): RollState {
    return getEffectiveRollState(skill.advantageCount, skill.disadvantageCount);
}
