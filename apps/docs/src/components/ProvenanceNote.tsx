import { ReactNode } from 'react'

interface ProvenanceNoteProps {
  children: ReactNode
}

export const ProvenanceNote = ({ children }: ProvenanceNoteProps) => (
  <div 
    className="border-l-4 p-4 my-6 rounded-r-lg" 
    style={{ 
      borderColor: '#FFD447', 
      backgroundColor: 'rgba(255, 212, 71, 0.1)', 
      color: '#FFD447' 
    }}
  >
    <strong>Provenance Note:</strong> {children}
  </div>
)