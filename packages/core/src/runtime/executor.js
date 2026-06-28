// =========================================================
// NAGARE BEHAVIOR EXECUTOR
// =========================================================
import { getTemplate, getPreset } from './registry.js';
// Apply tw block to element
function applyTw(el, classes) {
    const list = classes.trim().split(/\s+/);
    list.forEach(cls => el.classList.add(cls));
}
// Apply css block to element
function applyCss(el, properties, state, params) {
    Object.entries(properties).forEach(([prop, value]) => {
        const resolved = resolveValue(value, state, params);
        el.style.setProperty(prop, resolved);
    });
}
// Apply @if conditions in css
function applyConditions(el, conditions, state, params) {
    if (!conditions)
        return;
    conditions.forEach((condition) => {
        const result = evaluateExpression(condition.expression, state, params);
        if (result) {
            applyCss(el, condition.properties, state, params);
        }
    });
}
// Resolve parameter values in strings
function resolveValue(value, state, params) {
    return value.replace(/\$?(\w+)/g, (match, key) => {
        if (params[key] !== undefined)
            return params[key];
        if (state[key] !== undefined)
            return state[key];
        return match;
    });
}
// Evaluate @if expressions
function evaluateExpression(expression, state, params) {
    try {
        const context = { ...state, ...params };
        const fn = new Function(...Object.keys(context), `return ${expression}`);
        return fn(...Object.values(context));
    }
    catch {
        return false;
    }
}
// Execute a single lifecycle phase
export function executeLifecycle(el, lifecycle, soul, params) {
    const state = soul.state;
    if (lifecycle.tw) {
        applyTw(el, lifecycle.tw.classes);
    }
    if (lifecycle.css) {
        applyCss(el, lifecycle.css.properties, state, params);
        applyConditions(el, lifecycle.css.conditions, state, params);
    }
    if (lifecycle.js) {
        try {
            lifecycle.js.fn.call({ state, params, el });
        }
        catch (err) {
            console.error(`Nagare: js block error`, err);
        }
    }
}
// Execute full behavior
export async function executeBehavior(el, behavior, soul, paramValues) {
    const delay = behavior.delay ?? 0;
    if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    behavior.presets.forEach(presetName => {
        const preset = getPreset(presetName);
        if (!preset)
            return;
        if (preset.onStart) {
            executeLifecycle(el, preset.onStart, soul, paramValues);
        }
    });
    behavior.templates.forEach(({ name }) => {
        const template = getTemplate(name);
        if (!template)
            return;
        const lifecycle = {
            tw: template.tw,
            css: template.css,
            js: template.js
        };
        executeLifecycle(el, lifecycle, soul, paramValues);
    });
    if (behavior.onStart) {
        executeLifecycle(el, behavior.onStart, soul, paramValues);
    }
    if (behavior.onUpdate) {
        executeLifecycle(el, behavior.onUpdate, soul, paramValues);
    }
    if (behavior.onEnd) {
        executeLifecycle(el, behavior.onEnd, soul, paramValues);
    }
}
//# sourceMappingURL=executor.js.map