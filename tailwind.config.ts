import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fae9be",
          100: "#e8cd8b",
          200: "#b39244",
        },
        slate: {
          50: "#2d2e2d",
          100: "#3a3b3a",
          200: "#4a4b4a",
          300: "#646464",
          400: "#7d7d7d",
          500: "#959595",
          600: "#b0b0b0",
          700: "#c7c7c7",
          800: "#f1ece2",
          900: "#ffffff",
        },
        accent: {
          coral: "#e8c061",
          teal: "#b39244",
          gold: "#fae9be",
          mint: "#fae9be",
        },
      },
      boxShadow: {
        float: "0 20px 55px rgba(0, 0, 0, 0.32)",
        soft: "0 12px 30px rgba(0, 0, 0, 0.22)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(232, 192, 97, 0.18), transparent 34%), radial-gradient(circle at top right, rgba(228, 50, 146, 0.12), transparent 30%), linear-gradient(180deg, #2d2e2d 0%, #181818 52%, #0a0a0a 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        reveal: "reveal 0.45s ease-out both",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};

export default config;
