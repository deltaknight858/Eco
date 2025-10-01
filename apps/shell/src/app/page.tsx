import { Shell } from '@/components/Shell'

export default function HomePage() {
  return (
    <Shell>
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-eco-accent mb-4">
          Welcome to Eco Shell
        </h1>
        <p className="text-eco-text-secondary max-w-2xl mx-auto">
          The provenance application shell for the Eco ecosystem.
        </p>
      </div>
    </Shell>
  )
}