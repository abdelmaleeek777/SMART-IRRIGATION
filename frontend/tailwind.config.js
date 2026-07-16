/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Manrope', 'sans-serif'],
    },
    extend: {
      colors: {
        deepOcean: '#023047',
        deepocean: '#023047',
        deppocean: '#023047',
        'deep-ocean': '#023047',
        oceanBlue: '#0077B6',
        oceanblue: '#0077B6',
        'ocean-blue': '#0077B6',
        aquaBlue: '#00B4D8',
        aquablue: '#00B4D8',
        'aqua-blue': '#00B4D8',
        crystalCyan: '#48CAE4',
        crystalcyan: '#48CAE4',
        'crystal-cyan': '#48CAE4',
        iceBlue: '#CAF0F8',
        iceblue: '#CAF0F8',
        'ice-blue': '#CAF0F8',
        arcticWhite: '#F7FBFC',
        arcticwhite: '#F7FBFC',
        'arctic-white': '#F7FBFC',
        midnight: '#0F172A',
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63'
        }
      },
      boxShadow: {
        soft: '0 18px 50px rgba(15, 23, 42, 0.12)'
      },
      backgroundImage: {
        'hero-grid': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 0)'
      }
    },
  },
  plugins: [],
};
