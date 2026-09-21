/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // slate-900 for dark mode bg
        card: '#1e293b', // slate-800 for cards
        bullish: '#10B981', // emerald-500
        bearish: '#EF4444', // rose-500
        primary: '#4f46e5', // indigo-600
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
