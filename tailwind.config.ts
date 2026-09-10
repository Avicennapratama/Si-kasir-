import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Dark Glassmorphism FusionAI Base ---
        base: "#090A0F",
        bg: "#090A0F",
        surface: "rgba(255, 255, 255, 0.03)",
        card: "rgba(255, 255, 255, 0.03)",
        border: "rgba(255, 255, 255, 0.08)",
        foreground: "#F8FAFC",

        // --- Solar Fusion Glow Aksen (#FF8918 glow to #DA4E24 flame) ---
        solar: {
          50: "#fff7f0",
          100: "#ffe9d6",
          glow: "#FF8918",
          flame: "#DA4E24",
          500: "#FF8918",
          600: "#DA4E24",
          700: "#A22904",
        },

        // --- Accents ---
        emerald: {
          DEFAULT: "#10B981",
          500: "#10B981",
          600: "#059669",
        },
        crimson: {
          DEFAULT: "#F43F5E",
          500: "#F43F5E",
          600: "#EA580C",
        },
        cyan: {
          500: "#0098F3",
          600: "#0077CC",
        },
      },
    },
  },
  plugins: [],
};

export default config;
