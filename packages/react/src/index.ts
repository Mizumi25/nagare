import { useEffect, useRef } from 'react'
import {
  registerSoul,
  registerTemplate,
  registerPreset,
  bindAll,
  unbindAll,
  getSoul,
  clearRegistry,
  destroySoul,
  observeMutations,
  stopObservingMutations
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

type BehaviorConfig<T extends State = State> = {
  delay?: number
  idleTimeout?: number
  templates?: { name: string; mode?: 'merge' | 'override' }[]
  presets?: (string | PresetAttachment)[]
  onStart?: { tw?: string; css?: string; js?: (this: { state: T; params: Record<string, any>; el: HTMLElement }) => void }
  onUpdate?: { tw?: string; css?: string; js?: (this: { state: T; params: Record<string, any>; el: HTMLElement }) => void }
  onEnd?: { tw?: string; css?: string; js?: (this: { state: T; params: Record<string, any>; el: HTMLElement }) => void }
}

type SoulBuilder<T extends State = State> = {
  default(config: {
    tw?: string
    css?: string
    js?: (this: { state: T; el: HTMLElement }) => void
    state?: T
  }): SoulBuilder<T>
  behavior(name: string, config: BehaviorConfig<T>): SoulBuilder<T>
  hover(config: BehaviorConfig<T>): SoulBuilder<T>
  click(config: BehaviorConfig<T>): SoulBuilder<T>
  press(config: BehaviorConfig<T>): SoulBuilder<T>
  release(config: BehaviorConfig<T>): SoulBuilder<T>
  focus(config: BehaviorConfig<T>): SoulBuilder<T>
  blur(config: BehaviorConfig<T>): SoulBuilder<T>
  scroll(config: BehaviorConfig<T>): SoulBuilder<T>
  drag(config: BehaviorConfig<T>): SoulBuilder<T>
  drop(config: BehaviorConfig<T>): SoulBuilder<T>
  enter(config: BehaviorConfig<T>): SoulBuilder<T>
  exit(config: BehaviorConfig<T>): SoulBuilder<T>
  expand(config: BehaviorConfig<T>): SoulBuilder<T>
  shrink(config: BehaviorConfig<T>): SoulBuilder<T>
  lift(config: BehaviorConfig<T>): SoulBuilder<T>
  fade(config: BehaviorConfig<T>): SoulBuilder<T>
  rotate(config: BehaviorConfig<T>): SoulBuilder<T>
  load(config: BehaviorConfig<T>): SoulBuilder<T>
  reset(config: BehaviorConfig<T>): SoulBuilder<T>
  onMount(config: BehaviorConfig<T>): SoulBuilder<T>
  onVisible(config: BehaviorConfig<T>): SoulBuilder<T>
  onInvisible(config: BehaviorConfig<T>): SoulBuilder<T>
  tap(config: BehaviorConfig<T>): SoulBuilder<T>
  longpress(config: BehaviorConfig<T>): SoulBuilder<T>
  swipe(config: BehaviorConfig<T>): SoulBuilder<T>
  onIdle(config: BehaviorConfig<T> & { idleTimeout?: number }): SoulBuilder<T>
  networkChanged(config: BehaviorConfig<T>): SoulBuilder<T>
  onOrientationChange(config: BehaviorConfig<T>): SoulBuilder<T>
}

// track which souls were registered in a given useSoul call
type SoulSession = {
  soulNames: string[]
}

function createSoulBuilder<T extends State = State>(soulName: string, session: SoulSession | null): SoulBuilder<T> {
  const addBehavior = (behaviorName: string, config: BehaviorConfig<T>): SoulBuilder<T> => {
    const soulEl = getSoul<T>(soulName)
    if (!soulEl) {
      console.warn(`Nagare: soul "${soulName}" not registered yet. Call .default() before adding behaviors.`)
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
      ...(behaviorName === 'onIdle' && config.idleTimeout
        ? { idleTimeout: config.idleTimeout } as any
        : {}),
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

  const builder: SoulBuilder<T> = {
    default(config) {
      const soulEl: SoulElement<T> = {
        name: soulName,
        behaviors: new Map(),
        state: (config.state ?? {}) as T,
        default: {
          tw: config.tw ? { classes: config.tw } : undefined,
          css: config.css ? parseCss(config.css) : undefined,
          js: config.js ? { fn: config.js } : undefined,
          state: config.state
        }
      }
      registerSoul<T>(soulName, soulEl)
      // track in session for cleanup
      if (session && !session.soulNames.includes(soulName)) {
        session.soulNames.push(soulName)
      }
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
    onIdle: (c) => addBehavior('onIdle', c),
    networkChanged: (c) => addBehavior('networkChanged', c),
    onOrientationChange: (c) => addBehavior('onOrientationChange', c),
  }

  return builder
}

// ── useSoul — React hook with auto cleanup ────────────────────────────────────
export function useSoul(fn: (soul: <T extends State = State>(name: string) => SoulBuilder<T>) => void) {
  useEffect(() => {
    const session: SoulSession = { soulNames: [] }

    const boundSoul = <T extends State = State>(name: string) => createSoulBuilder<T>(name, session)

    fn(boundSoul)
    bindAll()
    observeMutations() // auto-rebind newly added/removed [data-soul] elements

    return () => {
      // cleanup DOM listeners
      unbindAll()
      // cleanup registry for souls registered in this session
      session.soulNames.forEach(name => destroySoul(name))
    }
  }, [])
}

// ── Standalone soul() — for use outside useSoul ───────────────────────────────
export function soul<T extends State = State>(name: string): SoulBuilder<T> {
  return createSoulBuilder<T>(name, null)
}

// ── template ──────────────────────────────────────────────────────────────────
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

// ── preset ────────────────────────────────────────────────────────────────────
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

export { bindAll, unbindAll, getSoul, registerSoul, clearRegistry, destroySoul, observeMutations, stopObservingMutations }
