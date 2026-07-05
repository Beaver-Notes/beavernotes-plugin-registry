const colors = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.amber['400'],
        secondary: colors.amber['300'],
      },
    },
  },
  plugins: [],
};
