import {type Config} from 'tailwindcss';

const config: Config = {
  content: [
    './public/**/*.html',
    './src/**/*.{astro,js,jsx,svelte,ts,tsx,vue}',
  ],
  theme: {
    colors: {
      'bg-primary': '#06080A',
      'bg-secondary': '#333333',
      'bg-tertiary': '#1A1A1A',
      'bg-surface': '#0B0F12',
      'bg-card': '#0F1418',
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
      'color-subtitle': '#6EB5F7',
      'color-case-title': '#CFE6FC',
      'color-description': '#CCCCCC',
      'color-success': '#52E078',
      'color-blue-50': '#0C81ED',
      'color-gray-50': '#808080',
      'color-gray-100': '#000000',
      'accent-blue': '#3890C2',
      'accent-cyan': '#2CBDDA',
      'accent-green': '#22A06B',
      'text-secondary': '#AEB8C0',
      'text-muted': '#76828B',
    },
    fontFamily: {
      sans: ['Public Sans', 'sans-serif'],
      serif: ['Fraunces', 'serif'],
    },
    fontSize: {
      h1: '56px',
      h2: '48px',
      h3: '40px',
      h4: '32px',
      h24: '24px',
      h5: '18px',
      h6: '16px',
      h7: '14px',
      h8: '12px',
    },
    screens: {
      sm: '310px',
      md: '640px',
      lg: '1024px',
      xl: '1440px',
      '2xl': '1920px',
    },
  },
};

export default config;
