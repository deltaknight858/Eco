import { HaloCard, HaloBadge } from '@eco/halo-components'

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
    <h3 className="text-xl font-bold text-primary-400">{title}</h3>
    <p className="text-sm text-white mt-2">{description}</p>
    <div className="mt-4">
      <HaloBadge variant="primary" className={`tier-${tier}`}>
        {tier.toUpperCase()}
      </HaloBadge>
    </div>
  </HaloCard>
)