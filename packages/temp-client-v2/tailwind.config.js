/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      colors: {
        "pb-yellow": "#CC9F03",
        "pb-gray": "#9A978F",
        "pb-bg": "#C2BEB3",
        "pb-text-dark-900": "#000000",
        "pb-bg-light": "#ccc9c0",
      },
    },
  },
  plugins: [],
}
