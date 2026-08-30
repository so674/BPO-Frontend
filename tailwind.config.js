/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080C16",
          900: "#0E1526",
          850: "#111A2E",
          800: "#152036",
          700: "#1B2740",
        },
        line: {
          DEFAULT: "#22304C",
          soft: "#182236",
        },
        steel: {
          100: "#E8ECF5",
          300: "#B3BFD6",
          400: "#8B9AB8",
          500: "#647391",
          600: "#4B5875",
        },
        brand: {
          400: "#7C8CD8",
          500: "#5561A6",
          600: "#454C88",
        },
        status: {
          present: "#34B27B",
          late: "#E3A23C",
          absent: "#E15656",
          missing: "#A78BDA",
          leave: "#4FA8D8",
          holiday: "#6B7A99",
          corrected: "#D88BC0",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
    },
  },
  plugins: [],
}
