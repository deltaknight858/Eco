interface BadgeProps {
  tier: 'bronze' | 'silver' | 'gold'
  label: string
}

const tierStyles = {
  bronze: 'bg-gradient-to-r from-[#cd7f32] to-[#a97142] text-white',
  silver: 'bg-gradient-to-r from-[#c0c0c0] to-[#a9a9a9] text-black',
  gold: 'bg-gradient-to-r from-[var(--eco-prestige-gold)] to-[#e6b800] text-black',
}

export const Badge = ({ tier, label }: BadgeProps) => (
  <span
    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tierStyles[tier]}`}
  >
    {label}
  </span>
)