import type { MDXComponents } from 'mdx/types'
import { ProvenanceNote } from './src/components/ProvenanceNote'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ProvenanceNote,
  }
}