import { ProvenanceNote } from '../../../components/ProvenanceNote'

export default function ContributorFirstHour() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1 style={{ color: '#00E6C4' }}>Contributor First Hour</h1>
      
      <p>Welcome to your first 60 minutes inside <strong>Eco</strong>.<br />
      This guide ensures you can clone, run, and contribute with provenance from the very start.</p>
      
      <hr />
      
      <h2>⏱️ 0–10 min: Setup</h2>
      
      <ul>
        <li>Clone the repo:
          <pre style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <code>{`git clone https://github.com/oursynth/eco.git
cd eco`}</code>
          </pre>
        </li>
        
        <li>Install dependencies:
          <pre style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <code>pnpm install</code>
          </pre>
        </li>
        
        <li>Start the Shell:
          <pre style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <code>pnpm dev --filter @eco/shell</code>
          </pre>
        </li>
      </ul>
      
      <ProvenanceNote>
        Your very first pnpm install is provenance‑stamped by the lockfile. Every contributor shares the same dependency graph.
      </ProvenanceNote>
      
      <h2>⏱️ 10–20 min: Explore the Shell</h2>
      
      <ul>
        <li>Open <code>http://localhost:3000</code></li>
        <li>Navigate through the Eco‑Shell</li>
        <li>Notice the Provenance Footer in gold — every page is sealed.</li>
      </ul>
      
      <ProvenanceNote>
        The Shell is the cinematic frame. Every app, capsule, and doc lives inside it.
      </ProvenanceNote>
      
      <h2>⏱️ 20–40 min: Open the Docs</h2>
      
      <ul>
        <li>Run the Docs app:
          <pre style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <code>pnpm dev --filter @eco/docs</code>
          </pre>
        </li>
        
        <li>Visit <code>http://localhost:3001</code></li>
        <li>Explore the Docs Index Power Page</li>
        <li>Click through Guides, Architecture, Agents.</li>
      </ul>
      
      <ProvenanceNote>
        Docs are Power Pages too. Every .mdx file is provenance‑aware.
      </ProvenanceNote>
      
      <h2>⏱️ 40–55 min: Make Your First Change</h2>
      
      <ul>
        <li>Edit <code>docs/guides/getting-started.mdx</code></li>
        <li>Add a line under "Getting Started"</li>
        <li>Commit with provenance:
          <pre style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
            <code>{`git add docs/guides/getting-started.mdx
git commit -m "docs: personalize getting started guide"
git push origin main`}</code>
          </pre>
        </li>
      </ul>
      
      <ProvenanceNote>
        Every commit is a provenance seal. Your first contribution is now part of Eco's history.
      </ProvenanceNote>
      
      <h2>⏱️ 55–60 min: Celebrate 🎉</h2>
      
      <p>You've:</p>
      <ul>
        <li>✅ Cloned the repo</li>
        <li>✅ Installed dependencies</li>
        <li>✅ Explored the Shell</li>
        <li>✅ Opened the Docs</li>
        <li>✅ Made your first provenance‑sealed commit</li>
      </ul>
      
      <ProvenanceNote>
        Welcome to Eco. You're now a contributor.
      </ProvenanceNote>
    </main>
  )
}