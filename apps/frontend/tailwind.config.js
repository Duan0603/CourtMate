/** @type {import('tailwindcss').Config} */
module.exports = {
  // Path to all components and screens for styling parsing
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#ff5e3a", // Vibrant customized brand accent color (avoid generic red)
        secondary: "#1f2937",
        background: "#0f172a", // Curated harmonious dark mode color
      }
    },
  },
  plugins: [],
}
