import type { Die } from "./dice";
import type { ResetCondition } from "./custom-resource"; // shared with custom resources, magic items, etc.
import { AbilityName } from "./abilities";
import { ActionType } from "./action-types";

export interface SpellSlot {
    max: number;
    available: number;
    resetCondition?: ResetCondition; // e.g., reset on long rest
}

export type SpellSlots = Record<number, SpellSlot>;

export type ScalingEffect =
    | { type: "damage"; dice: Die } // now uses structured die
    | { type: "targets"; additional: number }
    | { type: "range"; additional: number } // increase in feet/meters
    | { type: "duration"; additional: string }
    | { type: "custom"; description: string };

export interface SpellScaling {
    type: "characterLevel" | "spellScale" | "spellLevel";
    scaleBy: {
        level: number;
        effect: ScalingEffect;
    }[];
}

export interface Spell {
    name: string;
    level: number; // 0 for cantrips
    school?: string; // e.g., Evocation
    description: string;
    components: string[]; // e.g., ["V", "S", "M"]
    castingTime: ActionType | string; // e.g., "1 action"
    range: string; // e.g., "60 feet"
    duration: string; // e.g., "Concentration, up to 1 minute"
    ritual?: boolean;
    concentration?: boolean;
    scaling?: SpellScaling[];
    dcAbility?: AbilityName; // optional, e.g., "wisdom" for saves
}

export type Spells = Spell[];