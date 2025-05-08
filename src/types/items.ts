import { ResetCondition } from "./custom-resource";
import { DamageType } from "./damage-types";
import { Die } from "./dice";

export interface ItemBase {
    id?: number;
    name: string;
    description?: string;
    weight: number;
    quantity: number;
    magical?: MagicProperties;
    containerId?: number;
}

export interface Armor extends ItemBase {
    type: "armor";
    armorType: "light" | "medium" | "heavy";
    baseAC: number;
    maxDexBonus?: number; // if undefined, no max
    stealthDisadvantage?: boolean;
    requiredProficiency: boolean;
}

export interface Weapon extends ItemBase {
    type: "weapon";
    weaponType: "melee" | "ranged";
    ability: "strength" | "dexterity"; // primary ability used to hit
    damage: {
        dice: Die; // e.g., "1d8"
        type: DamageType; // e.g., "slashing"
    };
    traits: WeaponTrait[]; // e.g., ["finesse", "two-handed"]
    requiredProficiency: boolean;
    usesAmmo?: boolean;
    ammoItemId?: number;
    mastery?: string; // optional weapon mastery
}

export type WeaponTrait =
    | "finesse"
    | "two-handed"
    | "light"
    | "versatile"
    | "reach"
    | "thrown"
    | "loading"
    | "ammunition"
    | "heavy";

export interface Container extends ItemBase {
    type: "container";
    capacity: number; // total weight it can carry
}

export interface MiscItem extends ItemBase {
    type: "misc";
    consumable?: boolean;
    uses?: number;
    destroyWhenDepleted?: boolean;
}

export interface Shield extends ItemBase {
    type: "shield";
    acBonus: number;
    requiredProficiency: boolean;
}

export interface MagicProperties {
    bonusToAC?: number;
    bonusToDamage?: number;
    bonusToHit?: number;
    charges?: {
        max: number;
        current: number;
        resetCondition?: ResetCondition;
        destroyWhenDepleted?: boolean;
    };
    miscEffect?: string; // for anything else magical
}

export type InventoryItem =
    | Armor
    | Weapon
    | Shield
    | Container
    | MiscItem;
