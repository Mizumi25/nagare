"use client"

import { useEffect } from "react"
import { soul, bindAll } from "@nagare/react"

export default function Page() {

  useEffect(() => {

    soul("hero")
      .default({
        tw: "flex items-center justify-center w-full bg-gray-950 text-white text-4xl font-bold",
        css: `
          height: 100vh
          transition: all 0.1s ease
        `,
        state: {}
      })
      .scroll({
        onUpdate: {
          css: `opacity: calc(1 - scrollY / 500)`,
          js: function(this: any) {
            console.log("scrollY:", this.params.scrollY)
          }
        }
      })

    bindAll()

  }, [])

  return (
    <div style={{ height: '200vh' }} className="bg-gray-950">
      <div data-soul="hero">
        Scroll down 👇
      </div>
    </div>
  )
}
