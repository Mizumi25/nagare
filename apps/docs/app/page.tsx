"use client"

import { useEffect, useState, useRef } from "react"
import { soul, template, preset, bindAll } from "@nagarejs/react"

// ─────────────────────────────────────────────────────────────────────────────
// Syntax highlighter — order matters, runs top-down
// ─────────────────────────────────────────────────────────────────────────────
function hl(raw: string): string {
  // 1. escape HTML entities first
  let s = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // 2. protect template-literal content inside backtick strings
  //    replace them with placeholders so inner content doesn't get double-highlighted
  const tlParts: string[] = []
  s = s.replace(/`([\s\S]*?)`/g, (_m, inner) => {
    const idx = tlParts.length
    // highlight @if / @else inside CSS blocks
    const innerHl = inner.replace(/(@if|@else\s+if|@else)/g, '<span class="sh-at">$1</span>')
    tlParts.push(`\`${innerHl}\``)
    return `\x00TL${idx}\x00`
  })

  // 3. line comments  //...
  s = s.replace(/(\/\/[^\n]*)/g, '<span class="sh-comment">$1</span>')

  // 4. double-quoted strings
  s = s.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="sh-str">"$1"</span>')

  // 5. nagare API keywords (BEFORE generic JS keywords so they win)
  s = s.replace(
    /\b(soul|template|preset|bindAll|onStart|onEnd|onUpdate|css|tw|js|state|delay|presets|templates)\b(?=[\s:(,.\x00]|$)/g,
    '<span class="sh-api">$1</span>'
  )

  // 6. JS keywords
  s = s.replace(
    /\b(function|const|let|var|return|import|from|export|default|async|await|new|typeof|true|false|null|undefined|this)\b/g,
    '<span class="sh-kw">$1</span>'
  )

  // 7. numbers
  s = s.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="sh-num">$1</span>')

  // 8. restore template literals
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
// Mini Sandbox — editable + live preview
// ─────────────────────────────────────────────────────────────────────────────
const SANDBOX_DEFAULT = `soul("box")
  .hover({
    onStart: {
      css: \`
        transform: scale(1.08)
        background: #FAFAF8
        color: #1A1A18
        border-radius: 20px
      \`
    },
    onEnd: {
      css: \`
        transform: scale(1)
        background: #1A1A18
        color: #FAFAF8
        border-radius: 8px
      \`
    }
  })
  .click({
    onStart: { css: \`transform: scale(0.92)\` },
    onEnd:   { css: \`transform: scale(1)\` }
  })`

function Sandbox() {
  const [code, setCode]     = useState(SANDBOX_DEFAULT)
  const [status, setStatus] = useState<"idle"|"running"|"ok"|"err">("idle")
  const [errMsg, setErrMsg] = useState("")
  const boxRef = useRef<HTMLDivElement>(null)

  const run = () => {
    setStatus("running")
    setErrMsg("")
    try {
      if (!boxRef.current) { setStatus("err"); setErrMsg("Preview not mounted."); return }
      // Reset box styles
      boxRef.current.removeAttribute("style")
      boxRef.current.style.cssText = `
        background:#1A1A18; color:#FAFAF8; width:120px; height:120px;
        border-radius:8px; display:flex; align-items:center; justify-content:center;
        cursor:pointer; font-size:0.75rem; font-family:var(--font-code);
        transition:all 0.3s ease; user-select:none;
      `
      // We can't eval Nagare here because the runtime isn't importable in a
      // closure — so we simulate a subset: parse css blocks from the code string
      // and wire mouseenter/mouseleave/mousedown/mouseup ourselves.
      const getBlock = (evt: string, lifecycle: string) => {
        const evtRx = new RegExp(`\\.${evt}\\s*\\(\\s*\\{[\\s\\S]*?${lifecycle}\\s*:\\s*\\{[\\s\\S]*?css\\s*:\\s*\`([^}\`]*)\``, "m")
        const m = code.match(evtRx)
        if (!m) return null
        return m[1].trim()
      }
      const applyCSS = (el: HTMLElement, block: string | null) => {
        if (!block) return
        block.split("\n").forEach(line => {
          const l = line.trim()
          if (!l || l.startsWith("@")) return
          const colonIdx = l.indexOf(":")
          if (colonIdx < 0) return
          const prop = l.slice(0, colonIdx).trim()
          const val  = l.slice(colonIdx + 1).trim()
          try { (el.style as any)[prop.replace(/-([a-z])/g, (_:string,c:string) => c.toUpperCase())] = val } catch(_){}
        })
      }
      const el = boxRef.current
      const hoverStart = getBlock("hover", "onStart")
      const hoverEnd   = getBlock("hover", "onEnd")
      const clickStart = getBlock("click", "onStart")
      const clickEnd   = getBlock("click", "onEnd")
      el.onmouseenter = () => applyCSS(el, hoverStart)
      el.onmouseleave = () => applyCSS(el, hoverEnd)
      el.onmousedown  = () => applyCSS(el, clickStart)
      el.onmouseup    = () => applyCSS(el, clickEnd)
      setStatus("ok")
    } catch(e: any) {
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
        background:#1A1A18; color:#FAFAF8; width:120px; height:120px;
        border-radius:8px; display:flex; align-items:center; justify-content:center;
        cursor:pointer; font-size:0.75rem; font-family:var(--font-code);
        transition:all 0.3s ease; user-select:none;
      `
      boxRef.current.onmouseenter = null
      boxRef.current.onmouseleave = null
      boxRef.current.onmousedown = null
      boxRef.current.onmouseup = null
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
              background: "#1A1A18",
              color: "#FAFAF8",
              width: "120px",
              height: "120px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontFamily: "var(--font-code)",
              transition: "all 0.3s ease",
              userSelect: "none",
            }}
          >
            {status === "idle" ? "press run ▶" : status === "running" ? "…" : status === "ok" ? "live ✦" : "error"}
          </div>
          {errMsg && <p style={{ color: "#ff6b6b", fontSize: "0.65rem", marginTop: "0.75rem", fontFamily: "var(--font-code)", maxWidth: "200px" }}>{errMsg}</p>}
          {status === "ok" && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", marginTop: "0.75rem", fontFamily: "var(--font-code)" }}>
              hover · click the box
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// All 18 behaviors list
// ─────────────────────────────────────────────────────────────────────────────
const BEHAVIORS = [
  { name: "click",       continuous: false, desc: "Mouse / touch click — onStart fires on down, onEnd on release" },
  { name: "tap",         continuous: false, desc: "Tap gesture — fires once on touch release, like click for mobile" },
  { name: "longpress",   continuous: false, desc: "Hold for 500 ms — onStart when threshold is met, onEnd on release" },
  { name: "swipe",       continuous: false, desc: "Directional swipe — params.direction is left/right/up/down" },
  { name: "hover",       continuous: true,  desc: "Cursor enters/leaves — continuous with onUpdate while inside" },
  { name: "press",       continuous: true,  desc: "Pointer held down — continuous between mousedown and mouseup" },
  { name: "release",     continuous: false, desc: "Fires once when pointer lifts — complement to press" },
  { name: "drag",        continuous: true,  desc: "Drag with cursor tracking — params.x / params.y update live" },
  { name: "scroll",      continuous: true,  desc: "Page scroll — params.scrollY updates on every scroll frame" },
  { name: "resize",      continuous: true,  desc: "Window resize — params.width / params.height live" },
  { name: "focus",       continuous: true,  desc: "Element receives focus — works on inputs, buttons, links" },
  { name: "blur",        continuous: false, desc: "Element loses focus — fires once" },
  { name: "enter",       continuous: false, desc: "Pointer enters element bounds — like hover but no onUpdate" },
  { name: "exit",        continuous: false, desc: "Pointer leaves element bounds" },
  { name: "onMount",     continuous: false, desc: "Fires once when element is mounted in the DOM" },
  { name: "onVisible",   continuous: false, desc: "IntersectionObserver — element scrolls into view" },
  { name: "onInvisible", continuous: false, desc: "IntersectionObserver — element scrolls out of view" },
  { name: "longpress",   continuous: false, desc: "" }, // dedupe guard, filtered below
].filter((b, i, arr) => arr.findIndex(x => x.name === b.name) === i)

// ─────────────────────────────────────────────────────────────────────────────
// Snippets
// ─────────────────────────────────────────────────────────────────────────────
const S_HERO = `soul("button")
  .hover({
    onStart: {
      css: \`transform: translateY(-4px)
            box-shadow: 0 20px 40px rgba(0,0,0,0.2)\`
    },
    onEnd: {
      css: \`transform: translateY(0)\`
    }
  })`

const S_CONCEPT = `// before nagare — 5 places, 1 interaction
const btn = document.querySelector("button")

// CSS file
.button:hover { transform: translateY(-4px); }

// animation lib
btn.addEventListener("mouseenter", () =>
  gsap.to(btn, { boxShadow: "0 20px 40px black" })
)

// state store
btn.addEventListener("mouseenter", () =>
  store.setState({ hovered: true })
)

// event handler
btn.addEventListener("mouseenter", updateAnalytics)`

const S_AFTER = `// after nagare — 1 place, 1 interaction
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

  // no ceiling — use anything
  gsap.to(this.el, { rotation: 360, duration: 0.4 })
  const res = await fetch("/api/like")
  new Audio("/pop.mp3").play()
}`

const S_TEMPLATE = `template("lift", {
  css: \`
    transform: translateY(-6px)
    box-shadow: 0 24px 48px rgba(0,0,0,0.15)
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
  const [activeNav,       setActiveNav]       = useState("purpose")
  const [hoveredBehavior, setHoveredBehavior] = useState<string | null>(null)
  const [navVisible,      setNavVisible]      = useState(true)
  const [pressActive,     setPressActive]     = useState(false)
  const [tapFlash,        setTapFlash]        = useState(false)
  const [swipeDir,        setSwipeDir]        = useState("")
  const [dragActive,      setDragActive]      = useState(false)
  const [focusActive,     setFocusActive]     = useState(false)
  const [resizeW,         setResizeW]         = useState(0)
  const [scrollPct,       setScrollPct]       = useState(0)
  const [clickCount,      setClickCount]      = useState(0)
  const [longpressHeld,   setLongpressHeld]   = useState(false)
  const [releaseFlash,    setReleaseFlash]    = useState(false)
  const [enterActive,     setEnterActive]     = useState(false)
  const [blurActive,      setBlurActive]      = useState(false)
  const [visibleActive,   setVisibleActive]   = useState(false)
  const [invisibleActive, setInvisibleActive] = useState(false)
  const [mountDone,       setMountDone]       = useState(false)

  const lastScrollY   = useRef(0)
  const longpressTimer= useRef<ReturnType<typeof setTimeout> | null>(null)
  const swipeTouchStart = useRef<{x:number;y:number} | null>(null)
  const visRef        = useRef<HTMLDivElement>(null)
  const dragRef       = useRef<HTMLDivElement>(null)
  const dragPos       = useRef({ ox: 0, oy: 0, startX: 0, startY: 0 })

  // scroll tracking
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

  // resize tracking
  useEffect(() => {
    const onResize = () => setResizeW(window.innerWidth)
    setResizeW(window.innerWidth)
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // IntersectionObserver for onVisible / onInvisible demo
  useEffect(() => {
    if (!visRef.current) return
    const obs = new IntersectionObserver(([entry]) => {
      setVisibleActive(entry.isIntersecting)
      setInvisibleActive(!entry.isIntersecting)
    }, { threshold: 0.5 })
    obs.observe(visRef.current)
    return () => obs.disconnect()
  }, [])

  // drag via pointer events
  const startDrag = (e: React.PointerEvent) => {
    if (!dragRef.current) return
    const r = dragRef.current.getBoundingClientRect()
    dragPos.current = { ox: r.left, oy: r.top, startX: e.clientX, startY: e.clientY }
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

  // swipe touch
  const swipeStart = (e: React.TouchEvent) => {
    swipeTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const swipeEnd = (e: React.TouchEvent) => {
    if (!swipeTouchStart.current) return
    const dx = e.changedTouches[0].clientX - swipeTouchStart.current.x
    const dy = e.changedTouches[0].clientY - swipeTouchStart.current.y
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "right →" : "left ←")
      : (dy > 0 ? "down ↓" : "up ↑")
    setSwipeDir(dir)
    setTimeout(() => setSwipeDir(""), 1500)
  }
  // swipe mouse fallback
  const swipeMouseStart = useRef<{x:number;y:number}|null>(null)
  const swipeMouseDown = (e: React.MouseEvent) => { swipeMouseStart.current = {x:e.clientX,y:e.clientY} }
  const swipeMouseUp   = (e: React.MouseEvent) => {
    if (!swipeMouseStart.current) return
    const dx = e.clientX - swipeMouseStart.current.x
    const dy = e.clientY - swipeMouseStart.current.y
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
    const dir = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? "right →" : "left ←")
      : (dy > 0 ? "down ↓" : "up ↑")
    setSwipeDir(dir)
    swipeMouseStart.current = null
    setTimeout(() => setSwipeDir(""), 1500)
  }

  // onMount badge
  useEffect(() => { setTimeout(() => setMountDone(true), 600) }, [])

  useEffect(() => {
    // ── TEMPLATES ────────────────────────────────────────────────────────────
    template("revealUp", {
      css: `
        opacity: 1
        transform: translateY(0px)
        filter: blur(0px)
        transition: all 0.9s cubic-bezier(0.16,1,0.3,1)
      `
    })
    template("liftGlow", {
      css: `
        transform: translateY(-6px)
        box-shadow: 0 28px 56px rgba(0,0,0,0.22)
        transition: all 0.3s ease
      `
    })

    // ── PRESETS ──────────────────────────────────────────────────────────────
    preset("fadeUp", {
      onStart: {
        css: `
          opacity: 1
          transform: translateY(0px)
          filter: blur(0px)
          transition: all 0.9s cubic-bezier(0.16,1,0.3,1)
        `
      }
    })
    preset("scaleIn", {
      onStart: {
        css: `
          opacity: 1
          transform: scale(1)
          transition: all 0.6s cubic-bezier(0.16,1,0.3,1)
        `
      }
    })

    // ── HERO ─────────────────────────────────────────────────────────────────
    soul("hero-logo").default({ css: `opacity: 0 transform: translateY(-12px) scale(0.9)`, state: {} })
      .onMount({ delay: 50, onStart: { css: `opacity: 1 transform: translateY(0) scale(1) transition: all 1s cubic-bezier(0.16,1,0.3,1)` } })
      .scroll({ onUpdate: { js: function(this:any){ this.el.style.transform = `translateY(${this.params.scrollY*0.04}px)` } } })

    soul("hero-tag").default({ css: `opacity: 0 transform: translateY(10px)`, state: {} })
      .onMount({ delay: 200, presets: [{ name: "fadeUp" }] })

    soul("hero-h1").default({ css: `opacity: 0 transform: translateY(40px) filter: blur(10px)`, state: {} })
      .onMount({ delay: 300, onStart: { css: `opacity: 1 transform: translateY(0) filter: blur(0px) transition: all 1.3s cubic-bezier(0.16,1,0.3,1)` } })

    soul("hero-sub").default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
      .onMount({ delay: 600, presets: [{ name: "fadeUp" }] })

    soul("hero-cta-row").default({ css: `opacity: 0 transform: translateY(16px)`, state: {} })
      .onMount({ delay: 800, presets: [{ name: "fadeUp" }] })

    soul("hero-code-card").default({ css: `opacity: 0 transform: translateY(24px)`, state: {} })
      .onMount({ delay: 500, presets: [{ name: "fadeUp" }] })

    soul("hero-install-btn").default({
      css: `
        display: inline-flex align-items: center gap: 0.75rem
        background: #1A1A18 color: #FAFAF8
        font-family: var(--font-code) font-size: 0.78rem
        padding: 0.9rem 1.6rem border-radius: 100px cursor: pointer
        transition: all 0.2s ease
      `,
      state: {}
    })
    .hover({ onStart: { css: `background: #2E2E2C transform: scale(1.02)` }, onEnd: { css: `background: #1A1A18 transform: scale(1)` } })
    .click({ onStart: { css: `transform: scale(0.96)` }, onEnd: { css: `transform: scale(1)` } })

    soul("hero-gh-btn").default({
      css: `
        display: inline-flex align-items: center gap: 0.5rem
        border: 1px solid rgba(26,26,24,0.15) color: #6B6B67
        font-size: 0.78rem padding: 0.9rem 1.6rem border-radius: 100px
        cursor: pointer text-decoration: none transition: all 0.2s ease
      `,
      state: {}
    })
    .hover({ onStart: { css: `border-color: #1A1A18 color: #1A1A18 transform: scale(1.02)` }, onEnd: { css: `border-color: rgba(26,26,24,0.15) color: #6B6B67 transform: scale(1)` } })

    // scroll parallax on hero koi watermark
    soul("hero-watermark").default({ css: `opacity: 0`, state: {} })
      .onMount({ delay: 700, onStart: { css: `opacity: 1 transition: opacity 2s ease` } })
      .scroll({ onUpdate: { js: function(this:any){ this.el.style.transform = `translateY(${this.params.scrollY*0.1}px)` } } })

    // ── PURPOSE ───────────────────────────────────────────────────────────────
    const rv = (id: string, delay = 0) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(28px) filter: blur(4px)`, state: {} })
        .onVisible({ delay, onStart: { presets: [{ name: "fadeUp" }] } })
    }
    rv("purpose-eyebrow",  0)
    rv("purpose-h2",       80)
    rv("purpose-lead",    160)
    rv("purpose-cards",   240)

    // purpose pillar cards
    ;["p-pillar-1","p-pillar-2","p-pillar-3"].forEach((id,i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
        .onVisible({ delay: 300 + i*100, onStart: { presets: [{ name: "fadeUp" }] } })
        .hover({ onStart: { templates: [{ name: "liftGlow" }] }, onEnd: { css: `transform: translateY(0) box-shadow: none` } })
    })

    // ── CONCEPT ───────────────────────────────────────────────────────────────
    rv("concept-eyebrow", 0)
    rv("concept-h2",     80)
    rv("concept-desc",  160)
    rv("concept-grid",  240)
    rv("concept-arrow", 100)
    rv("concept-after", 180)

    ;["cc1","cc2","cc3","cc4","cc5"].forEach((id,i) => {
      soul(`concept-col-${id}`).default({ css: `opacity: 0 transform: translateY(18px)`, state: {} })
        .onVisible({ delay: 280 + i*60, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── DEMO CARDS ────────────────────────────────────────────────────────────
    soul("demo-hover").default({
      css: `
        background: linear-gradient(135deg, #1A1A18, #2E2E2C)
        color: #FAFAF8 padding: 2rem border-radius: 20px
        cursor: default transition: all 0.35s cubic-bezier(0.16,1,0.3,1)
      `,
      state: {}
    })
    .hover({
      onStart: { templates: [{ name: "liftGlow" }] },
      onEnd: { css: `transform: translateY(0) box-shadow: none` }
    })

    soul("demo-click").default({
      css: `
        background: linear-gradient(135deg, #F0EDE8, #E8E4DF)
        color: #1A1A18 padding: 2rem border-radius: 20px
        cursor: pointer transition: all 0.18s ease
      `,
      state: { count: 0 }
    })
    .click({
      onStart: {
        css: `transform: scale(0.92) background: linear-gradient(135deg,#E0DDD8,#D8D4CF)`,
        js: function(this:any) {
          this.state.count += 1
          const el = this.el.querySelector(".click-count")
          if (el) el.textContent = String(this.state.count)
        }
      },
      onEnd: { css: `transform: scale(1) background: linear-gradient(135deg,#F0EDE8,#E8E4DF)` }
    })
    .hover({ onStart: { templates: [{ name: "liftGlow" }] }, onEnd: { css: `transform: translateY(0) box-shadow: none` } })

    soul("demo-longpress").default({
      css: `
        background: linear-gradient(135deg,#2A2A28,#1A1A18)
        color: #FAFAF8 padding: 2rem border-radius: 20px
        cursor: pointer transition: all 0.2s ease position: relative overflow: hidden
      `,
      state: { held: false }
    })

    soul("demo-scroll-vis").default({ css: `border-radius: 20px overflow: hidden`, state: {} })

    // ── BEHAVIORS SECTION PILLS ───────────────────────────────────────────────
    rv("beh-eyebrow", 0)
    rv("beh-h2",     80)
    rv("beh-sub",   160)
    rv("beh-pills", 240)
    rv("beh-detail",300)

    BEHAVIORS.forEach(b => {
      soul(`pill-${b.name}`).default({
        css: `
          display: inline-flex align-items: center gap: 0.35rem
          border: 1px solid rgba(26,26,24,0.1) color: #6B6B67
          background: transparent font-family: var(--font-code)
          font-size: 0.72rem padding: 0.45rem 1rem border-radius: 100px
          letter-spacing: 0.02em transition: all 0.18s ease cursor: default white-space: nowrap
        `,
        state: {}
      })
      .hover({
        onStart: { css: `border-color: #1A1A18 background: #1A1A18 color: #FAFAF8 transform: scale(1.04)` },
        onEnd:   { css: `border-color: rgba(26,26,24,0.1) background: transparent color: #6B6B67 transform: scale(1)` }
      })
    })

    // ── BLOCKS ────────────────────────────────────────────────────────────────
    rv("blocks-eyebrow", 0)
    rv("blocks-h2",     80)
    rv("blocks-sub",   160)
    ;["block-tw","block-css","block-js"].forEach((id,i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
        .onVisible({ delay: 200 + i*90, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── API ───────────────────────────────────────────────────────────────────
    rv("api-eyebrow", 0)
    rv("api-h2",     80)
    rv("api-sub",   160)
    ;["api-template","api-preset","api-scroll","api-lifecycle"].forEach((id,i) => {
      soul(id).default({ css: `opacity: 0 transform: translateY(20px)`, state: {} })
        .onVisible({ delay: 100 + i*80, onStart: { presets: [{ name: "fadeUp" }] } })
    })

    // ── INSTALL ───────────────────────────────────────────────────────────────
    rv("install-eyebrow", 0)
    rv("install-h2",     80)
    rv("install-desc",  160)
    rv("install-box",   240)

    ;["fw-next","fw-remix","fw-astro","fw-vite","fw-tanstack","fw-cra"].forEach(id => {
      soul(id).default({
        css: `
          padding: 0.55rem 1.1rem
          background: rgba(255,255,255,0.04)
          border: 1px solid rgba(255,255,255,0.08)
          color: rgba(255,255,255,0.35) font-size: 0.75rem
          font-family: var(--font-code) border-radius: 100px
          transition: all 0.18s ease
        `,
        state: {}
      })
      .hover({
        onStart: { css: `background: rgba(255,255,255,0.1) border-color: rgba(255,255,255,0.2) color: rgba(255,255,255,0.85) transform: scale(1.04)` },
        onEnd:   { css: `background: rgba(255,255,255,0.04) border-color: rgba(255,255,255,0.08) color: rgba(255,255,255,0.35) transform: scale(1)` }
      })
    })

    soul("install-core-btn").default({
      css: `
        display: flex align-items: center gap: 0.75rem
        background: rgba(250,250,248,0.95) color: #1A1A18
        font-family: var(--font-code) font-size: 0.8rem
        padding: 1rem 1.5rem border-radius: 16px cursor: pointer
        transition: all 0.2s ease width: 100% margin-bottom: 0.6rem
      `,
      state: {}
    })
    .hover({ onStart: { css: `background: #FFFFFF transform: scale(1.01)` }, onEnd: { css: `background: rgba(250,250,248,0.95) transform: scale(1)` } })
    .click({ onStart: { css: `transform: scale(0.97)` }, onEnd: { css: `transform: scale(1)` } })

    soul("install-react-btn").default({
      css: `
        display: flex align-items: center gap: 0.75rem
        background: rgba(255,255,255,0.06) border: 1px solid rgba(255,255,255,0.1)
        color: rgba(255,255,255,0.7) font-family: var(--font-code)
        font-size: 0.8rem padding: 1rem 1.5rem border-radius: 16px
        cursor: pointer transition: all 0.2s ease width: 100%
      `,
      state: {}
    })
    .hover({ onStart: { css: `background: rgba(255,255,255,0.11) color: #FAFAF8 transform: scale(1.01)` }, onEnd: { css: `background: rgba(255,255,255,0.06) color: rgba(255,255,255,0.7) transform: scale(1)` } })
    .click({ onStart: { css: `transform: scale(0.97)` }, onEnd: { css: `transform: scale(1)` } })

    // ── FOOTER links ──────────────────────────────────────────────────────────
    ;["footer-npm","footer-gh"].forEach(id => {
      soul(id).default({
        css: `color: rgba(255,255,255,0.3) text-decoration: none font-size: 0.7rem letter-spacing: 0.1em text-transform: uppercase transition: color 0.2s`,
        state: {}
      })
      .hover({ onStart: { css: `color: rgba(255,255,255,0.8)` }, onEnd: { css: `color: rgba(255,255,255,0.3)` } })
    })

    // ── NAV links ─────────────────────────────────────────────────────────────
    NAV.forEach(item => {
      soul(`fnav-${item.id}`).default({
        css: `
          font-size: 0.68rem letter-spacing: 0.06em text-transform: lowercase
          color: rgba(250,250,248,0.45) text-decoration: none cursor: pointer
          padding: 0.3rem 0.7rem border-radius: 100px transition: all 0.2s ease
        `,
        state: {}
      })
      .hover({ onStart: { css: `color: #FAFAF8` }, onEnd: { css: `color: rgba(250,250,248,0.45)` } })
    })

    bindAll()
  }, [])

  const copy = (txt: string) => navigator.clipboard.writeText(txt)

  // Longpress handlers (plain DOM since Nagare longpress works on data-soul)
  const startLongpress = () => {
    longpressTimer.current = setTimeout(() => setLongpressHeld(true), 500)
  }
  const endLongpress = () => {
    if (longpressTimer.current) clearTimeout(longpressTimer.current)
    setLongpressHeld(false)
  }

  return (
    <div style={{ background: "#FAFAF8", overflowX: "hidden" }}>

      {/* ── FLOATING NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: "1.75rem", left: "50%",
        transform: "translateX(-50%)",
        zIndex: 500,
        display: "flex", alignItems: "center", gap: "0.1rem",
        background: "rgba(20,20,18,0.82)",
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "999px", padding: "0.45rem 0.6rem",
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: navVisible ? 1 : 0,
        pointerEvents: navVisible ? "all" : "none",
      }}>
        {NAV.map(item => (
          <a
            key={item.id}
            data-soul={`fnav-${item.id}`}
            href={`#${item.id}`}
            style={{
              background: activeNav === item.id ? "rgba(250,250,248,0.14)" : "transparent",
              color: activeNav === item.id ? "#FAFAF8" : undefined,
              fontFamily: "var(--font-code)",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "7rem 2.5rem 5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* gradient bg */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse 70% 60% at 65% 50%, rgba(200,195,185,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        {/* watermark */}
        <div data-soul="hero-watermark" style={{
          position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: "var(--font-display)", fontSize: "clamp(9rem,24vw,20rem)",
          fontWeight: 800, color: "rgba(26,26,24,0.04)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none", letterSpacing: "-0.04em",
        }}>流れ</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              {/* Logo */}
              <div data-soul="hero-logo" style={{
                display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem",
              }}>
                <img src="/nagare-logo.png" alt="Nagare" style={{ height: "36px", width: "auto" }} />
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#1A1A18", letterSpacing: "0.01em" }}>Nagare</span>
                <span style={{ fontSize: "0.62rem", fontFamily: "var(--font-code)", color: "#BBBAB7", letterSpacing: "0.1em", marginLeft: "0.25rem" }}>v0.1.1</span>
              </div>

              <span data-soul="hero-tag" style={{
                display: "inline-block", fontSize: "0.65rem", letterSpacing: "0.16em",
                textTransform: "uppercase", color: "#BBBAB7", fontFamily: "var(--font-code)",
                marginBottom: "1.5rem",
              }}>
                Behavior Runtime · Frontend
              </span>

              <h1 data-soul="hero-h1" style={{
                fontFamily: "var(--font-display)", fontSize: "clamp(3.2rem,8vw,7rem)",
                fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.04em",
                color: "#1A1A18", marginBottom: "2rem",
              }}>
                Behavior<br />
                <span style={{ color: "#BBBAB7" }}>runtime</span><br />
                for frontend.
              </h1>

              <p data-soul="hero-sub" style={{
                fontSize: "0.95rem", color: "#6B6B67", lineHeight: 1.8,
                maxWidth: "44ch", marginBottom: "2.5rem",
              }}>
                CSS owns styling. JS owns logic. Libraries own animation.
                Nobody owned <em>behavior</em> — until Nagare.
              </p>

              <div data-soul="hero-cta-row" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <div data-soul="hero-install-btn" onClick={() => copy("npm install @nagarejs/react")}>
                  <span style={{ color: "#6B6B67" }}>$</span>
                  npm install @nagarejs/react
                  <span style={{ fontSize: "0.62rem", padding: "0.15rem 0.4rem", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "6px", color: "rgba(255,255,255,0.3)" }}>copy</span>
                </div>
                <a data-soul="hero-gh-btn" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">
                  ↗ github
                </a>
              </div>
            </div>

            <div data-soul="hero-code-card">
              <CodeBlock code={S_HERO} filename="button.tsx" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PURPOSE ──────────────────────────────────────────────────────── */}
      <section id="purpose" style={{ background: "#FAFAF8", padding: "8rem 2.5rem", position: "relative" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <span data-soul="purpose-eyebrow" style={{
            display: "block", fontSize: "0.62rem", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1.25rem", fontFamily: "var(--font-code)",
          }}>our purpose</span>

          <h2 data-soul="purpose-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,5vw,4.5rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.03em",
            color: "#1A1A18", marginBottom: "1.5rem", maxWidth: "18ch",
          }}>
            We gave behavior<br />
            <span style={{ color: "#BBBAB7" }}>a home.</span>
          </h2>

          <p data-soul="purpose-lead" style={{
            color: "#6B6B67", fontSize: "1rem", lineHeight: 1.85, maxWidth: "55ch", marginBottom: "4rem",
          }}>
            Frontend development has always had a missing layer.
            Styling has CSS. Logic has JavaScript. Animation has libraries.
            But <strong style={{ color: "#1A1A18" }}>behavior</strong> — the full arc of an interaction from start to finish —
            has never had its own home. Until Nagare.
            <br /><br />
            We believe that a click, a hover, a drag — they deserve to live in one place.
            All their styles, animations, logic, and state — together, where they belong.
          </p>

          {/* Three pillars */}
          <div data-soul="purpose-cards" style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem",
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
                body: "The js: block is pure JavaScript with no restrictions. Call GSAP, fetch an API, play a sound, update a store — all in the same lifecycle step.",
              },
              {
                id: "p-pillar-3",
                num: "03",
                title: "JSX stays clean",
                body: "No className gymnastics, no inline style explosions, no event handlers cluttering your markup. Add data-soul and call bindAll(). Done.",
              },
            ].map(p => (
              <div key={p.id} data-soul={p.id} style={{
                background: "linear-gradient(145deg,#F5F2EE,#EEEBE5)",
                borderRadius: "24px", padding: "2.25rem",
                cursor: "default",
              }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1.25rem", fontFamily: "var(--font-code)" }}>{p.num}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "#1A1A18", marginBottom: "0.75rem", lineHeight: 1.3 }}>{p.title}</h3>
                <p style={{ fontSize: "0.82rem", color: "#6B6B67", lineHeight: 1.75 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONCEPT ──────────────────────────────────────────────────────── */}
      <section id="concept" style={{
        background: "#1A1A18", padding: "8rem 2.5rem",
        borderRadius: "2.5rem 2.5rem 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* gradient overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          background: "radial-gradient(ellipse 60% 50% at 80% 30%, rgba(80,70,60,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>

          <span data-soul="concept-eyebrow" style={{
            display: "block", fontSize: "0.62rem", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "1.25rem", fontFamily: "var(--font-code)",
          }}>the problem</span>

          <h2 data-soul="concept-h2" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,6vw,5rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.03em",
            color: "#FAFAF8", marginBottom: "1.5rem",
          }}>
            One hover.<br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>Five places.</span>
          </h2>

          <p data-soul="concept-desc" style={{
            color: "rgba(255,255,255,0.38)", fontSize: "0.9rem",
            lineHeight: 1.85, maxWidth: "50ch", marginBottom: "3.5rem",
          }}>
            Tailwind lifts it. CSS glows it. GSAP animates it.
            A store tracks it. A handler fires it.
            Five responsibilities, one interaction. You've been accepting that.
          </p>

          {/* Five columns */}
          <div data-soul="concept-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(5,1fr)",
            borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: "4rem",
          }}>
            {[
              { tool: "Tailwind", job: "the lift"      },
              { tool: "CSS",      job: "the glow"      },
              { tool: "GSAP",     job: "the animation" },
              { tool: "Store",    job: "the state"     },
              { tool: "Handler",  job: "the logic"     },
            ].map((item,i) => (
              <div key={i} data-soul={`concept-col-cc${i+1}`} style={{
                padding: "1.75rem 1.25rem",
                borderRight: i < 4 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", marginBottom: "0.4rem" }}>{item.tool}</div>
                <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)" }}>{item.job}</div>
              </div>
            ))}
          </div>

          {/* Before / after code blocks */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "4rem" }}>
            <div>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem", fontFamily: "var(--font-code)" }}>before</div>
              <CodeBlock code={S_CONCEPT} filename="button-before.ts" />
            </div>
            <div>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "0.75rem", fontFamily: "var(--font-code)" }}>after nagare ✦</div>
              <CodeBlock code={S_AFTER} filename="button-after.ts" />
            </div>
          </div>

          <h2 data-soul="concept-after" style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem,6vw,5rem)",
            fontWeight: 700, lineHeight: 1.0, letterSpacing: "-0.03em", color: "#FAFAF8",
          }}>
            Nagare gives it<br />
            <span style={{ color: "rgba(255,255,255,0.2)" }}>one place.</span> ✦
          </h2>
        </div>
      </section>

      {/* ── INTERACTIVE DEMO ─────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(180deg,#F5F2EE 0%,#FAFAF8 100%)",
        padding: "8rem 2.5rem", position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3.5rem" }}>
            <span style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>live playground</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,3.2rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem" }}>
              All 18 behaviors. Try every one.
            </h2>
            <p style={{ color: "#6B6B67", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: "52ch" }}>
              Each card is a real Nagare behavior — zero manual event listeners.
            </p>
          </div>

          {/* DEMO GRID — all 18 behaviors */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem", marginBottom: "3rem" }}>

            {/* hover */}
            <div data-soul="demo-hover" style={{ borderRadius: "20px" }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.hover()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>Hover over me ↑</div>
              <div style={{ fontSize: "0.72rem", opacity: 0.4, marginTop: "0.4rem" }}>continuous · transforms on enter/leave</div>
            </div>

            {/* click */}
            <div data-soul="demo-click" style={{ borderRadius: "20px" }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.click()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)", marginBottom: "0.35rem" }}>Click me ✦</div>
              <div style={{ fontSize: "0.72rem", color: "#6B6B67" }}>clicked <span className="click-count">0</span>×</div>
            </div>

            {/* tap — touch / mouse */}
            <div
              style={{
                background: "linear-gradient(135deg,#FAFAF8,#F0EDE8)",
                color: "#1A1A18", padding: "2rem", borderRadius: "20px",
                cursor: "pointer", transition: "all 0.15s ease",
                border: "1px solid rgba(26,26,24,0.07)",
              }}
              onPointerDown={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(0.93)"; (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg,#E8E5E0,#E0DDD8)" }}
              onPointerUp={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = "scale(1)"; el.style.background = "linear-gradient(135deg,#FAFAF8,#F0EDE8)"
                setTapFlash(true); setTimeout(()=>setTapFlash(false),800)
              }}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.tap()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>{tapFlash ? "tapped! ✦" : "Tap me"}</div>
            </div>

            {/* press */}
            <div
              style={{
                background: pressActive
                  ? "linear-gradient(135deg,#1A1A18,#111)" 
                  : "linear-gradient(135deg,#2E2E2C,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "20px",
                cursor: "pointer", transition: "all 0.15s ease",
                transform: pressActive ? "scale(0.93)" : "scale(1)",
              }}
              onPointerDown={() => setPressActive(true)}
              onPointerUp={() => { setPressActive(false); setReleaseFlash(true); setTimeout(()=>setReleaseFlash(false),700) }}
              onPointerLeave={() => setPressActive(false)}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.press()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>{pressActive ? "holding… ⏸" : "Press and hold"}</div>
            </div>

            {/* release */}
            <div style={{
              background: releaseFlash
                ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)"
                : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              color: "#1A1A18", padding: "2rem", borderRadius: "20px",
              border: "1px solid rgba(26,26,24,0.07)",
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.release()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>{releaseFlash ? "released! ✦" : "Release from press card"}</div>
            </div>

            {/* longpress */}
            <div
              style={{
                background: longpressHeld
                  ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)"
                  : "linear-gradient(135deg,#2A2A28,#1A1A18)",
                color: longpressHeld ? "#1A1A18" : "#FAFAF8",
                padding: "2rem", borderRadius: "20px",
                cursor: "pointer", transition: "all 0.3s ease",
                userSelect: "none",
              }}
              onPointerDown={startLongpress}
              onPointerUp={endLongpress}
              onPointerLeave={endLongpress}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.45, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.longpress()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>{longpressHeld ? "held! ✦" : "Hold for 500ms"}</div>
            </div>

            {/* drag */}
            <div style={{
              background: "linear-gradient(135deg,#F5F2EE,#EEEAE4)",
              borderRadius: "20px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.07)",
              position: "relative", minHeight: "120px",
              overflow: "visible",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.8rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.drag()</div>
              <div
                ref={dragRef}
                style={{
                  width: "72px", height: "72px", borderRadius: "16px",
                  background: dragActive ? "linear-gradient(135deg,#333,#1A1A18)" : "linear-gradient(135deg,#1A1A18,#2E2E2C)",
                  cursor: dragActive ? "grabbing" : "grab",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FAFAF8", fontSize: "0.68rem", fontFamily: "var(--font-code)",
                  transition: dragActive ? "none" : "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                  userSelect: "none", touchAction: "none",
                  boxShadow: dragActive ? "0 24px 48px rgba(0,0,0,0.3)" : "none",
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
                background: swipeDir
                  ? "linear-gradient(135deg,#1A1A18,#2E2E2C)"
                  : "linear-gradient(135deg,#2E2E2C,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "20px",
                cursor: "pointer", transition: "all 0.3s ease",
                userSelect: "none", touchAction: "pan-y",
              }}
              onTouchStart={swipeStart}
              onTouchEnd={swipeEnd}
              onMouseDown={swipeMouseDown}
              onMouseUp={swipeMouseUp}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.swipe()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>{swipeDir || "Swipe any direction"}</div>
              {!swipeDir && <div style={{ fontSize: "0.72rem", opacity: 0.35, marginTop: "0.4rem" }}>touch or drag-release</div>}
            </div>

            {/* scroll */}
            <div style={{
              background: "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "20px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.07)",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.scroll()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)", color: "#1A1A18", marginBottom: "0.6rem" }}>scrollY · live</div>
              <div style={{ height: "6px", background: "rgba(26,26,24,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${scrollPct}%`, background: "#1A1A18", borderRadius: "3px", transition: "width 0.1s linear" }} />
              </div>
              <div style={{ fontSize: "0.68rem", color: "#6B6B67", marginTop: "0.4rem", fontFamily: "var(--font-code)" }}>{scrollPct}%</div>
            </div>

            {/* resize */}
            <div style={{
              background: "linear-gradient(135deg,#FAFAF8,#F5F2EE)",
              borderRadius: "20px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.07)",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.resize()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)", color: "#1A1A18" }}>Window width</div>
              <div style={{ fontSize: "1.4rem", fontFamily: "var(--font-code)", color: "#1A1A18", marginTop: "0.4rem", fontWeight: 600 }}>{resizeW}px</div>
            </div>

            {/* focus */}
            <div style={{
              background: focusActive
                ? "linear-gradient(135deg,#1A1A18,#111)"
                : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "20px", padding: "2rem",
              border: `1px solid ${focusActive ? "#1A1A18" : "rgba(26,26,24,0.07)"}`,
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.75rem", fontFamily: "var(--font-code)", color: focusActive ? "#FAFAF8" : "#1A1A18" }}>.focus() / .blur()</div>
              <input
                placeholder="focus me"
                onFocus={() => setFocusActive(true)}
                onBlur={() => { setFocusActive(false); setBlurActive(true); setTimeout(()=>setBlurActive(false),600) }}
                style={{
                  background: "transparent", border: "none",
                  color: focusActive ? "#FAFAF8" : "#1A1A18",
                  fontFamily: "var(--font-code)", fontSize: "0.85rem",
                  outline: "none", width: "100%",
                }}
              />
              {blurActive && <div style={{ fontSize: "0.7rem", color: "#6B6B67", marginTop: "0.3rem" }}>blurred ✦</div>}
            </div>

            {/* enter / exit */}
            <div
              style={{
                background: enterActive
                  ? "linear-gradient(135deg,#1A1A18,#2E2E2C)"
                  : "linear-gradient(135deg,#2E2E2C,#1A1A18)",
                color: "#FAFAF8", padding: "2rem", borderRadius: "20px",
                transition: "all 0.25s ease", cursor: "default",
              }}
              onMouseEnter={() => setEnterActive(true)}
              onMouseLeave={() => setEnterActive(false)}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.enter() / .exit()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>
                {enterActive ? "entered ✦" : "Hover to enter"}
              </div>
            </div>

            {/* onMount */}
            <div style={{
              background: mountDone
                ? "linear-gradient(135deg,#FAFAF8,#F5F2EE)"
                : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
              borderRadius: "20px", padding: "2rem",
              border: "1px solid rgba(26,26,24,0.07)",
              transition: "all 0.6s ease",
            }}>
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)", color: "#1A1A18" }}>.onMount()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)", color: "#1A1A18" }}>
                {mountDone ? "mounted ✦" : "mounting…"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#6B6B67", marginTop: "0.4rem" }}>fires once on DOM attach</div>
            </div>

            {/* onVisible / onInvisible */}
            <div
              ref={visRef}
              style={{
                background: visibleActive
                  ? "linear-gradient(135deg,#1A1A18,#2E2E2C)"
                  : "linear-gradient(135deg,#F0EDE8,#E8E4DF)",
                color: visibleActive ? "#FAFAF8" : "#1A1A18",
                borderRadius: "20px", padding: "2rem",
                border: `1px solid ${visibleActive ? "transparent" : "rgba(26,26,24,0.07)"}`,
                transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <div style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, marginBottom: "0.5rem", fontFamily: "var(--font-code)" }}>.onVisible() / .onInvisible()</div>
              <div style={{ fontSize: "0.92rem", fontFamily: "var(--font-display)" }}>
                {visibleActive ? "visible ✦" : "scroll to reveal"}
              </div>
            </div>

          </div>

          {/* SANDBOX */}
          <Sandbox />
        </div>
      </section>

      {/* ── BEHAVIORS ────────────────────────────────────────────────────── */}
      <section id="behaviors" style={{ background: "#FAFAF8", padding: "8rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: "-1rem", top: "50%", transform: "translateY(-50%)",
          fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)",
          fontWeight: 800, color: "rgba(26,26,24,0.025)", lineHeight: 1,
          userSelect: "none", pointerEvents: "none",
        }}>02</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="beh-eyebrow" style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>behaviors</span>
          <h2 data-soul="beh-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem" }}>18 detectors. All interactions.</h2>
          <p data-soul="beh-sub" style={{ color: "#6B6B67", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: "52ch", marginBottom: "2.5rem" }}>
            Behaviors are sensors — they fire when the user or environment triggers them.
            Underlined = supports continuous <code>onUpdate</code> events.
          </p>

          <div data-soul="beh-pills" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
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
                  background: "linear-gradient(135deg,#1A1A18,#2E2E2C)",
                  padding: "0.85rem 1.4rem", borderRadius: "16px",
                  fontSize: "0.75rem", fontFamily: "var(--font-code)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  backdropFilter: "blur(8px)",
                }}>
                  <span style={{ color: "#FAFAF8", fontWeight: 600 }}>.{b.name}()</span>
                  <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.15)" }} />
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{b.continuous ? "continuous" : "discrete"}</span>
                  <span style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
                  <span style={{ color: "rgba(255,255,255,0.38)", maxWidth: "42ch", lineHeight: 1.5 }}>{b.desc}</span>
                </div>
              )
            })() : (
              <span style={{ fontSize: "0.75rem", color: "#BBBAB7", fontFamily: "var(--font-code)" }}>hover a behavior ↑</span>
            )}
          </div>
        </div>
      </section>

      {/* ── BLOCKS ───────────────────────────────────────────────────────── */}
      <section id="blocks" style={{
        background: "#1A1A18", padding: "8rem 2.5rem",
        borderRadius: "2.5rem 2.5rem 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)", fontWeight: 800, color: "rgba(255,255,255,0.025)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>03</div>
        {/* glassy gradient top */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 20% 20%, rgba(80,70,60,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="blocks-eyebrow" style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>blocks</span>
          <h2 data-soul="blocks-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#FAFAF8", marginBottom: "0.75rem" }}>Three blocks. Each owns its lane.</h2>
          <p data-soul="blocks-sub" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: "50ch", marginBottom: "3.5rem" }}>
            Inside every behavior lifecycle — onStart, onUpdate, onEnd — you pick what you need.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.75rem" }}>
            <div data-soul="block-tw">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>tw:</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)" }}>Tailwind utility classes</span>
              </div>
              <CodeBlock code={`tw: "transition-all duration-300 ease-out\n     hover:shadow-xl rounded-2xl"`} filename="tw-block.ts" />
            </div>

            <div data-soul="block-css">
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>css:</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)" }}>pure CSS with @if / @else</span>
              </div>
              <CodeBlock code={S_CSS} filename="css-block.ts" />
            </div>

            <div data-soul="block-js" style={{ gridColumn: "1 / -1" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1rem" }}>
                <span style={{ fontFamily: "var(--font-code)", fontSize: "1rem", color: "#FAFAF8", fontWeight: 700 }}>js:</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.28)" }}>any JavaScript — no ceiling (≧▽≦)</span>
              </div>
              <CodeBlock code={S_JS} filename="js-block.ts" />
            </div>
          </div>
        </div>
      </section>

      {/* ── API ──────────────────────────────────────────────────────────── */}
      <section id="api" style={{ background: "#FAFAF8", padding: "8rem 2.5rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)", fontWeight: 800, color: "rgba(26,26,24,0.025)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>04</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="api-eyebrow" style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#BBBAB7", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>api</span>
          <h2 data-soul="api-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#1A1A18", marginBottom: "0.75rem" }}>Templates. Presets. Reuse everything.</h2>
          <p data-soul="api-sub" style={{ color: "#6B6B67", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: "50ch", marginBottom: "3.5rem" }}>
            Extract behavior patterns into named units. Merge or override. Compose freely.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", marginBottom: "2.5rem" }}>
            <div data-soul="api-template">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#1A1A18" }}>template()</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.78rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>Reusable block collections. Attach to any behavior. Merge (default) or override.</p>
              <CodeBlock code={S_TEMPLATE} filename="templates.ts" />
            </div>
            <div data-soul="api-preset">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#1A1A18" }}>preset()</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.78rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>Full lifecycle reuse — onStart, onUpdate, onEnd all in one named unit.</p>
              <CodeBlock code={S_PRESET} filename="presets.ts" />
            </div>
            <div data-soul="api-scroll" style={{ gridColumn: "1 / -1" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#1A1A18" }}>scroll() with live params</h3>
              <p style={{ color: "#6B6B67", fontSize: "0.78rem", lineHeight: 1.75, marginBottom: "1.25rem" }}>
                Continuous behaviors pass live data via <code>this.params</code>. scrollY, x, y, direction — no extra library.
              </p>
              <CodeBlock code={S_SCROLL} filename="scroll.ts" />
            </div>
          </div>

          {/* Lifecycle diagram */}
          <div data-soul="api-lifecycle" style={{
            background: "linear-gradient(135deg,#F5F2EE,#EEEBE5)",
            borderRadius: "24px", padding: "2.5rem",
          }}>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "#BBBAB7", display: "block", marginBottom: "1.5rem", fontFamily: "var(--font-code)" }}>lifecycle</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              {[
                { n: "onStart", d: "once · begin" }, "→",
                { n: "onUpdate", d: "continuous" }, "→",
                { n: "onEnd", d: "once · end" },
              ].map((item, i) =>
                item === "→" ? <span key={i} style={{ color: "#BBBAB7", fontSize: "1.1rem" }}>→</span> : (
                  <div key={i}>
                    <div style={{ fontFamily: "var(--font-code)", fontSize: "0.82rem", color: "#1A1A18", marginBottom: "0.2rem" }}>{(item as any).n}</div>
                    <div style={{ fontSize: "0.65rem", color: "#6B6B67" }}>{(item as any).d}</div>
                  </div>
                )
              )}
            </div>
            <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", paddingTop: "1.5rem", borderTop: "1px solid rgba(26,26,24,0.08)" }}>
              {[{k:"tw:",d:"Tailwind classes"},{k:"css:",d:"pure CSS + @if conditions"},{k:"js:",d:"any JavaScript, async OK"}].map(b => (
                <div key={b.k} style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontFamily: "var(--font-code)", fontSize: "0.78rem", color: "#1A1A18", fontWeight: 700 }}>{b.k}</span>
                  <span style={{ fontSize: "0.7rem", color: "#6B6B67" }}>{b.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTALL ──────────────────────────────────────────────────────── */}
      <section id="install" style={{
        background: "linear-gradient(160deg,#111110 0%,#1A1A18 60%,#2A2A28 100%)",
        padding: "8rem 2.5rem",
        borderRadius: "2.5rem 2.5rem 0 0", marginTop: "-2rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* glass orb bg */}
        <div style={{ position: "absolute", top: "-10rem", right: "-10rem", width: "40rem", height: "40rem", borderRadius: "50%", background: "radial-gradient(circle,rgba(80,70,60,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "-1rem", top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "clamp(8rem,20vw,16rem)", fontWeight: 800, color: "rgba(255,255,255,0.025)", lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>05</div>

        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <span data-soul="install-eyebrow" style={{ display: "block", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: "1rem", fontFamily: "var(--font-code)" }}>install</span>
          <h2 data-soul="install-h2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.5rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em", color: "#FAFAF8", marginBottom: "0.75rem" }}>Works with any React framework.</h2>
          <p data-soul="install-desc" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem", lineHeight: 1.8, maxWidth: "50ch", marginBottom: "3rem" }}>
            <strong style={{ color: "#FAFAF8" }}>@nagarejs/core is mandatory.</strong> It is the engine — it handles binding, lifecycle parsing, state, and behavior wiring. The React adapter sits on top.
          </p>

          {/* frameworks */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
            {[["fw-next","Next.js"],["fw-remix","Remix"],["fw-astro","Astro"],["fw-vite","React Vite"],["fw-tanstack","TanStack"],["fw-cra","CRA"]].map(([id,label]) => (
              <div key={id} data-soul={id}>✦ {label}</div>
            ))}
          </div>

          <div data-soul="install-box" style={{ maxWidth: "540px", marginBottom: "2rem" }}>
            {/* core — required badge */}
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.5rem", fontFamily: "var(--font-code)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ background: "rgba(255,255,255,0.1)", padding: "0.15rem 0.5rem", borderRadius: "6px", color: "#FAFAF8" }}>required</span>
              @nagarejs/core
            </div>
            <div data-soul="install-core-btn" onClick={() => copy("npm install @nagarejs/core")}>
              <span style={{ color: "#6B6B67" }}>$</span>
              <span style={{ flex: 1 }}>npm install @nagarejs/core</span>
              <span style={{ fontSize: "0.62rem", opacity: 0.4 }}>copy</span>
            </div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "1.25rem 0 0.5rem", fontFamily: "var(--font-code)" }}>React adapter</div>
            <div data-soul="install-react-btn" onClick={() => copy("npm install @nagarejs/react")}>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>$</span>
              <span style={{ flex: 1 }}>npm install @nagarejs/react</span>
              <span style={{ fontSize: "0.62rem", opacity: 0.4 }}>copy</span>
            </div>
          </div>

          <CodeBlock code={S_INSTALL} filename="terminal" />

          <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
            <a data-soul="footer-npm" href="https://www.npmjs.com/package/@nagarejs/react" target="_blank" rel="noopener noreferrer">npm ↗</a>
            <a data-soul="footer-gh"  href="https://github.com/Mizumi25/nagare" target="_blank" rel="noopener noreferrer">github ↗</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "1rem",
        padding: "2rem 2.5rem",
        borderTop: "1px solid rgba(26,26,24,0.07)",
        background: "#FAFAF8",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img src="/nagare-logo.png" alt="Nagare" style={{ height: "22px", width: "auto", opacity: 0.5 }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: "0.85rem", fontWeight: 600, color: "#1A1A18" }}>Nagare</span>
          <span style={{ color: "#BBBAB7", fontSize: "0.78rem" }}>流れ · flow</span>
        </div>
        <span style={{ fontFamily: "var(--font-code)", fontSize: "0.68rem", color: "#BBBAB7", letterSpacing: "0.06em" }}>
          @nagarejs/react · v0.1.1
        </span>
      </footer>

    </div>
  )
}