import { ProvenanceNote } from '../../../components/ProvenanceNote'

const CODE_BLOCK_CLASSES = 'bg-slate-900/90 p-4 rounded-lg text-sm font-mono border border-white/10'

export default function ContributorFirstHour() {
  return (
    <main className="max-w-4xl mx-auto p-8 prose prose-invert">
      <h1 className="text-teal-300">Contributor First Hour</h1>

      <p>
        Welcome to your first 60 minutes inside <strong>Eco</strong>.<br />
        This guide ensures you can clone, run, and contribute with provenance from the very start.
      </p>

      <hr />

      <h2>⏱️ 0–10 min: Setup</h2>

      <ul>
        <li>
          Clone the repo:
          <pre className={CODE_BLOCK_CLASSES}>
            <code>{`git clone https://github.com/oursynth/eco.git
cd eco`}</code>
          </pre>
        </li>
        <li>
          Install dependencies:
          <pre className={CODE_BLOCK_CLASSES}>
            <code>pnpm install</code>
          </pre>
        </li>
        <li>
          Start the Shell:
          <pre className={CODE_BLOCK_CLASSES}>
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
        <li>
          Run the Docs app:
          <pre className={CODE_BLOCK_CLASSES}>
            <code>pnpm dev --filter @eco/docs</code>
          </pre>
        </li>
        <li>
          Visit <code>http://localhost:3001</code>
        </li>
        <li>Explore the Docs Index Power Page</li>
        <li>Click through Guides, Architecture, Agents.</li>
      </ul>
      
      <ProvenanceNote>
        Docs are Power Pages too. Every .mdx file is provenance‑aware.
      </ProvenanceNote>
      
      <h2>⏱️ 40–55 min: Make Your First Change</h2>
      
      <ul>
        <li>Edit <code>docs/guides/getting-started.mdx</code></li>
        <li>Add a line under &quot;Getting Started&quot;</li>
        <li>
          Commit with provenance:
          <pre className={CODE_BLOCK_CLASSES}>
            <code>{`git add docs/guides/getting-started.mdx
git commit -m "docs: personalize getting started guide"
git push origin main`}</code>
          </pre>
        </li>
      </ul>
      
      <ProvenanceNote>
        Every commit is a provenance seal. Your first contribution is now part of Eco&apos;s history.
      </ProvenanceNote>
      
      <h2>⏱️ 55–60 min: Celebrate 🎉</h2>
      
      <p>You&apos;ve:</p>
      <ul>
        <li>✅ Cloned the repo</li>
        <li>✅ Installed dependencies</li>
        <li>✅ Explored the Shell</li>
        <li>✅ Opened the Docs</li>
        <li>✅ Made your first provenance‑sealed commit</li>
      </ul>
      
      <ProvenanceNote>
        Welcome to Eco. You&apos;re now a contributor.
      </ProvenanceNote>
    </main>
  )
}