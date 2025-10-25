module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pinus: "#D9CBA7",
        angelim: "#A57A56",
        imbuia: "#5B3A29",
        offwhite: "#F6F3EE",
        graphite: "#2F2F2F",
      },
      boxShadow: {
        card: "0 2px 10px rgba(0, 0, 0, 0.08)",
      },
      borderRadius: {
        lg: "12px",
      },
    },
  },
  plugins: [],
};