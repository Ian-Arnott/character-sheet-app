export type DieSize = 4 | 6 | 8 | 10 | 12 | 20 | 100;

export interface Die {
    die: DieSize;      // e.g., 6 for a d6
    count: number;     // number of dice, e.g., 2 for 2d6
    modifier?: number; // optional flat bonus like +3
}