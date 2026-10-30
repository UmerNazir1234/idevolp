import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { brand: { DEFAULT: "#a30000", dark: "#7d0000" }, page: "#7a7a7a" },
    fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "Arial", "sans-serif"] },
    keyframes: { rise: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "none" } } },
    animation: { rise: "rise .7s ease-out both" },
  } },
  plugins: [],
};
export default config;
