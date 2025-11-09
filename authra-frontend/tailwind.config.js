/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E95C28',    // Bright orange
        secondary: '#C62828',  // Deep red
        dark: '#1E1E1E',      // Almost black
        light: '#F9F9F9',     // Light grey/off-white
        navy: '#0D1F2D',      // Deep blue tone
      },
    },
  },
  plugins: [],
}