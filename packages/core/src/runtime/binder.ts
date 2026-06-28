import type { SoulElement } from '../types.js'
import { getSoul } from './registry.js'
import { executeBehavior, executeLifecycle } from './executor.js'

export function bindSoul(name: string) {
  const el = document.querySelector(`[data-soul="${name}"]`) as HTMLElement | null

  if (!el) {
    console.warn(`Nagare: no element found with data-soul="${name}"`)
    return
  }

  const soul = getSoul(name)
  if (!soul) {
    console.warn(`Nagare: soul "${name}" not registered`)
    return
  }

  soul.domElement = el

  // mount default
  if (soul.default) {
    if (soul.default.tw) {
      el.classList.add(...soul.default.tw.classes.trim().split(/\s+/))
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
      el.addEventListener('mouseenter', () => executeBehavior(el, behavior, soul, params))
      el.addEventListener('mouseleave', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'click') {
      el.addEventListener('click', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'tap') {
      let touchStartTime = 0
      let touchStartX = 0
      let touchStartY = 0
      el.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now()
        touchStartX = e.touches[0].clientX
        touchStartY = e.touches[0].clientY
      }, { passive: true })
      el.addEventListener('touchend', (e) => {
        const elapsed = Date.now() - touchStartTime
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartX)
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY)
        // tap = quick touch under 200ms with minimal movement
        if (elapsed < 200 && dx < 10 && dy < 10) {
          executeBehavior(el, behavior, soul, params)
        }
      })
    }

    if (behaviorName === 'longpress') {
      let timer: ReturnType<typeof setTimeout> | null = null
      el.addEventListener('touchstart', (e) => {
        e.preventDefault()
        timer = setTimeout(() => {
          executeBehavior(el, behavior, soul, params)
        }, 500)
      }, { passive: false })
      el.addEventListener('touchend', () => {
        if (timer) clearTimeout(timer)
      })
      el.addEventListener('touchmove', () => {
        if (timer) clearTimeout(timer)
      })
    }

    if (behaviorName === 'swipe') {
      let startX = 0
      let startY = 0
      el.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }, { passive: true })
      el.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX
        const dy = e.changedTouches[0].clientY - startY
        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)
        if (Math.max(absDx, absDy) < 30) return // too small
        let direction = ''
        if (absDx > absDy) {
          direction = dx > 0 ? 'right' : 'left'
        } else {
          direction = dy > 0 ? 'down' : 'up'
        }
        executeBehavior(el, behavior, soul, { ...params, direction })
      })
    }

    if (behaviorName === 'press') {
      el.addEventListener('mousedown', () => {
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      })
      el.addEventListener('mouseup', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
      el.addEventListener('touchstart', (e) => {
        e.preventDefault()
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      }, { passive: false })
      el.addEventListener('touchend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'release') {
      el.addEventListener('mouseup', () => executeBehavior(el, behavior, soul, params))
      el.addEventListener('touchend', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'focus') {
      el.addEventListener('focus', () => executeBehavior(el, behavior, soul, params))
      el.addEventListener('blur', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'blur') {
      el.addEventListener('blur', () => executeBehavior(el, behavior, soul, params))
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
    }

    if (behaviorName === 'scroll') {
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY
        executeBehavior(el, behavior, soul, { ...params, scrollY })
      })
    }

    if (behaviorName === 'drag') {
      el.addEventListener('dragstart', () => {
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      })
      el.addEventListener('dragend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
      el.addEventListener('touchstart', (e) => {
        e.preventDefault()
        if (behavior.onStart) executeLifecycle(el, behavior.onStart, soul, params)
      }, { passive: false })
      el.addEventListener('touchmove', (e) => {
        e.preventDefault()
        const touch = e.touches[0]
        if (behavior.onUpdate) executeLifecycle(el, behavior.onUpdate, soul, {
          ...params,
          x: touch.clientX,
          y: touch.clientY
        })
      }, { passive: false })
      el.addEventListener('touchend', () => {
        if (behavior.onEnd) executeLifecycle(el, behavior.onEnd, soul, params)
      })
    }

    if (behaviorName === 'resize') {
      window.addEventListener('resize', () => {
        const width = window.innerWidth
        const height = window.innerHeight
        executeBehavior(el, behavior, soul, { ...params, width, height })
      })
    }

    if (behaviorName === 'enter') {
      el.addEventListener('mouseenter', () => executeBehavior(el, behavior, soul, params))
      el.addEventListener('touchstart', () => executeBehavior(el, behavior, soul, params))
    }

    if (behaviorName === 'exit') {
      el.addEventListener('mouseleave', () => executeBehavior(el, behavior, soul, params))
      el.addEventListener('touchend', () => executeBehavior(el, behavior, soul, params))
    }
  })
}

export function bindAll() {
  const elements = document.querySelectorAll('[data-soul]')
  elements.forEach(el => {
    const name = el.getAttribute('data-soul')
    if (name) bindSoul(name)
  })
}
