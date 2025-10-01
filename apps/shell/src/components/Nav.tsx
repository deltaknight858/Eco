import { HaloButton } from '@eco/halo-components'

export const Nav = () => (
  <nav className="flex items-center gap-4 p-4 border-b border-eco-cyan">
    <span className="font-bold text-eco-cyan">Eco</span>
    <HaloButton variant="ghost" size="sm" asChild>
      <a href="/docs">Docs</a>
    </HaloButton>
    <HaloButton variant="ghost" size="sm" asChild>
      <a href="/tracker">Tracker</a>
    </HaloButton>
    <HaloButton variant="ghost" size="sm" asChild>
      <a href="/marketplace">Marketplace</a>
    </HaloButton>
    <HaloButton variant="ghost" size="sm" asChild>
      <a href="/studio">Studio</a>
    </HaloButton>
  </nav>
)