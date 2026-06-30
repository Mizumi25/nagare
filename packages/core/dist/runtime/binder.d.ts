export declare function unbindSoul(el: HTMLElement): void;
export declare function unbindAll(): void;
export declare function bindSoul(name: string): void;
export declare function bindAll(): void;
/**
 * Starts watching the DOM for added/removed [data-soul] elements and
 * automatically binds/unbinds them. Idempotent — calling it multiple
 * times has no extra effect while already observing.
 */
export declare function observeMutations(root?: Element | Document): void;
export declare function stopObservingMutations(): void;
export declare function bindSouls(names: string[]): void;
export declare function unbindSouls(names: string[]): void;
//# sourceMappingURL=binder.d.ts.map