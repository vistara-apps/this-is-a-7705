/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg': 'hsl(220, 10%, 95%)',
        'accent': 'hsl(170, 70%, 45%)',
        'primary': 'hsl(220, 80%, 50%)',
        'surface': 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(220, 15%, 25%)',
        'text-secondary': 'hsl(220, 15%, 45%)',
        'dark-bg': 'hsl(240, 15%, 8%)',
        'dark-surface': 'hsl(240, 10%, 12%)',
        'dark-card': 'hsl(240, 10%, 16%)',
        'dark-text': 'hsl(0, 0%, 95%)',
        'dark-text-secondary': 'hsl(0, 0%, 70%)',
      },
      borderRadius: {
        'lg': '16px',
        'md': '10px',
        'sm': '6px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '28px',
      },
      boxShadow: {
        'card': '0 6px 18px hsla(220, 20%, 10%, 0.1)',
        'modal': '0 10px 30px hsla(220, 20%, 10%, 0.2)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '.8',
            transform: 'scale(1.05)',
          },
        }
      }
    },
  },
  plugins: [],
}