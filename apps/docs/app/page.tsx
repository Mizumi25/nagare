"use client"

import { useEffect, useState, useRef } from "react"
import { soul, template, preset, bindAll } from "@nagarejs/react"

// ─────────────────────────────────────────────────────────────────────────────
// Syntax highlighter
// ─────────────────────────────────────────────────────────────────────────────
function hl(raw: string): string {
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  const tlParts: string[] = []
  s = s.replace(/`([\s\S]*?)`/g, (_m, inner) => {
    const idx = tlParts.length
    const innerHl = inner.replace(/(@if|@else\s+if|@else)/g, '<span class="sh-at">$1</span>')
    tlParts.push(`\`${innerHl}\``)
    return `\x00TL${idx}\x00`
  })
  s = s.replace(/(\/\/[^\n]*)/g, '<span class="sh-comment">$1</span>')
  s = s.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="sh-str">"$1"</span>')
  s = s.replace(
    /\b(soul|template|preset|bindAll|onStart|onEnd|onUpdate|css|tw|js|state|delay|presets|templates)\b(?=[\s:(,.\x00]|$)/g,
    '<span class="sh-api">$1</span>'
  )
  s = s.replace(
    /\b(function|const|let|var|return|import|from|export|default|async|await|new|typeof|true|false|null|undefined|this)\b/g,
    '<span class="sh-kw">$1</span>'
  )
  s = s.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="sh-num">$1</span>')
  s = s.replace(/\x00TL(\d+)\x00/g, (_m, i) => `<span class="sh-tl">${tlParts[+i]}</span>`)
  return s
}

// ─────────────────────────────────────────────────────────────────────────────
// CodeBlock
// ─────────────────────────────────────────────────────────────────────────────
function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="cb-wrap">
      {filename && (
        <div className="cb-header">
          <div className="cb-dots"><span /><span /><span /></div>
          <span className="cb-filename">{filename}</span>
        </div>
      )}
      <div style={{ position: "relative" }}>
        <pre className="cb-pre" dangerouslySetInnerHTML={{ __html: hl(code) }} />
        <button
          className="cb-copy"
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }}
        >
          {copied ? "✓" : "copy"}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sandbox
// ─────────────────────────────────────────────────────────────────────────────
const SANDBOX_DEFAULT = `soul("box")
  .hover({
    onStart: {
      css: \`
        transform: scale(1.08)
        background: #FAFAF8
        color: #1A1A18
        border-radius: 28px
      \`
    },
    onEnd: {
      css: \`
        transform: scale(1)
        background: #1A1A18
        color: #FAFAF8
        border-radius: 16px
      \`
    }
  })
  .click({
    onStart: { css: \`transform: scale(0.9)\` },
    onEnd:   { css: \`transform: scale(1)\` }
  })`

function Sandbox() {
  const [code, setCode] = useState(SANDBOX_DEFAULT)
  const [status, setStatus] = useState<"idle" | "running" | "ok" | "err">("idle")
  const [errMsg, setErrMsg] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)

  const run = () => {
    setStatus("running")
    setErrMsg("")
    try {
      if (!boxRef.current) { setStatus("err"); setErrMsg("Preview not mounted."); return }
      boxRef.current.removeAttribute("style")
      boxRef.current.style.cssText = `
        background:#1A1A18;color:#FAFAF8;width:100px;height:100px;
        border-radius:16px;display:flex;align-items:center;justify-content:center;
        cursor:pointer;font-size:0.7rem;font-family:var(--font-code);
        transition:all 0.3s cubic-bezier(0.16,1,0.3,1);user-select:none;
      `
      const getBlock = (evt: string, lifecycle: string) => {
        const evtRx = new RegExp(`\\.${evt}\\s*\\(\\s*\\{[\\s\\S]*?${lifecycle}\\s*:\\s*\\{[\\s\\S]*?css\\s*:\\s*\`([^}\`]*)\``, "m")
        const m = code.match(evtRx)
        return m ? m[1].trim() : null
      }
      const applyCSS = (el: HTMLElement, block: string | null) => {
        if (!block) return
        block.split("\n").forEach(line => {
          const l = line.trim()
          if (!l || l.startsWith("@")) return
          const colonIdx = l.indexOf(":")
          if (colonIdx < 0) return
          const prop = l.slice(0, colonIdx).trim()
          const val = l.slice(colonIdx + 1).trim()
          try { (el.style as any)[prop.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase())] = val } catch (_) { }
        })
      }
      const el = boxRef.current
      el.onmouseenter = () => applyCSS(el, getBlock("hover", "onStart"))
      el.onmouseleave = () => applyCSS(el, getBlock("hover", "onEnd"))
      el.onmousedown = () => applyCSS(el, getBlock("click", "onStart"))
      el.onmouseup = () => applyCSS(el, getBlock("click", "onEnd"))
      setStatus("ok")
    } catch (e: any) {
      setStatus("err")
      setErrMsg(String(e))
    }
  }

  const reset = () => {
    setCode(SANDBOX_DEFAULT)
    setStatus("idle")
    setErrMsg("")
    if (boxRef.current) {
      boxRef.current.style.cssText = `
        background:#1A1A18;color:#FAFAF8;width:100px;height:100px;
        border-radius:16px;display:flex;align-items:center;justify-content:center;
        cursor:pointer;font-size:0.7rem;font-family:var(--font-code);
        transition:all 0.3s cubic-bezier(0.16,1,0.3,1);user-select:none;
      `
      el: {
        boxRef.current.onmouseenter = null
        boxRef.current.onmouseleave = null
        boxRef.current.onmousedown = null
        boxRef.current.onmouseup = null
      }
    }
  }

  return (
    <div className="sandbox-wrap">
      <div className="sandbox-header">
        <div className="cb-dots"><span /><span /><span /></div>
        <span className="cb-filename">sandbox · live preview</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button className="sb-btn sb-reset" onClick={reset}>reset</button>
          <button className="sb-btn sb-run" onClick={run}>▶ run</button>
        </div>
      </div>
      <div className="sandbox-body">
        <div className="sandbox-editor-wrap">
          <textarea
            className="sandbox-editor"
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="sandbox-preview">
          <div
            ref={boxRef}
            style={{
              background: "#1A1A18", color: "#FAFAF8",
              width: "100px", height: "100px", borderRadius: "16px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "0.7rem", fontFamily: "var(--font-code)",
              transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)", userSelect: "none",
            }}
          >
            {status === "idle" ? "press run ▶" : status === "running" ? "…" : status === "ok" ? "live ✦" : "error"}
          </div>
          {errMsg && <p style={{ color: "#ff6b6b", fontSize: "0.65rem", marginTop: "0.75rem", fontFamily: "var(--font-code)", maxWidth: "200px" }}>{errMsg}</p>}
          {status === "ok" && (
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.62rem", marginTop: "0.5rem", fontFamily: "var(--font-code)" }}>
              hover · click the box
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Behaviors
// ─────────────────────────────────────────────────────────────────────────────
const BEHAVIORS = [
  { name: "click",       continuous: false, desc: "Fires on pointer down (onStart) and release (onEnd). Works for mouse and touch." },
  { name: "tap",         continuous: false, desc: "Single tap gesture — fires once on touch release. Designed for mobile." },
  { name: "longpress",   continuous: false, desc: "Held for 500 ms. onStart triggers when threshold is met, onEnd on release." },
  { name: "swipe",       continuous: false, desc: "Directional swipe. params.direction delivers left / right / up / down." },
  { name: "hover",       continuous: true,  desc: "Cursor enters or leaves. Continuous — onUpdate fires while inside." },
  { name: "press",       continuous: true,  desc: "Pointer held down. Continuous between mousedown and mouseup." },
  { name: "release",     continuous: false, desc: "Fires once when pointer lifts. Natural complement to press." },
  { name: "drag",        continuous: true,  desc: "Drag with live cursor tracking. params.x and params.y update each frame." },
  { name: "scroll",      continuous: true,  desc: "Page scroll. params.scrollY updates on every scroll frame." },
  { name: "resize",      continuous: true,  desc: "Window resize. params.width and params.height available live." },
  { name: "focus",       continuous: true,  desc: "Element receives focus — works on inputs, buttons, links." },
  { name: "blur",        continuous: false, desc: "Element loses focus. Fires once." },
  { name: "enter",       continuous: false, desc: "Pointer enters element bounds. Like hover but no onUpdate." },
  { name: "exit",        continuous: false, desc: "Pointer leaves element bounds." },
  { name: "onMount",     continuous: false, desc: "Fires once when element is attached to the DOM." },
  { name: "onVisible",   continuous: false, desc: "IntersectionObserver — element scrolls into view." },
  { name: "onInvisible", continuous: false, desc: "IntersectionObserver — element scrolls out of view." },
].filter((b, i, arr) => arr.findIndex(x => x.name === b.name) === i)

// ─────────────────────────────────────────────────────────────────────────────
// Code snippets
// ─────────────────────────────────────────────────────────────────────────────
const S_HERO = `soul("button")
  .hover({
    onStart: {
      css: \`transform: translateY(-4px)
            box-shadow: 0 20px 40px rgba(0,0,0,0.15)\`,
      tw: "ring-1 ring-black/10"
    },
    onEnd: {
      css: \`transform: translateY(0)\`
    }
  })`

const S_CONCEPT_BEFORE = `// before nagare — 5 places, 1 interaction
const btn = document.querySelector("button")

// CSS file
.button:hover { transform: translateY(-4px); }

// animation library
btn.addEventListener("mouseenter", () =>
  gsap.to(btn, { boxShadow: "0 20px 40px black" })
)

// state store
btn.addEventListener("mouseenter", () =>
  store.setState({ hovered: true })
)

// event handler
btn.addEventListener("mouseenter", updateAnalytics)`

const S_CONCEPT_AFTER = `// after nagare — 1 place, 1 interaction
soul("button")
  .hover({
    onStart: {
      css: \`transform: translateY(-4px)\`,
      tw:  "shadow-2xl",
      js:  function(this) {
        this.state.hovered = true
        gsap.to(this.el, { boxShadow: "0 20px 40px black" })
        updateAnalytics()
      }
    },
    onEnd: {
      css: \`transform: translateY(0)\`,
      js:  function(this) { this.state.hovered = false }
    }
  })`

const S_CSS = `css: \`
  transform: scale(1.02)

  @if open {
    height: auto
    opacity: 1
    pointer-events: all
  }
  @else if loading {
    opacity: 0.4
    pointer-events: none
  }
  @else {
    height: 0px
    opacity: 0
  }
\``

const S_JS = `js: function(this) {
  // this.el     → the DOM element
  // this.state  → soul state object
  // this.params → scrollY, x, y, direction…

  // no ceiling — bring whatever you need
  gsap.to(this.el, { rotation: 360, duration: 0.4 })
  const res = await fetch("/api/like")
  new Audio("/pop.mp3").play()
}`

const S_TEMPLATE = `template("lift", {
  css: \`
    transform: translateY(-6px)
    box-shadow: 0 24px 48px rgba(0,0,0,0.14)
  \`
})

soul("card").hover({
  templates: [{ name: "lift" }],
  onStart: { tw: "ring-1 ring-white/10" }
})`

const S_PRESET = `preset("popIn", {
  onStart: {
    css: \`
      opacity: 1
      transform: translateY(0px) scale(1)
      transition: all 0.7s cubic-bezier(0.16,1,0.3,1)
    \`
  }
})

soul("hero").onMount({
  delay: 200,
  presets: [{ name: "popIn" }]
})`

const S_SCROLL = `soul("parallax")
  .scroll({
    onUpdate: {
      js: function(this) {
        const y = this.params.scrollY
        this.el.style.transform = \`translateY(\${y * 0.12}px)\`
        this.el.style.opacity   = String(1 - y / 600)
      }
    }
  })`

const S_INSTALL = `# core is the engine — always required
npm install @nagarejs/core

# pick your adapter
npm install @nagarejs/react`

const NAV = [
  { id: "purpose",   label: "purpose"   },
  { id: "concept",   label: "concept"   },
  { id: "behaviors", label: "behaviors" },
  { id: "blocks",    label: "blocks"    },
  { id: "api",       label: "api"       },
  { id: "install",   label: "install"   },
]

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Page() {
  const [activeNav, setActiveNav] = useState("purpose")
  const [hoveredBehavior, setHoveredBehavior] = useState<string | null>(null)
  const [navVisible, setNavVisible] = useState(true)
  const [pressActive, setPressActive] = useState(false)
  const [tapFlash, setTapFlash] = useState(false)
  const [swipeDir, setSwipeDir] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [focusActive, setFocusActive] = useState(false)
  const [resizeW, setResizeW] = useState(0)
  const [scrollPct, setScrollPct] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [longpressHeld, setLongpressHeld] = useState(false)
  const [releaseFlash, setReleaseFlash] = useState(false)
  const [enterActive, setEnterActive] = useState(false)
  const [blurActive, setBlurActive] = useState(false)
  const [visibleActive, setVisibleActive] = useState(false)
  const [mountDone, setMountDone] = useState(false)

  const lastScrollY = useRef(0)
  const longpressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const swipeTouchStart = useRef<{ x: number; y: number } | null>(null)
  const visRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragPos = useRef({ startX: 0, startY: 0 })
  const swipeMouseStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setNavVisible(y <= lastScrollY.current || y < 80)
      lastScrollY.current = y
      const pct = Math.round((y / (document.body.scrollHeight - window.innerHeight)) * 100)
      setScrollPct(Math.min(pct, 100))
      for (const item of [...NAV].reverse()) {
        const el = document.getElementById(item.id)
        if (el && y >= el.offsetTop - 200) { setActiveNav(item.id); break }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => setResizeW(window.innerWidth)
    setResizeW(window.innerWidth)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    if (!visRef.current) return
    const obs = new IntersectionObserver(([entry]) => {
      setVisibleActive(entry.isIntersecting)
    }, { threshold: 0.5 })
    obs.observe(visRef.current)
    return () => obs.disconnect()
  }, [])

  const startDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    dragPos.current = { startX: e.clientX, startY: e.clientY }
    setDragActive(true)
    dragRef.current.setPointerCapture(e.pointerId)
  }
  const moveDrag = (e: React.PointerEvent) => {
    if (!dragActive || !dragRef.current) return
    const dx = e.clientX - dragPos.current.startX
    const dy = e.clientY - dragPos.current.startY
    dragRef.current.style.transform = `translate(${dx}px,${dy}px)`
  }
  const endDrag = () => {
    setDragActive(false)
    if (dragRef.current) dragRef.current.style.transform = "translate(0,0)"
  }

  const swipeStart = (e: React.TouchEvent) => {
    swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const swipeEnd = (e: React.TouchEvent) => {
    if (!swipeTouchStart.current) return
    const dx = e.changedTouches[0].clientX - swipeTouchStart.current.x
    const dy = e.changedTouches[0].clientY - swipeTouchStart.current.y
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right →" : "left ←") : (dy > 0 ? "down ↓" : "up ↑")
    setSwipeDir(dir)
    setTimeout(() => setSwipeDir(""), 1500)
  }
  const swipeMouseDown = (e: React.MouseEvent) => { swipeMouseStart.current = { x: e.clientX, y: e.clientY } }
  const swipeMouseUp = (e: React.MouseEvent) => {
    if (!swipeMouseStart.current) return
    const dx = e.clientX - swipeMouseStart.current.x
    const dy = e.clientY - swipeMouseStart.current.y
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right →" : "left ←") : (dy > 0 ? "down ↓" : "up ↑")
    setSwipeDir(dir)
    swipeMouseStart.current = null
    setTimeout(() => setSwipeDir(""), 1500)
  }

  const startLongpress = () => { longpressTimer.current = setTimeout(() => setLongpressHeld(true), 500) }
  const endLongpress = () => { if (longpressTimer.current) clearTimeout(longpressTimer.current); setLongpressHeld(false) }

  useEffect(() => { setTimeout(() => setMountDone(true), 600) }, [])

  useEffect(() => {
    template("revealUp", {
      css: `opacity: 1 transform: translateY(0px) filter: blur(0px) transition: all 0.9s cubic-bezier(0.16,1,0.3,1)`
    })
    template("liftCard", {
      css: `transform: translateY(-8px) box-shadow: 0 32px 64px rgba(0,0,0,0.18) transition: all 0.38s cubic-bezier(0.16,1,0.3,1)`
    })

    preset("fadeUp", {
      onStart: {
        css: `opacity: 1 transform: translateY(0px) filter: blur(0px) transition: all 0.9s cubic-bezier(0.16,1,0.3,1)`
      }
    })

    // ── Hero ─────────────────────────────────────────────────────────────────
    soul("hero-logo").default({ css: `opacity: 0 transform: translateY(-10px)`, state: {} })
      .onMount({ delay: 60, onStart: { css: `opacity: 1 transform: translateY(0) transition: all 0.9s cubic-bezier(0.16,1,0.3,1)` } })

    soul("hero-tag").default({ css: `opacity: 0 transform: translateY(8px)`, state: {} })
      .onMount({ delay: 180, presets: [{ name: "fadeUp" }] })

    soul("hero-h1").default({ css: `opacity: 0 transform: translateY(48px) filter: blur(12px)`, state: {} })
      .onMount({ delay: 280, onStart: { css: `opacity: 1 transform: translateY(0) filter: blur(0px) transition: all 1.4s cubic-bezier(0.16,1,0.3,1)` } })

    soul("hero-sub").default({ css: `opacity: 0 transform: translateY(18px)`, state: {} })
      .onMount({ delay: 580, presets: [{ name: "fadeUp" }] })

    soul("hero-cta-row").default({ css: `opacity: 0 transform: translateY(14px)`, state: {} })
      .onMount({ delay: 760, presets: [{ name: "fadeUp" }] })

    soul("hero-code-card").default({ css: `opacity: 0 transform: translateY(28px)`, state: {} })
      .onMount({ delay: 480, presets: [{ name: "fadeUp" }] })

    soul("hero-watermark").default({ css: `opacity: 0`, state: {} })
      .onMount({ delay: 700, onStart: { css: `opacity: 1 transition: opacity 2.5s ease` } })
      .scroll({ onUpdate: { js: function (this: any) { this.el.style.transform = `translateY(${this.params.scrollY * 0.08}px)` } } })

    soul("hero-install-btn").default({
      css: `display:inline-flex align-items:center gap:0.75rem background:#1A1A18 color:#FAFAF8 font-family:var(--font-code) font-size:0.76rem padding:0.85rem 1.5rem border-radius:100px cursor:pointer transition:all 0.22s ease`,
      state: {}
    })
      .hover({ onStart: { css: `background:#2E2E2C transform:scale(1.03)` }, onEnd: { css: `background:#1A1A18 transform:scale(1)` } })
      .click({ onStart: { css: `transform:scale(0.95)` }, onEnd: { css: `transform:scale(1)` } })

    soul("hero-gh-btn").default({
      css: `display:inline-flex align-items:center gap:0.5rem border:1px solid rgba(26,26,24,0.14) color:#6B6B67 font-size:0.76rem padding:0.85rem 1.5rem border-radius:100px cursor:pointer text-decoration:none transition:all 0.22s ease`,
      state: {}
    })
      .hover({ onStart: { css: `border-color:#1A1A18 color:#1A1A18 transform:scale(1.03)` }, onEnd: { css: `border-color:rgba(26,26,24,0.14) color:#6B6B67 transform:scale(1)` } })

    // ── Purpose ───────────────────────────────────────────────────────────────
    const rv = (id: string, delay = 0) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(24px) filter: blur(4px)`, state: {} })
        .onVisible({ delay, onStart: { presets: [{ name: "fadeUp" }] } })
    }
    rv("purpose-eyebrow", 0)
    rv("purpose-h2", 80)
    rv("purpose-lead", 160)
    rv("purpose-cards", 240)

    ;["p-pillar-1", "p-pillar-2", "p-pillar-3"].forEach((id, i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(18px)`, state: {} })
        .onVisible({ delay: 280 + i * 100, onStart: { presets: [{ name: "fadeUp" }] } })
        .hover({ onStart: { templates: [{ name: "liftCard" }] }, onEnd: { css: `transform: translateY(0) box-shadow: none` } })
    })

    // ── Concept ───────────────────────────────────────────────────────────────
    rv("concept-eyebrow", 0)
    rv("concept-h2", 80)
    rv("concept-desc", 160)
    rv("concept-grid", 220)
    rv("concept-after", 100)

    ;[1, 2, 3, 4, 5].forEach((n, i) => {
      soul(`concept-col-cc${n}`).default({ css: `opacity: 0 transform: translateY(16px)`, state: {} })
        .onVisible({ delay: 260 + i * 55, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── Demo cards ────────────────────────────────────────────────────────────
    soul("demo-hover").default({
      css: `background:linear-gradient(135deg,#1A1A18,#2A2A28) color:#FAFAF8 padding:2rem border-radius:24px cursor:default transition:all 0.38s cubic-bezier(0.16,1,0.3,1)`,
      state: {}
    })
      .hover({ onStart: { templates: [{ name: "liftCard" }] }, onEnd: { css: `transform:translateY(0) box-shadow:none` } })

    soul("demo-click").default({
      css: `background:linear-gradient(135deg,#F0EDE8,#E8E4DF) color:#1A1A18 padding:2rem border-radius:24px cursor:pointer transition:all 0.18s ease`,
      state: { count: 0 }
    })
      .click({
        onStart: {
          css: `transform:scale(0.91) background:linear-gradient(135deg,#E0DDD8,#D8D4CF)`,
          js: function (this: any) {
            this.state.count += 1
            const el = this.el.querySelector(".click-count")
            if (el) el.textContent = String(this.state.count)
          }
        },
        onEnd: { css: `transform:scale(1) background:linear-gradient(135deg,#F0EDE8,#E8E4DF)` }
      })
      .hover({ onStart: { templates: [{ name: "liftCard" }] }, onEnd: { css: `transform:translateY(0) box-shadow:none` } })

    // ── Behaviors pills ────────────────────────────────────────────────────────
    rv("beh-eyebrow", 0)
    rv("beh-h2", 80)
    rv("beh-sub", 160)
    rv("beh-pills", 240)
    rv("beh-detail", 300)

    BEHAVIORS.forEach(b => {
      soul(`pill-${b.name}`).default({
        css: `display:inline-flex align-items:center gap:0.3rem border:1px solid rgba(26,26,24,0.1) color:#6B6B67 background:transparent font-family:var(--font-code) font-size:0.7rem padding:0.42rem 0.95rem border-radius:100px letter-spacing:0.02em transition:all 0.18s ease cursor:default white-space:nowrap`,
        state: {}
      })
        .hover({
          onStart: { css: `border-color:#1A1A18 background:#1A1A18 color:#FAFAF8 transform:scale(1.05)` },
          onEnd: { css: `border-color:rgba(26,26,24,0.1) background:transparent color:#6B6B67 transform:scale(1)` }
        })
    })

    // ── Blocks ────────────────────────────────────────────────────────────────
    rv("blocks-eyebrow", 0)
    rv("blocks-h2", 80)
    rv("blocks-sub", 160)
    ;["block-tw", "block-css", "block-js"].forEach((id, i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
        .onVisible({ delay: 180 + i * 90, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── API ───────────────────────────────────────────────────────────────────
    rv("api-eyebrow", 0)
    rv("api-h2", 80)
    rv("api-sub", 160)
    ;["api-template", "api-preset", "api-scroll", "api-lifecycle"].forEach((id, i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
        .onVisible({ delay: 100 + i * 80, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── Install ───────────────────────────────────────────────────────────────
    rv("install-eyebrow", 0)
    rv("install-h2", 80)
    rv("install-desc", 160)
    rv("install-box", 240)

    ;[["fw-next", "Next.js"], ["fw-remix", "Remix"], ["fw-astro", "Astro"], ["fw-vite", "Vite"], ["fw-tanstack", "TanStack"], ["fw-cra", "CRA"]].forEach(([id]) => {
      soul(id).default({
        css: `padding:0.5rem 1rem background:rgba(255,255,255,0.04) border:1px solid rgba(255,255,255,0.08) color:rgba(255,255,255,0.3) font-size:0.72rem font-family:var(--font-code) border-radius:100px transition:all 0.18s ease`,
        state: {}
      })
        .hover({
          onStart: { css: `background:rgba(255,255,255,0.1) border-color:rgba(255,255,255,0.2) color:rgba(255,255,255,0.82) transform:scale(1.05)` },
          onEnd: { css: `background:rgba(255,255,255,0.04) border-color:rgba(255,255,255,0.08) color:rgba(255,255,255,0.3) transform:scale(1)` }
        })
    })

    soul("install-core-btn").default({
      css: `display:flex align-items:center gap:0.75rem background:rgba(250,250,248,0.95) color:#1A1A18 font-family:var(--font-code) font-size:0.78rem padding:1rem 1.5rem border-radius:20px cursor:pointer transition:all 0.2s ease width:100% margin-bottom:0.5rem`,
      state: {}
    })
      .hover({ onStart: { css: `background:#FFFFFF transform:scale(1.01)` }, onEnd: { css: `background:rgba(250,250,248,0.95) transform:scale(1)` } })
      .click({ onStart: { css: `transform:scale(0.97)` }, onEnd: { css: `transform:scale(1)` } })

    soul("install-react-btn").default({
      css: `display:flex align-items:center gap:0.75rem background:rgba(255,255,255,0.06) border:1px solid rgba(255,255,255,0.1) color:rgba(255,255,255,0.65) font-family:var(--font-code) font-size:0.78rem padding:1rem 1.5rem border-radius:20px cursor:pointer transition:all 0.2s ease width:100%`,
      state: {}
    })
      .hover({ onStart: { css: `background:rgba(255,255,255,0.11) color:#FAFAF8 transform:scale(1.01)` }, onEnd: { css: `background:rgba(255,255,255,0.06) color:rgba(255,255,255,0.65) transform:scale(1)` } })
      .click({ onStart: { css: `transform:scale(0.97)` }, onEnd: { css: `transform:scale(1)` } })

    // ── Footer / Nav links ────────────────────────────────────────────────────
    ;["footer-npm", "footer-gh"].forEach(id => {
      soul(id).default({ css: `color:rgba(255,255,255,0.28) text-decoration:none font-size:0.68rem letter-spacing:0.1em text-transform:uppercase transition:color 0.2s`, state: {} })
        .hover({ onStart: { css: `color:rgba(255,255,255,0.75)` }, onEnd: { css: `color:rgba(255,255,255,0.28)` } })
    })

    NAV.forEach(item => {
      soul(`fnav-${item.id}`).default({
        css: `font-size:0.66rem letter-spacing:0.06em text-transform:lowercase color:rgba(250,250,248,0.4) text-decoration:none cursor:pointer padding:0.28rem 0.65rem border-radius:100px transition:all 0.2s ease`,
        state: {}
      })
        .hover({ onStart: { css: `color:#FAFAF8` }, onEnd: { css: `color:rgba(250,250,248,0.4)` } })
    })

    bindAll()
  }, [])

  const copy = (txt: string) => navigator.clipboard.writeText(txt)

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#FAFAF8", overflowX: "hidden" }}>

      {/* ── FLOATING NAV ────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: "1.75rem", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 500,
        display: "flex", alignItems: "center", gap: "0.05rem",
        background: "rgba(18,18,16,0.88)",
        backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "999px", padding: "0.4rem 0.55rem",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: navVisible ? 1 : 0,
        pointerEvents: navVisible ? "all" : "none",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}>
        {NAV.map(item => (
          <a
            key={item.id}
            data-soul={`fnav-${item.id}`}
            href={`#${item.id}`}
            style={{
              background: activeNav === item.id ? "rgba(250,250,248,0.13)" : "transparent",
              color: activeNav === item.id ? "#FAFAF8" : undefined,
              fontFamily: "var(--font-code)",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "7rem 2.5rem 5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* soft radial bg */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse 72% 58% at 60% 52%, rgba(195,188,176,0.16) 0%, transparent 72%)",
          pointerEvents: "none",
        }} />
        {/* Kanji watermark */}
        <div data-soul="hero-watermark" style={{
          position: "absolute", right: "-2rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: "var(--font-display)", fontSize: "clamp(10rem,26vw,22rem)",
          fontWeight: 800, color: "rgba(26,26,24,0.035)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
        }}>流れ</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5rem", alignItems: "center" }}>
            <div>
              {/* Logo row */}
              <div data-soul="hero-logo" style={{ display: "flex", alignItems: "center", gap: "0.7rem", marginBottom: "2.25rem" }}>
                <img src="/nagare-logo.png" alt="Nagare" style={{ height: "34px", width: "auto" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "#1A1A18", letterSpacing: "0.01em" }}>Nagare</span>
                <span style={{ fontSize: "0.6rem", fontFamily: "var(--font-code)", color: "#BBBAB7", letterSpacing: "0.1em", background: "rgba(26,26,24,0.06)", padding: "0.2rem 0.5rem", borderRadius: "6px" }}>v0.1.1</span>
              </div>

              <span data-soul="hero-tag" style={{
                display: "inline-block", fontSize: "0.63rem", letterSpacing: "0.18em",
                textTransform: "uppercase", color: "#BBBAB7", fontFamily: "var(--font-code)",
                marginBottom: "1.5rem",
              }}>
                Behavior Runtime · Frontend
              </span>

              <h1 data-soul="hero-h1" style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(3rem,8vw,6.5rem)",
                fontWeight: 700, lineHeight: 0.94, letterSpacing: "-0.04em",
                color: "#1A1A18", marginBottom: "2rem",
              }}>
                Behavior<br />
                <span style={{ color: "#BBBAB7" }}>runtime</span><br />
                for frontend.
              </h1>

              <p data-soul="hero-sub" style={{
                fontSize: "0.92rem", color: "#6B6B67", lineHeight: 1.85,
                maxWidth: "42ch", marginBottom: "2.5rem",
              }}>
                CSS owns styling. JS owns logic. Libraries own animation.
                Nobody owned <em>behavior</em> — until Nagare.
              </p>

              <div data-soul="hero-cta-row" style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", alignItems: "center" }}>
                <div data-soul="hero-install-btn" onClick={() => copy("npm install @nagarejs/react")}>
                  <span style={{ color: "#6B6B67" }}>$</span>
                  npm install @nagarejs/react
                  <span style={{
                    fontSize: "0.6rem", padding: "0.14rem 0.4rem",
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "5px", color: "rgba(255,255,255,0.28)",
                  }}>copy</span>
                </div>
                <a data-soul="hero-gh-btn" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">
                  ↗ github
                </a>
              </div>
            </div>

            {/* Code card */}
            <div data-soul="hero-code-card">
              <CodeBlock code={S_HERO} filename="button.tsx" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PURPOSE ─────────────────────────────────────────────────────── */}
      <section id="purpose" style={{ background: "#FAFAF8", padding: "9rem 2.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <span data-soul="purpose-eyebrow" style={{
            display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1.25rem", fontFamily: "var(--font-code)",
          }}>our purpose</span>

          <h2 data-soul="purpose-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,4.25rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.03em",
            color: "#1A1A18", marginBottom: "1.5rem", maxWidth: "18ch",
          }}>
            We gave behavior<br />
            <span style={{ color: "#BBBAB7" }}>a home.</span>
          </h2>

          <p data-soul="purpose-lead" style={{
            color: "#6B6B67", fontSize: "0.93rem", lineHeight: 1.9,
            maxWidth: "54ch", marginBottom: "4.5rem",
          }}>
            Frontend development has always had a missing layer.
            Styling has CSS. Logic has JavaScript. Animation has libraries.
            But <strong style={{ color: "#1A1A18" }}>behavior</strong> — the full arc of an interaction — 
            has never had its own home. Until Nagare.
            <br /><br />
            A click, a hover, a drag. They deserve to live in one place.
            All their styles, animations, logic, and state — together, where they belong.
          </p>

          <div data-soul="purpose-cards" style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.25rem",
          }}>
            {[
              {
                id: "p-pillar-1",
                num: "01",
                title: "One block per interaction",
                body: "A hover starts, runs, and ends. All its CSS, animation, logic, and state live inside one behavior block — not scattered across five files.",
              },
              {
                id: "p-pillar-2",
                num: "02",
                title: "No ceiling on JS",
                body: "The js: block is pure JavaScript. Call GSAP, fetch an API, play audio, update a store — all in the same lifecycle step.",
              },
              {
                id: "p-pillar-3",
                num: "03",
                title: "JSX stays clean",
                body: "No className gymnastics. No inline style explosions. No event handlers in markup. Add data-soul and call bindAll(). Done.",
              },
            ].map(p => (
              <div key={p.id} data-soul={p.id} style={{
                background: "linear-gradient(150deg,#F7F4F0,#EFEBE5)",
                borderRadius: "28px", padding: "2.25rem",
                cursor: "default",
              }}>
                <div style={{
                  fontSize: "0.56rem", letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#BBBAB7", marginBottom: "1.5rem", fontFamily: "var(--font-code)",
                }}>{p.num}</div>
                <h3 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.1rem",
                  fontWeight: 600, color: "#1A1A18", marginBottom: "0.7rem", lineHeight: 1.3,
                }}>{p.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "#6B6B67", lineHeight: 1.8 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONCEPT ─────────────────────────────────────────────────────── */}
      <section id="concept" style={{
        background: "#161614", padding: "9rem 2.5rem",
        borderRadius: "36px 36px 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse 55% 45% at 80% 25%, rgba(70,62,52,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

          <span data-soul="concept-eyebrow" style={{
            display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "1.25rem", fontFamily: "var(--font-code)",
          }}>the problem</span>

          <h2 data-soul="concept-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2rem,6vw,5rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.035em",
            color: "#FAFAF8", marginBottom: "1.5rem",
          }}>
            One hover.<br />
            <span style={{ color: "rgba(255,255,255,0.18)" }}>Five places.</span>
          </h2>

          <p data-soul="concept-desc" style={{
            color: "rgba(255,255,255,0.36)", fontSize: "0.88rem",
            lineHeight: 1.9, maxWidth: "48ch", marginBottom: "3.5rem",
          }}>
            Tailwind lifts it. CSS glows it. GSAP animates it.
            A store tracks it. A handler fires it.
            Five responsibilities, one interaction. You've been accepting that.
          </p>

          {/* Five-column breakdown */}
          <div data-soul="concept-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(5,1fr)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            marginBottom: "4rem",
          }}>
            {[
              { tool: "Tailwind", job: "the lift"      },
              { tool: "CSS",      job: "the glow"      },
              { tool: "GSAP",     job: "the animation" },
              { tool: "Store",    job: "the state"     },
              { tool: "Handler",  job: "the logic"     },
            ].map((item, i) => (
              <div key={i} data-soul={`concept-col-cc${i + 1}`} style={{
                padding: "1.75rem 1.25rem",
                borderRight: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ fontSize: "0.56rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", marginBottom: "0.4rem" }}>{item.tool}</div>
                <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.42)" }}>{item.job}</div>
              </div>
            ))}
          </div>

          {/* Before / after */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "5rem" }}>
            <div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "0.75rem", fontFamily: "var(--font-code)" }}>before</div>
              <CodeBlock code={S_CONCEPT_BEFORE} filename="button-before.ts" />
            </div>
            <div>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "0.75rem", fontFamily: "var(--font-code)" }}>after nagare ✦</div>
              <CodeBlock code={S_CONCEPT_AFTER} filename="button-after.ts" />
            </div>
          </div>

          <h2 data-soul="concept-after" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2rem,6vw,5rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.035em", color: "#FAFAF8",
          }}>
            Nagare gives it<br />
            <span style={{ color: "rgba(255,255,255,0.18)" }}>one place.</span> ✦
          </h2>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ─────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(180deg,#F7F4F0 0%,#FAFAF8 100%)",
        padding: "9rem 2.5rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3.75rem" }}>
            <span style={{
              display: "block", fontSize: "0.6rem", letterSpacing: "0.18em",
              textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)",
            }}>live playground</span>
            <h2 style={{
              fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,3rem)",
              fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem",
            }}>
              All 18 behaviors. Try every one.
            </h2>
            <p style={{ color: "#6B6B67", fontSize: "0.86rem", lineHeight: 1.85, maxWidth: "50ch" }}>
              Each card is a live Nagare behavior. Zero manual event listeners.
            </p>
          </div>

          {/* Demo grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(252px,1fr))", gap: "0.9rem", marginBottom: "3rem" }}>

            {/* hover */}
            <div data-soul="demo-hover" style={{ borderRadius: "24px" }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.hover()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>Hover over me ↑</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.35, marginTop: "0.4rem" }}>continuous · transforms on enter / leave</div>
            </div>

            {/* click */}
            <div data-soul="demo-click" style={{ borderRadius: "24px" }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.click()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)", marginBottom: "0.35rem" }}>Click me ✦</div>
              <div style={{ fontSize: "0.7rem", color: "#6B6B67" }}>clicked <span className="click-count">0</span>×</div>
            </div>

            {/* tap */}
            <div
              style={{
                background: tapFlash ? "linear-gradient(135deg,#1A1A18,#2E2E2C)" : "linear-gradient(135deg,#FAFAF8,#F0EDE8)",
                color: tapFlash ? "#FAFAF8" : "#1A1A18", padding: "2rem", borderRadius: "24px",
                cursor: "pointer", transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
                border: "1px solid rgba(26,26,24,0.06)",
              }}
              onPointerDown={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(0.92)" }}
              onPointerUp={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = "scale(1)"
                setTapFlash(true); setTimeout(() => setTapFlash(false), 700)
              }}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.tap()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{tapFlash ? "tapped! ✦" : "Tap me"}</div>
            </div>

            {/* press */}
            <div
              style={{
                background: pressActive ? "linear-gradient(135deg,#111,#0A0A09)" : "linear-gradient(135deg,#2E2E2C,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "24px",
                cursor: "pointer", transition: "background 0.18s ease",
                transform: pressActive ? "scale(0.92)" : "scale(1)",
              }}
              onPointerDown={() => setPressActive(true)}
              onPointerUp={() => { setPressActive(false); setReleaseFlash(true); setTimeout(() => setReleaseFlash(false), 700) }}
              onPointerLeave={() => setPressActive(false)}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.press()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{pressActive ? "holding… ⏸" : "Press and hold"}</div>
            </div>

            {/* release */}
            <div style={{
              background: releaseFlash ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)" : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              color: "#1A1A18", padding: "2rem", borderRadius: "24px",
              border: "1px solid rgba(26,26,24,0.06)",
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.release()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{releaseFlash ? "released! ✦" : "Release from press card"}</div>
            </div>

            {/* longpress */}
            <div
              style={{
                background: longpressHeld ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)" : "linear-gradient(135deg,#2A2A28,#1A1A18)",
                color: longpressHeld ? "#1A1A18" : "#FAFAF8",
                padding: "2rem", borderRadius: "24px",
                cursor: "pointer", transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                userSelect: "none",
              }}
              onPointerDown={startLongpress}
              onPointerUp={endLongpress}
              onPointerLeave={endLongpress}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.longpress()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{longpressHeld ? "held! ✦" : "Hold for 500ms"}</div>
            </div>

            {/* drag */}
            <div style={{
              background: "linear-gradient(135deg,#F5F2EE,#EEEBE6)",
              borderRadius: "24px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.06)",
              position: "relative", minHeight: "130px",
              overflow: "visible",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.85rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.drag()</div>
              <div
                ref={dragRef}
                style={{
                  width: "68px", height: "68px", borderRadius: "18px",
                  background: dragActive ? "linear-gradient(135deg,#333,#1A1A18)" : "linear-gradient(135deg,#1A1A18,#2E2E2C)",
                  cursor: dragActive ? "grabbing" : "grab",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FAFAF8", fontSize: "0.65rem", fontFamily: "var(--font-code)",
                  transition: dragActive ? "none" : "all 0.45s cubic-bezier(0.16,1,0.3,1)",
                  userSelect: "none", touchAction: "none",
                  boxShadow: dragActive ? "0 28px 56px rgba(0,0,0,0.32)" : "none",
                }}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerLeave={endDrag}
              >
                {dragActive ? "✦" : "grab"}
              </div>
            </div>

            {/* swipe */}
            <div
              style={{
                background: swipeDir ? "linear-gradient(135deg,#1A1A18,#2E2E2C)" : "linear-gradient(135deg,#2E2E2C,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "24px",
                cursor: "pointer", transition: "all 0.3s ease",
                userSelect: "none", touchAction: "pan-y",
              }}
              onTouchStart={swipeStart}
              onTouchEnd={swipeEnd}
              onMouseDown={swipeMouseDown}
              onMouseUp={swipeMouseUp}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.38, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.swipe()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{swipeDir || "Swipe any direction"}</div>
              {!swipeDir && <div style={{ fontSize: "0.7rem", opacity: 0.3, marginTop: "0.4rem" }}>touch or drag-release</div>}
            </div>

            {/* scroll */}
            <div style={{
              background: "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "24px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.06)",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.scroll()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)", color: "#1A1A18", marginBottom: "0.7rem" }}>scrollY · live</div>
              <div style={{ height: "5px", background: "rgba(26,26,24,0.08)", borderRadius: "100px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${scrollPct}%`, background: "#1A1A18", borderRadius: "100px", transition: "width 0.1s linear" }} />
              </div>
              <div style={{ fontSize: "0.66rem", color: "#6B6B67", marginTop: "0.45rem", fontFamily: "var(--font-code)" }}>{scrollPct}%</div>
            </div>

            {/* resize */}
            <div style={{
              background: "linear-gradient(135deg,#FAFAF8,#F5F2EE)",
              borderRadius: "24px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.06)",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.resize()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)", color: "#1A1A18" }}>Window width</div>
              <div style={{ fontSize: "1.5rem", fontFamily: "var(--font-code)", color: "#1A1A18", marginTop: "0.5rem", fontWeight: 600, letterSpacing: "-0.02em" }}>{resizeW}px</div>
            </div>

            {/* focus / blur */}
            <div style={{
              background: focusActive ? "linear-gradient(135deg,#1A1A18,#111)" : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "24px", padding: "2rem",
              border: `1px solid ${focusActive ? "#1A1A18" : "rgba(26,26,24,0.06)"}`,
              transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.7rem", fontFamily: "var(--font-code)", color: focusActive ? "#FAFAF8" : "#1A1A18" }}>.focus() / .blur()</div>
              <input
                placeholder="focus me"
                onFocus={() => setFocusActive(true)}
                onBlur={() => { setFocusActive(false); setBlurActive(true); setTimeout(() => setBlurActive(false), 600) }}
                style={{
                  background: "transparent", border: "none",
                  color: focusActive ? "#FAFAF8" : "#1A1A18",
                  fontFamily: "var(--font-code)", fontSize: "0.82rem",
                  outline: "none", width: "100%",
                }}
              />
              {blurActive && <div style={{ fontSize: "0.68rem", color: "#6B6B67", marginTop: "0.35rem" }}>blurred ✦</div>}
            </div>

            {/* enter / exit */}
            <div
              style={{
                background: enterActive ? "linear-gradient(135deg,#1A1A18,#2E2E2C)" : "linear-gradient(135deg,#2A2A28,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "24px",
                transition: "all 0.28s ease", cursor: "default",
              }}
              onMouseEnter={() => setEnterActive(true)}
              onMouseLeave={() => setEnterActive(false)}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.38, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.enter() / .exit()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{enterActive ? "entered ✦" : "Hover to enter"}</div>
            </div>

            {/* onMount */}
            <div style={{
              background: mountDone ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)" : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "24px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.06)",
              transition: "all 0.6s ease",
            }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.onMount()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)", color: "#1A1A18" }}>{mountDone ? "mounted ✦" : "mounting…"}</div>
              <div style={{ fontSize: "0.68rem", color: "#6B6B67", marginTop: "0.4rem" }}>fires once on DOM attach</div>
            </div>

            {/* onVisible / onInvisible */}
            <div
              ref={visRef}
              style={{
                background: visibleActive ? "linear-gradient(135deg,#1A1A18,#2E2E2C)" : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
                color: visibleActive ? "#FAFAF8" : "#1A1A18",
                borderRadius: "24px", padding: "2rem",
                border: `1px solid ${visibleActive ? "transparent" : "rgba(26,26,24,0.06)"}`,
                transition: "all 0.65s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.onVisible() / .onInvisible()</div>
              <div style={{ fontSize: "0.9rem", fontFamily: "var(--font-display)" }}>{visibleActive ? "visible ✦" : "scroll to reveal"}</div>
            </div>

          </div>

          {/* Sandbox */}
          <Sandbox />
        </div>
      </section>

      {/* ── BEHAVIORS ───────────────────────────────────────────────────── */}
      <section id="behaviors" style={{ background: "#FAFAF8", padding: "9rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "-2rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: "var(--font-display)", fontSize: "clamp(9rem,22vw,18rem)",
          fontWeight: 800, color: "rgba(26,26,24,0.022)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>02</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="beh-eyebrow" style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>behaviors</span>
          <h2 data-soul="beh-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem" }}>
            18 detectors. All interactions.
          </h2>
          <p data-soul="beh-sub" style={{ color: "#6B6B67", fontSize: "0.86rem", lineHeight: 1.85, maxWidth: "50ch", marginBottom: "2.5rem" }}>
            Behaviors are sensors — they fire when the user or environment triggers them.
            <br /><span style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>Underlined</span> = supports continuous <code>onUpdate</code> events.
          </p>

          <div data-soul="beh-pills" style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "2.25rem" }}>
            {BEHAVIORS.map(b => (
              <span key={b.name} data-soul={`pill-${b.name}`}
                style={{ textDecoration: b.continuous ? "underline" : "none", textUnderlineOffset: "3px" }}
                onMouseEnter={() => setHoveredBehavior(b.name)}
                onMouseLeave={() => setHoveredBehavior(null)}
              >
                .{b.name}()
              </span>
            ))}
          </div>

          <div data-soul="beh-detail" style={{ minHeight: "3.5rem" }}>
            {hoveredBehavior ? (() => {
              const b = BEHAVIORS.find(x => x.name === hoveredBehavior)!
              return (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.75rem",
                  background: "linear-gradient(135deg,#1A1A18,#2A2A28)",
                  padding: "0.9rem 1.5rem", borderRadius: "20px",
                  fontSize: "0.72rem", fontFamily: "var(--font-code)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
                }}>
                  <span style={{ color: "#FAFAF8", fontWeight: 600 }}>.{b.name}()</span>
                  <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.12)" }} />
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>{b.continuous ? "continuous" : "discrete"}</span>
                  <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
                  <span style={{ color: "rgba(255,255,255,0.35)", maxWidth: "44ch", lineHeight: 1.55 }}>{b.desc}</span>
                </div>
              )
            })() : (
              <span style={{ fontSize: "0.72rem", color: "#BBBAB7", fontFamily: "var(--font-code)" }}>hover a behavior ↑</span>
            )}
          </div>
        </div>
      </section>

      {/* ── BLOCKS ──────────────────────────────────────────────────────── */}
      <section id="blocks" style={{
        background: "#161614", padding: "9rem 2.5rem",
        borderRadius: "36px 36px 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "-2rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(9rem,22vw,18rem)", fontWeight: 800, color: "rgba(255,255,255,0.022)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>03</div>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 38% at 18% 22%, rgba(70,62,52,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="blocks-eyebrow" style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>blocks</span>
          <h2 data-soul="blocks-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#FAFAF8", marginBottom: "0.75rem" }}>
            Three blocks. Each owns its lane.
          </h2>
          <p data-soul="blocks-sub" style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.86rem", lineHeight: 1.85, maxWidth: "48ch", marginBottom: "3.5rem" }}>
            Inside every behavior lifecycle — onStart, onUpdate, onEnd — pick what you need.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div data-soul="block-tw">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem", marginBottom: "0.9rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>tw:</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.26)" }}>Tailwind utility classes</span>
              </div>
              <CodeBlock code={`tw: "transition-all duration-300 ease-out\n     hover:shadow-xl rounded-3xl"`} filename="tw-block.ts" />
            </div>

            <div data-soul="block-css">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem", marginBottom: "0.9rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>css:</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.26)" }}>pure CSS with @if / @else</span>
              </div>
              <CodeBlock code={S_CSS} filename="css-block.ts" />
            </div>

            <div data-soul="block-js" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.65rem", marginBottom: "0.9rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>js:</span>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.26)" }}>any JavaScript — no ceiling (≧▽≦)</span>
              </div>
              <CodeBlock code={S_JS} filename="js-block.ts" />
            </div>
          </div>
        </div>
      </section>

      {/* ── API ─────────────────────────────────────────────────────────── */}
      <section id="api" style={{ background: "#FAFAF8", padding: "9rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-2rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(9rem,22vw,18rem)", fontWeight: 800, color: "rgba(26,26,24,0.022)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>04</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="api-eyebrow" style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>api</span>
          <h2 data-soul="api-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem" }}>
            Templates. Presets. Reuse everything.
          </h2>
          <p data-soul="api-sub" style={{ color: "#6B6B67", fontSize: "0.86rem", lineHeight: 1.85, maxWidth: "48ch", marginBottom: "3.5rem" }}>
            Extract behavior patterns into named units. Merge or override. Compose freely.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
            <div data-soul="api-template">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.45rem", color: "#1A1A18" }}>template()</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.76rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>Reusable block collections. Attach to any behavior. Merge (default) or override.</p>
              <CodeBlock code={S_TEMPLATE} filename="templates.ts" />
            </div>
            <div data-soul="api-preset">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.45rem", color: "#1A1A18" }}>preset()</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.76rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>Full lifecycle reuse — onStart, onUpdate, onEnd all in one named unit.</p>
              <CodeBlock code={S_PRESET} filename="presets.ts" />
            </div>
            <div data-soul="api-scroll" style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.45rem", color: "#1A1A18" }}>scroll() with live params</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.76rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                Continuous behaviors pass live data via <code>this.params</code>. scrollY, x, y, direction — no extra library.
              </p>
              <CodeBlock code={S_SCROLL} filename="scroll.ts" />
            </div>
          </div>

          {/* Lifecycle card */}
          <div data-soul="api-lifecycle" style={{
            background: "linear-gradient(150deg,#F7F4F0,#EFEBE5)",
            borderRadius: "28px", padding: "2.5rem",
          }}>
            <span style={{ fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#BBBAB7", display: "block", marginBottom: "1.5rem", fontFamily: "var(--font-code)" }}>lifecycle</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {[
                { n: "onStart", d: "once · begin" }, "→",
                { n: "onUpdate", d: "continuous" }, "→",
                { n: "onEnd", d: "once · end" },
              ].map((item, i) =>
                item === "→"
                  ? <span key={i} style={{ color: "#BBBAB7", fontSize: "1rem" }}>→</span>
                  : (
                    <div key={i}>
                      <div style={{ fontFamily: "var(--font-code)", fontSize: "0.8rem", color: "#1A1A18", marginBottom: "0.2rem" }}>{(item as any).n}</div>
                      <div style={{ fontSize: "0.62rem", color: "#6B6B67" }}>{(item as any).d}</div>
                    </div>
                  )
              )}
            </div>
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", paddingTop: "1.5rem", borderTop: "1px solid rgba(26,26,24,0.07)" }}>
              {[{ k: "tw:", d: "Tailwind classes" }, { k: "css:", d: "pure CSS + @if conditions" }, { k: "js:", d: "any JavaScript, async OK" }].map(b => (
                <div key={b.k} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-code)", fontSize: "0.76rem", color: "#1A1A18", fontWeight: 700 }}>{b.k}</span>
                  <span style={{ fontSize: "0.68rem", color: "#6B6B67" }}>{b.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTALL ─────────────────────────────────────────────────────── */}
      <section id="install" style={{
        background: "linear-gradient(160deg,#0F0F0E 0%,#161614 55%,#222220 100%)",
        padding: "9rem 2.5rem",
        borderRadius: "36px 36px 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-12rem", right: "-12rem", width: "44rem", height: "44rem", borderRadius: "50%", background: "radial-gradient(circle,rgba(70,62,52,0.14) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "-2rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(9rem,22vw,18rem)", fontWeight: 800, color: "rgba(255,255,255,0.022)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>05</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="install-eyebrow" style={{ display: "block", fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>install</span>
          <h2 data-soul="install-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#FAFAF8", marginBottom: "0.75rem" }}>
            Works with any React framework.
          </h2>
          <p data-soul="install-desc" style={{ color: "rgba(255,255,255,0.32)", fontSize: "0.86rem", lineHeight: 1.85, maxWidth: "48ch", marginBottom: "3rem" }}>
            <strong style={{ color: "#FAFAF8" }}>@nagarejs/core is mandatory.</strong> It is the engine — handles binding, lifecycle parsing, state, and behavior wiring. The React adapter sits on top.
          </p>

          {/* Frameworks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginBottom: "2.75rem" }}>
            {[["fw-next", "Next.js"], ["fw-remix", "Remix"], ["fw-astro", "Astro"], ["fw-vite", "React Vite"], ["fw-tanstack", "TanStack"], ["fw-cra", "CRA"]].map(([id, label]) => (
              <div key={id} data-soul={id}>✦ {label}</div>
            ))}
          </div>

          <div data-soul="install-box" style={{ maxWidth: "540px", marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "0.5rem", fontFamily: "var(--font-code)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ background: "rgba(255,255,255,0.09)", padding: "0.15rem 0.5rem", borderRadius: "7px", color: "#FAFAF8", letterSpacing: "0.06em" }}>required</span>
              @nagarejs/core
            </div>
            <div data-soul="install-core-btn" onClick={() => copy("npm install @nagarejs/core")}>
              <span style={{ color: "#6B6B67" }}>$</span>
              <span style={{ flex: 1 }}>npm install @nagarejs/core</span>
              <span style={{ fontSize: "0.6rem", opacity: 0.38 }}>copy</span>
            </div>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", margin: "1.25rem 0 0.5rem", fontFamily: "var(--font-code)" }}>React adapter</div>
            <div data-soul="install-react-btn" onClick={() => copy("npm install @nagarejs/react")}>
              <span style={{ color: "rgba(255,255,255,0.32)" }}>$</span>
              <span style={{ flex: 1 }}>npm install @nagarejs/react</span>
              <span style={{ fontSize: "0.6rem", opacity: 0.35 }}>copy</span>
            </div>
          </div>

          <CodeBlock code={S_INSTALL} filename="terminal" />

          <div style={{ display: "flex", gap: "2rem", marginTop: "2.25rem" }}>
            <a data-soul="footer-npm" href="https://www.npmjs.com/package/@nagarejs/react" target="_blank" rel="noopener noreferrer">npm ↗</a>
            <a data-soul="footer-gh" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">github ↗</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        padding: "2rem 2.5rem",
        borderTop: "1px solid rgba(26,26,24,0.06)",
        background: "#FAFAF8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <img src="/nagare-logo.png" alt="Nagare" style={{ height: "22px", width: "auto", opacity: 0.55 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 600, color: "#1A1A18" }}>Nagare</span>
          <span style={{ color: "#BBBAB7", fontSize: "0.76rem" }}>流れ · flow</span>
        </div>
        <span style={{ fontFamily: "var(--font-code)", fontSize: "0.65rem", color: "#BBBAB7", letterSpacing: "0.06em" }}>
          @nagarejs/react · v0.1.1
        </span>
      </footer>

    </div>
  )
}
