// =========================================================
// NAGARE STATE MANAGER
// =========================================================
import { getSoul } from '../runtime/registry.js';
export function getState(soulName) {
    return getSoul(soulName)?.state;
}
export function setState(soulName, key, value) {
    const soul = getSoul(soulName);
    if (!soul) {
        console.warn(`Nagare: soul "${soulName}" not found`);
        return;
    }
    soul.state[key] = value;
}
export function resetState(soulName) {
    const soul = getSoul(soulName);
    if (!soul)
        return;
    const defaultState = soul.default?.state ?? {};
    soul.state = { ...defaultState };
}
export function createState(initial) {
    return { ...initial };
}
//# sourceMappingURL=index.js.map