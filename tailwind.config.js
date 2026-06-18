/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8ec1ff',
          400: '#599dff', 500: '#3478f6', 600: '#1f5be0', 700: '#1947b8',
          800: '#1a3e92', 900: '#1b3873', 950: '#142348',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
