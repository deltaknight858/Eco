import Link from 'next/link'

export const DocsHeader = () => (
  <header className="text-center py-8">
    <h1 className="text-4xl font-bold text-[var(--eco-secondary-cyan)] eco-glow-cyan">
      Eco Documentation
    </h1>
    <p className="mt-2 text-lg text-[var(--eco-primary-purple)] eco-glow-purple">
      Welcome to the Eco ecosystem manual
    </p>
    <Link
      href="/guides/getting-started"
      className="inline-block mt-6 px-6 py-3 rounded-lg bg-eco-contrast-orange text-black font-bold hover:opacity-90 transition-opacity duration-200"
    >
      Get Started →
    </Link>
  </header>
)