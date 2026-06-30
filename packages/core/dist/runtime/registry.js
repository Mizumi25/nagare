const registry = {
    souls: new Map(),
    templates: new Map(),
    presets: new Map()
};
// SOULS
export function registerSoul(name, soul) {
    if (registry.souls.has(name)) {
        console.warn(`Nagare: soul "${name}" already registered — overwriting. Use unique soul names per page.`);
    }
    registry.souls.set(name, soul);
}
export function getSoul(name) {
    return registry.souls.get(name);
}
export function destroySoul(name) {
    registry.souls.delete(name);
}
// TEMPLATES
export function registerTemplate(name, template) {
    registry.templates.set(name, template);
}
export function getTemplate(name) {
    return registry.templates.get(name);
}
// PRESETS
export function registerPreset(name, preset) {
    registry.presets.set(name, preset);
}
export function getPreset(name) {
    return registry.presets.get(name);
}
// CLEANUP — call on unmount
export function clearRegistry() {
    registry.souls.clear();
    registry.templates.clear();
    registry.presets.clear();
}
export { registry };
//# sourceMappingURL=registry.js.map