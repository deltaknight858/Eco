/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'eco-dark': '#0A0A0F',
        'eco-panel': '#14141A',
        'eco-text': '#F5F5F7',
        'eco-muted': '#9CA3AF',
        // Refined brand palette with proper eco namespace
        eco: {
          purple: 'var(--eco-primary-purple)',
          cyan: 'var(--eco-secondary-cyan)',
          orange: 'var(--eco-contrast-orange)',
          gold: 'var(--eco-prestige-gold)',
        },
        // Individual color utilities for direct use
        'eco-primary-purple': '#8E43CC',
        'eco-secondary-cyan': '#00E6C4',
        'eco-contrast-orange': '#FF5A1F',
        'eco-prestige-gold': '#FFD447',
        // Legacy colors
        'eco-cyan': '#00F5FF',
        'eco-violet': '#9D4DFF',
        'eco-magenta': '#FF2ED1',
        'eco-gold': '#FFD700',
      },
      fontFamily: {
        heading: ['var(--font-orbitron)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        'eco-cyan': '0 0 24px rgba(0, 245, 255, 0.25)',
        'eco-violet': '0 0 24px rgba(157, 77, 255, 0.25)',
        'eco-magenta': '0 0 24px rgba(255, 46, 209, 0.25)',
        'eco-purple': '0 0 24px rgba(142, 67, 204, 0.25)',
        'eco-orange': '0 0 24px rgba(255, 90, 31, 0.25)',
      },
    },
  },
  plugins: [],
}