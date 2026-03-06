import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f6efe3",
        paper: "#fffdf8",
        ink: "#152122",
        accent: "#0f766e",
        accentSoft: "#d7efe6",
        alert: "#dc6b2f",
        alertSoft: "#ffe5d4",
        line: "#d6d1c4",
      },
      boxShadow: {
        card: "0 20px 50px rgba(21, 33, 34, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
