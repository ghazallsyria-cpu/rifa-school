/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
        display: ["Cairo", "sans-serif"],
        serif: ["Amiri", "serif"],
      },
      colors: {
        gold: {
          50: "#fffdf0",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#f5c518",
          500: "#c9970c",
          600: "#a07808",
          700: "#7a5a05",
          800: "#5c4204",
          900: "#3d2d02",
        },
        obsidian: {
          950: "#020202",
          900: "#080808",
          800: "#0f0f0f",
          700: "#1a1a1a",
          600: "#222222",
          500: "#2e2e2e",
          400: "#3a3a3a",
          300: "#555555",
          200: "#888888",
          100: "#aaaaaa",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "gold-pulse": "goldPulse 2.5s ease-in-out infinite",
        "fade-up": "fadeUp 0.4s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } },
        slideIn: { "0%": { transform: "translateX(-20px)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        fadeUp: { "from": { opacity: "0", transform: "translateY(16px)" }, "to": { opacity: "1", transform: "translateY(0)" } },
        scaleIn: { "from": { opacity: "0", transform: "scale(0.95)" }, "to": { opacity: "1", transform: "scale(1)" } },
        goldPulse: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(184,134,11,0.2)" },
          "50%": { boxShadow: "0 0 22px rgba(184,134,11,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f5c518 0%, #c9970c 50%, #a07808 100%)",
        "dark-gradient": "linear-gradient(135deg, #080808 0%, #1a1a1a 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
