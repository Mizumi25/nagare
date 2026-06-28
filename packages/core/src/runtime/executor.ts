import type { Behavior, Lifecycle, SoulElement, CssCondition } from '../types.js'
import { getTemplate, getPreset } from './registry.js'

function applyTw(el: HTMLElement, classes: string) {
  const list = classes.trim().split(/\s+/)
  list.forEach(cls => el.classList.add(cls))
}

function applyCss(el: HTMLElement, properties: Record<string, string>, state: Record<string, any>, params: Record<string, any>) {
  if (!properties) return
  Object.entries(properties).forEach(([prop, value]) => {
    const resolved = resolveValue(value, state, params)
    el.style.setProperty(prop, resolved)
  })
}

function applyConditions(el: HTMLElement, conditions: CssCondition[], state: Record<string, any>, params: Record<string, any>) {
  if (!conditions) return
  conditions.forEach((condition: CssCondition) => {
    const result = evaluateExpression(condition.expression, state, params)
    if (result) applyCss(el, condition.properties, state, params)
  })
}

function resolveValue(value: string, state: Record<string, any>, params: Record<string, any>): string {
  if (!value) return ''
  return value.replace(/\$?(\w+)/g, (match, key) => {
    if (params[key] !== undefined) return String(params[key])
    if (state[key] !== undefined) return String(state[key])
    return match
  })
}

function evaluateExpression(expression: string, state: Record<string, any>, params: Record<string, any>): boolean {
  try {
    const context = { ...state, ...params }
    const fn = new Function(...Object.keys(context), `return ${expression}`)
    return fn(...Object.values(context))
  } catch {
    return false
  }
}

export function executeLifecycle(el: HTMLElement, lifecycle: Lifecycle, soul: SoulElement, params: Record<string, any>) {
  const state = soul.state

  if (lifecycle.tw) applyTw(el, lifecycle.tw.classes)

  // js runs FIRST so state is updated before css evaluates
  if (lifecycle.js) {
    try {
      lifecycle.js.fn.call({ state, params, el })
    } catch (err) {
      console.error(`Nagare: js block error`, err)
    }
  }

  // css runs AFTER js so @if sees updated state
  if (lifecycle.css) {
    applyCss(el, lifecycle.css.properties, state, params)
    applyConditions(el, lifecycle.css.conditions ?? [], state, params)
  }
}

export async function executeBehavior(el: HTMLElement, behavior: Behavior, soul: SoulElement, paramValues: Record<string, any>) {
  const delay = behavior.delay ?? 0
  if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay))

  const resolvedPresets = behavior.presets.map(({ name, mode }) => ({
    preset: getPreset(name),
    mode
  })).filter(p => p.preset)

  const resolvedTemplates = behavior.templates.map(({ name, mode }) => ({
    template: getTemplate(name),
    mode
  })).filter(t => t.template)

  // onStart
  resolvedPresets.forEach(({ preset }) => {
    if (preset!.onStart) executeLifecycle(el, preset!.onStart, soul, paramValues)
  })
  resolvedTemplates.forEach(({ template }) => {
    executeLifecycle(el, { tw: template!.tw, css: template!.css, js: template!.js }, soul, paramValues)
  })
  if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, paramValues)

  // onUpdate
  if (behavior.onUpdate) {
    resolvedPresets.forEach(({ preset }) => {
      if (preset!.onUpdate) executeLifecycle(el, preset!.onUpdate, soul, paramValues)
    })
    executeLifecycle(el, behavior.onUpdate, soul, paramValues)
  }

  // onEnd
  if (!behavior.onUpdate) {
    await new Promise(resolve => setTimeout(resolve, 300))
    resolvedPresets.forEach(({ preset }) => {
      if (preset!.onEnd) executeLifecycle(el, preset!.onEnd, soul, paramValues)
    })
    if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, paramValues)
  }
}
