import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#151a18',        // page background (deep charcoal-green)
        board: '#1f2b26',
        line: '#2c3833',
        copper: { DEFAULT: '#c98b5b', light: '#e2b48c', dark: '#9a6440' },
        paper: '#ece8df',      // off-white text
        mute: '#8f9a94',
        mint: '#9fd3bd',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
