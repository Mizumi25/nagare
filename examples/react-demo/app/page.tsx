"use client"

import { useEffect } from "react"
import { soul, bindAll } from "@nagare/react"

export default function Page() {

  useEffect(() => {

    soul("tap")
      .default({
        tw: "flex items-center justify-center w-full h-32 rounded-xl text-white text-2xl font-bold",
        css: `
          background-color: rgb(30,30,30)
          transition: all 0.3s ease
        `,
        state: {}
      })
      .tap({
        onStart: {
          css: `background-color: rgb(99,102,241)`,
          js: function() { console.log("TAP!") }
        },
        onEnd: {
          css: `background-color: rgb(30,30,30)`
        }
      })

    soul("longpress")
      .default({
        tw: "flex items-center justify-center w-full h-32 rounded-xl text-white text-2xl font-bold",
        css: `
          background-color: rgb(30,30,30)
          transition: all 0.3s ease
        `,
        state: {}
      })
      .longpress({
        onStart: {
          css: `background-color: rgb(220,38,38)`,
          js: function() { console.log("LONGPRESS!") }
        },
        onEnd: {
          css: `background-color: rgb(30,30,30)`
        }
      })

    soul("swipe")
      .default({
        tw: "flex items-center justify-center w-full h-32 rounded-xl text-white text-2xl font-bold",
        css: `
          background-color: rgb(30,30,30)
          transition: all 0.3s ease
        `,
        state: {}
      })
      .swipe({
        onStart: {
          js: function(this: any) {
            const dir = this.params.direction
            console.log("SWIPE:", dir)
            if (dir === 'left') this.el.style.backgroundColor = 'rgb(234,179,8)'
            if (dir === 'right') this.el.style.backgroundColor = 'rgb(34,197,94)'
            if (dir === 'up') this.el.style.backgroundColor = 'rgb(168,85,247)'
            if (dir === 'down') this.el.style.backgroundColor = 'rgb(239,68,68)'
          }
        },
        onEnd: {
          css: `background-color: rgb(30,30,30)`
        }
      })

    bindAll()

  }, [])

  return (
    <div className="w-full min-h-screen bg-gray-950 flex flex-col gap-4 p-6">

      <p className="text-white text-center text-lg font-bold mb-2">
        Touch Behaviors 🔥
      </p>

      <div data-soul="tap">
        👆 TAP — quick touch
      </div>

      <div data-soul="longpress">
        ⏱ LONGPRESS — hold 500ms
      </div>

      <div data-soul="swipe">
        👉 SWIPE — any direction
      </div>

    </div>
  )
}
