export type Ability = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export type ProficiencyLevel = 'none' | 'half' | 'full' | 'double';

export type AbilityScores = {
    [key in Ability]: number;
};

export type Proficiencies = {
    [key in Ability]?: ProficiencyLevel;
};

export type Condition =
    | 'blinded'
    | 'charmed'
    | 'deafened'
    | 'frightened'
    | 'grappled'
    | 'incapacitated'
    | 'invisible'
    | 'paralyzed'
    | 'petrified'
    | 'poisoned'
    | 'prone'
    | 'restrained'
    | 'stunned'
    | 'unconscious';

export type DamageType =
    | 'acid'
    | 'bludgeoning'
    | 'cold'
    | 'fire'
    | 'force'
    | 'lightning'
    | 'necrotic'
    | 'piercing'
    | 'poison'
    | 'psychic'
    | 'radiant'
    | 'slashing'
    | 'thunder';