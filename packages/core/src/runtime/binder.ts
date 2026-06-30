import type { SoulElement } from '../types.js'
import { getSoul } from './registry.js'
import { executeBehavior, executeLifecycle } from './executor.js'

const listenerMap = new WeakMap<HTMLElement, (() => void)[]>()

function addListener(
  el: HTMLElement,
  event: string,
  handler: EventListener,
  options?: AddEventListenerOptions
) {
  el.addEventListener(event, handler, options)
  const cleanups = listenerMap.get(el) ?? []
  cleanups.push(() => el.removeEventListener(event, handler))
  listenerMap.set(el, cleanups)
}

export function unbindSoul(el: HTMLElement) {
  const cleanups = listenerMap.get(el)
  if (cleanups) {
    cleanups.forEach(fn => fn())
    listenerMap.delete(el)
  }
}

export function unbindAll() {
  document.querySelectorAll('[data-soul]').forEach(el => {
    unbindSoul(el as HTMLElement)
  })
}

function bindElement(el: HTMLElement, name: string) {
  const soul = getSoul(name)
  if (!soul) {
    console.warn(`Nagare: soul "${name}" not registered`)
    return
  }

  unbindSoul(el)
  soul.domElement = el

  if (soul.default) {
    if (soul.default.tw) {
      el.classList.add(...soul.default.tw.classes.trim().split(/\s+/).filter(Boolean))
    }
    if (soul.default.css) {
      Object.entries(soul.default.css.properties).forEach(([prop, val]) => {
        el.style.setProperty(prop, val)
      })
    }
    if (soul.default.js) {
      try {
        soul.default.js.fn.call({ state: soul.state, el })
      } catch (err) {
        console.error(`Nagare: default js block error`, err)
      }
    }
  }

  soul.behaviors.forEach((behavior, behaviorName) => {
    const params: Record<string, any> = {}

    if (behaviorName === 'hover') {
      addListener(el, 'mouseenter', () => executeBehavior(el, behavior, soul, params))
      addListener(el, 'mouseleave', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'click') {
      addListener(el, 'click', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'tap') {
      let startTime = 0, startX = 0, startY = 0
      const onStart = (e: Event) => {
        const t = (e as TouchEvent).touches?.[0] ?? (e as MouseEvent)
        startTime = Date.now()
        startX = t.clientX
        startY = t.clientY
      }
      const onEnd = (e: Event) => {
        const t = (e as TouchEvent).changedTouches?.[0] ?? (e as MouseEvent)
        const elapsed = Date.now() - startTime
        const dx = Math.abs(t.clientX - startX)
        const dy = Math.abs(t.clientY - startY)
        if (elapsed < 200 && dx < 10 && dy < 10) {
          executeBehavior(el, behavior, soul, params)
        }
      }
      addListener(el, 'touchstart', onStart as EventListener, { passive: true })
      addListener(el, 'touchend', onEnd as EventListener)
    }

    if (behaviorName === 'longpress') {
      let timer: ReturnType<typeof setTimeout> | null = null
      const start = (e: Event) => {
        e.preventDefault()
        timer = setTimeout(() => executeBehavior(el, behavior, soul, params), 500)
      }
      const cancel = () => { if (timer) clearTimeout(timer) }
      addListener(el, 'touchstart', start as EventListener, { passive: false })
      addListener(el, 'touchend', cancel)
      addListener(el, 'touchmove', cancel)
    }

    if (behaviorName === 'swipe') {
      let startX = 0, startY = 0
      addListener(el, 'touchstart', (e) => {
        startX = (e as TouchEvent).touches[0].clientX
        startY = (e as TouchEvent).touches[0].clientY
      }, { passive: true })
      addListener(el, 'touchend', (e) => {
        const dx = (e as TouchEvent).changedTouches[0].clientX - startX
        const dy = (e as TouchEvent).changedTouches[0].clientY - startY
        const absDx = Math.abs(dx), absDy = Math.abs(dy)
        if (Math.max(absDx, absDy) < 30) return
        const direction = absDx > absDy
          ? (dx > 0 ? 'right' : 'left')
          : (dy > 0 ? 'down' : 'up')
        executeBehavior(el, behavior, soul, { ...params, direction })
      })
    }

    if (behaviorName === 'press') {
      addListener(el, 'mousedown', () => {
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      })
      addListener(el, 'mouseup', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
      addListener(el, 'touchstart', (e) => {
        e.preventDefault()
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      }, { passive: false })
      addListener(el, 'touchend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'release') {
      addListener(el, 'mouseup', () => executeBehavior(el, behavior, soul, params))
      addListener(el, 'touchend', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'focus') {
      addListener(el, 'focus', () => executeBehavior(el, behavior, soul, params))
      addListener(el, 'blur', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'blur') {
      addListener(el, 'blur', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'enter') {
      addListener(el, 'mouseenter', () => executeBehavior(el, behavior, soul, params))
      addListener(el, 'touchstart', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'exit') {
      addListener(el, 'mouseleave', () => executeBehavior(el, behavior, soul, params))
      addListener(el, 'touchend', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'onMount') {
      executeBehavior(el, behavior, soul, params)
    }

    if (behaviorName === 'onVisible' || behaviorName === 'onInvisible') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && behaviorName === 'onVisible') {
            executeBehavior(el, behavior, soul, params)
          }
          if (!entry.isIntersecting && behaviorName === 'onInvisible') {
            executeBehavior(el, behavior, soul, params)
          }
        })
      })
      observer.observe(el)
      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => observer.disconnect())
      listenerMap.set(el, cleanups)
    }

    if (behaviorName === 'scroll') {
      const handler = () => {
        executeBehavior(el, behavior, soul, { ...params, scrollY: window.scrollY })
      }
      window.addEventListener('scroll', handler, { passive: true })
      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => window.removeEventListener('scroll', handler))
      listenerMap.set(el, cleanups)
    }

    if (behaviorName === 'drag') {
      addListener(el, 'dragstart', () => {
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      })
      addListener(el, 'dragend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
      addListener(el, 'touchstart', (e) => {
        e.preventDefault()
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      }, { passive: false })
      addListener(el, 'touchmove', (e) => {
        e.preventDefault()
        const touch = (e as TouchEvent).touches[0]
        if (behavior.onUpdate) executeLifecycle(el, behavior.onUpdate, soul, {
          ...params, x: touch.clientX, y: touch.clientY
        })
      }, { passive: false })
      addListener(el, 'touchend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'resize') {
      const handler = () => {
        executeBehavior(el, behavior, soul, {
          ...params,
          width: window.innerWidth,
          height: window.innerHeight
        })
      }
      window.addEventListener('resize', handler)
      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => window.removeEventListener('resize', handler))
      listenerMap.set(el, cleanups)
    }

    // ── NEW: onIdle ──
    if (behaviorName === 'onIdle') {
      const timeout = (behavior as any).idleTimeout ?? 3000
      let timer: ReturnType<typeof setTimeout> | null = null
      let idle = false

      const resetIdle = () => {
        if (idle) {
          idle = false
          if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
        }
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          idle = true
          executeBehavior(el, behavior, soul, params)
        }, timeout)
      }

      const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click']
      events.forEach(event => {
        window.addEventListener(event, resetIdle, { passive: true })
        const cleanups = listenerMap.get(el) ?? []
        cleanups.push(() => window.removeEventListener(event, resetIdle))
        listenerMap.set(el, cleanups)
      })

      // start timer immediately
      resetIdle()
      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => { if (timer) clearTimeout(timer) })
      listenerMap.set(el, cleanups)
    }

    // ── NEW: networkChanged ──
    if (behaviorName === 'networkChanged') {
      const onOnline = () => executeBehavior(el, behavior, soul, { ...params, online: true })
      const onOffline = () => executeBehavior(el, behavior, soul, { ...params, online: false })

      window.addEventListener('online', onOnline)
      window.addEventListener('offline', onOffline)

      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => {
        window.removeEventListener('online', onOnline)
        window.removeEventListener('offline', onOffline)
      })
      listenerMap.set(el, cleanups)
    }

    // ── NEW: onOrientationChange ──
    if (behaviorName === 'onOrientationChange') {
      const handler = () => {
        const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        executeBehavior(el, behavior, soul, { ...params, orientation })
      }

      window.addEventListener('orientationchange', handler)
      window.addEventListener('resize', handler)

      const cleanups = listenerMap.get(el) ?? []
      cleanups.push(() => {
        window.removeEventListener('orientationchange', handler)
        window.removeEventListener('resize', handler)
      })
      listenerMap.set(el, cleanups)
    }
  })
}

export function bindSoul(name: string) {
  const elements = document.querySelectorAll(`[data-soul="${name}"]`)
  if (elements.length === 0) {
    console.warn(`Nagare: no element found with data-soul="${name}"`)
    return
  }
  elements.forEach(el => bindElement(el as HTMLElement, name))
}

export function bindAll() {
  const elements = document.querySelectorAll('[data-soul]')
  elements.forEach(el => {
    const name = el.getAttribute('data-soul')
    if (name) bindElement(el as HTMLElement, name)
  })
}
