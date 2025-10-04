import type { Metadata } from 'next'
import '@eco/core-tokens/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Eco Shell - Agentic Orchestration Interface',
  description: 'The primary interface for the Eco agentic ecosystem',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}