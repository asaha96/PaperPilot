/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          ghost: '#94A3B8',
          concept: '#10B981',
        },
      },
      animation: {
        'explode': 'explode 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        explode: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

