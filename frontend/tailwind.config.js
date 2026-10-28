/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Fira Code"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#0B0F19',
          subtle: '#111625',
          card: '#161E31',
          border: '#232F47',
          hover: '#1C263D',
        },
        brand: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          glow: '#818CF8',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        syntax: {
          bg: '#0E1322',
          border: '#1E283D',
        }
      },
      boxShadow: {
        'glow-indigo': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
