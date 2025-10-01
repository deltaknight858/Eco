import { HaloCard } from '@eco/halo-components'
import { Badge } from '../../../shell/src/components/Badge'

interface MarketplaceCardProps {
  title: string
  description: string
  tier: 'bronze' | 'silver' | 'gold'
}

export const MarketplaceCard = ({ title, description, tier }: MarketplaceCardProps) => (
  <HaloCard 
    variant="glass" 
    glow="primary"
    className="transition-all duration-200 hover:shadow-lg"
  >
    <h3 className="text-xl font-bold" style={{ color: '#00E6C4' }}>{title}</h3>
    <p className="text-sm text-white mt-2">{description}</p>
    <div className="mt-4">
      <Badge tier={tier} label={tier.toUpperCase()} />
    </div>
  </HaloCard>
)