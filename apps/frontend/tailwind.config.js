/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFE8DF',
          100: '#FFD9CC',
          200: '#FFBAA5',
          300: '#FF9B7F',
          400: '#FF8358',
          500: '#FF6B35',
          600: '#FF4900',
          700: '#CC3A00',
          800: '#992B00',
          900: '#661D00',
        },
        dark: {
          DEFAULT: '#09090B',
          50: '#2A2A2F',
          100: '#1F1F23',
          200: '#18181B',
          300: '#131316',
          400: '#0E0E10',
          500: '#09090B',
          600: '#050506',
          700: '#020202',
          800: '#000000',
          900: '#000000',
        },
      },
      backgroundColor: {
        'dark': '#09090B',
        'dark-lighter': '#18181B',
      },
      borderColor: {
        'dark': '#27272A',
      },
    },
  },
  plugins: [],
}

