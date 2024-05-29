import {type Config} from 'tailwindcss';

const config: Config = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  theme: {
    colors: {
      'bg-primary': '#000000',
      'bg-secondary': '#333333',
      'bg-price': '#FFFFFF',
      'btn-main': {
        'normal-bg': '#0C81ED',
        'hover-bg': '#3D9DF5',
        'active-bg': '#0A6AC2',
        color: '#FFFFFF',
      },
      'btn-link': {
        'normal-bg': 'transparent',
        'hover-bg': '#333333',
        'active-bg': '#4D4D4D',
        color: '#FFFFFF',
      },
      'color-main': '#FFFFFF',
      'text-dark': '#000000',
      'text-description': '#828282',
      'input-border': '#E0E0E0',
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      serif: ['Inter', 'serif'],
    },
    fontSize: {
      h1: '56px',
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
      md: '640px',
      lg: '1024px',
      xl: '1440px',
      '2xl': '1920px',
    },
  },
};

export default config;
