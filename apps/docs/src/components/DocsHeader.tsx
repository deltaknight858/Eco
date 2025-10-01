import Link from 'next/link'
import { HaloButton } from '@eco/halo-components'

export const DocsHeader = () => (
  <header className="text-center py-8">
    <h1 className="text-4xl font-bold text-[var(--eco-secondary-cyan)] eco-glow-cyan">
      Eco Documentation
    </h1>
    <p className="mt-2 text-lg text-[var(--eco-primary-purple)] eco-glow-purple">
      Welcome to the Eco ecosystem manual
    </p>
    <HaloButton variant="primary" size="lg" className="mt-6" asChild>
      <Link href="/guides/getting-started">
        Get Started →
      </Link>
    </HaloButton>
  </header>
)