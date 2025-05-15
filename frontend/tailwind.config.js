export default {
  darkMode: "class", // Enables class-based dark mode
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dp: "rgb(250, 240, 230)",
        lp: "rgba(239, 239, 255, 1)",
        "lp-dark": "#667184",
        mp: "#667184",
        "mp-dark": "#667184",
        cbg: "rgba(252, 251, 252, 1)",
        "cbg-dark": "rgb(48, 50, 54)",
        bg: "rgba(255, 255, 255, 1)",
        "bg-dark": "#161618",
        gf: "rgba(173, 181, 186, 1)",
        "gf-dark": "rgba(200, 200, 210, 1)",
      },
    },
  },
  plugins: [],
};
