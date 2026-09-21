/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0f172a',
        card: {
          DEFAULT: '#1e293b',
          hover: '#334155',
        },
        dropdown: {
          DEFAULT: '#1e293b',
          hover: '#334155',
        },
        'border-subtle': '#334155',
        'text-main': '#f8fafc',
        'text-muted': '#94a3b8',
        bullish: '#10B981',
        bearish: '#EF4444',
        primary: '#6366f1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
