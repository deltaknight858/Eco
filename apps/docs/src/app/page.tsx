import Link from 'next/link'
import { DocsHeader } from '../components/DocsHeader'

const sections = [
  { title: 'Guides', slug: 'guides/getting-started', description: 'Get started with Eco and learn the basics' },
  { title: 'Architecture', slug: 'architecture/overview', description: 'System design and component relationships' },
  { title: 'Agents', slug: 'agents/overview', description: 'Specialized workers and their capabilities' },
  { title: 'Brand', slug: 'brand/halo-ui', description: 'Design system and visual identity' },
  { title: 'Capsules', slug: 'capsules/overview', description: 'Modular application components' },
  { title: 'Workflows', slug: 'workflows/overview', description: 'Standardized processes and procedures' },
  { title: 'Engineering', slug: 'engineering/coding-standards', description: 'Technical standards and practices' },
  { title: 'Business', slug: 'business/monetization', description: 'Business model and strategy' },
  { title: 'Diagrams', slug: 'diagrams/system-architecture', description: 'Visual system representations' },
  { title: 'Reference', slug: 'reference/api', description: 'API documentation and type definitions' },
]

export default function DocsIndex() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <DocsHeader />

      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map(({ title, slug, description }) => (
          <Link
            key={slug}
            href={`/${slug}`}
            className="block p-6 glass-panel rounded-lg hover:bg-eco-contrast-orange hover:text-black transition-all duration-300 group"
          >
            <h3 className="text-xl font-semibold mb-2 text-eco-contrast-orange group-hover:text-black">
              {title}
            </h3>
            <p className="text-eco-muted text-sm group-hover:text-black/70">
              {description}
            </p>
            <div className="mt-3 text-eco-contrast-orange group-hover:text-black font-mono text-sm">
              Read more →
            </div>
          </Link>
        ))}
      </section>

      <footer className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel rounded-full">
          <div className="w-2 h-2 bg-eco-prestige-gold rounded-full animate-pulse"></div>
          <span className="text-eco-prestige-gold font-mono text-sm">
            Provenance Sealed · {new Date().toLocaleDateString()}
          </span>
        </div>
      </footer>
    </main>
  )
}