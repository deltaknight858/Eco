/**
 * Provenance Utilities for Halo-UI Components
 * Embeds Eco's provenance DNA into the design system
 */

export type ProvenanceTier = 'bronze' | 'silver' | 'gold'
export type ProvenanceStep = 'Created' | 'Reviewed' | 'Verified'

/**
 * Get the color scheme for a provenance tier
 */
export function getProvenanceColor(tier: ProvenanceTier) {
  const colors = {
    bronze: {
      primary: '#CD7F32',
      gradient: 'from-amber-600 to-amber-700',
      glow: 'shadow-amber-500/30',
      border: 'border-amber-500/40',
      text: 'text-amber-200'
    },
    silver: {
      primary: '#C0C0C0', 
      gradient: 'from-slate-400 to-slate-500',
      glow: 'shadow-slate-400/30',
      border: 'border-slate-400/40',
      text: 'text-slate-200'
    },
    gold: {
      primary: '#FFD447', // eco-prestige-gold
      gradient: 'from-yellow-400 to-yellow-500',
      glow: 'shadow-yellow-400/50 shadow-lg',
      border: 'border-yellow-400/60',
      text: 'text-yellow-100'
    }
  }
  
  return colors[tier]
}

/**
 * Get provenance step configuration
 */
export function getProvenanceSteps(): Array<{ 
  step: ProvenanceStep
  icon: string
  description: string 
}> {
  return [
    {
      step: 'Created',
      icon: '✨',
      description: 'Initial contribution created'
    },
    {
      step: 'Reviewed', 
      icon: '👁️',
      description: 'Peer review completed'
    },
    {
      step: 'Verified',
      icon: '🛡️', 
      description: 'Provenance verified'
    }
  ]
}

/**
 * Stamp component with provenance metadata for debugging/logging
 */
export function stampProvenance(componentName: string, tier?: ProvenanceTier) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`🛡️ Provenance: ${componentName}${tier ? ` (${tier} tier)` : ''} - Eco DNA embedded`)
  }
  
  return {
    'data-provenance': 'eco-verified',
    'data-component': componentName,
    ...(tier && { 'data-tier': tier })
  }
}