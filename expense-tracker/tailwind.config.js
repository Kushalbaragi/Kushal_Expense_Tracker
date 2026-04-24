/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: '#0a0a0a',
        surface: '#161616',
        border: '#2a2a2a',
        muted: '#666666',
        income: '#4ade80',
        expense: '#f87171',
        'income-dim': 'rgba(74,222,128,0.15)',
        'expense-dim': 'rgba(248,113,113,0.15)',
      },
    },
  },
  plugins: [],
}


