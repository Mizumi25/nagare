import type { NagareRegistry, SoulElement, Template, Preset, State } from '../types.js';
declare const registry: NagareRegistry;
export declare function registerSoul<T extends State = State>(name: string, soul: SoulElement<T>): void;
export declare function getSoul<T extends State = State>(name: string): SoulElement<T> | undefined;
export declare function destroySoul(name: string): void;
export declare function registerTemplate(name: string, template: Template): void;
export declare function getTemplate(name: string): Template | undefined;
export declare function registerPreset(name: string, preset: Preset): void;
export declare function getPreset(name: string): Preset | undefined;
export declare function clearRegistry(): void;
export { registry };
//# sourceMappingURL=registry.d.ts.map