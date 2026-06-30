# @nagarejs/core ✦

The runtime engine that powers Nagare.

---

You probably don't need this directly. (⁠^⁠^⁠)

Most developers use a framework adapter:

```bash
npm install @nagarejs/react   # React, Next.js, Remix, Astro...
```

But if you're building your own adapter, working in vanilla JS,
or just curious how it all works — you're in the right place.

---

## What lives here

```
parser/       →   turns CSS strings into runtime-ready blocks
                  including @if / @else if / @else conditions

runtime/      →   registry   — stores souls, templates, presets
              →   executor   — runs lifecycle blocks in order
              →   binder     — connects data-soul elements to behaviors

state/        →   manages per-element state
types/        →   all the TypeScript types
```

---

## Install

```bash
npm install @nagarejs/core
```

---

## The mental model ✦

```
soul          →   the element  (soul("hero"))
behavior      →   the detector (hover, click, scroll, tap, swipe...)
lifecycle     →   onStart / onUpdate / onEnd
blocks        →   tw / css / js
```

Everything flows in that order. The runtime does the rest. (⁠ ⁠•⁠ᴗ⁠•⁠ ⁠)

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

Some behaviors hand you a little extra info through `params`, depending on what they're detecting — like which direction a swipe went, or whether the network just came back online. You don't need to memorize this, it just shows up when it's relevant.

---

## Building an adapter

```ts
import {
  registerSoul,
  registerTemplate,
  registerPreset,
  bindAll,
  getSoul
} from '@nagarejs/core'

import { parseCss } from '@nagarejs/core/parser/css'
```

Register souls, templates and presets — then call `bindAll()` to wire everything to the DOM.

That's what `@nagarejs/react` does under the hood. ✦

---

## CSS parser

The CSS parser turns plain strings into structured blocks the runtime can execute.

```ts
import { parseCss } from '@nagarejs/core'

parseCss(`
  transform: scale(1.1)
  opacity: 0.9

  @if hovered {
    color: white
  }
  @else if active {
    color: violet
  }
  @else {
    color: gray
  }
`)
```

Any valid JS expression works inside `@if`. (⁠≧⁠▽⁠≦⁠)

---

## Part of Nagare ✦

- `@nagarejs/core` — runtime engine  ← you are here
- `@nagarejs/react` — React adapter

---

*Nagare (流れ) — flow.*
# @nagarejs/core ✦

The runtime engine that powers Nagare.

---

You probably don't need this directly. (⁠^⁠^⁠)

Most developers use a framework adapter:

```bash
npm install @nagarejs/react   # React, Next.js, Remix, Astro...
```

But if you're building your own adapter, working in vanilla JS,
or just curious how it all works — you're in the right place.

---

## What lives here

```
parser/       →   turns CSS strings into runtime-ready blocks
                  including @if / @else if / @else conditions

runtime/      →   registry   — stores souls, templates, presets
              →   executor   — runs lifecycle blocks in order
              →   binder     — connects data-soul elements to behaviors

state/        →   manages per-element state
types/        →   all the TypeScript types
```

---

## Install

```bash
npm install @nagarejs/core
```

---

## The mental model ✦

```
soul          →   the element  (soul("hero"))
behavior      →   the detector (hover, click, scroll, tap, swipe...)
lifecycle     →   onStart / onUpdate / onEnd
blocks        →   tw / css / js
```

Everything flows in that order. The runtime does the rest. (⁠ ⁠•⁠ᴗ⁠•⁠ ⁠)

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

Some behaviors hand you a little extra info through `params`, depending on what they're detecting — like which direction a swipe went, or whether the network just came back online. You don't need to memorize this, it just shows up when it's relevant.

---

## Building an adapter

```ts
import {
  registerSoul,
  registerTemplate,
  registerPreset,
  bindAll,
  getSoul
} from '@nagarejs/core'

import { parseCss } from '@nagarejs/core/parser/css'
```

Register souls, templates and presets — then call `bindAll()` to wire everything to the DOM.

That's what `@nagarejs/react` does under the hood. ✦

---

## CSS parser

The CSS parser turns plain strings into structured blocks the runtime can execute.

```ts
import { parseCss } from '@nagarejs/core'

parseCss(`
  transform: scale(1.1)
  opacity: 0.9

  @if hovered {
    color: white
  }
  @else if active {
    color: violet
  }
  @else {
    color: gray
  }
`)
```

Any valid JS expression works inside `@if`. (⁠≧⁠▽⁠≦⁠)

---

## Part of Nagare ✦

- `@nagarejs/core` — runtime engine  ← you are here
- `@nagarejs/react` — React adapter

---

*Nagare (流れ) — flow.*
