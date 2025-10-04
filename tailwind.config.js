/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        kraken: {
          beige: '#e5bf99',
          red: '#cd4634',
          dark: '#211f20',
          light: '#e5e7eb',
        }
      }
    },
  },
  plugins: [],
}
