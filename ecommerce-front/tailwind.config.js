/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00e6ff',
          pink: '#ff00ea',
          purple: '#a259ff',
          teal: '#00ffd0',
          yellow: '#fff500',
        },
        glass: 'rgba(255,255,255,0.15)',
        darkglass: 'rgba(30,41,59,0.35)',
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00e6ff 0%, #a259ff 50%, #ff00ea 100%)',
        'gradient-dark': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        neon: '0 0 16px 2px #00e6ff, 0 0 32px 4px #a259ff',
        glass: '0 4px 32px 0 rgba(0,0,0,0.12)',
        glow: '0 0 8px 2px #ff00ea',
      },
      backdropBlur: {
        glass: '8px',
      },
      fontFamily: {
        display: ['Poppins', 'ui-sans-serif', 'system-ui'],
        neon: ['Orbitron', 'Poppins', 'ui-sans-serif'],
      },
      transitionProperty: {
        'bg': 'background-color, background-image',
      },
    },
  },
  plugins: [],
};
