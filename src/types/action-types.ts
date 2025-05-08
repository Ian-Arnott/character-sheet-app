export type ActionType =
    | "action"
    | "bonusAction"
    | "reaction"
    | "freeAction"
    | "passive"
    | "special"
    | "initiative" // triggers when rolling initiative
    | "turnStart"
    | "turnEnd"
    | "roundStart"
    | "roundEnd";
