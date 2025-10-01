import { ReactNode } from 'react'
import { HaloAlert } from '@eco/halo-components'

interface ProvenanceNoteProps {
  children: ReactNode
}

export const ProvenanceNote = ({ children }: ProvenanceNoteProps) => (
  <HaloAlert 
    variant="info"
    className="my-6"
    style={{ 
      borderColor: '#FFD447', 
      backgroundColor: 'rgba(255, 212, 71, 0.1)', 
      color: '#FFD447' 
    }}
  >
    <strong>Provenance Note:</strong> {children}
  </HaloAlert>
)