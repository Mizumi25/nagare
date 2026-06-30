"use client"
import Link from "next/link"

import { useState } from "react"
import { useSoul, soul } from "@nagarejs/react"

type IdleState = { idleCount: number }

function SignalsPanel() {
  useSoul((soul) => {
    soul("signals-grid").default({
      tw: "grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
    })

    soul<IdleState>("idle-box")
      .default({
        tw: "flex items-center justify-center w-full h-28 rounded-xl bg-emerald-700 text-white font-semibold text-center px-4 transition-colors",
        state: { idleCount: 0 },
        js: function (this: { state: IdleState; el: HTMLElement }) {
          this.el.textContent = "Move the mouse, scroll, click, or type..."
        }
      })
      .onIdle({
        idleTimeout: 3000,
        onStart: {
          tw: "bg-amber-600",
          js: function (this: { state: IdleState; params: Record<string, any>; el: HTMLElement }) {
            this.state.idleCount += 1
            this.el.textContent = `Idle 💤 (triggered ${this.state.idleCount}x)`
          }
        },
        onEnd: {
          tw: "bg-emerald-700",
          js: function (this: { state: IdleState; params: Record<string, any>; el: HTMLElement }) {
            this.el.textContent = "Active again 👋"
          }
        }
      })

    soul("network-box")
      .default({
        tw: "flex items-center justify-center w-full h-28 rounded-xl text-white font-semibold text-center px-4 transition-colors",
        css: `background-color: #1f2937`,
        state: {},
        js: function (this: { state: any; el: HTMLElement }) {
          this.el.textContent = navigator.onLine ? "Online ✅" : "Offline ❌"
        }
      })
      .networkChanged({
        onStart: {
          css: `
            @if online {
              background-color: #047857
            }
            @else {
              background-color: #b91c1c
            }
          `,
          js: function (this: { state: any; params: Record<string, any>; el: HTMLElement }) {
            this.el.textContent = this.params.online
              ? "Online ✅"
              : "Offline ❌ — try DevTools > Network > Offline"
          }
        }
      })

    soul("orientation-box")
      .default({
        tw: "flex items-center justify-center w-full h-28 rounded-xl bg-fuchsia-700 text-white font-semibold text-center px-4",
        state: {},
        js: function (this: { state: any; el: HTMLElement }) {
          const o = window.innerWidth > window.innerHeight ? "landscape" : "portrait"
          this.el.textContent = `Orientation: ${o}`
        }
      })
      .onOrientationChange({
        onStart: {
          js: function (this: { state: any; params: Record<string, any>; el: HTMLElement }) {
            this.el.textContent = `Orientation: ${this.params.orientation}`
          }
        }
      })
  })


  // ── Logo entrance animations ──
useSoul((soul) => {
  // Loading screen logo
  soul('loader-logo')
    .default({ 
      css: `opacity: 0; transform: scale(0.8) rotate(-10deg)`
    })
    .onMount({
      delay: 100,
      onStart: { 
        css: `opacity: 1; transform: scale(1) rotate(0deg); transition: all 0.8s cubic-bezier(.16,1,.3,1)` 
      }
    })

  // Nav logo
  soul('nav-logo')
    .default({ 
      css: `opacity: 0; transform: translateX(-20px)`
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
    <div data-soul="signals-grid">
      <div data-soul="idle-box"></div>
      <div data-soul="network-box"></div>
      <div data-soul="orientation-box"></div>
    </div>
  )
}

export default function Page() {
  const [signalsMounted, setSignalsMounted] = useState(true)
  const [boxes, setBoxes] = useState<number[]>([1])

  useSoul((soul) => {
    soul("page-root").default({
      tw: "min-h-screen bg-gray-950 text-white p-8 flex flex-col gap-8"
    })

    soul("heading").default({
      tw: "text-2xl font-bold",
      js: function (this: { state: any; el: HTMLElement }) {
        this.el.textContent = "Nagare feature test bench"
      }
    })

    soul("controls-row").default({
      tw: "flex items-center gap-3"
    })

    soul("mount-toggle-btn")
      .default({
        tw: "px-4 py-2 bg-rose-600 rounded-lg text-sm",
        js: function (this: { state: any; el: HTMLElement }) {
          this.el.dataset.signalsMounted = "true"
          this.el.textContent = "Unmount signals panel"
        }
      })
      .click({
        onStart: {
          js: function (this: { state: any; el: HTMLElement }) {
            const willMount = this.el.dataset.signalsMounted !== "true"
            this.el.dataset.signalsMounted = String(willMount)
            this.el.textContent = willMount ? "Unmount signals panel" : "Mount signals panel"
            setSignalsMounted(willMount)
          }
        }
      })

    soul("mount-desc").default({
      tw: "text-sm text-gray-400",
      js: function (this: { state: any; el: HTMLElement }) {
        this.el.textContent = "Tests useSoul() cleanup — unmount then remount, idle count should reset to 0."
      }
    })

    soul("dynamic-section").default({
      tw: "flex flex-col gap-3 p-6 bg-gray-900 rounded-xl w-full"
    })

    soul("dynamic-desc").default({
      tw: "text-sm text-gray-400",
      js: function (this: { state: any; el: HTMLElement }) {
        this.el.textContent = "MutationObserver test — new boxes auto-bind without calling bindAll() again."
      }
    })

    soul("add-box-btn")
      .default({
        tw: "self-start px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm",
        js: function (this: { state: any; el: HTMLElement }) {
          this.el.dataset.count = "1"
          this.el.textContent = "Add box (1)"
        }
      })
      .click({
        onStart: {
          js: function (this: { state: any; el: HTMLElement }) {
            const next = Number(this.el.dataset.count || "1") + 1
            this.el.dataset.count = String(next)
            this.el.textContent = `Add box (${next})`
            setBoxes((b) => [...b, b.length + 1])
          }
        }
      })

    soul("dynamic-boxes-row").default({
      tw: "flex flex-wrap gap-2"
    })

    soul("dynamic-box")
      .default({
        tw: "w-16 h-16 flex items-center justify-center rounded-lg bg-gray-800 text-white text-sm transition-colors"
      })
      .onMount({
        onStart: {
          tw: "bg-purple-700",
          js: function (this: { state: any; el: HTMLElement }) {
            console.log("Nagare: dynamic-box mounted via MutationObserver auto-bind")
          }
        }
      })

    soul("warn-section").default({
      tw: "flex items-center gap-3"
    })

    soul("warn-btn")
      .default({
        tw: "px-4 py-2 bg-yellow-700 rounded-lg text-sm",
        js: function (this: { state: any; el: HTMLElement }) {
          this.el.textContent = "Trigger missing .default() warning"
        }
      })
      .click({
        onStart: {
          js: function (this: { state: any; el: HTMLElement }) {
            soul("ghost-soul").hover({ onStart: { tw: "opacity-50" } })
            const warnEl = document.querySelector('[data-soul="warn-text"]') as HTMLElement | null
            if (warnEl) warnEl.textContent = "Check console for the Nagare warning ↑"
          }
        }
      })

    soul("warn-text").default({
      tw: "text-sm text-gray-400"
    })
  })

  return (
    <div data-soul="page-root">
      <div data-soul="heading"></div>
      <Link href="/about" className="text-blue-400 underline w-fit">go to about page →</Link>

      <section>
        <div data-soul="controls-row">
          <button data-soul="mount-toggle-btn"></button>
          <p data-soul="mount-desc"></p>
        </div>
        {signalsMounted && <SignalsPanel />}
      </section>

      <section>
        <div data-soul="dynamic-section">
          <p data-soul="dynamic-desc"></p>
          <button data-soul="add-box-btn"></button>
          <div data-soul="dynamic-boxes-row">
            {boxes.map((n) => (
              <div key={n} data-soul="dynamic-box"></div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div data-soul="warn-section">
          <button data-soul="warn-btn"></button>
          <p data-soul="warn-text"></p>
        </div>
      </section>
    </div>
  )
}
