// =========================================================
// NAGARE REGISTRY
// =========================================================

import type { NagareRegistry, SoulElement, Template, Preset } from '../types.js'

const registry: NagareRegistry = {
  souls: new Map(),
  templates: new Map(),
  presets: new Map()
}

// SOULS
export function registerSoul(name: string, soul: SoulElement) {
  registry.souls.set(name, soul)
}

export function getSoul(name: string): SoulElement | undefined {
  return registry.souls.get(name)
}

// TEMPLATES
export function registerTemplate(name: string, template: Template) {
  registry.templates.set(name, template)
}

export function getTemplate(name: string): Template | undefined {
  return registry.templates.get(name)
}

// PRESETS
export function registerPreset(name: string, preset: Preset) {
  registry.presets.set(name, preset)
}

export function getPreset(name: string): Preset | undefined {
  return registry.presets.get(name)
}

export { registry }
