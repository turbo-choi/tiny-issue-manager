import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f2f0eb",
        ceramic: "#edebe9",
        paper: "#ffffff",
        ink: "#1E3932",
        body: "rgba(0, 0, 0, 0.87)",
        muted: "rgba(0, 0, 0, 0.58)",
        accent: "#00754A",
        brand: "#006241",
        uplift: "#2b5148",
        accentSoft: "#d4e9e2",
        gold: "#cba258",
        alert: "#c82014",
        alertSoft: "hsl(4 82% 43% / 5%)",
        line: "#d6dbde",
      },
      boxShadow: {
        card: "0 0 0.5px rgba(0, 0, 0, 0.14), 0 1px 1px rgba(0, 0, 0, 0.24)",
        nav: "0 1px 3px rgba(0, 0, 0, 0.10), 0 2px 2px rgba(0, 0, 0, 0.06), 0 0 2px rgba(0, 0, 0, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
