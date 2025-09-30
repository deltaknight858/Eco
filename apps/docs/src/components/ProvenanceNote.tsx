import { ReactNode } from 'react'

interface ProvenanceNoteProps {
  children: ReactNode
}

export const ProvenanceNote = ({ children }: ProvenanceNoteProps) => (
  <div className="border-l-4 border-eco-prestige-gold bg-eco-primary-purple/10 p-4 my-6 text-eco-prestige-gold">
    <strong>Provenance Note:</strong> {children}
  </div>
)