import { CharacterState } from './character';
import { StoreApi } from 'zustand';

export type SetFn = StoreApi<CharacterState>['setState'];
export type GetFn = StoreApi<CharacterState>['getState'];
