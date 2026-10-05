import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        lazuli: {
          navy: "#181D3A",
          gold: "#DA9B5C",
          cream: "#FDEDDD",
          soft: "#F8F0E8",
          mist: "#D9DEE7",
          text: "#505977"
        }
      },
      boxShadow: {
        soft: "0 18px 42px rgba(24,29,58,0.12)",
        floating: "0 18px 42px rgba(24,29,58,0.35)",
        gold: "0 12px 30px rgba(218,155,92,0.25)"
      }
    }
  },
  plugins: [],
};

export default config;
