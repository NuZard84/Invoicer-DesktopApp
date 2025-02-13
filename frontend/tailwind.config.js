/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dp: "rgba(102, 94, 242, 1)",
        lp: "rgba(239, 239, 255, 1)",
        mp: "rgba(110, 104, 192, 1)",
        cbg: "rgba(252, 251, 252, 1)",
        bg: "rgba(255, 255, 255, 1)",
        gf: "rgba(173, 181, 186, 1)",
      },
    },
  },
  plugins: [],
};
