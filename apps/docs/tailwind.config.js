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
        'eco-cyan': '#00F5FF',
        'eco-violet': '#9D4DFF',
        'eco-magenta': '#FF2ED1',
        'eco-gold': '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'eco-cyan': '0 0 24px rgba(0, 245, 255, 0.25)',
        'eco-violet': '0 0 24px rgba(157, 77, 255, 0.25)',
        'eco-magenta': '0 0 24px rgba(255, 46, 209, 0.25)',
      },
    },
  },
  plugins: [],
}