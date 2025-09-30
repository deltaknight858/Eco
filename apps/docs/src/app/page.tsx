export default function DocsIndex() {
  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold" style={{ color: '#00E6C4' }}>
          Eco Documentation
        </h1>
        <p className="mt-2 text-lg" style={{ color: '#8E43CC' }}>
          Welcome to the Eco ecosystem manual
        </p>
        <a
          href="/guides/getting-started"
          className="inline-block mt-6 px-6 py-3 rounded-lg font-bold transition-opacity duration-200"
          style={{ backgroundColor: '#FF5A1F', color: 'black' }}
        >
          Get Started →
        </a>
      </header>

      <section className="mt-12 space-y-6">
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(10, 10, 15, 0.7)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#FF5A1F' }}>
            Guides
          </h3>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Get started with Eco and learn the basics
          </p>
        </div>
        
        <div className="p-6 rounded-lg border" style={{ backgroundColor: 'rgba(10, 10, 15, 0.7)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#FF5A1F' }}>
            Architecture
          </h3>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            System design and component relationships
          </p>
        </div>
      </section>

      <footer className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style={{ backgroundColor: 'rgba(10, 10, 15, 0.7)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFD447' }}></div>
          <span className="text-sm" style={{ color: '#FFD447', fontFamily: 'monospace' }}>
            Provenance Sealed · {new Date().toLocaleDateString()}
          </span>
        </div>
      </footer>
    </main>
  )
}