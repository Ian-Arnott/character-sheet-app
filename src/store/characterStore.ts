import { create } from "zustand";
import localforage from "localforage";

// Define character state
interface CharacterState {
    name: string;
    level: number;
    class: string;
    subclass: string;
    race: string;
    background: string;
    stats: { [key: string]: number };
    resources: { [key: string]: number };
    inspiration: boolean;
    setCharacter: (updates: Partial<CharacterState>) => void;
    loadCharacter: () => Promise<void>;
    proficiencyBonus: () => number;
}

// Zustand store with IndexedDB persistence
export const useCharacterStore = create<CharacterState>((set) => ({
    name: "",
    level: 1,
    class: "",
    subclass: "",
    race: "",
    background: "",
    stats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    resources: { hp: 10, ac: 10, speed: 30 },
    inspiration: false,

    // Update character data
    setCharacter: (updates) => {
        set((state) => {
            const newState = { ...state, ...updates };
            const { setCharacter, loadCharacter, proficiencyBonus, ...serializableState } = newState;
            // localforage.setItem("character", serializableState);
            return newState;
        });
    },

    // Load character from IndexedDB
    loadCharacter: async () => {
        // const savedData = await localforage.getItem<CharacterState>("character");
        // if (savedData) set(savedData);
    },

    proficiencyBonus: (): number => {
        const { level } = useCharacterStore.getState();
        return Math.floor((level - 1) / 4) + 2;
    }
}));

// Load character on app start
// useCharacterStore.getState().loadCharacter();
