'use client'

import { useEffect, useState } from 'react'
import { useSoul, soul } from '@nagarejs/react'

const SECTIONS = [
  { id: 'hero', label: 'Top' },
  { id: 'about', label: 'About' },
  { id: 'demo', label: 'Demo' },
  { id: 'behaviors', label: 'Behaviors' },
  { id: 'install', label: 'Install' },
  { id: 'production', label: 'Production' },
  { id: 'source', label: 'Source' }
]

const MARQUEE_WORDS = [
  'hover', 'click', 'tap', 'longpress', 'swipe', 'drag',
  'scroll', 'resize', 'focus', 'blur', 'onMount', 'onIdle',
  'onVisible', 'networkChanged', 'onOrientationChange'
]

export default function Page() {
  const [activeSection, setActiveSection] = useState('hero')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900)
    return () => clearTimeout(t)
  }, [])

  useSoul((soul) => {
    SECTIONS.forEach(({ id }) => {
      soul(`navwatch-${id}`)
        .default({ tw: '' })
        .onVisible({
          onStart: {
            js: function (this: any) {
              setActiveSection(id)
            }
          }
        })
    })
  })

  useSoul((soul) => {
    soul('hero-eyebrow')
      .default({ css: `opacity: 0; transform: translateY(12px)` })
      .onMount({
        delay: 80,
        onStart: { css: `opacity: 1; transform: translateY(0px); transition: all 0.7s ease` }
      })

    soul('hero-title')
      .default({ css: `opacity: 0; transform: translateY(24px)` })
      .onMount({
        delay: 220,
        onStart: { css: `opacity: 1; transform: translateY(0px); transition: all 0.9s cubic-bezier(.16,1,.3,1)` }
      })

    soul('hero-sub')
      .default({ css: `opacity: 0; transform: translateY(16px)` })
      .onMount({
        delay: 420,
        onStart: { css: `opacity: 1; transform: translateY(0px); transition: all 0.8s ease` }
      })

    soul('hero-cta')
      .default({ css: `opacity: 0` })
      .onMount({
        delay: 600,
        onStart: { css: `opacity: 1; transition: opacity 0.8s ease` }
      })
  })

  useSoul((soul) => {
    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
      const name = `reveal-${i}`
      el.setAttribute('data-soul', name)
      soul(name)
        .default({ tw: '' })
        .onVisible({
          onStart: {
            css: `opacity: 1; transform: translateY(0px); transition: all 0.8s cubic-bezier(.16,1,.3,1)`
          }
        })
    })
  })

  useSoul((soul) => {
    soul('demo-hover')
      .default({
        tw: 'demo-soul',
        state: { hovered: false }
      })
      .hover({
        onStart: {
          css: `
            transform: translateY(-6px) scale(1.04)
            box-shadow: 0 14px 30px rgba(91,84,240,0.35)
          `,
          js: function (this: any) { this.state.hovered = true }
        },
        onEnd: {
          css: `transform: translateY(0px) scale(1); box-shadow: none`,
          js: function (this: any) { this.state.hovered = false }
        }
      })
  })

  useSoul((soul) => {
    soul('demo-click')
      .default({
        tw: 'demo-soul',
        css: `transition: all 0.3s ease`,
        state: { active: false }
      })
      .click({
        onStart: {
          css: `
            transform: scale(0.92)
            @if active {
              background: #5b54f0
            }
            @else {
              background: #16161a
            }
          `,
          js: function (this: any) { this.state.active = !this.state.active }
        },
        onEnd: { css: `transform: scale(1)` }
      })
  })

  useSoul((soul) => {
    soul('demo-longpress')
      .default({ tw: 'demo-soul', state: { charged: false } })
      .longpress({
        onStart: {
          css: `
            @if charged { background: #5b54f0 }
            @else { background: #16161a }
          `,
          js: function (this: any) { this.state.charged = !this.state.charged }
        }
      })
  })

  useSoul((soul) => {
    soul('demo-swipe')
      .default({ tw: 'demo-soul', state: { dir: null as any } })
      .swipe({
        onStart: {
          js: function (this: any) {
            this.state.dir = this.params.direction
            this.el.textContent = this.params.direction
            setTimeout(() => { this.el.textContent = 'swipe' }, 700)
          }
        }
      })
  })

  useSoul((soul) => {
    soul('demo-idle')
      .default({ tw: 'demo-soul' })
      .onIdle({
        idleTimeout: 2500,
        onStart: { css: `opacity: 0.35; transition: opacity 0.6s ease` },
        onEnd: { css: `opacity: 1; transition: opacity 0.3s ease` }
      })
  })

  useSoul((soul) => {
    soul('demo-drag')
      .default({ tw: 'demo-soul', css: `position: relative; cursor: grab` })
      .drag({
        onStart: { css: `cursor: grabbing; opacity: 0.85` },
        onUpdate: {
          js: function (this: any) {
            this.el.style.transform = `translate(${this.params.x % 80}px, 0px)`
          }
        },
        onEnd: { css: `cursor: grab; opacity: 1; transform: translate(0px, 0px)` }
      })
  })

  useSoul((soul) => {
    soul('nav-logo')
      .default({ 
        css: `
        vertical-align: middle
        display: inline-block
        height: 28px
        width: 28px
        opacity: 0; transform: translateX(-20px)`
      })
      .onMount({
        delay: 50,
        onStart: { 
          css: `opacity: 1; transform: translateX(0px); transition: all 0.6s ease` 
        }
      })
      .hover({
        onStart: { 
          css: `transform: rotate(15deg) scale(1.1); transition: transform 0.3s ease` 
        },
        onEnd: { 
          css: `transform: rotate(0deg) scale(1); transition: transform 0.3s ease` 
        }
      })
  })

  return (
    <>
      {loading && (
        <div className="loader" aria-hidden="true">
          <span className="loader__mark">NAGARE — LOADING</span>
        </div>
      )}

      <div className="chrome-logo">
        <img 
          src="/nagare-logo.png" 
          alt="Nagare Logo" 
          className="nav-logo"
          data-soul="nav-logo"
        />
        NAGARE<span>✦</span>
      </div>

      <nav className="side-nav">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`side-nav__item ${activeSection === s.id ? 'is-active' : ''}`}
          >
            <span className="dot" />
            {s.label}
          </a>
        ))}
      </nav>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section id="hero" className="hero">
        <p className="hero__eyebrow" data-soul="hero-eyebrow">流れ — flow</p>
        <h1 className="hero__title" data-soul="hero-title">
          Behavior has<br />a home, <em>now</em>.
        </h1>
        <p className="hero__sub" data-soul="hero-sub">
          Nagare keeps every interaction's styles, animation, logic, and state
          together — under one name, in one place. No more hunting across
          CSS, handlers, a tween library, and a store for a single hover.
        </p>
        <a href="#install" className="hero__cta" data-soul="hero-cta">
          npm install @nagarejs/react
        </a>

        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span key={i} className={i % 4 === 0 ? 'is-accent' : ''}>{w}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── ABOUT ───────────────────────── */}
      <section id="about" className="section">
        <div className="section__inner">
          <div className="eyebrow">
            <span className="eyebrow__big">About</span>
            <span className="eyebrow__min">Why Nagare exists</span>
          </div>
          <div className="about__grid" data-reveal>
            <p className="about__statement">
              A hover is one thing. It starts, it runs, it ends —
              and everything it owns should live in the same place.
            </p>
            <div className="about__body">
              <p>
                Most frontends split a single interaction across four or five
                tools: CSS for the look, a handler for the logic, a tweening
                library for motion, a store for state. Nagare collapses that
                into one declaration — a <em>soul</em> — bound to an element
                with a single <code>data-soul</code> attribute.
              </p>
              <p>
                Behaviors are detectors: <code>hover</code>, <code>click</code>,{' '}
                <code>swipe</code>, <code>onIdle</code>, and more. Each one
                runs a lifecycle — start, update, end — and each lifecycle can
                carry Tailwind classes, real CSS with inline{' '}
                <code>@if</code> conditions, and a plain JS block with no
                ceiling: gsap, canvas, fetch, anything.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── DEMO ───────────────────────── */}
      <section id="demo" className="section">
        <div className="section__inner">
          <div className="eyebrow">
            <span className="eyebrow__big">Demo</span>
            <span className="eyebrow__min">Live souls, running on this page</span>
          </div>

          <div className="demo-grid" data-reveal>
            <DemoCard
              behavior=".hover()"
              title="Lift &amp; glow"
              hint="Move your cursor over the circle."
              soulName="demo-hover"
              code={`soul("card")\n  .hover({\n    onStart: {\n      css: \`transform: translateY(-6px)\`,\n      js: function (this: any) {\n        this.state.hovered = true\n      }\n    },\n    onEnd: { css: \`transform: translateY(0px)\` }\n  })`}
            />
            <DemoCard
              behavior=".click()"
              title="State toggle"
              hint="Click to flip state — color follows @if."
              soulName="demo-click"
              code={`soul("card")\n  .click({\n    onStart: {\n      css: \`\n        @if active { background: violet }\n        @else { background: black }\n      \`,\n      js: function (this: any) {\n        this.state.active = !this.state.active\n      }\n    }\n  })`}
            />
            <DemoCard
              behavior=".longpress()"
              title="Charge up"
              hint="Press and hold for 500ms."
              soulName="demo-longpress"
              code={`soul("card")\n  .longpress({\n    onStart: {\n      js: function (this: any) {\n        this.state.charged = !this.state.charged\n      }\n    }\n  })`}
            />
            <DemoCard
              behavior=".swipe()"
              title="Direction read"
              hint="Swipe on touch — reports left/right/up/down."
              soulName="demo-swipe"
              code={`soul("card")\n  .swipe({\n    onStart: {\n      js: function (this: any) {\n        // this.params.direction\n        this.state.dir = this.params.direction\n      }\n    }\n  })`}
            />
            <DemoCard
              behavior=".onIdle()"
              title="Ambient dim"
              hint="Stop moving the mouse for 2.5s."
              soulName="demo-idle"
              className="demo-card--idle"
              code={`soul("card")\n  .onIdle({\n    idleTimeout: 2500,\n    onStart: { css: \`opacity: 0.35\` },\n    onEnd:   { css: \`opacity: 1\` }\n  })`}
            />
            <DemoCard
              behavior=".drag()"
              title="Free movement"
              hint="Drag horizontally on touch."
              soulName="demo-drag"
              code={`soul("card")\n  .drag({\n    onUpdate: {\n      js: function (this: any) {\n        this.el.style.transform =\n          \`translateX(\${this.params.x}px)\`\n      }\n    }\n  })`}
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────── BEHAVIORS ───────────────────────── */}
      <section id="behaviors" className="section">
        <div className="section__inner">
          <div className="eyebrow">
            <span className="eyebrow__big">Behaviors</span>
            <span className="eyebrow__min">Every detector Nagare ships with</span>
          </div>

          <div className="behaviors-menu" data-reveal>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Pointer</p>
              <ul className="behaviors-group__list">
                <li>hover</li>
                <li>click</li>
                <li>press</li>
                <li>release</li>
                <li>drag</li>
              </ul>
            </div>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Touch</p>
              <ul className="behaviors-group__list">
                <li>tap</li>
                <li>longpress</li>
                <li>swipe</li>
                <li>enter</li>
                <li>exit</li>
              </ul>
            </div>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Lifecycle</p>
              <ul className="behaviors-group__list">
                <li>onMount</li>
                <li>onVisible</li>
                <li>onInvisible</li>
                <li>focus</li>
                <li>blur</li>
              </ul>
            </div>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Environment</p>
              <ul className="behaviors-group__list">
                <li>scroll</li>
                <li>resize</li>
                <li>onIdle</li>
                <li>networkChanged</li>
                <li>onOrientationChange</li>
              </ul>
            </div>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Blocks</p>
              <ul className="behaviors-group__list">
                <li>tw</li>
                <li>css</li>
                <li>js</li>
                <li>@if / @else</li>
                <li>state</li>
              </ul>
            </div>
            <div className="behaviors-group">
              <p className="behaviors-group__tit">Reuse</p>
              <ul className="behaviors-group__list">
                <li>template()</li>
                <li>preset()</li>
                <li>useSoul()</li>
                <li>delay</li>
                <li>idleTimeout</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── INSTALL / OUTLINE ───────────────────────── */}
      <section id="install" className="section">
        <div className="section__inner">
          <div className="eyebrow">
            <span className="eyebrow__big">Install</span>
            <span className="eyebrow__min">Package outline</span>
          </div>

          <table className="outline-table" data-reveal>
            <tbody>
              <tr>
                <th>Package</th>
                <td>@nagarejs/react · @nagarejs/core</td>
              </tr>
              <tr>
                <th>Install</th>
                <td>npm install @nagarejs/react</td>
              </tr>
              <tr>
                <th>Core only</th>
                <td>npm install @nagarejs/core &nbsp;// vanilla JS, custom adapters</td>
              </tr>
              <tr>
                <th>Intellisense</th>
                <td>npm install @nagarejs/ts-plugin --save-dev</td>
              </tr>
              <tr>
                <th>Frameworks</th>
                <td>Next.js, Remix, Astro, TanStack, Vite</td>
              </tr>
              <tr>
                <th>Binding</th>
                <td>&lt;div data-soul=&quot;card&quot;&gt;</td>
              </tr>
              <tr>
                <th>Entry hook</th>
                <td>useSoul((soul) =&gt; {'{ ... }'})</td>
              </tr>
              <tr>
                <th>Author</th>
                <td>Mizumi · github.com/Mizumi25/nagare</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ───────────────────────── PRODUCTION ───────────────────────── */}
      <section id="production" className="section">
        <div className="section__inner">
          <div className="eyebrow">
            <span className="eyebrow__big">Production</span>
            <span className="eyebrow__min">How Nagare behaves under stress</span>
          </div>

          <p className="about__statement" data-reveal style={{ marginBottom: '2rem' }}>
            Nagare is a lifecycle detector, not an animation engine. It fires a lifecycle and applies styles — it doesn't interpolate, tween, or manage timing.
          </p>

          <table className="outline-table" data-reveal>
            <tbody>
              <tr>
                <th>Element disappears</th>
                <td>Silent no-op, no crash. Listener cleanup fix planned.</td>
              </tr>
              <tr>
                <th>Rapid state updates</th>
                <td>Holds up. State stays consistent, no race conditions.</td>
              </tr>
              <tr>
                <th>prefers-reduced-motion</th>
                <td>Not applicable — no animation engine. Handle in your js block.</td>
              </tr>
              <tr>
                <th>Escape / interruption</th>
                <td>Lifecycle completes. Handle interruption logic in your js block.</td>
              </tr>
            </tbody>
          </table>

          <p className="about__body" data-reveal style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.9rem' }}>
            The js block is intentionally no-ceiling — anything you can do in plain JavaScript you can do inside it. prefers-reduced-motion, escape handling, cancelling a fetch mid-flight — all of that lives in the js block by design, the same way React doesn't cancel a setState because the user hit escape.
          </p>
        </div>
      </section>

      {/* ───────────────────────── CTA / SOURCE ───────────────────────── */}
      <section id="source" className="cta">
        <h2 className="cta__title">Give your next hover<br />a home.</h2>
        <div className="cta__links">
          <a className="cta__link primary" href="https://github.com/Mizumi25/nagare" target="_blank" rel="noreferrer">
            View source
          </a>
          <a className="cta__link" href="https://www.npmjs.com/package/@nagarejs/react" target="_blank" rel="noreferrer">
            npm package
          </a>
        </div>
      </section>

      <footer className="footer">
        <span>Nagare (流れ) — flow.</span>
        <span>Built with @nagarejs/react, on this very page.</span>
      </footer>
    </>
  )
}

function DemoCard({
  behavior,
  title,
  hint,
  soulName,
  code,
  className = ''
}: {
  behavior: string
  title: string
  hint: string
  soulName: string
  code: string
  className?: string
}) {
  return (
    <div className={`demo-card ${className}`}>
      <span className="demo-card__behavior">{behavior}</span>
      <h3 className="demo-card__title">{title}</h3>
      <p className="demo-card__hint">{hint}</p>
      <div className="demo-card__stage">
        <div data-soul={soulName}>{behavior.replace(/[.()]/g, '')}</div>
      </div>
      <pre className="code-snip">{code}</pre>
    </div>
  )
}