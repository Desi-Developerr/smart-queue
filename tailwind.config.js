/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2B",
        slate: {
          950: "#0B1420",
        },
        brand: {
          50: "#EEF6F6",
          100: "#D7EBEA",
          300: "#8FC6C2",
          500: "#2F8F87",
          600: "#22726B",
          700: "#1B5B56",
          900: "#0F3A37",
        },
        amber: {
          400: "#E8A33D",
          500: "#D68C1F",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
