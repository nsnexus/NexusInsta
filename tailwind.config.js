/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        instagram: {
          yellow: '#f09433',
          orange: '#e6683c',
          red: '#dc2743',
          pink: '#cc2366',
          purple: '#bc1888',
        }
      }
    },
  },
  plugins: [],
}
