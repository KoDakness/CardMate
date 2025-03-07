/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cardmate: {
          green: '#00B140',
          burgundy: '#8B0046'
        }
      }
    },
  },
  plugins: [],
};
