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
          50: "#fffdf7",
          100: "#fae9be",
          200: "#e8cd8b",
        },
        slate: {
          50: "#faf8f3",
          100: "#f1ece2",
          200: "#e1d9ca",
          300: "#c7c7c7",
          400: "#b0a89d",
          500: "#959595",
          600: "#646464",
          700: "#4a4b4a",
          800: "#3a3b3a",
          900: "#2d2e2d",
        },
        accent: {
          coral: "#e8c061",
          teal: "#b39244",
          gold: "#e8cd8b",
          mint: "#fae9be",
        },
      },
      boxShadow: {
        float: "0 20px 55px rgba(45, 46, 45, 0.14)",
        soft: "0 12px 30px rgba(45, 46, 45, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(232, 192, 97, 0.24), transparent 34%), radial-gradient(circle at top right, rgba(45, 46, 45, 0.12), transparent 28%), linear-gradient(180deg, #fffdf7 0%, #fff8e8 52%, #fae9be 100%)",
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
