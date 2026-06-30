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

`useSoul()` handles everything for you — it binds your souls to the page, watches for new elements that show up later, and cleans up automatically when the component unmounts. Just remember: always call `.default()` first when defining a soul, that's what registers it.

You'll usually import `soul` alongside `useSoul` too — it's handy when you need to reach a soul from outside the `useSoul` callback, like inside a separate event handler.

---

## Behaviors

These are detectors — they fire when the user or environment triggers them. ✦

```
click       tap         longpress     swipe
hover       press       release       drag
scroll      resize      focus         blur
enter       exit        onMount       onVisible
onInvisible onIdle      networkChanged
onOrientationChange
```

A few of these pass along extra details depending on what they detect — for example `swipe` tells you which direction, `onOrientationChange` tells you landscape or portrait, `networkChanged` tells you if you're back online. You can read these through `this.params` inside your `js` block, or use them directly in `@if`.

`onIdle` also takes an optional `idleTimeout` (in milliseconds, default 3000) if you want to control how long before it's considered idle.

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
    presets: ["bouncy"],                              // shorthand, merge by default
    presets: [{ name: "snap", mode: "override" }]      // or be explicit
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

Use `useSoul()` inside your component and it handles binding for you — no need to call `bindAll()` yourself.

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
