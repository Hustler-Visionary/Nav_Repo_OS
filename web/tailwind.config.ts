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
        glowMagenta: "0 0 24px rgba(232, 121, 249, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
