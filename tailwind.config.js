/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#64248b',    // Color principal del proyecto (morado)
        accent: '#4a1a6b',     // Color de acento (morado más oscuro)
        dark: '#000000',
        secondary: '#cecece',
      },
    },
  },
  plugins: [],
}

