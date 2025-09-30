import React, { ReactNode } from 'react'
import { Nav } from './Nav'
import { ProvenanceFooter } from './ProvenanceFooter'

type ShellProps = {
  children: ReactNode
}

export const Shell = ({ children }: ShellProps): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col bg-eco-dark text-eco-text">
      {/* Branding watermark / particle field */}
      <div className="absolute inset-0 -z-10 bg-eco-particles" />

      {/* Navigation */}
      <Nav />

      {/* Main content slot */}
      <main className="flex-1 p-6 glass-panel">
        {children}
      </main>

      {/* Provenance footer */}
      <ProvenanceFooter />
    </div>
  )
}

export default Shell