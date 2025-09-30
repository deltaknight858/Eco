export const colors = {
  surface: {
    darkGlass: 'rgba(10, 10, 15, 0.7)',
    lightGlass: 'rgba(245, 245, 250, 0.6)',
    frosted: 'rgba(255, 255, 255, 0.08)',
  },
  brand: {
    cyan: '#00F5FF',
    violet: '#9D4DFF',
    magenta: '#FF2ED1',
    gold: '#FFD700',
  },
  background: {
    deepSpace: '#0A0A0F',
    panel: '#14141A',
  },
  text: {
    primary: '#F5F5F7',
    muted: '#9CA3AF',
    provenance: '#00F5FF',
  },
}

export const fonts = {
  sans: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
}

export const effects = {
  glowCyan: '0 0 24px rgba(0, 245, 255, 0.25)',
  glowViolet: '0 0 24px rgba(157, 77, 255, 0.25)',
  glowMagenta: '0 0 24px rgba(255, 46, 209, 0.25)',
}

export const provenance = {
  seal: {
    color: colors.text.provenance,
    font: fonts.mono,
    glow: effects.glowCyan,
  },
  footer: {
    background: colors.surface.darkGlass,
    border: colors.brand.violet,
  },
}