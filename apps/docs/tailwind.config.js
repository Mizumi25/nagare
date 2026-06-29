/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-shippori)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        bg: "#FAFAF8",
        "bg-alt": "#F0EDE8",
        ink: "#1A1A18",
        "ink-mid": "#2E2E2C",
        "ink-soft": "#6B6B67",
        "ink-faint": "#BBBAB7",
      },
    },
  },
  plugins: [],
}
