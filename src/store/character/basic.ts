import { SetFn } from '@/types/zustand-utils';

export const basicSetters = (set: SetFn) => ({
    setName: (name: string) => set({ name }),
    setRace: (race: string) => set({ race }),
    setClass: (charClass: string) => set({ class: charClass }),
    setSubclass: (subclass: string) => set({ subclass }),
    setLevel: (level: number) => set({ level }),
    setInspiration: (value: boolean) => set({ inspiration: value }),
});
