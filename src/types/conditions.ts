export enum ConditionType {
    Blinded = "Blinded",
    Charmed = "Charmed",
    Deafened = "Deafened",
    Fatigued = "Fatigued",
    Frightened = "Frightened",
    Grappled = "Grappled",
    Incapacitated = "Incapacitated",
    Invisible = "Invisible",
    Paralyzed = "Paralyzed",
    Petrified = "Petrified",
    Poisoned = "Poisoned",
    Prone = "Prone",
    Restrained = "Restrained",
    Stunned = "Stunned",
    Unconscious = "Unconscious",
}

// A single inflicted condition instance
export interface InflictedCondition {
    type: ConditionType;
    duration?: number;
}

export type InflictedConditions = InflictedCondition[];
export type ConditionImmunities = ConditionType[];