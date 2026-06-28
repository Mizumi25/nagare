import { registerSoul, registerTemplate, registerPreset, bindAll, getSoul } from '../../core/dist/index.js';
import { parseCss } from '../../core/dist/parser/css.js';
function buildLifecycle(config) {
    return {
        tw: config.tw ? { classes: config.tw } : undefined,
        css: config.css ? parseCss(config.css) : undefined,
        js: config.js ? { fn: config.js } : undefined
    };
}
function createSoulBuilder(soulName) {
    const addBehavior = (behaviorName, config) => {
        const soulEl = getSoul(soulName);
        if (!soulEl) {
            console.warn(`Nagare: soul "${soulName}" not registered yet`);
            return builder;
        }
        const resolvedPresets = (config.presets ?? []).map(p => typeof p === 'string'
            ? { name: p, mode: 'merge' }
            : { name: p.name, mode: p.mode ?? 'merge' });
        const b = {
            name: behaviorName,
            params: [],
            delay: config.delay,
            templates: config.templates?.map(t => ({
                name: t.name,
                mode: t.mode ?? 'merge'
            })) ?? [],
            presets: resolvedPresets,
            onStart: config.onStart ? buildLifecycle(config.onStart) : undefined,
            onUpdate: config.onUpdate ? buildLifecycle(config.onUpdate) : undefined,
            onEnd: config.onEnd ? buildLifecycle(config.onEnd) : undefined
        };
        soulEl.behaviors.set(behaviorName, b);
        return builder;
    };
    const builder = {
        default(config) {
            const soulEl = {
                name: soulName,
                behaviors: new Map(),
                state: config.state ?? {},
                default: {
                    tw: config.tw ? { classes: config.tw } : undefined,
                    css: config.css ? parseCss(config.css) : undefined,
                    js: config.js ? { fn: config.js } : undefined,
                    state: config.state
                }
            };
            registerSoul(soulName, soulEl);
            return builder;
        },
        behavior: addBehavior,
        hover: (c) => addBehavior('hover', c),
        click: (c) => addBehavior('click', c),
        press: (c) => addBehavior('press', c),
        release: (c) => addBehavior('release', c),
        focus: (c) => addBehavior('focus', c),
        blur: (c) => addBehavior('blur', c),
        scroll: (c) => addBehavior('scroll', c),
        drag: (c) => addBehavior('drag', c),
        drop: (c) => addBehavior('drop', c),
        enter: (c) => addBehavior('enter', c),
        exit: (c) => addBehavior('exit', c),
        expand: (c) => addBehavior('expand', c),
        shrink: (c) => addBehavior('shrink', c),
        lift: (c) => addBehavior('lift', c),
        fade: (c) => addBehavior('fade', c),
        rotate: (c) => addBehavior('rotate', c),
        load: (c) => addBehavior('load', c),
        reset: (c) => addBehavior('reset', c),
        onMount: (c) => addBehavior('onMount', c),
        onVisible: (c) => addBehavior('onVisible', c),
        onInvisible: (c) => addBehavior('onInvisible', c),
        tap: (c) => addBehavior('tap', c),
        longpress: (c) => addBehavior('longpress', c),
        swipe: (c) => addBehavior('swipe', c),
    };
    return builder;
}
export function soul(name) {
    return createSoulBuilder(name);
}
export function template(name, config) {
    const t = {
        name,
        tw: config.tw ? { classes: config.tw } : undefined,
        css: config.css ? parseCss(config.css) : undefined,
        js: config.js ? { fn: config.js } : undefined
    };
    registerTemplate(name, t);
    return t;
}
export function preset(name, config) {
    const toLifecycle = (phase) => {
        if (!phase)
            return undefined;
        return {
            tw: phase.tw ? { classes: phase.tw } : undefined,
            css: phase.css ? parseCss(phase.css) : undefined,
            js: phase.js ? { fn: phase.js } : undefined
        };
    };
    const p = {
        name,
        onStart: toLifecycle(config.onStart),
        onUpdate: toLifecycle(config.onUpdate),
        onEnd: toLifecycle(config.onEnd)
    };
    registerPreset(name, p);
    return p;
}
export { bindAll, getSoul, registerSoul };
//# sourceMappingURL=index.js.map