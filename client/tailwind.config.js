/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust this path to include your project's source files
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
