import type { MDXComponents } from 'mdx/types'
import { ProvenanceNote } from './src/components/ProvenanceNote'
import { Badge } from '../shell/src/components/Badge'
import { MarketplaceCard } from './src/components/MarketplaceCard'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ProvenanceNote,
    Badge,
    MarketplaceCard,
  }
}