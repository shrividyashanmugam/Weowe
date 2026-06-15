/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1A6B6B', light: '#2E8B8B', dark: '#0f4a4a' },
        secondary: '#2E8B8B',
        success:   '#2ED573',
        danger:    '#FF4757',
        wbg:       '#E8F8F5',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(26,107,107,0.08)',
        hover: '0 8px 32px rgba(26,107,107,0.16)',
      },
    },
  },
  plugins: [],
}
