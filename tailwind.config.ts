import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1c1c1a",
        paper: "#f6f4ef",
        brand: {
          50: "#eef4f2",
          100: "#d6e5e0",
          300: "#8fb9ac",
          500: "#2f6f5e",
          600: "#265a4c",
          700: "#1c4438",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
