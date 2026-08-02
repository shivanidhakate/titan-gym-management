/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gymGray: {
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#262626',
          500: '#404040',
          400: '#a3a3a3',
        },
        gymNeon: {
          DEFAULT: '#00FF66',
          dark: '#00cc52',
          light: '#66ff99',
        },
        gymRed: {
          DEFAULT: '#E50914',
          dark: '#b3070f',
          light: '#ff333d',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon': '0 0 15px rgba(0, 255, 102, 0.4)',
        'red-glow': '0 0 15px rgba(229, 9, 20, 0.4)'
      }
    },
  },
  plugins: [],
}
