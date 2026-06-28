import type { State, StateValue } from '../types.js';
export declare function getState(soulName: string): State | undefined;
export declare function setState(soulName: string, key: string, value: StateValue): void;
export declare function resetState(soulName: string): void;
export declare function createState(initial: State): State;
//# sourceMappingURL=index.d.ts.map