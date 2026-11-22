/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom dark theme palette
        dark: {
          bg: '#0A0A0A',
          surface: '#1A1A1A',
          'surface-light': '#2A2A2A',
        },
        orange: {
          primary: '#FF6B35',
          secondary: '#FF8C42',
          dark: '#E55A2B',
          muted: 'rgba(255, 107, 53, 0.12)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          muted: '#666666',
        },
        border: {
          DEFAULT: '#333333',
          hover: '#FF6B35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 8px 24px rgba(255, 107, 53, 0.1)',
        'orange-glow-strong': '0 8px 24px rgba(255, 107, 53, 0.2)',
      },
    },
  },
  plugins: [],
};
