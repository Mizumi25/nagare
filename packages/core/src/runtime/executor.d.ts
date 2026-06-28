import type { Behavior, Lifecycle, SoulElement } from '../types.js';
export declare function executeLifecycle(el: HTMLElement, lifecycle: Lifecycle, soul: SoulElement, params: Record<string, any>): void;
export declare function executeBehavior(el: HTMLElement, behavior: Behavior, soul: SoulElement, paramValues: Record<string, any>): Promise<void>;
//# sourceMappingURL=executor.d.ts.map