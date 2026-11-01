/** @type {import('tailwindcss').Config} */

// ---------------------------------------------------------------------------
// CareLink design tokens
//
// Colours are exposed as *semantic* tokens that read CSS variables defined in
// src/index.css (one set for light, one for dark). Components therefore use
// `bg-surface text-fg border-line` and automatically follow the active theme,
// instead of repeating `bg-white dark:bg-slate-900` pairs everywhere.
//
//   canvas   page background            fg        primary text
//   surface  cards / panels             muted     secondary text
//   surface-2 inputs / subtle fills     subtle    tertiary text / placeholders
//   line     borders & dividers
//
// Brand: Neon Emerald #00D995 (brand) + Teal #00BFA5 (accent).
// ---------------------------------------------------------------------------

const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

const brand = {
  50: '#E8FFF7',
  100: '#C6FFEA',
  200: '#92FBD3',
  300: '#55F0BA',
  400: '#1FE3A3',
  500: '#00D995', // Neon Emerald
  600: '#00A874',
  700: '#007552',
  800: '#005C41',
  900: '#003F2E',
  950: '#002219',
  DEFAULT: '#00D995',
  text: token('brand-text'), // readable brand colour for text in both themes
};

const accent = {
  50: '#E6FBF8',
  100: '#C0F5EE',
  200: '#86EADD',
  300: '#4DDDCB',
  400: '#22CDB9',
  500: '#00BFA5', // Teal
  600: '#008577',
  700: '#00695F',
  800: '#004F48',
  900: '#00352F',
  950: '#001F1B',
  DEFAULT: '#00BFA5',
};

// Green-tinted neutral scale (used for fixed dark surfaces such as text-on-brand)
const ink = {
  50: '#F3F8F7',
  100: '#E8F1EF',
  200: '#D3E0DD',
  300: '#B3C7C3',
  400: '#8BA39F',
  500: '#657F7B',
  600: '#4A6360',
  700: '#2F4443',
  800: '#1C2929',
  900: '#101A1B',
  950: '#050B0B',
};

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        fg: token('fg'),
        muted: token('fg-muted'),
        subtle: token('fg-subtle'),
        brand,
        accent,
        ink,
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.12)',
        lift: '0 2px 4px rgb(0 0 0 / 0.05), 0 16px 40px -16px rgb(0 0 0 / 0.25)',
        glow: '0 0 24px rgba(0, 217, 149, 0.25)',
        'glow-lg': '0 0 48px rgba(0, 217, 149, 0.30)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(4px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'toast-in': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
        'slide-up': 'slide-up 0.35s ease-out both',
        'pop-in': 'pop-in 0.2s ease-out both',
        'toast-in': 'toast-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
};
