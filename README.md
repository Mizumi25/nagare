# Nagare ✦

---

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
npm install @nagarejs/react
```

---

## How it works

You define a **soul** — that's your element.
You attach **behaviors** — those are your interactions.
Each behavior has a **lifecycle** — start, update, end.
Each lifecycle has **blocks** — tw, css, js.

```js
soul("button")
  .default({
    tw: "px-6 py-3 rounded-xl bg-indigo-600 text-white cursor-pointer",
    css: `transition: all 0.2s ease`,
    state: { pressed: false }
  })
  .click({
    onStart: {
      css: `transform: scale(0.96)`,
      js: function(this: any) {
        this.state.pressed = true
      }
    },
    onEnd: {
      css: `transform: scale(1)`,
      js: function(this: any) {
        this.state.pressed = false
      }
    }
  })
```

Bind it to your HTML with `data-soul`. (⁠^⁠^⁠)

```html
<button data-soul="button">Click me</button>
```

Call `bindAll()` and Nagare does the rest.

---

## Behaviors

These fire when the user or environment triggers them.

```
click       tap         longpress     swipe
hover       press       release       drag
scroll      resize      focus         blur
enter       exit        onMount       onVisible
onInvisible
```

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

Any JS expression works inside @if. State keys go in directly — no prefix needed.

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
    presets: [{ name: "bouncy" }],
    presets: [{ name: "bouncy", mode: "override" }]
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

## Packages

```bash
npm install @nagarejs/react    # React, Next.js, Remix, Astro, TanStack...
npm install @nagarejs/core     # vanilla JS or build your own adapter
```

---

*Nagare (流れ) — flow.*
