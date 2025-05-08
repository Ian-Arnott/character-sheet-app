import { AbilityName } from "./abilities";
import { Die } from "./dice";

export type RestType = "shortRest" | "longRest" | "none"; // "none" for resources that don't reset automatically

export interface ResetCondition {
    on: RestType;
    restore: "full" | "partial";
    amount?: number; // used if "partial" to restore a fixed number
    die?: Die;       // optional if partial restoration uses a die roll (e.g., Hit Dice recovery)
}

export interface CustomResource {
    id?: string;
    name: string;
    current: number;
    max: number;
    die?: Die; // if resource uses dice
    associatedAbility?: AbilityName;
    hasSaveDC?: boolean;
    resetCondition?: ResetCondition;
}
