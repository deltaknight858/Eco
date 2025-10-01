import { Badge } from '../../../shell/src/components/Badge'

interface MarketplaceCardProps {
  title: string
  description: string
  tier: 'bronze' | 'silver' | 'gold'
}

export const MarketplaceCard = ({ title, description, tier }: MarketplaceCardProps) => (
  <div className="p-6 rounded-lg border transition-all duration-200 hover:shadow-lg" 
       style={{ 
         backgroundColor: 'rgba(142, 67, 204, 0.2)', 
         borderColor: 'rgba(142, 67, 204, 0.3)' 
       }}>
    <h3 className="text-xl font-bold" style={{ color: '#00E6C4' }}>{title}</h3>
    <p className="text-sm text-white mt-2">{description}</p>
    <div className="mt-4">
      <Badge tier={tier} label={tier.toUpperCase()} />
    </div>
  </div>
)