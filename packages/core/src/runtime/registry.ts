import type { NagareRegistry, SoulElement, Template, Preset } from '../types.js'

const registry: NagareRegistry = {
  souls: new Map(),
  templates: new Map(),
  presets: new Map()
}

// SOULS
export function registerSoul(name: string, soul: SoulElement) {
  if (registry.souls.has(name)) {
    console.warn(`Nagare: soul "${name}" already registered — overwriting. Use unique soul names per page.`)
  }
  registry.souls.set(name, soul)
}

export function getSoul(name: string): SoulElement | undefined {
  return registry.souls.get(name)
}

export function destroySoul(name: string) {
  registry.souls.delete(name)
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

// CLEANUP — call on unmount
export function clearRegistry() {
  registry.souls.clear()
  registry.templates.clear()
  registry.presets.clear()
}

export { registry }
