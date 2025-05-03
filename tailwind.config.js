/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f3fa',
          100: '#cce7f5',
          200: '#99cfe9',
          300: '#66b7dd',
          400: '#3399d1',
          500: '#0078c5', // RAL 5015 (Sky Blue)
          600: '#0060a4',
          700: '#004883',
          800: '#003062',
          900: '#001831',
        },
        secondary: {
          50: '#f5fbff',
          100: '#ebf7ff',
          200: '#d7efff',
          300: '#c3e7ff',
          400: '#afdfff',
          500: '#9bd7ff',
          600: '#87b4d9',
          700: '#7391b3',
          800: '#5f6e8c',
          900: '#4b4b66',
        },
        accent: {
          50: '#fff8e6',
          100: '#fff1cc',
          200: '#ffe299',
          300: '#ffd466',
          400: '#ffc633',
          500: '#ffb800',
          600: '#d99c00',
          700: '#b38000',
          800: '#8c6400',
          900: '#664800',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};