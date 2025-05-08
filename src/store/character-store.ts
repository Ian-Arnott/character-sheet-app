import { create } from "zustand";
import { addCharacter, deleteCharacter, getAllCharacters, updateCharacter } from "@/lib/db";
import { Character } from "@/types/character";
import { defaultAbilities } from "@/types/abilities";
import { defaultSkills } from "@/types/skills";
import { defaultSavingThrows } from "@/types/saving-thorws";
import { SpellSlots } from "@/types/spells";

interface CharacterState {
  characters: Character[];
  selectedCharacterId: number | null;
  fetchCharacters: () => Promise<void>;
  createCharacter: () => Promise<number>;
  updateCharacter: (id: number, data: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: number | undefined) => Promise<void>;
  selectCharacter: (id: number | null | undefined) => void;
}

export const useCharacterStore = create<CharacterState>((set, get) => ({
  characters: [],
  selectedCharacterId: null,

  fetchCharacters: async () => {
    const characters = await getAllCharacters();
    set({ characters });
  },

  createCharacter: async () => {
    const defaultCharacter: Omit<Character, "id" | "createdAt" | "updatedAt"> = {
      name: "New Character",
      race: "",
      class: "",
      subclass: null,
      background: "",
      level: 1,
      speed: 30,
      proficiencyBonus: 2,
      exhaustionLevel: 0,
      combatMode: false,
      currentRound: 0,
      abilities: defaultAbilities(),
      skills: defaultSkills(),
      savingThrows: defaultSavingThrows(),
      inflictedConditions: [],
      conditionImmunities: [],
      damageVulnerabilities: [],
      damageResistances: [],
      damageImmunities: [],
      hitPoints: {
        max: 10,
        current: 10,
        temp: 0,
      },
      hitDie: [],
      armorClass: 10,
      spellSlots: {
        1: { max: 0, available: 0 },
        2: { max: 0, available: 0 },
        3: { max: 0, available: 0 },
        4: { max: 0, available: 0 },
        5: { max: 0, available: 0 },
        6: { max: 0, available: 0 },
        7: { max: 0, available: 0 },
        8: { max: 0, available: 0 },
        9: { max: 0, available: 0 },
      } as SpellSlots,
      spellcastingAbility: undefined,
      spells: [],
      inventory: [],
      equipped: {
        armor: undefined,
        shield: undefined,
        weapons: {
          mainHand: undefined,
          offHand: undefined,
        },
        container: undefined,
      },
      customResources: [],
      features: [],
    };

    const id = await addCharacter(defaultCharacter as Character);
    await get().fetchCharacters();
    set({ selectedCharacterId: id });
    return id;
  },

  updateCharacter: async (id, data) => {
    await updateCharacter(id, data);
    await get().fetchCharacters();
  },

  deleteCharacter: async (id) => {
    if (id === undefined) return;
    await deleteCharacter(id);
    await get().fetchCharacters();
    if (get().selectedCharacterId === id) {
      set({ selectedCharacterId: null });
    }
  },

  selectCharacter: (id) => {
    set({ selectedCharacterId: id });
  },
}));
