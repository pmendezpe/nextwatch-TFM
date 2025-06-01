/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A101F",
        secondary: "#0A1C48",
        accent: "#FCA311",
        platinum: "#E5E5E5",
        white: "#ffffff",
      },
      fontFamily: {
        text: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

