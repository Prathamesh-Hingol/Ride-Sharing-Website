/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem',
      },
      colors: {
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#d4daea',
          bright: '#f9f9ff',
          lowest: '#ffffff',
          low: '#f1f3ff',
          container: '#e8eeff',
          high: '#e3e8f9',
          highest: '#dde2f3',
        },
        ink: {
          DEFAULT: '#161c27',
          variant: '#424654',
          inverse: '#2a303d',
        },
        outline: {
          DEFAULT: '#727786',
          variant: '#c2c6d7',
        },
        primary: {
          DEFAULT: '#2E7BFF',
          dark: '#0056c5',
          container: '#146ef1',
          fixed: '#d9e2ff',
        },
        secondary: {
          DEFAULT: '#00CCBB',
          dark: '#006a61',
          container: '#5cfae7',
        },
        tertiary: {
          DEFAULT: '#FFB800',
          dark: '#795600',
          container: '#986d00',
        },
        danger: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '0.5rem',
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
      },
      backdropBlur: {
        xs: '4px',
        glass: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(46, 123, 255, 0.08)',
        'glass-lg': '0 20px 48px rgba(46, 123, 255, 0.14)',
        glow: '0 0 0 1px rgba(46, 123, 255, 0.15), 0 8px 24px rgba(46, 123, 255, 0.18)',
      },
      backgroundImage: {
        'lumina-gradient':
          'radial-gradient(circle at 15% 20%, rgba(46,123,255,0.14), transparent 45%), radial-gradient(circle at 85% 15%, rgba(0,204,187,0.14), transparent 40%), radial-gradient(circle at 50% 90%, rgba(46,123,255,0.10), transparent 45%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-120%) skewX(-20deg)' },
          '100%': { transform: 'translateX(220%) skewX(-20deg)' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        shine: 'shine 1.1s ease forwards',
      },
    },
  },
  plugins: [],
};
