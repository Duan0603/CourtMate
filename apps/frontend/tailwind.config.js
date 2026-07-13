/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: "#1d4ed8",
        secondary: "#1f2937",

        // Background surfaces
        background: "#f8fafc",
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f1f5f9',
        'surface-container-high': '#e2e8f0',

        // Text colors
        'on-surface-variant': '#64748b',

        // Outline colors
        'outline-variant': '#94a3b8',

        // Semantic colors
        'green-success': '#22c55e',
        'orange-highlight': '#f97316',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '40px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'level-1': '0 1px 3px rgba(0,0,0,0.08)',
        'level-2': '0 4px 6px rgba(0,0,0,0.06)',
        'level-3': '0 10px 15px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
