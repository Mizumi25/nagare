"use client"

import Link from "next/link"
import { useSoul } from "@nagarejs/react"

export default function About() {
  useSoul((soul) => {
    soul("about-heading")
      .default({
        tw: "text-2xl font-bold text-white p-8",
        js: function (this: { state: any; el: HTMLElement }) {
          this.el.textContent = "About page — testing navigation cleanup"
        }
      })
      .onMount({
        onStart: {
          css: `opacity: 1 transition: opacity 0.5s ease`,
          js: function (this: any) {
            console.log("about-heading mounted")
          }
        }
      })

    soul("about-box")
      .default({
        tw: "w-32 h-32 bg-blue-600 rounded-xl mx-8",
        state: { hovered: false }
      })
      .hover({
        onStart: { tw: "bg-blue-400", js: function (this: any) { this.state.hovered = true } },
        onEnd: { tw: "bg-blue-600", js: function (this: any) { this.state.hovered = false } }
      })
  })

  return (
    <div className="min-h-screen bg-gray-950">
      <div data-soul="about-heading"></div>
      <div data-soul="about-box"></div>
      <Link href="/" className="text-blue-400 underline p-8 block">← back to home</Link>
    </div>
  )
}
