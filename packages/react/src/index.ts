import {
  registerSoul,
  registerTemplate,
  registerPreset,
  bindAll,
  getSoul
} from '../../core/dist/index.js'

import { parseCss } from '../../core/dist/parser/css.js'

import type {
  SoulElement,
  Template,
  Preset,
  State,
  Behavior,
  Lifecycle
} from '../../core/dist/types.js'

function buildLifecycle(config: {
  tw?: string
  css?: string
  js?: Function
}): Lifecycle {
  return {
    tw: config.tw ? { classes: config.tw } : undefined,
    css: config.css ? parseCss(config.css) : undefined,
    js: config.js ? { fn: config.js } : undefined
  }
}

type PresetAttachment = {
  name: string
  mode?: 'merge' | 'override'
}

type BehaviorConfig = {
  delay?: number
  templates?: { name: string; mode?: 'merge' | 'override' }[]
  presets?: (string | PresetAttachment)[]
  onStart?: { tw?: string; css?: string; js?: Function }
  onUpdate?: { tw?: string; css?: string; js?: Function }
  onEnd?: { tw?: string; css?: string; js?: Function }
}

type SoulBuilder = {
  default(config: {
    tw?: string
    css?: string
    js?: Function
    state?: State
  }): SoulBuilder
  behavior(name: string, config: BehaviorConfig): SoulBuilder
  hover(config: BehaviorConfig): SoulBuilder
  click(config: BehaviorConfig): SoulBuilder
  press(config: BehaviorConfig): SoulBuilder
  release(config: BehaviorConfig): SoulBuilder
  focus(config: BehaviorConfig): SoulBuilder
  blur(config: BehaviorConfig): SoulBuilder
  scroll(config: BehaviorConfig): SoulBuilder
  drag(config: BehaviorConfig): SoulBuilder
  drop(config: BehaviorConfig): SoulBuilder
  enter(config: BehaviorConfig): SoulBuilder
  exit(config: BehaviorConfig): SoulBuilder
  expand(config: BehaviorConfig): SoulBuilder
  shrink(config: BehaviorConfig): SoulBuilder
  lift(config: BehaviorConfig): SoulBuilder
  fade(config: BehaviorConfig): SoulBuilder
  rotate(config: BehaviorConfig): SoulBuilder
  load(config: BehaviorConfig): SoulBuilder
  reset(config: BehaviorConfig): SoulBuilder
  onMount(config: BehaviorConfig): SoulBuilder
  onVisible(config: BehaviorConfig): SoulBuilder
  onInvisible(config: BehaviorConfig): SoulBuilder
  tap(config: BehaviorConfig): SoulBuilder
  longpress(config: BehaviorConfig): SoulBuilder
  swipe(config: BehaviorConfig): SoulBuilder
}

function createSoulBuilder(soulName: string): SoulBuilder {
  const addBehavior = (behaviorName: string, config: BehaviorConfig): SoulBuilder => {
    const soulEl = getSoul(soulName)
    if (!soulEl) {
      console.warn(`Nagare: soul "${soulName}" not registered yet`)
      return builder
    }

    const resolvedPresets = (config.presets ?? []).map(p => 
      typeof p === 'string' 
        ? { name: p, mode: 'merge' as const }
        : { name: p.name, mode: p.mode ?? 'merge' as const }
    )

    const b: Behavior = {
      name: behaviorName,
      params: [],
      delay: config.delay,
      templates: config.templates?.map(t => ({
        name: t.name,
        mode: t.mode ?? 'merge' as const
      })) ?? [],
      presets: resolvedPresets,
      onStart: config.onStart ? buildLifecycle(config.onStart) : undefined,
      onUpdate: config.onUpdate ? buildLifecycle(config.onUpdate) : undefined,
      onEnd: config.onEnd ? buildLifecycle(config.onEnd) : undefined
    }
    soulEl.behaviors.set(behaviorName, b)
    return builder
  }

  const builder: SoulBuilder = {
    default(config) {
      const soulEl: SoulElement = {
        name: soulName,
        behaviors: new Map(),
        state: config.state ?? {},
        default: {
          tw: config.tw ? { classes: config.tw } : undefined,
          css: config.css ? parseCss(config.css) : undefined,
          js: config.js ? { fn: config.js } : undefined,
          state: config.state
        }
      }
      registerSoul(soulName, soulEl)
      return builder
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
  }

  return builder
}

export function soul(name: string): SoulBuilder {
  return createSoulBuilder(name)
}

export function template(name: string, config: {
  tw?: string
  css?: string
  js?: Function
}) {
  const t: Template = {
    name,
    tw: config.tw ? { classes: config.tw } : undefined,
    css: config.css ? parseCss(config.css) : undefined,
    js: config.js ? { fn: config.js } : undefined
  }
  registerTemplate(name, t)
  return t
}

export function preset(name: string, config: {
  onStart?: { tw?: string; css?: string; js?: Function }
  onUpdate?: { tw?: string; css?: string; js?: Function }
  onEnd?: { tw?: string; css?: string; js?: Function }
}) {
  const toLifecycle = (phase: typeof config.onStart) => {
    if (!phase) return undefined
    return {
      tw: phase.tw ? { classes: phase.tw } : undefined,
      css: phase.css ? parseCss(phase.css) : undefined,
      js: phase.js ? { fn: phase.js } : undefined
    }
  }
  const p: Preset = {
    name,
    onStart: toLifecycle(config.onStart),
    onUpdate: toLifecycle(config.onUpdate),
    onEnd: toLifecycle(config.onEnd)
  }
  registerPreset(name, p)
  return p
}

export { bindAll, getSoul, registerSoul }
