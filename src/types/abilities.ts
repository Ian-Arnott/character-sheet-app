export type AbilityName =
    | "strength"
    | "dexterity"
    | "constitution"
    | "intelligence"
    | "wisdom"
    | "charisma";

export interface AbilityScore {
    score: number;
    modifier: number;
}

export type Abilities = Record<AbilityName, AbilityScore>;

export function calculateModifier(score: number): number {
    return Math.floor((score - 10) / 2);
}

export function defaultAbilities(): Abilities {
    const names: AbilityName[] = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
    ];
    return Object.fromEntries(
        names.map((name) => [
            name,
            { score: 10, modifier: calculateModifier(10) },
        ])
    ) as Abilities;
}
