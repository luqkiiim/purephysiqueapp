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
          50: "#fbf7f0",
          100: "#f5ead9",
          200: "#ecd8bc",
        },
        slate: {
          900: "#1d2b2a",
          800: "#28403f",
          700: "#365352",
        },
        accent: {
          coral: "#ff7f63",
          teal: "#1eb7a6",
          gold: "#f1c45a",
          mint: "#d6f3ea",
        },
      },
      boxShadow: {
        float: "0 20px 55px rgba(29, 43, 42, 0.12)",
        soft: "0 12px 30px rgba(29, 43, 42, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top left, rgba(255, 127, 99, 0.22), transparent 34%), radial-gradient(circle at top right, rgba(30, 183, 166, 0.16), transparent 28%), linear-gradient(180deg, #fbf7f0 0%, #fffdf8 52%, #f5ead9 100%)",
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
