export type RollState = 'advantage' | 'disadvantage' | 'normal';

export function getEffectiveRollState(
    advantageCount: number,
    disadvantageCount: number
): RollState {
    if (advantageCount > 0 && disadvantageCount === 0) return 'advantage';
    if (disadvantageCount > 0 && advantageCount === 0) return 'disadvantage';
    return 'normal';
}
