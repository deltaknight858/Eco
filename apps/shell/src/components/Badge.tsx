import { HaloBadge } from '../../../node_modules/@eco/halo-ui'

interface BadgeProps {
  tier: 'bronze' | 'silver' | 'gold'
  label: string
}

const tierVariants = {
  bronze: 'secondary' as const,
  silver: 'outline' as const,
  gold: 'primary' as const,
}

const tierColors = {
  bronze: '#cd7f32',
  silver: '#c0c0c0', 
  gold: 'var(--eco-prestige-gold)',
}

export const Badge = ({ tier, label }: BadgeProps) => (
  <HaloBadge 
    variant={tierVariants[tier]}
    style={{ 
      background: tier === 'gold' 
        ? `linear-gradient(to right, ${tierColors[tier]}, #e6b800)`
        : tier === 'bronze'
        ? `linear-gradient(to right, ${tierColors[tier]}, #a97142)`
        : `linear-gradient(to right, ${tierColors[tier]}, #a9a9a9)`,
      color: tier === 'silver' ? 'black' : 'white'
    }}
  >
    {label}
  </HaloBadge>
)