import { MarketplaceCard } from '../../../components/MarketplaceCard'
import { ProvenanceNote } from '../../../components/ProvenanceNote'
import { Badge } from '../../../../../shell/src/components/Badge'

export default function MarketplacePage() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-teal-300">
          Eco Marketplace
        </h1>
        <p className="mt-2 text-lg text-purple-400">
          Discover, share, and trade AI agents, capsules, and Power Pages
        </p>
      </header>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-orange-400">
          Marketplace Tiers
        </h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Badge tier="bronze" label="BRONZE" />
            <span>Entry‑level contributions and emerging creators</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge tier="silver" label="SILVER" />
            <span>Trusted contributors with proven track records</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge tier="gold" label="GOLD" />
            <span>Premium, provenance‑sealed capsules and elite creators</span>
          </div>
        </div>

        <ProvenanceNote>
          Gold badges are reserved for contributors and capsules that meet provenance and premium standards. Every gold-tier item undergoes rigorous quality and security review.
        </ProvenanceNote>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-orange-400">
          Featured Marketplace Items
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MarketplaceCard
            title="AI Code Assistant"
            description="Advanced code generation and refactoring agent with provenance tracking"
            tier="gold"
          />
          <MarketplaceCard
            title="Data Visualization Kit"
            description="React components for creating interactive charts and dashboards"
            tier="silver"
          />
          <MarketplaceCard
            title="API Documentation Generator"
            description="Automatically generate beautiful API docs from your codebase"
            tier="bronze"
          />
          <MarketplaceCard
            title="ML Model Optimizer"
            description="Performance optimization suite for machine learning models"
            tier="gold"
          />
          <MarketplaceCard
            title="UI Component Library"
            description="Modern React components with accessibility and theming support"
            tier="silver"
          />
          <MarketplaceCard
            title="Testing Framework"
            description="Simplified testing utilities for JavaScript applications"
            tier="bronze"
          />
        </div>
      </section>

      <footer className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-slate-900/80">
          <div className="w-2 h-2 rounded-full bg-amber-300"></div>
          <span className="text-sm text-amber-300 font-mono">
            Marketplace Provenance Sealed · {new Date().toLocaleDateString()}
          </span>
        </div>
      </footer>
    </main>
  )
}