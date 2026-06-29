import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Nagare — Behavior Runtime for Frontend",
  description:
    "The first package that gives behavior a home. One block for every interaction. No scattered logic.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
