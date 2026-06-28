import type { SoulElement, Template, Preset, State } from '../../core/dist/types.js';
export declare function useNagare(fn: () => void): void;
export declare function soul(name: string): {
    default(config: {
        tw?: string;
        css?: Record<string, string>;
        js?: Function;
        state?: State;
    }): SoulElement;
};
export declare function template(name: string, config: {
    tw?: string;
    css?: Record<string, string>;
    js?: Function;
}): Template;
export declare function preset(name: string, config: {
    onStart?: {
        tw?: string;
        css?: Record<string, string>;
        js?: Function;
    };
    onUpdate?: {
        tw?: string;
        css?: Record<string, string>;
        js?: Function;
    };
    onEnd?: {
        tw?: string;
        css?: Record<string, string>;
        js?: Function;
    };
}): Preset;
//# sourceMappingURL=index.d.ts.map