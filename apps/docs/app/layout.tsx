import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nagare ✦ — a behavior-first UI runtime',
  description:
    'Nagare gives behavior its own home. One soul, one place — styles, animation, logic, and state, together. A live showcase built with @nagarejs/react.',
  openGraph: {
    title: 'Nagare — a behavior-first UI runtime',
    description: 'Behavior has a home now. Live demos powered by @nagarejs/react.',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
