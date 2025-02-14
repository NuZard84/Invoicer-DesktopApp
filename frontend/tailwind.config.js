export default {
  darkMode: "class", // Enables class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dp: "rgba(102, 94, 242, 1)",
        lp: "rgba(239, 239, 255, 1)",
        "lp-dark": "rgba(50, 50, 75, 1)",
        mp: "rgba(110, 104, 192, 1)",
        "mp-dark": "rgba(80, 75, 162, 1)",
        cbg: "rgba(252, 251, 252, 1)",
        "cbg-dark": "rgba(30, 30, 40, 1)",
        bg: "rgba(255, 255, 255, 1)",
        "bg-dark": "rgba(15, 15, 20, 1)",
        gf: "rgba(173, 181, 186, 1)",
        "gf-dark": "rgba(200, 200, 210, 1)",
      },
    },
  },
  plugins: [],
};
