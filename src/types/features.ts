import { ActionType } from "./action-types";
import { Die } from "./dice";
import { AbilityName } from "./abilities"; // e.g., "strength", "dexterity"
import { ResetCondition } from "./custom-resource";
import { ConditionType } from "./conditions";

export interface Feature {
    id?: string;
    name: string;
    description: string;

    activation: FeatureActivation;
    duration?: FeatureDuration;

    usage?: FeatureUsage;
    resourceUsed?: string; // refers to a custom resource id or name
    attack?: FeatureAttack;
    save?: FeatureSave;

    effects?: FeatureEffect[]; // bonuses, temporary effects, conditions, etc.
    conditionsApplied?: ConditionType[]; // e.g., ["frightened"]
    tags?: string[]; // for grouping or filtering in UI
    source?: string; // e.g., "Rage", "Fighter (Champion)", etc.
}

export interface FeatureActivation {
    type: ActionType;
    triggerCondition?: string; // e.g., "when you take damage", "when initiative is rolled"
}

export interface FeatureDuration {
    type: "rounds" | "minutes" | "hours" | "untilRest" | "instantaneous" | "concentration" | "custom";
    value?: number;
    customDescription?: string;
}

export interface FeatureUsage {
    max: number;
    current: number;
    recharge: ResetCondition;
    fullRecharge: boolean;
    destroyWhenDepleted?: boolean;
}

export interface FeatureAttack {
    ability: AbilityName;
    bonus?: number;
    damage?: {
        dice: Die;
        type: string; // reuse DamageType if available
    };
}

export interface FeatureSave {
    ability: AbilityName;
    dc?: number; // can be computed from character stats, but allow override
}

export interface FeatureEffect {
    type: "bonus" | "healing" | "movement" | "temporaryHP" | "custom";
    target?: "self" | "ally" | "enemy" | "area";
    bonus?: {
        abilityChecks?: Partial<Record<AbilityName, number>>;
        savingThrows?: Partial<Record<AbilityName, number>>;
        attackRolls?: number;
        damage?: number;
        ac?: number;
    };
    healing?: {
        amount?: number;
        dice?: Die;
        scalingWithLevel?: boolean;
    };
    movement?: {
        type?: "walk" | "fly" | "swim";
        bonus: number;
    };
    tempHP?: number;
    customEffect?: string; // fallback for anything else
}


export type Features = Feature[];