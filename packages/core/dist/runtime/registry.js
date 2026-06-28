// =========================================================
// NAGARE REGISTRY
// =========================================================
const registry = {
    souls: new Map(),
    templates: new Map(),
    presets: new Map()
};
// SOULS
export function registerSoul(name, soul) {
    registry.souls.set(name, soul);
}
export function getSoul(name) {
    return registry.souls.get(name);
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
export { registry };
//# sourceMappingURL=registry.js.map