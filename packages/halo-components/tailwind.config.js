/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.tsx",
    "./stories/**/*.{js,ts,jsx,tsx,mdx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eco-primary-purple': '#8E43CC',
        'eco-secondary-cyan': '#00E6C4',
        'eco-contrast-orange': '#FF5A1F',
        'eco-prestige-gold': '#FFD447',
        'halo-cyan': '#00F5FF',
        'halo-violet': '#9D4DFF',
        'halo-magenta': '#FF2ED1',
        'halo-gold': '#FFD700',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}