/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "semitransparent-grey": "rgb(152, 150, 165, 0.3)",
        "semitransparent-acquamarine": "rgb(78, 195, 203, 0.6)",
        "uber-semitransparent-acquamarine": "rgb(78, 195, 203, 0.2)",
      }
    },
  },
  plugins: [],
}
