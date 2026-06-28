import { useEffect } from 'react';
import { registerSoul, registerTemplate, registerPreset, bindAll } from '../../core/dist/index.js';
export function useNagare(fn) {
    useEffect(() => {
        fn();
        bindAll();
    }, []);
}
export function soul(name) {
    return {
        default(config) {
            const existing = {
                name,
                behaviors: new Map(),
                state: config.state ?? {},
                default: {
                    tw: config.tw ? { classes: config.tw } : undefined,
                    css: config.css
                        ? { properties: config.css, conditions: [] }
                        : undefined,
                    js: config.js ? { fn: config.js } : undefined,
                    state: config.state
                }
            };
            registerSoul(name, existing);
            return existing;
        }
    };
}
export function template(name, config) {
    const t = {
        name,
        tw: config.tw ? { classes: config.tw } : undefined,
        css: config.css
            ? { properties: config.css, conditions: [] }
            : undefined,
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
            css: phase.css ? { properties: phase.css, conditions: [] } : undefined,
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
//# sourceMappingURL=index.js.map