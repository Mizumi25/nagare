# @nagarejs/react (⁠^⁠^⁠)

**The behavior runtime for React.**

---

You know that feeling when hover logic is in CSS, click stuff is in a handler,
animations are in some library, and state is somewhere else entirely?

Nagare fixes that. Every behavior owns its own world. ✦

---

## The idea

A button hover isn't just a CSS rule.
It's a thing that *starts*, *runs*, and *ends*.
It has styles. It has logic. It has animation.

Nagare calls that a **behavior** — and gives it a lifecycle.

```
onStart   →   it begins
onUpdate  →   it's happening
onEnd     →   it's done
```

Inside each phase, you have three blocks.

```
tw    →   tailwind classes
css   →   real CSS  (with @if / @else if / @else !)
js    →   any JavaScript. seriously, anything.
```

---

## Install

```bash
npm install @nagarejs/react
```

---

## Quick look (⁠◕⁠ᴗ⁠◕⁠)

```tsx
"use client"

import { useEffect } from "react"
import { soul, bindAll } from "@nagarejs/react"

export default function Page() {

  useEffect(() => {

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

    bindAll()

  }, [])

  return (
    <div data-soul="card">
      tap me ✦
    </div>
  )
}
```

---

## Behaviors

These are detectors — they fire when the user or environment triggers them. ✦

```
click       tap         longpress     swipe
hover       press       release       drag
scroll      resize      focus         blur
enter       exit        onMount       onVisible
onInvisible
```

Behaviors with `onUpdate` (continuous):

```
hover   scroll   drag   resize   press   focus
```

Everything else just uses `onStart` and `onEnd`.

---

## CSS block — real CSS, but smarter (⁠ ⁠ꈍ⁠ᴗ⁠ꈍ⁠)

Write pure CSS. No objects, no camelCase, no weirdness.

```js
css: `
  transform: scale(1.1)
  opacity: 0.9
  color: white
`
```

And it supports conditions — based on your state or params:

```js
css: `
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

Any JS expression works inside `@if`. State keys are used directly — no `state.` prefix needed.

---

## Templates

Reusable block collections. Write once, attach to any behavior. ✦

```js
template("glow", {
  css: `box-shadow: 0 0 30px rgba(99,102,241,0.6)`
})

soul("button")
  .click({
    templates: [
      { name: "glow" },              // merge by default
      { name: "danger", mode: "override" }  // or override
    ],
    onStart: {
      css: `transform: scale(1.05)`
    }
  })
```

Modes:
- `merge` — template blocks layer on top of behavior blocks *(default)*
- `override` — template blocks replace behavior blocks

---

## Presets

Like templates but for the full lifecycle. ✦

```js
preset("bouncy", {
  onStart: { css: `transform: scale(1.1)` },
  onEnd:   { css: `transform: scale(1)` }
})

soul("button")
  .click({
    presets: [
      { name: "bouncy" },                    // merge by default
      { name: "snap", mode: "override" }     // or override
    ]
  })
```

Same modes as templates — `merge` or `override`.

---

## State (⁠^⁠o⁠^⁠)

Each soul has its own state. Access it in `js` via `this.state` and in `css` directly by key.

```js
soul("card")
  .default({
    state: { open: false, count: 0 }
  })
  .click({
    onStart: {
      css: `
        @if open {
          background-color: indigo
        }
      `,
      js: function(this: any) {
        this.state.open = !this.state.open
        this.state.count++
      }
    }
  })
```

---

## Delay

Hold on before the behavior fires. (⁠ ⁠•⁠ᴗ⁠•⁠ ⁠)

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

## Binding

Nagare connects to real DOM elements via `data-soul`. ✦

```html
<div data-soul="card">...</div>
<button data-soul="button">...</button>
```

Always call `bindAll()` after defining your souls.

---

## The js block has no ceiling (⁠≧⁠▽⁠≦⁠)

Because it's just JavaScript — you can bring anything in.

```js
js: function(this: any) {
  // gsap, three.js, web audio, fetch, literally anything
  gsap.to(this.el, { rotation: 360, duration: 0.5 })
}
```

Nagare coordinates the behavior. You own the output.

---

## Part of Nagare ✦

- `@nagarejs/core` — the runtime engine
- `@nagarejs/react` — React adapter  ← you are here

---

*Nagare (流れ) — flow.*
