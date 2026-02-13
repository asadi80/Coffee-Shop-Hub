/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cream: "#F5EDE2",
        "cream-dark": "#E6D5C3",
        "coffee-light": "#C7A17A",
        "coffee-medium": "#8B5E3C",
        "coffee-dark": "#2C1810",
        "accent-orange": "#D97706",
      },
      fontFamily: {
        serif: ["Crimson Pro", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
