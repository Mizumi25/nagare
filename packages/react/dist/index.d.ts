import { registerSoul, bindAll, getSoul } from '../../core/dist/index.js';
import type { Template, Preset, State } from '../../core/dist/types.js';
type PresetAttachment = {
    name: string;
    mode?: 'merge' | 'override';
};
type BehaviorConfig = {
    delay?: number;
    templates?: {
        name: string;
        mode?: 'merge' | 'override';
    }[];
    presets?: (string | PresetAttachment)[];
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
};
type SoulBuilder = {
    default(config: {
        tw?: string;
        css?: string;
        js?: Function;
        state?: State;
    }): SoulBuilder;
    behavior(name: string, config: BehaviorConfig): SoulBuilder;
    hover(config: BehaviorConfig): SoulBuilder;
    click(config: BehaviorConfig): SoulBuilder;
    press(config: BehaviorConfig): SoulBuilder;
    release(config: BehaviorConfig): SoulBuilder;
    focus(config: BehaviorConfig): SoulBuilder;
    blur(config: BehaviorConfig): SoulBuilder;
    scroll(config: BehaviorConfig): SoulBuilder;
    drag(config: BehaviorConfig): SoulBuilder;
    drop(config: BehaviorConfig): SoulBuilder;
    enter(config: BehaviorConfig): SoulBuilder;
    exit(config: BehaviorConfig): SoulBuilder;
    expand(config: BehaviorConfig): SoulBuilder;
    shrink(config: BehaviorConfig): SoulBuilder;
    lift(config: BehaviorConfig): SoulBuilder;
    fade(config: BehaviorConfig): SoulBuilder;
    rotate(config: BehaviorConfig): SoulBuilder;
    load(config: BehaviorConfig): SoulBuilder;
    reset(config: BehaviorConfig): SoulBuilder;
    onMount(config: BehaviorConfig): SoulBuilder;
    onVisible(config: BehaviorConfig): SoulBuilder;
    onInvisible(config: BehaviorConfig): SoulBuilder;
    tap(config: BehaviorConfig): SoulBuilder;
    longpress(config: BehaviorConfig): SoulBuilder;
    swipe(config: BehaviorConfig): SoulBuilder;
};
export declare function soul(name: string): SoulBuilder;
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
export { bindAll, getSoul, registerSoul };
//# sourceMappingURL=index.d.ts.map