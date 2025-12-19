/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // U&I Brand Colors (customize these)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        canvas: {
          light: '#ffffff',
          dark: '#1e1e1e',
        }
      },
      fontFamily: {
        sans: ['SF Pro', 'Inter', 'system-ui', 'sans-serif'],
        hand: ['Caveat', 'cursive'], // For that hand-drawn feel
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
  // Don't purge Excalidraw's classes
  safelist: [
    { pattern: /^excalidraw/ },
  ],
}
