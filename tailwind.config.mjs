/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Naija Threads brand palette (sampled from the logo)
        forest: {
          50: "#EEF5F0",
          100: "#D5E8DC",
          300: "#7FB094",
          500: "#1E6B44",
          600: "#145232",
          700: "#0D3A25",
          800: "#0A2E1D",
          900: "#06200F",
        },
        gold: {
          300: "#E2C77E",
          400: "#D4AF5A",
          500: "#B8912F",
          600: "#9A7724",
        },
        cream: "#FAF1E2",
      },
      gridTemplateColumns:{
        'auto': 'repeat(auto-fit, minmax(200px, 1fr))'
      },
    },
  },
  plugins: [],
};
