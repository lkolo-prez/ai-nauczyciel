/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette — "głęboki granat + energetyczny fiolet/cyjan"
        ink: '#0b1020',
        surface: '#141a2e',
        card: '#1b2440',
        brand: {
          DEFAULT: '#7c5cff',
          50: '#f1eeff',
          400: '#9d86ff',
          500: '#7c5cff',
          600: '#5f3de6',
        },
        accent: '#22d3ee',
        good: '#34d399',
        warn: '#fbbf24',
        bad: '#fb7185',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(124,92,255,0.55)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
