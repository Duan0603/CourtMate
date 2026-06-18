/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        secondary: '#1C1C1E',
        accent: '#39FF14',
        destructive: '#FF3B30',
        textGray: '#8E8E93',
        borderGray: '#2C2C2E',
      }
    },
  },
  plugins: [],
}
