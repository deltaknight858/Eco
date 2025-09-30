import { DocsHeader } from '../components/DocsHeader'

export default function DocsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <DocsHeader />

      <main className="space-y-8">
        <section className="glass-panel p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-eco-violet mb-4">
            Getting Started
          </h2>
          <p className="text-eco-text mb-4">
            Eco is a comprehensive ecosystem that includes a shell interface, tracking capabilities, 
            and marketplace functionality for the OurSynth platform.
          </p>
          <ul className="list-disc list-inside space-y-2 text-eco-muted">
            <li>Shell: Core interface and navigation</li>
            <li>Tracker: Resource and activity tracking</li>
            <li>Marketplace: Plugin and extension marketplace</li>
            <li>Studio: Development environment</li>
          </ul>
        </section>

        <section className="glass-panel p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-eco-magenta mb-4">
            Core Tokens
          </h2>
          <p className="text-eco-text mb-4">
            The design system is built on a foundation of core tokens that define colors, typography, and effects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-eco-gold mb-2">Brand Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-eco-cyan rounded eco-glow-cyan"></div>
                  <span className="font-mono text-sm">Cyan #00F5FF</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-eco-violet rounded eco-glow-violet"></div>
                  <span className="font-mono text-sm">Violet #9D4DFF</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-eco-magenta rounded eco-glow-magenta"></div>
                  <span className="font-mono text-sm">Magenta #FF2ED1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-eco-gold rounded"></div>
                  <span className="font-mono text-sm">Gold #FFD700</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-eco-gold mb-2">Typography</h3>
              <div className="space-y-2">
                <p className="font-sans">Inter - Primary font</p>
                <p className="font-mono">JetBrains Mono - Code font</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}