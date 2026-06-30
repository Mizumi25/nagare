import { registerSoul, bindAll, bindSouls, unbindAll, unbindSouls, getSoul, clearRegistry, destroySoul, observeMutations, stopObservingMutations } from '../../core/dist/index.js';
import type { Template, Preset, State } from '../../core/dist/types.js';
type PresetAttachment = {
    name: string;
    mode?: 'merge' | 'override';
};
type BehaviorConfig<T extends State = State> = {
    delay?: number;
    idleTimeout?: number;
    templates?: {
        name: string;
        mode?: 'merge' | 'override';
    }[];
    presets?: (string | PresetAttachment)[];
    onStart?: {
        tw?: string;
        css?: string;
        js?: (this: {
            state: T;
            params: Record<string, any>;
            el: HTMLElement;
        }) => void;
    };
    onUpdate?: {
        tw?: string;
        css?: string;
        js?: (this: {
            state: T;
            params: Record<string, any>;
            el: HTMLElement;
        }) => void;
    };
    onEnd?: {
        tw?: string;
        css?: string;
        js?: (this: {
            state: T;
            params: Record<string, any>;
            el: HTMLElement;
        }) => void;
    };
};
type SoulBuilder<T extends State = State> = {
    default(config: {
        tw?: string;
        css?: string;
        js?: (this: {
            state: T;
            el: HTMLElement;
        }) => void;
        state?: T;
    }): SoulBuilder<T>;
    behavior(name: string, config: BehaviorConfig<T>): SoulBuilder<T>;
    hover(config: BehaviorConfig<T>): SoulBuilder<T>;
    click(config: BehaviorConfig<T>): SoulBuilder<T>;
    press(config: BehaviorConfig<T>): SoulBuilder<T>;
    release(config: BehaviorConfig<T>): SoulBuilder<T>;
    focus(config: BehaviorConfig<T>): SoulBuilder<T>;
    blur(config: BehaviorConfig<T>): SoulBuilder<T>;
    scroll(config: BehaviorConfig<T>): SoulBuilder<T>;
    drag(config: BehaviorConfig<T>): SoulBuilder<T>;
    drop(config: BehaviorConfig<T>): SoulBuilder<T>;
    enter(config: BehaviorConfig<T>): SoulBuilder<T>;
    exit(config: BehaviorConfig<T>): SoulBuilder<T>;
    expand(config: BehaviorConfig<T>): SoulBuilder<T>;
    shrink(config: BehaviorConfig<T>): SoulBuilder<T>;
    lift(config: BehaviorConfig<T>): SoulBuilder<T>;
    fade(config: BehaviorConfig<T>): SoulBuilder<T>;
    rotate(config: BehaviorConfig<T>): SoulBuilder<T>;
    load(config: BehaviorConfig<T>): SoulBuilder<T>;
    reset(config: BehaviorConfig<T>): SoulBuilder<T>;
    onMount(config: BehaviorConfig<T>): SoulBuilder<T>;
    onVisible(config: BehaviorConfig<T>): SoulBuilder<T>;
    onInvisible(config: BehaviorConfig<T>): SoulBuilder<T>;
    tap(config: BehaviorConfig<T>): SoulBuilder<T>;
    longpress(config: BehaviorConfig<T>): SoulBuilder<T>;
    swipe(config: BehaviorConfig<T>): SoulBuilder<T>;
    onIdle(config: BehaviorConfig<T> & {
        idleTimeout?: number;
    }): SoulBuilder<T>;
    networkChanged(config: BehaviorConfig<T>): SoulBuilder<T>;
    onOrientationChange(config: BehaviorConfig<T>): SoulBuilder<T>;
};
export declare function useSoul(fn: (soul: <T extends State = State>(name: string) => SoulBuilder<T>) => void): void;
export declare function soul<T extends State = State>(name: string): SoulBuilder<T>;
export declare function template(name: string, config: {
    tw?: string;
    css?: string;
    js?: Function;
}): Template;
export declare function preset(name: string, config: {
    onStart?: {
        tw?: string;
        css?: string;
        js?: Function;
    };
    onUpdate?: {
        tw?: string;
        css?: string;
        js?: Function;
    };
    onEnd?: {
        tw?: string;
        css?: string;
        js?: Function;
    };
}): Preset;
export { bindAll, unbindAll, bindSouls, unbindSouls, getSoul, registerSoul, clearRegistry, destroySoul, observeMutations, stopObservingMutations };
//# sourceMappingURL=index.d.ts.map