import {type Config} from 'tailwindcss';

const config: Config = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  theme: {
    colors: {
      'bg-primary': '#000000',
      'bg-secondary': '#2B313B',
      'bg-price': '#FFFFFF',
      'btn-main': {
        normal: {
          bg: '#0C81ED',
          color: '#FFFFFF',
        },
        disabled: {
          bg: '#AECCF9',
          color: '#FFFFFF',
        },
      },
      'btn-link': {
        normal: {
          bg: 'transparent',
          color: '#FFFFFF',
        },
        disabled: {
          bg: 'transparent',
          color: '#FFFFFF',
        },
      },
      'text-main': '#FFFFFF',
      'text-dark': '#000000',
      'text-description': '#828282',
      'input-border': '#E0E0E0',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Inter', 'serif'],
    },
    fontSize: {
      h1: '64px',
      h2: '40px',
      h3: '32px',
      h4: '24px',
      h5: '20px',
      h6: '16px',
      h7: '14px',
      h8: '12px',
    },
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
};

export default config;
