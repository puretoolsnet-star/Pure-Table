import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#020617",
        surface: "#0f172a",
        "surface-hover": "#1e293b",
        primary: "#3b82f6",
        accent: "#10b981",
      },
    },
  },
};

export default config;
