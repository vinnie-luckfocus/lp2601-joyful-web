/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mlb: {
          navy: '#041E42',
          red: '#BF0D3E',
          'red-dark': '#A00B34',
        },
        gold: '#C4A35A',
        success: '#2D8659',
        warning: '#E67E22',
        info: '#3182CE',
        error: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
      },
      boxShadow: {
        card: '0 4px 6px rgba(4, 30, 66, 0.05)',
        'card-hover': '0 10px 15px rgba(4, 30, 66, 0.1)',
      },
    },
  },
  plugins: [],
};
