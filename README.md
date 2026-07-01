# Nagare ✦

**A behavior-first UI runtime.**

Nagare gives behavior its own home — instead of scattering hover logic across CSS, click logic across handlers, animation across a library, and state across a store, Nagare keeps everything one interaction owns — its styles, its animation, its logic, its state — together, in one place, under one name.

```bash
npm install @nagarejs/react
```

---

## Why

Frontend has everything figured out.

CSS for styling. JavaScript for logic. Libraries for animation. Frameworks for state.
Every concern has a tool. Every tool has a job.

Except one. (⁠-⁠_⁠-⁠)

Nobody ever gave **behavior** its own home.

When a button is hovered — the lift is in CSS, the glow is in a class, the animation is in GSAP,
the state update is in a store, and the logic is in an event handler.
Five places. One interaction. You just accept it and move on.

Nagare doesn't accept it.

A hover is one thing. It starts, it runs, it ends.
It has styles. It has animation. It has logic. It has state.
All of that belongs together — and Nagare is the first package that keeps it that way.

```js
soul("button")
  .hover({
    onStart: {
      tw:  "transition-all duration-300",
      css: `transform: translateY(-4px)`,
      js: function(this: any) {
        this.state.hovered = true
        gsap.to(this.el, { glow: true })
      }
    },
    onEnd: {
      css: `transform: translateY(0px)`,
      js: function(this: any) {
        this.state.hovered = false
      }
    }
  })
```

One behavior. One place. Everything it owns — right there. ✦

---

## Install

```bash
npm install @nagarejs/react    # React, Next.js, Remix, Astro, TanStack...
npm install @nagarejs/core     # vanilla JS or build your own adapter
```

---

## How it works

You define a **soul** — that's your element.
You attach **behaviors** — those are your detectors. They watch for something — a click, a hover, the page going idle, the network dropping — and fire when it happens.
Each behavior has a **lifecycle** — start, update, end.
Each lifecycle has **blocks** — tw, css, js.

```
soul          →   the element
behavior      →   the detector
lifecycle     →   onStart / onUpdate / onEnd
blocks        →   tw / css / js
```

Bind it to your HTML with `data-soul`. (⁠^⁠^⁠)

```html
<div data-soul="card">tap me ✦</div>
```

---

## Quick look — React (⁠◕⁠ᴗ⁠◕⁠)

```tsx
"use client"

import { useSoul, soul } from "@nagarejs/react"

export default function Page() {

  useSoul((soul) => {
    soul("card")
      .default({
        tw: "flex items-center justify-center p-8 rounded-2xl bg-gray-900 text-white cursor-pointer",
        css: `transition: all 0.3s ease`,
        state: { clicked: false }
      })
      .click({
        onStart: {
          css: `
            transform: scale(1.05)
            @if clicked {
              color: violet
            }
            @else {
              color: white
            }
          `,
          js: function(this: any) {
            this.state.clicked = !this.state.clicked
            console.log("hey (⁠^⁠^⁠)")
          }
        },
        onEnd: {
          css: `transform: scale(1)`
        }
      })
  })

  return (
    <div data-soul="card">
      tap me ✦
    </div>
  )
}
```

`useSoul()` does all the wiring for you — it registers your souls, binds them to the page, watches for new elements that show up later, and cleans everything up automatically when the component unmounts. Always call `.default()` first when defining a soul — that's what registers it.

You'll usually import `soul` alongside `useSoul` too — useful when you need to reach a soul from outside the `useSoul` callback, like inside a separate event handler.

---

## Behaviors

These are detectors. They watch the user or the environment, and fire a lifecycle when something happens.

```
click       tap         longpress     swipe
hover       press       release       drag
scroll      resize      focus         blur
enter       exit        onMount       onVisible
onInvisible onIdle      networkChanged
onOrientationChange
```

A few of these hand you a little extra info depending on what they detect — `swipe` tells you which direction, `onOrientationChange` tells you landscape or portrait, `networkChanged` tells you if you're back online, `scroll` and `resize` tell you the current values, `drag` tells you the live position. You can read these through `this.params` inside your `js` block, or use them directly in `@if`.

`onIdle` also takes an optional `idleTimeout` (in milliseconds, default 3000) if you want to control how long before it's considered idle.

---

## CSS block — write real CSS (⁠ ⁠•⁠ᴗ⁠•⁠ ⁠)

No objects. No camelCase. Just CSS.
And it supports conditions based on your state:

```js
css: `
  transform: scale(1.05)

  @if open {
    height: auto
    opacity: 1
  }
  @else if loading {
    opacity: 0.5
    pointer-events: none
  }
  @else {
    height: 0px
    opacity: 0
  }
`
```

Any JS expression works inside `@if`. State keys go in directly — no prefix needed.

---

## JS block — no ceiling (⁠≧⁠▽⁠≦⁠)

It's just JavaScript. Bring whatever you want.

```js
js: function(this: any) {
  // gsap, three.js, web audio, fetch, canvas...
  // this.el      → the DOM element
  // this.state   → the soul's state
  // this.params  → behavior parameters
}
```

---

## Templates — reusable blocks

Write once. Attach to any behavior.

```js
template("glow", {
  css: `box-shadow: 0 0 30px rgba(99,102,241,0.6)`
})

soul("button")
  .click({
    templates: [{ name: "glow" }],                       // merge by default
    templates: [{ name: "glow", mode: "override" }]      // or override
  })
```

---

## Presets — reusable lifecycles

Like templates but for the full onStart / onUpdate / onEnd structure.

```js
preset("bouncy", {
  onStart: { css: `transform: scale(1.1)` },
  onEnd:   { css: `transform: scale(1)` }
})

soul("button")
  .click({
    presets: ["bouncy"],                               // shorthand, merge by default
    presets: [{ name: "bouncy", mode: "override" }]    // or be explicit
  })
```

---

## State

Each soul has its own state. Use it in js via `this.state`
and in css directly by key name — no prefix needed.

```js
soul("card")
  .default({
    state: { open: false }
  })
  .click({
    onStart: {
      css: `
        @if open {
          height: auto
        }
        @else {
          height: 0px
        }
      `,
      js: function(this: any) {
        this.state.open = !this.state.open
      }
    }
  })
```

---

## Delay

```js
soul("hero")
  .onMount({
    delay: 300,
    onStart: {
      css: `
        opacity: 1
        transform: translateY(0px)
        transition: all 0.6s ease
      `
    }
  })
```

---

## The JSX stays clean

```tsx
return (
  <div data-soul="card">
    your content
  </div>
)
```

No className logic. No inline styles. No event handlers.
Nagare owns the behavior. Your JSX stays readable. ✦

---

## Editor Intellisense ✦

Nagare ships a TypeScript language service plugin that gives you autocompletion inside `tw` and `css` strings — in any editor that uses tsserver (VSCode, Neovim, WebStorm, Zed).

**Install:**

```bash
npm install @nagarejs/ts-plugin --save-dev
```

**Add to your `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@nagarejs/ts-plugin" }]
  }
}
```

That's it. Restart your editor's TS server and you'll get:

- Tailwind class completions inside `tw: "..."`
- CSS property completions inside `css: \`...\``
- `@if` / `@else` keyword completions in css blocks
- Hover docs on every suggestion

The builder API (`.hover()`, `.click()`, `useSoul()` etc) and `js` blocks already have full intellisense out of the box via the shipped type definitions — no plugin needed for those.

---

## Packages

```bash
npm install @nagarejs/react       # React, Next.js, Remix, Astro, TanStack...
npm install @nagarejs/core        # vanilla JS or build your own adapter
npm install @nagarejs/ts-plugin   # editor intellisense (dev dependency)
```

- `@nagarejs/core` — the runtime engine
- `@nagarejs/react` — the React adapter
- `@nagarejs/ts-plugin` — TypeScript language service plugin

---

*Nagare (流れ) — flow.*
