export interface TwBlock {
    classes: string;
}
export interface CssBlock {
    properties: Record<string, string>;
    conditions: CssCondition[];
}
export interface CssCondition {
    expression: string;
    properties: Record<string, string>;
}
export interface JsBlock {
    fn: Function;
}
export interface Lifecycle {
    tw?: TwBlock;
    css?: CssBlock;
    js?: JsBlock;
}
export interface Behavior {
    name: string;
    params: string[];
    delay?: number;
    templates: TemplateAttachment[];
    presets: string[];
    onStart?: Lifecycle;
    onUpdate?: Lifecycle;
    onEnd?: Lifecycle;
}
export interface Template {
    name: string;
    tw?: TwBlock;
    css?: CssBlock;
    js?: JsBlock;
}
export type TemplateMode = 'merge' | 'override';
export interface TemplateAttachment {
    name: string;
    mode: TemplateMode;
}
export interface Preset {
    name: string;
    onStart?: Lifecycle;
    onUpdate?: Lifecycle;
    onEnd?: Lifecycle;
}
export type StateValue = boolean | number | string | null;
export interface State {
    [key: string]: StateValue;
}
export interface SoulElement {
    name: string;
    default?: Lifecycle & {
        state?: State;
    };
    behaviors: Map<string, Behavior>;
    state: State;
    domElement?: HTMLElement;
}
export interface NagareRegistry {
    souls: Map<string, SoulElement>;
    templates: Map<string, Template>;
    presets: Map<string, Preset>;
}
//# sourceMappingURL=types.d.ts.map