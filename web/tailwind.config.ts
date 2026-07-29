import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hud: {
          bg: "#05070a",
          panel: "#0a0f16",
          panelAlt: "#0d1420",
          border: "#1b2a38",
          cyan: "#22d3ee",
          cyanDim: "#0e7490",
          magenta: "#e879f9",
          magentaDim: "#a21caf",
          green: "#34d399",
          amber: "#fbbf24",
          red: "#f87171",
          text: "#cdeef7",
          textDim: "#6b8494"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      boxShadow: {
        glow: "0 0 24px rgba(34, 211, 238, 0.15)",
        glowMagenta: "0 0 24px rgba(232, 121, 249, 0.15)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        glassLg: "0 24px 64px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.06)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};

export default config;
