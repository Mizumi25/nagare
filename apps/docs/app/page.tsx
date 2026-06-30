"use client"

import { useState } from "react"
import { useSoul, template, preset } from "@nagarejs/react"

// ── Syntax highlight ──────────────────────────────────────────────────────────
function hl(code: string) {
  return code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(\/\/[^\n]*)/g, '<span class="c-comment">$1</span>')
    .replace(/`([^`]*)`/g, '<span class="c-string">`$1`</span>')
    .replace(/"([^"]*)"/g, '<span class="c-string">"$1"</span>')
    .replace(/\b(function|const|let|return|import|from|this|useSoul)\b/g, '<span class="c-kw">$1</span>')
    .replace(/\b(soul|template|preset|bindAll|useSoul|onStart|onEnd|onUpdate|css|tw|js|state|delay|presets|templates|behavior|idleTimeout)\b(?=[\s:(,])/g, '<span class="c-ng">$1</span>')
    .replace(/(@if|@else if|@else)/g, '<span class="c-at">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="c-bool">$1</span>')
}

function Code({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="code-wrap">
      <pre className="code-pre" dangerouslySetInnerHTML={{ __html: hl(code) }} />
      <button className="copy-btn" onClick={() => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      }}>{copied ? "✓" : "copy"}</button>
    </div>
  )
}

// ── Snippets ──────────────────────────────────────────────────────────────────
const CODE_BASIC = `soul("card")
  .default({
    css: \`
      background-color: #1A1A18
      color: #F8F6F2
      border-radius: 24px
      padding: 2rem
      transition: all 0.35s ease
    \`,
    state: { clicked: false }
  })
  .hover({
    onStart: {
      css: \`
        transform: translateY(-8px)
        box-shadow: 0 40px 80px rgba(0,0,0,0.2)
      \`
    },
    onEnd: {
      css: \`
        transform: translateY(0px)
        box-shadow: 0 8px 40px rgba(0,0,0,0.08)
      \`
    }
  })
  .click({
    onStart: {
      css: \`
        transform: scale(0.97)
        @if clicked { background-color: #2E2E2C }
      \`,
      js: function(this) {
        this.state.clicked = !this.state.clicked
      }
    },
    onEnd: { css: \`transform: scale(1)\` }
  })
  .onVisible({
    delay: 200,
    onStart: {
      css: \`
        opacity: 1
        transform: translateY(0px)
        transition: all 0.8s ease
      \`
    }
  })`

const CODE_CSS = `css: \`
  border-radius: 24px
  padding: 2rem

  @if open {
    height: auto
    opacity: 1
    transform: scale(1)
  }
  @else if loading {
    opacity: 0.4
    pointer-events: none
  }
  @else {
    height: 0px
    opacity: 0
    transform: scale(0.95)
  }
\``

const CODE_JS = `js: function(this) {
  // this.el      → DOM element
  // this.state   → soul state
  // this.params  → scrollY, x, y, direction, width,
  //                height, online, orientation...

  // no ceiling. bring anything.
  gsap.to(this.el, { rotation: 360, duration: 0.8 })
  const res = await fetch("/api/data")
  new Audio("/sound.mp3").play()
}`

const CODE_SCROLL = `soul("hero")
  .scroll({
    onUpdate: {
      css: \`opacity: calc(1 - scrollY / 600)\`,
      js: function(this) {
        const s = this.params.scrollY
        this.el.style.transform =
          \`translateY(\${s * 0.3}px)\`
      }
    }
  })`

const CODE_SWIPE = `soul("card")
  .swipe({
    onStart: {
      js: function(this) {
        const dir = this.params.direction
        // left | right | up | down
        console.log("swiped:", dir)
      }
    }
  })`

const CODE_TEMPLATE = `template("glass", {
  css: \`
    backdrop-filter: blur(20px)
    background-color: rgba(255,255,255,0.08)
    border-radius: 24px
    box-shadow: 0 8px 40px rgba(0,0,0,0.12)
  \`
})

preset("lift", {
  onStart: {
    css: \`
      transform: translateY(-8px)
      box-shadow: 0 40px 80px rgba(0,0,0,0.2)
    \`
  },
  onEnd: {
    css: \`transform: translateY(0)\`
  }
})

soul("card")
  .hover({
    templates: [{ name: "glass" }],
    presets: ["lift"]   // shorthand — or { name: "lift", mode: "override" }
  })`

const CODE_USESOUL = `"use client"

import { useSoul } from "@nagarejs/react"

export default function Page() {
  useSoul((soul) => {
    soul("card")
      .default({ tw: "p-8 rounded-3xl bg-black", state: { open: false } })
      .click({ onStart: { js: function(this) { this.state.open = !this.state.open } } })
  })

  return <div data-soul="card">tap me ✦</div>
}`

const BEHAVIORS = [
  { name: "click", type: "d", desc: "tap / mouse click" },
  { name: "tap", type: "d", desc: "quick touch under 200ms" },
  { name: "longpress", type: "d", desc: "hold for 500ms" },
  { name: "swipe", type: "d", desc: "directional touch — params.direction" },
  { name: "hover", type: "c", desc: "mouse over — continuous" },
  { name: "press", type: "c", desc: "held down — mouse or touch" },
  { name: "release", type: "d", desc: "finger / mouse lifted" },
  { name: "drag", type: "c", desc: "moving touch — params.x, params.y" },
  { name: "scroll", type: "c", desc: "window scroll — params.scrollY" },
  { name: "resize", type: "c", desc: "window resize — params.width, params.height" },
  { name: "focus", type: "c", desc: "element focused" },
  { name: "blur", type: "d", desc: "element lost focus" },
  { name: "enter", type: "d", desc: "mouse / touch enters element" },
  { name: "exit", type: "d", desc: "mouse / touch leaves element" },
  { name: "onMount", type: "d", desc: "fires once on mount" },
  { name: "onVisible", type: "d", desc: "enters viewport" },
  { name: "onInvisible", type: "d", desc: "leaves viewport" },
  { name: "onIdle", type: "d", desc: "no activity for idleTimeout (default 3s)" },
  { name: "networkChanged", type: "d", desc: "connection drops / comes back — params.online" },
  { name: "onOrientationChange", type: "d", desc: "device rotated — params.orientation" },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [activeBehavior, setActiveBehavior] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useSoul((soul) => {

    // ── TEMPLATES & PRESETS ──
    template("glass", {
      css: `
        backdrop-filter: blur(20px)
        background-color: rgba(255,255,255,0.06)
      `
    })

    preset("liftUp", {
      onStart: {
        css: `
          transform: translateY(-8px)
          box-shadow: 0 40px 80px rgba(0,0,0,0.18)
        `
      },
      onEnd: {
        css: `
          transform: translateY(0px)
          box-shadow: 0 8px 40px rgba(0,0,0,0.08)
        `
      }
    })

    // ── PAGE ROOT ──
    soul("page").default({
      css: `
        background-color: #F8F6F2
        overflow-x: hidden
        min-height: 100vh
      `,
      state: {}
    })

    // ── HERO ──
    soul("hero").default({
      css: `
        min-height: 100vh
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center
        padding: 8rem 2rem 6rem
        position: relative
        overflow: hidden
        background-color: #F8F6F2
        text-align: center
      `,
      state: {}
    })

    soul("hero-bg-kanji").default({
      css: `
        position: absolute
        top: 50%
        left: 50%
        transform: translate(-50%, -50%)
        font-family: var(--font-display)
        font-size: clamp(14rem, 40vw, 32rem)
        font-weight: 800
        color: rgba(26,26,24,0.04)
        line-height: 1
        user-select: none
        pointer-events: none
        animation: shimmer 4s ease infinite
        white-space: nowrap
      `,
      state: {}
    })
    .scroll({
      onUpdate: {
        js: function(this: any) {
          this.el.style.transform = `translate(-50%, calc(-50% + ${this.params.scrollY * 0.1}px))`
        }
      }
    })

    soul("hero-koi").default({
      css: `
        width: clamp(160px, 30vw, 280px)
        height: auto
        opacity: 0
        transform: translateY(30px)
        filter: drop-shadow(0 40px 60px rgba(0,0,0,0.12))
        margin-bottom: 2.5rem
        animation: float 6s ease infinite
      `,
      state: {}
    })
    .onMount({
      delay: 200,
      onStart: {
        css: `
          opacity: 1
          transform: translateY(0px)
          transition: all 1.2s cubic-bezier(0.16,1,0.3,1)
        `
      }
    })

    soul("hero-label").default({
      css: `
        font-size: 0.62rem
        letter-spacing: 0.18em
        text-transform: uppercase
        color: #C4C2BE
        font-family: var(--font-code)
        margin-bottom: 1.25rem
        opacity: 0
      `,
      state: {}
    })
    .onMount({ delay: 400, onStart: { css: `opacity: 1 transition: opacity 0.8s ease` } })

    soul("hero-h1").default({
      css: `
        font-family: var(--font-display)
        font-size: clamp(3rem, 9vw, 8rem)
        font-weight: 700
        line-height: 0.95
        color: #1A1A18
        letter-spacing: -0.03em
        margin-bottom: 1.5rem
        opacity: 0
        transform: translateY(40px)
        filter: blur(8px)
      `,
      state: {}
    })
    .onMount({
      delay: 100,
      onStart: {
        css: `
          opacity: 1
          transform: translateY(0px)
          filter: blur(0px)
          transition: all 1.1s cubic-bezier(0.16,1,0.3,1)
        `
      }
    })

    soul("hero-h1-soft").default({
      css: `color: #C4C2BE`,
      state: {}
    })

    soul("hero-desc").default({
      css: `
        font-size: 1rem
        color: #6B6B67
        line-height: 1.75
        max-width: 44ch
        margin: 0 auto 3rem
        opacity: 0
      `,
      state: {}
    })
    .onMount({ delay: 500, onStart: { css: `opacity: 1 transition: opacity 1s ease` } })

    soul("hero-cta-row").default({
      css: `
        display: flex
        align-items: center
        justify-content: center
        gap: 1rem
        flex-wrap: wrap
        opacity: 0
        transform: translateY(10px)
      `,
      state: {}
    })
    .onMount({ delay: 700, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.9s ease` } })

    soul("hero-install").default({
      css: `
        display: inline-flex
        align-items: center
        gap: 0.85rem
        background-color: #1A1A18
        color: #F8F6F2
        font-family: var(--font-code)
        font-size: 0.75rem
        padding: 1rem 1.5rem
        border-radius: 99px
        cursor: pointer
        box-shadow: 0 8px 40px rgba(0,0,0,0.2)
        transition: all 0.25s ease
        white-space: nowrap
      `,
      state: {}
    })
    .hover({
      onStart: { css: `background-color: #2E2E2C box-shadow: 0 16px 60px rgba(0,0,0,0.28) transform: translateY(-2px)` },
      onEnd: { css: `background-color: #1A1A18 box-shadow: 0 8px 40px rgba(0,0,0,0.2) transform: translateY(0)` }
    })
    .click({
      onStart: { css: `transform: scale(0.97)` },
      onEnd: { css: `transform: scale(1)` }
    })

    soul("hero-install-prefix").default({
      css: `color: #6B6B67`,
      state: {}
    })

    soul("hero-docs-link").default({
      css: `
        display: inline-flex
        align-items: center
        gap: 0.5rem
        font-size: 0.82rem
        color: #6B6B67
        text-decoration: none
        padding: 1rem 1.5rem
        border-radius: 99px
        background-color: rgba(26,26,24,0.06)
        transition: all 0.2s ease
      `,
      state: {}
    })
    .hover({
      onStart: { css: `background-color: rgba(26,26,24,0.1) color: #1A1A18` },
      onEnd: { css: `background-color: rgba(26,26,24,0.06) color: #6B6B67` }
    })

    soul("hero-scroll").default({
      css: `
        position: absolute
        bottom: 2.5rem
        left: 50%
        transform: translateX(-50%)
        display: flex
        flex-direction: column
        align-items: center
        gap: 0.4rem
        font-size: 0.58rem
        letter-spacing: 0.16em
        text-transform: uppercase
        color: #C4C2BE
        opacity: 0
      `,
      state: {}
    })
    .onMount({ delay: 1400, onStart: { css: `opacity: 1 transition: opacity 1s ease` } })

    // ── FLOATING NAV (bottom, pill) ──
    soul("floatnav").default({
      css: `
        position: fixed
        bottom: 2rem
        left: 50%
        transform: translateX(-50%)
        z-index: 200
        display: flex
        align-items: center
        gap: 0.25rem
        background-color: #1A1A18
        border-radius: 99px
        padding: 0.5rem
        box-shadow: 0 16px 60px rgba(0,0,0,0.25)
        opacity: 0
      `,
      state: {}
    })
    .onMount({ delay: 1000, onStart: { css: `opacity: 1 transition: opacity 0.8s ease` } })

    const navItems = ["behaviors", "blocks", "api", "install"]
    navItems.forEach(item => {
      soul(`fnav-${item}`).default({
        css: `
          font-size: 0.68rem
          letter-spacing: 0.06em
          text-transform: uppercase
          color: rgba(255,255,255,0.45)
          text-decoration: none
          padding: 0.55rem 1.1rem
          border-radius: 99px
          transition: all 0.2s ease
          white-space: nowrap
        `,
        state: {}
      })
      .hover({
        onStart: { css: `color: rgba(255,255,255,0.9) background-color: rgba(255,255,255,0.1)` },
        onEnd: { css: `color: rgba(255,255,255,0.45) background-color: transparent` }
      })
      .click({
        onStart: { css: `transform: scale(0.95)` },
        onEnd: { css: `transform: scale(1)` }
      })
    })

    soul("fnav-logo").default({
      css: `
        display: flex
        align-items: center
        justify-content: center
        width: 32px
        height: 32px
        border-radius: 99px
        background-color: rgba(255,255,255,0.08)
        margin-right: 0.25rem
        cursor: pointer
        transition: background-color 0.2s ease
      `,
      state: {}
    })
    .hover({
      onStart: { css: `background-color: rgba(255,255,255,0.15)` },
      onEnd: { css: `background-color: rgba(255,255,255,0.08)` }
    })

    soul("fnav-github").default({
      css: `
        font-size: 0.68rem
        letter-spacing: 0.06em
        text-transform: uppercase
        color: rgba(255,255,255,0.45)
        text-decoration: none
        padding: 0.55rem 1.1rem
        border-radius: 99px
        transition: all 0.2s ease
        margin-left: 0.25rem
      `,
      state: {}
    })
    .hover({
      onStart: { css: `color: rgba(255,255,255,0.9) background-color: rgba(255,255,255,0.1)` },
      onEnd: { css: `color: rgba(255,255,255,0.45) background-color: transparent` }
    })

    // ── DEMO SECTION ──
    soul("section-demo").default({
      css: `
        padding: 6rem 2rem
        background-color: #F8F6F2
        position: relative
      `,
      state: {}
    })

    soul("section-demo-inner").default({
      css: `max-width: 900px margin: 0 auto`,
      state: {}
    })

    // demo-label, demo-h2, demo-sub, demo-cards, demo-code-wrap
    // get their full styling + reveal animation defined explicitly below —
    // no generic pre-registration needed here.

    soul("demo-label").default({
      css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: #C4C2BE display: block margin-bottom: 1rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("demo-h2").default({
      css: `font-family: var(--font-display) font-size: clamp(1.8rem, 4vw, 3.5rem) font-weight: 700 line-height: 1.1 letter-spacing: -0.02em color: #1A1A18 margin-bottom: 0.75rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("demo-sub").default({
      css: `color: #6B6B67 font-size: 0.88rem line-height: 1.75 margin-bottom: 3rem max-width: 52ch opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("demo-cards").default({
      css: `display: grid grid-template-columns: repeat(3,1fr) gap: 1rem margin-bottom: 2rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 200, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("demo-code-wrap").default({
      css: `opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 250, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    // Demo card souls
    soul("dc-hover").default({
      css: `
        background-color: #1A1A18
        color: #F8F6F2
        padding: 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.3s ease
      `,
      state: {}
    })
    .hover({
      presets: [{ name: "liftUp" }],
      onStart: { js: function(this: any) { console.log("hover!") } },
      onEnd: { js: function(this: any) { console.log("hover end") } }
    })

    soul("dc-click").default({
      css: `
        background-color: #EFECE7
        color: #1A1A18
        padding: 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.2s ease
      `,
      state: { times: 0 }
    })
    .click({
      onStart: {
        css: `transform: scale(0.94) box-shadow: none`,
        js: function(this: any) {
          this.state.times++
          const el = this.el.querySelector(".click-count")
          if (el) el.textContent = `clicked ${this.state.times}×`
        }
      },
      onEnd: { css: `transform: scale(1) box-shadow: var(--shadow)` }
    })

    soul("dc-press").default({
      css: `
        background-color: #F8F6F2
        color: #1A1A18
        padding: 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.15s ease
        border: 1.5px solid rgba(26,26,24,0.08)
      `,
      state: {}
    })
    .press({
      onStart: {
        css: `
          transform: scale(0.93)
          background-color: #EFECE7
          box-shadow: none
          border-color: rgba(26,26,24,0.15)
        `
      },
      onEnd: {
        css: `
          transform: scale(1)
          background-color: #F8F6F2
          box-shadow: var(--shadow)
          border-color: rgba(26,26,24,0.08)
        `
      }
    })

    soul("dc-drag").default({
      css: `
        background-color: #1A1A18
        color: #F8F6F2
        padding: 1.5rem 2rem
        border-radius: var(--radius)
        cursor: grab
        box-shadow: var(--shadow)
        transition: box-shadow 0.2s ease
        grid-column: 1 / 3
      `,
      state: {}
    })
    .drag({
      onStart: {
        css: `cursor: grabbing box-shadow: var(--shadow-xl)`,
      },
      onUpdate: {
        js: function(this: any) {
          this.el.style.position = "fixed"
          this.el.style.left = `${this.params.x - this.el.offsetWidth / 2}px`
          this.el.style.top = `${this.params.y - this.el.offsetHeight / 2}px`
          this.el.style.zIndex = "999"
          this.el.style.width = "300px"
        }
      },
      onEnd: {
        css: `cursor: grab box-shadow: var(--shadow)`,
        js: function(this: any) {
          this.el.style.position = ""
          this.el.style.left = ""
          this.el.style.top = ""
          this.el.style.zIndex = ""
          this.el.style.width = ""
        }
      }
    })

    soul("dc-swipe").default({
      css: `
        background-color: #EFECE7
        color: #1A1A18
        padding: 1.5rem 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.3s ease
      `,
      state: {}
    })
    .swipe({
      onStart: {
        js: function(this: any) {
          const dir = this.params.direction
          const map: Record<string, string> = {
            left: "#2E2E2C", right: "#EFECE7",
            up: "#1A1A18", down: "#F8F6F2"
          }
          const textMap: Record<string, string> = {
            left: "#F8F6F2", right: "#1A1A18",
            up: "#F8F6F2", down: "#1A1A18"
          }
          this.el.style.backgroundColor = map[dir]
          this.el.style.color = textMap[dir]
          const label = this.el.querySelector(".swipe-label")
          if (label) label.textContent = `swiped ${dir} ↗`
        }
      }
    })

    soul("dc-scroll").default({
      css: `
        background-color: #F8F6F2
        color: #1A1A18
        padding: 1.5rem 2rem
        border-radius: var(--radius)
        box-shadow: var(--shadow)
        border: 1.5px solid rgba(26,26,24,0.08)
        overflow: hidden
        position: relative
      `,
      state: {}
    })

    soul("dc-scroll-bar").default({
      css: `
        position: absolute
        bottom: 0
        left: 0
        height: 3px
        width: 0%
        background-color: #1A1A18
        border-radius: 0 99px 99px 0
        transition: width 0.1s linear
      `,
      state: {}
    })

    // Animate scroll bar based on scroll
    soul("scroll-tracker").default({ css: ``, state: {} })
      .scroll({
        onUpdate: {
          js: function(this: any) {
            const total = document.documentElement.scrollHeight - window.innerHeight
            const progress = (this.params.scrollY / total) * 100
            const bar = document.querySelector('[data-soul="dc-scroll-bar"]') as HTMLElement
            if (bar) bar.style.width = `${progress}%`
            const label = document.querySelector('[data-soul="dc-scroll-label"]')
            if (label) label.textContent = `scrollY: ${Math.round(this.params.scrollY)}px`
          }
        }
      })

    soul("dc-scroll-label").default({
      css: `font-family: var(--font-code) font-size: 0.7rem color: #6B6B67`,
      state: {}
    })

    // dc-longpress
    soul("dc-longpress").default({
      css: `
        background-color: #EFECE7
        color: #1A1A18
        padding: 1.5rem 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.2s ease
        user-select: none
      `,
      state: {}
    })
    .longpress({
      onStart: {
        css: `background-color: #1A1A18 color: #F8F6F2`,
        js: function(this: any) {
          const label = this.el.querySelector(".lp-label")
          if (label) label.textContent = "activated! (⁠^⁠^⁠)"
        }
      },
      onEnd: {
        css: `background-color: #EFECE7 color: #1A1A18`,
        js: function(this: any) {
          const label = this.el.querySelector(".lp-label")
          if (label) label.textContent = "hold 500ms"
        }
      }
    })

    // dc-tap
    soul("dc-tap").default({
      css: `
        background-color: #1A1A18
        color: #F8F6F2
        padding: 1.5rem 2rem
        border-radius: var(--radius)
        cursor: pointer
        box-shadow: var(--shadow)
        transition: all 0.15s ease
        user-select: none
      `,
      state: { count: 0 }
    })
    .tap({
      onStart: {
        css: `transform: scale(0.9)`,
        js: function(this: any) {
          this.state.count++
          const label = this.el.querySelector(".tap-label")
          if (label) label.textContent = `tapped ${this.state.count}×`
        }
      },
      onEnd: {
        css: `transform: scale(1)`
      }
    })

    // ── PROBLEM SECTION ──
    soul("section-problem").default({
      css: `
        background-color: #111110
        padding: 8rem 2rem
        border-radius: 32px 32px 0 0
        position: relative
        overflow: hidden
      `,
      state: {}
    })

    soul("problem-glow").default({
      css: `
        position: absolute
        top: -10rem
        left: 50%
        transform: translateX(-50%)
        width: 600px
        height: 600px
        background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)
        pointer-events: none
        border-radius: 50%
      `,
      state: {}
    })

    soul("problem-inner").default({
      css: `max-width: 900px margin: 0 auto position: relative z-index: 1`,
      state: {}
    })

    // problem-label, problem-h2, problem-cards, solution-h2, solution-sub
    // get their full styling + reveal animation defined explicitly below.

    soul("problem-label").default({
      css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: rgba(255,255,255,0.25) display: block margin-bottom: 1.5rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("problem-h2").default({
      css: `font-family: var(--font-display) font-size: clamp(2rem, 6vw, 5.5rem) font-weight: 700 line-height: 1.05 letter-spacing: -0.03em color: #F8F6F2 margin-bottom: 3rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("problem-h2-muted").default({ css: `color: rgba(255,255,255,0.2)`, state: {} })

    soul("problem-cards").default({
      css: `display: grid grid-template-columns: repeat(5,1fr) gap: 1px margin-bottom: 5rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("solution-h2").default({
      css: `font-family: var(--font-display) font-size: clamp(2rem, 6vw, 5.5rem) font-weight: 700 line-height: 1.05 letter-spacing: -0.03em color: #F8F6F2 margin-bottom: 1.5rem opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("solution-sub").default({
      css: `color: rgba(255,255,255,0.4) font-size: 0.9rem line-height: 1.75 max-width: 48ch opacity: 0 transform: translateY(28px)`,
      state: {}
    })
    .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    // ── BEHAVIORS SECTION ──
    soul("section-behaviors").default({
      css: `padding: 8rem 2rem background-color: #F8F6F2`,
      state: {}
    })

    soul("behaviors-inner").default({
      css: `max-width: 900px margin: 0 auto`,
      state: {}
    })

    // beh-label, beh-h2, beh-sub, beh-grid, beh-tip
    // get their full styling + reveal animation defined explicitly below.

    soul("beh-label").default({ css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: #C4C2BE display: block margin-bottom: 1rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.75s cubic-bezier(0.16,1,0.3,1)` } })

    soul("beh-h2").default({ css: `font-family: var(--font-display) font-size: clamp(1.8rem, 4vw, 3.5rem) font-weight: 700 line-height: 1.1 letter-spacing: -0.02em color: #1A1A18 margin-bottom: 0.75rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.75s cubic-bezier(0.16,1,0.3,1)` } })

    soul("beh-sub").default({ css: `color: #6B6B67 font-size: 0.88rem line-height: 1.75 margin-bottom: 2.5rem max-width: 52ch opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.75s cubic-bezier(0.16,1,0.3,1)` } })

    soul("beh-grid").default({ css: `display: flex flex-wrap: wrap gap: 0.5rem margin-bottom: 2rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 200, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.75s cubic-bezier(0.16,1,0.3,1)` } })

    soul("beh-tip").default({ css: `min-height: 3rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 250, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.75s cubic-bezier(0.16,1,0.3,1)` } })

    BEHAVIORS.forEach(b => {
      soul(`pill-${b.name}`).default({
        css: `
          display: inline-flex
          align-items: center
          gap: 0.4rem
          border: 1.5px solid rgba(26,26,24,0.1)
          color: #6B6B67
          background-color: transparent
          font-family: var(--font-code)
          font-size: 0.7rem
          padding: 0.4rem 0.85rem
          border-radius: 99px
          letter-spacing: 0.02em
          transition: all 0.18s ease
          cursor: default
        `,
        state: {}
      })
      .hover({
        onStart: { css: `border-color: #1A1A18 background-color: #1A1A18 color: #F8F6F2 transform: translateY(-2px) box-shadow: 0 8px 24px rgba(0,0,0,0.15)` },
        onEnd: { css: `border-color: rgba(26,26,24,0.1) background-color: transparent color: #6B6B67 transform: translateY(0) box-shadow: none` }
      })
    })

    // ── BLOCKS SECTION ──
    soul("section-blocks").default({
      css: `
        background-color: #111110
        padding: 8rem 2rem
        border-radius: 32px 32px 0 0
        position: relative
        overflow: hidden
      `,
      state: {}
    })

    soul("blocks-inner").default({ css: `max-width: 900px margin: 0 auto position: relative z-index: 1`, state: {} })

    // bl-label, bl-h2, bl-grid get their full styling defined explicitly below.

    soul("bl-label").default({ css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: rgba(255,255,255,0.25) display: block margin-bottom: 1rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("bl-h2").default({ css: `font-family: var(--font-display) font-size: clamp(1.8rem, 4vw, 3.5rem) font-weight: 700 line-height: 1.1 letter-spacing: -0.02em color: #F8F6F2 margin-bottom: 3rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("bl-grid").default({ css: `display: flex flex-direction: column gap: 2rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    ;["bl-tw","bl-css","bl-js"].forEach((id, i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(24px)`, state: {} })
        .onVisible({ delay: 200 + i * 80, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })
    })

    ;["bl-tw-key","bl-css-key","bl-js-key"].forEach(id => {
      soul(id).default({ css: `font-family: var(--font-code) font-size: 1rem color: #F8F6F2 font-weight: 600`, state: {} })
    })

    ;["bl-tw-desc","bl-css-desc","bl-js-desc"].forEach(id => {
      soul(id).default({ css: `font-size: 0.78rem color: rgba(255,255,255,0.3) margin-left: 0.75rem`, state: {} })
    })

    ;["bl-tw-label","bl-css-label","bl-js-label"].forEach(id => {
      soul(id).default({ css: `display: flex align-items: baseline margin-bottom: 1rem`, state: {} })
    })

    soul("bl-css-note").default({ css: `margin-top: 0.75rem color: rgba(255,255,255,0.25) font-size: 0.75rem line-height: 1.6`, state: {} })

    // ── API SECTION ──
    soul("section-api").default({ css: `padding: 8rem 2rem background-color: #F8F6F2`, state: {} })
    soul("api-inner").default({ css: `max-width: 900px margin: 0 auto`, state: {} })

    // api-label, api-h2, api-grid, lc-box get their full styling defined explicitly below.

    soul("api-label").default({ css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: #C4C2BE display: block margin-bottom: 1rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("api-h2").default({ css: `font-family: var(--font-display) font-size: clamp(1.8rem, 4vw, 3.5rem) font-weight: 700 line-height: 1.1 letter-spacing: -0.02em color: #1A1A18 margin-bottom: 3rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("api-grid").default({ css: `display: grid grid-template-columns: 1fr 1fr gap: 2rem margin-bottom: 2.5rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    ;["api-t-title","api-p-title"].forEach(id => {
      soul(id).default({ css: `font-family: var(--font-display) font-size: 1.2rem font-weight: 600 margin-bottom: 0.4rem color: #1A1A18`, state: {} })
    })

    ;["api-t-desc","api-p-desc"].forEach(id => {
      soul(id).default({ css: `color: #6B6B67 font-size: 0.78rem line-height: 1.7 margin-bottom: 1.25rem`, state: {} })
    })

    soul("lc-box").default({ css: `background-color: #EFECE7 padding: 2.5rem border-radius: var(--radius) box-shadow: var(--shadow) opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 200, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("lc-label").default({ css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: #C4C2BE display: block margin-bottom: 1.5rem`, state: {} })
    soul("lc-row").default({ css: `display: flex align-items: center gap: 1.5rem flex-wrap: wrap margin-bottom: 2rem`, state: {} })
    soul("lc-blocks").default({ css: `display: flex gap: 2.5rem flex-wrap: wrap padding-top: 1.5rem border-top: 1px solid rgba(26,26,24,0.08)`, state: {} })

    // ── INSTALL SECTION ──
    soul("section-install").default({
      css: `
        background-color: #111110
        padding: 8rem 2rem
        border-radius: 32px 32px 0 0
        position: relative
        overflow: hidden
        text-align: center
      `,
      state: {}
    })

    soul("install-inner").default({ css: `max-width: 700px margin: 0 auto position: relative z-index: 1`, state: {} })

    // ins-label, ins-h2, ins-grid, ins-code, ins-links get their full styling defined explicitly below.

    soul("ins-label").default({ css: `font-size: 0.62rem letter-spacing: 0.16em text-transform: uppercase color: rgba(255,255,255,0.25) display: block margin-bottom: 1.5rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("ins-h2").default({ css: `font-family: var(--font-display) font-size: clamp(2rem, 5vw, 4.5rem) font-weight: 700 line-height: 1.05 letter-spacing: -0.03em color: #F8F6F2 margin-bottom: 3rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 100, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("ins-grid").default({ css: `display: flex flex-wrap: wrap justify-content: center gap: 0.5rem margin-bottom: 3rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 150, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("ins-code").default({ css: `opacity: 0 transform: translateY(24px) text-align: left`, state: {} })
      .onVisible({ delay: 200, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    soul("ins-links").default({ css: `display: flex justify-content: center gap: 1rem margin-top: 2rem opacity: 0 transform: translateY(24px)`, state: {} })
      .onVisible({ delay: 250, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.8s cubic-bezier(0.16,1,0.3,1)` } })

    ;["ins-npm","ins-gh"].forEach(id => {
      soul(id).default({
        css: `
          font-size: 0.72rem letter-spacing: 0.08em text-transform: uppercase
          color: rgba(255,255,255,0.3) text-decoration: none
          padding: 0.65rem 1.4rem border-radius: 99px
          border: 1px solid rgba(255,255,255,0.1)
          transition: all 0.2s ease
        `,
        state: {}
      })
      .hover({
        onStart: { css: `color: rgba(255,255,255,0.8) border-color: rgba(255,255,255,0.3) background-color: rgba(255,255,255,0.05)` },
        onEnd: { css: `color: rgba(255,255,255,0.3) border-color: rgba(255,255,255,0.1) background-color: transparent` }
      })
    })

    // ── FOOTER ──
    soul("footer").default({
      css: `
        padding: 2rem
        display: flex align-items: center justify-content: space-between flex-wrap: wrap gap: 1rem
        border-top: 1px solid rgba(26,26,24,0.07)
        background-color: #F8F6F2
        padding-bottom: 6rem
      `,
      state: {}
    })

    soul("footer-left").default({ css: `display: flex align-items: center gap: 0.6rem`, state: {} })
    soul("footer-logo").default({ css: `height: 20px width: auto opacity: 0.3`, state: {} })
    soul("footer-name").default({ css: `font-family: var(--font-display) font-size: 0.8rem color: #C4C2BE`, state: {} })
    soul("footer-ver").default({ css: `font-family: var(--font-code) font-size: 0.68rem color: #C4C2BE`, state: {} })
  })

  return (
    <div data-soul="page">

      {/* FLOATING BOTTOM NAV */}
      <nav data-soul="floatnav">
        <div data-soul="fnav-logo">
          <img src="/nagare-logo.png" alt="" style={{ height: "16px", width: "auto", opacity: 0.7 }} />
        </div>
        <a data-soul="fnav-behaviors" href="#behaviors">behaviors</a>
        <a data-soul="fnav-blocks" href="#blocks">blocks</a>
        <a data-soul="fnav-api" href="#api">api</a>
        <a data-soul="fnav-install" href="#install">install</a>
        <a data-soul="fnav-github" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">github ↗</a>
      </nav>

      {/* HERO */}
      <section data-soul="hero">
        <div data-soul="hero-bg-kanji">流れ</div>
        <img data-soul="hero-koi" src="/nagare-logo.png" alt="Nagare" />
        <span data-soul="hero-label">@nagarejs/react · v0.1.9</span>
        <h1 data-soul="hero-h1">
          Behavior<br />
          <span data-soul="hero-h1-soft">runtime</span><br />
          for frontend.
        </h1>
        <p data-soul="hero-desc">
          CSS owns styling. JS owns logic. Libraries own animation.
          Nobody owned <em>behavior</em> — until now.
        </p>
        <div data-soul="hero-cta-row">
          <div data-soul="hero-install" onClick={() => navigator.clipboard.writeText("npm install @nagarejs/react")}>
            <span data-soul="hero-install-prefix">$</span>
            npm install @nagarejs/react
          </div>
          <a data-soul="hero-docs-link" href="#demo">see it live →</a>
        </div>
        <div data-soul="hero-scroll">
          <span style={{ animation: "bounce 1.5s ease infinite", display: "inline-block" }}>↓</span>
          scroll
        </div>
      </section>

      {/* HIDDEN scroll tracker */}
      <div data-soul="scroll-tracker" style={{ position: "absolute", top: 0, pointerEvents: "none", opacity: 0 }} />

      {/* DEMO */}
      <section data-soul="section-demo" id="demo">
        <div data-soul="section-demo-inner">
          <span data-soul="demo-label">try it — all powered by nagare</span>
          <h2 data-soul="demo-h2">Every interaction. One behavior.</h2>
          <p data-soul="demo-sub">
            These cards are live. Each uses a real Nagare behavior.
            No event listeners. No scattered logic. Just behaviors. (⁠^⁠^⁠)
          </p>
          <div data-soul="demo-cards">
            <div data-soul="dc-hover">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.hover()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Hover me</div>
              <div style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>lifts on hover ↑</div>
            </div>
            <div data-soul="dc-click">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.click()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Click me</div>
              <div className="click-count" style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>0 clicks</div>
            </div>
            <div data-soul="dc-press">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.press()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Press + hold</div>
              <div style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>hold it down ↓</div>
            </div>
            <div data-soul="dc-drag">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.drag()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Drag me anywhere ✦</div>
              <div style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>touch and move</div>
            </div>
            <div data-soul="dc-swipe">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.swipe()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Swipe any direction</div>
              <div className="swipe-label" style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>try swiping →</div>
            </div>
            <div data-soul="dc-scroll">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.scroll()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Scroll progress</div>
              <div data-soul="dc-scroll-label" style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>scrollY: 0px</div>
              <div data-soul="dc-scroll-bar" />
            </div>
            <div data-soul="dc-longpress">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.longpress()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Long press me</div>
              <div className="lp-label" style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>hold 500ms</div>
            </div>
            <div data-soul="dc-tap">
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-code)", opacity: 0.4 }}>.tap()</div>
              <div style={{ fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 600 }}>Quick tap</div>
              <div className="tap-label" style={{ fontSize: "0.75rem", marginTop: "0.4rem", opacity: 0.5 }}>tapped 0×</div>
            </div>
          </div>
          <div data-soul="demo-code-wrap">
            <Code code={CODE_BASIC} />
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section data-soul="section-problem">
        <div data-soul="problem-glow" />
        <div data-soul="problem-inner">
          <span data-soul="problem-label">the problem</span>
          <h2 data-soul="problem-h2">
            One hover.<br />
            <span data-soul="problem-h2-muted">Five places to live.</span>
          </h2>
          <div data-soul="problem-cards">
            {[
              { tool: "Tailwind", job: "the lift" },
              { tool: "CSS", job: "the glow" },
              { tool: "GSAP", job: "the animation" },
              { tool: "React", job: "the state" },
              { tool: "Handler", job: "the logic" },
            ].map((item, i) => (
              <div key={i} style={{ padding: "2rem 1.5rem", borderRight: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.4rem" }}>{item.tool}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>{item.job}</div>
              </div>
            ))}
          </div>
          <h2 data-soul="solution-h2">Nagare gives it one place. ✦</h2>
          <p data-soul="solution-sub">
            One behavior. One lifecycle. One block per concern.
            Everything that belongs to hover — lives in hover.
          </p>
        </div>
      </section>

      {/* BEHAVIORS */}
      <section data-soul="section-behaviors" id="behaviors">
        <div data-soul="behaviors-inner">
          <span data-soul="beh-label">behaviors</span>
          <h2 data-soul="beh-h2">20 detectors. All interactions covered.</h2>
          <p data-soul="beh-sub">
            Behaviors are sensors — they fire when the user or environment triggers them.
            Underlined = supports <code>onUpdate</code>. Hover each to see details.
          </p>
          <div data-soul="beh-grid">
            {BEHAVIORS.map(b => (
              <span
                key={b.name}
                data-soul={`pill-${b.name}`}
                onMouseEnter={() => setActiveBehavior(b.name)}
                onMouseLeave={() => setActiveBehavior(null)}
                style={{ textDecoration: b.type === "c" ? "underline" : "none", textUnderlineOffset: "3px" }}
              >
                .{b.name}()
              </span>
            ))}
          </div>
          <div data-soul="beh-tip">
            {activeBehavior ? (
              <div style={{ background: "#1A1A18", color: "rgba(255,255,255,0.55)", padding: "1rem 1.5rem", borderRadius: "16px", fontSize: "0.78rem", fontFamily: "var(--font-code)", display: "inline-flex", flexDirection: "column", gap: "0.3rem", boxShadow: "var(--shadow-lg)" }}>
                <span style={{ color: "#F8F6F2", fontWeight: 600 }}>.{activeBehavior}()</span>
                <span>{BEHAVIORS.find(b => b.name === activeBehavior)?.desc}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.68rem" }}>
                  {BEHAVIORS.find(b => b.name === activeBehavior)?.type === "c"
                    ? "onStart + onUpdate + onEnd"
                    : "onStart + onEnd"}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: "0.75rem", color: "#C4C2BE", fontFamily: "var(--font-code)" }}>hover a behavior above ↑</span>
            )}
          </div>
        </div>
      </section>

      {/* BLOCKS */}
      <section data-soul="section-blocks" id="blocks">
        <div data-soul="blocks-inner">
          <span data-soul="bl-label">blocks</span>
          <h2 data-soul="bl-h2">Three blocks. Each owns its lane.</h2>
          <div data-soul="bl-grid">
            <div data-soul="bl-tw">
              <div data-soul="bl-tw-label">
                <span data-soul="bl-tw-key">tw:</span>
                <span data-soul="bl-tw-desc">Tailwind utility classes</span>
              </div>
              <Code code={`tw: "transition-all duration-300 ease-out rounded-3xl"`} />
            </div>
            <div data-soul="bl-css">
              <div data-soul="bl-css-label">
                <span data-soul="bl-css-key">css:</span>
                <span data-soul="bl-css-desc">pure CSS — with @if / @else if / @else</span>
              </div>
              <Code code={CODE_CSS} />
              <p data-soul="bl-css-note">Any JS expression inside @if. State keys used directly — no prefix needed.</p>
            </div>
            <div data-soul="bl-js">
              <div data-soul="bl-js-label">
                <span data-soul="bl-js-key">js:</span>
                <span data-soul="bl-js-desc">standard JavaScript — no ceiling (⁠≧⁠▽⁠≦⁠)</span>
              </div>
              <Code code={CODE_JS} />
            </div>
          </div>
        </div>
      </section>

      {/* API */}
      <section data-soul="section-api" id="api">
        <div data-soul="api-inner">
          <span data-soul="api-label">api</span>
          <h2 data-soul="api-h2">Templates. Presets. Reuse everything.</h2>
          <div data-soul="api-grid">
            <div>
              <h3 data-soul="api-t-title">template()</h3>
              <p data-soul="api-t-desc">Reusable block collections. Modes: <code>merge</code> (default) or <code>override</code>.</p>
              <Code code={CODE_TEMPLATE} />
            </div>
            <div>
              <h3 data-soul="api-p-title">scroll behavior</h3>
              <p data-soul="api-p-desc">Live runtime param <code>scrollY</code> — available in css and js. Scrub, parallax, progress.</p>
              <Code code={CODE_SCROLL} />
            </div>
          </div>
          <div data-soul="lc-box">
            <span data-soul="lc-label">lifecycle</span>
            <div data-soul="lc-row">
              {[
                { n: "onStart", d: "once · begin" }, null,
                { n: "onUpdate", d: "continuous" }, null,
                { n: "onEnd", d: "once · end" }
              ].map((item, i) =>
                item === null ? (
                  <span key={i} style={{ color: "#C4C2BE", fontSize: "1rem" }}>→</span>
                ) : (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--font-code)", fontSize: "0.8rem", color: "#1A1A18", marginBottom: "0.2rem" }}>{item.n}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6B6B67" }}>{item.d}</div>
                  </div>
                )
              )}
            </div>
            <div data-soul="lc-blocks">
              {[{ k: "tw:", d: "Tailwind" }, { k: "css:", d: "pure CSS + @if" }, { k: "js:", d: "any JavaScript" }].map(b => (
                <div key={b.k} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-code)", fontSize: "0.78rem", color: "#1A1A18", fontWeight: 600 }}>{b.k}</span>
                  <span style={{ fontSize: "0.7rem", color: "#6B6B67" }}>{b.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL */}
      <section data-soul="section-install" id="install">
        <div data-soul="install-inner">
          <span data-soul="ins-label">install</span>
          <h2 data-soul="ins-h2">Works with any<br />React framework.</h2>
          <div data-soul="ins-grid">
            {["Next.js", "Remix", "Astro", "Vite", "TanStack", "CRA"].map(fw => (
              <div key={fw} style={{ background: "rgba(255,255,255,0.05)", padding: "0.6rem 1.2rem", borderRadius: "99px", fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                {fw}
              </div>
            ))}
          </div>
          <div data-soul="ins-code">
            <Code code={`# React adapter (Next.js, Remix, Astro, Vite...)\nnpm install @nagarejs/react\n\n# Core only — vanilla JS or custom adapter\nnpm install @nagarejs/core`} />
          </div>
          <div data-soul="ins-links">
            <a data-soul="ins-npm" href="https://www.npmjs.com/package/@nagarejs/react" target="_blank" rel="noopener noreferrer">npm ↗</a>
            <a data-soul="ins-gh" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">github ↗</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer data-soul="footer">
        <div data-soul="footer-left">
          <img src="/nagare-logo.png" alt="" data-soul="footer-logo" />
          <span data-soul="footer-name">Nagare · 流れ · flow</span>
        </div>
        <span data-soul="footer-ver">@nagarejs/react · v0.1.9</span>
      </footer>

    </div>
  )
}
