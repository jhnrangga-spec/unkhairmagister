import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0d6efd",
          dark: "#0a58ca",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
