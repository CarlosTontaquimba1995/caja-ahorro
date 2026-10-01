/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#f7a51d',   // Naranja corporativo
          secondary: '#297cbf', // Azul corporativo
          tertiary: '#e30f15',  // Rojo corporativo
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // Tipografía limpia
      }
    },
  },
  plugins: [],
}