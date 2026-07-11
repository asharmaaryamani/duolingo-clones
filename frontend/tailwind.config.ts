import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired palette
        duoGreen: "#58cc02",
        duoGreenDark: "#45a302",
        duoBlue: "#1cb0f6",
        duoBlueDark: "#1899d6",
        duoRed: "#ff4b4b",
        duoRedDark: "#e63e3e",
        duoYellow: "#ffc800",
        duoYellowDark: "#e6b400",
        duoPurple: "#ce82ff",
        duoOrange: "#ff9600",
        duoGray: "#e5e5e5",
        duoGrayDark: "#afafaf",
        duoText: "#3c3c3c",
        duoBg: "#131f24",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
      },
      boxShadow: {
        duo: "0 4px 0 0 var(--tw-shadow-color)",
        duoSm: "0 2px 0 0 var(--tw-shadow-color)",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        pop: "pop 0.25s ease-in-out",
        shake: "shake 0.3s ease-in-out",
        slideUp: "slideUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
