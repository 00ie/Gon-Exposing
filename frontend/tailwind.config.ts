import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#060606",
        panel: "#0a0a0a",
        panelAlt: "#0d0d0d",
        line: "#161616",
        clean: "#22c55e",
        low: "#3b82f6",
        medium: "#eab308",
        high: "#f97316",
        critical: "#ef4444"
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"]
      },
      boxShadow: {
        panel: "0 18px 60px rgba(0, 0, 0, 0.24)"
      }
    }
  },
  plugins: []
};

export default config;
