import { Abilities, AbilityName } from "./abilities";
import { ConditionImmunities, InflictedConditions } from "./conditions";
import { CustomResource } from "./custom-resource";
import { DamageTypeList } from "./damage-types";
import { Die } from "./dice";
import { Features } from "./features";
import { Armor, Container, InventoryItem, Shield, Weapon } from "./items";
import { SavingThrows } from "./saving-thorws";
import { Skills } from "./skills";
import { Spells, SpellSlots } from "./spells";

export interface HitPoints {
    max: number;
    current: number;
    temp: number;
}

export interface HitDie {
    type: Die;
    amount: number;
    max: number;
}

export interface Character {
    id?: number;
    name: string;
    race: string;
    class: string;
    subclass: string | null;
    background: string;
    level: number;
    speed: number; // in feet
    abilities: Abilities;
    skills: Skills;
    proficiencyBonus: number;
    savingThrows: SavingThrows
    hitPoints: HitPoints;
    hitDie: HitDie[];
    inflictedConditions: InflictedConditions;
    conditionImmunities: ConditionImmunities;
    exhaustionLevel: number;
    damageVulnerabilities: DamageTypeList;
    damageResistances: DamageTypeList;
    damageImmunities: DamageTypeList;
    armorClass: number;
    spellSlots: SpellSlots;
    spellcastingAbility?: AbilityName;
    spells: Spells; // e.g., "wisdom"
    inventory: InventoryItem[];
    equipped: {
        armor?: Armor;
        shield?: Shield;
        weapons: {
            mainHand?: Weapon;
            offHand?: Weapon;
        };
        container?: Container;
    };
    customResources: CustomResource[];
    features: Features;
    combatMode: boolean;
    currentRound: number;
    createdAt: Date;
    updatedAt: Date;
}
