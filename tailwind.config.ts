import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F7A4D", // PLASU Plug green
          dark: "#0B5C3A",
          light: "#E7F5EE",
        },
        accent: {
          DEFAULT: "#F5A623", // marketplace accent (badges, CTAs)
        },
      },
      borderRadius: {
        xl: "1rem",
      },
    },
  },
  plugins: [],
};
export default config;
