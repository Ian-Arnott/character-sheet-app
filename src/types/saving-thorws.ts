import { getEffectiveRollState, RollState } from '@/lib/roll-utils';
import { AbilityName, calculateModifier } from './abilities';

export interface SavingThrow {
    ability: AbilityName;
    proficient: boolean;
    advantageCount: number;
    disadvantageCount: number;
}

export type SavingThrows = Record<AbilityName, SavingThrow>;

export function defaultSavingThrows(): SavingThrows {
    const abilities: AbilityName[] = [
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma',
    ];

    return Object.fromEntries(
        abilities.map((ability) => [
            ability,
            {
                ability,
                proficient: false,
                advantageCount: 0,
                disadvantageCount: 0,
            },
        ])
    ) as SavingThrows;
}

export function getSavingThrowModifier(
    throwData: SavingThrow,
    abilityScore: number,
    proficiencyBonus: number
): number {
    const baseMod = calculateModifier(abilityScore);
    const profMod = throwData.proficient ? proficiencyBonus : 0;
    return baseMod + profMod;
}

export function getSavingThrowRollState(save: SavingThrow): RollState {
    return getEffectiveRollState(save.advantageCount, save.disadvantageCount);
}
