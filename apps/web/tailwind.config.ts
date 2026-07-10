import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        arcade: ['"Press Start 2P"', "monospace"],
        sans:   ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg:     "#0a0a0a",
        card:   "#111111",
        border: "#222222",
        neon:   "#00ff88",
        purple: "#a855f7",
        pink:   "#ec4899",
        amber:  "#f59e0b",
        red:    "#ef4444",
        blue:   "#3b82f6",
      },
      boxShadow: {
        neon:   "0 0 20px #00ff8840",
        purple: "0 0 20px #a855f740",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
