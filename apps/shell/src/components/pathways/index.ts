/**
 * Pathways System - Complete Export Index
 * "Gandalf of the Eco Ecosystem"
 * 
 * Provides guided journey navigation with cinematic UI, 
 * provenance awareness, and AI-enhanced guidance.
 */

import React from 'react'
// Import components locally for usage within this module (default export, helpers)
import { PathwaysWizard } from './PathwaysWizard'
import { PathwaysLauncher, defaultPathwaySuggestions } from './PathwaysLauncher'
import { PathwaysPanel } from './PathwaysPanel'
import { PathwaysIntegration } from './PathwaysIntegration'
// Import types locally when referenced in this module
import type { ProvenanceTier } from '../../types/pathways'

// Core Components (re-export)
export { PathwaysWizard } from './PathwaysWizard'
export { PathwaysLauncher, defaultPathwaySuggestions } from './PathwaysLauncher'
export { PathwaysPanel } from './PathwaysPanel'
export { PathwaysIntegration } from './PathwaysIntegration'

// Re-export types for convenience
export type {
  PathwayDefinition,
  PathwayStep,
  PathwaySuggestion,
  UserContext,
  ProvenanceTier,
  ProvenanceContext
} from '../../types/pathways'

/**
 * Quick Start Helper
 * 
 * @example
 * ```tsx
 * import { quickStartPathways } from '@/components/pathways'
 * 
 * function App() {
 *   return (
 *     <div>
 *       {quickStartPathways({
 *         tier: 'bronze',
 *         enableAI: true,
 *         enableCollaboration: true
 *       })}
 *     </div>
 *   )
 * }
 * ```
 */
export function quickStartPathways(config: {
  userId: string
  tier: ProvenanceTier
  className?: string
}): React.ReactElement<any> {
  return React.createElement(PathwaysIntegration as any, {
    userId: config.userId,
    tier: config.tier,
    className: config.className
  })
}

/**
 * Version Information
 */
export const PATHWAYS_VERSION = '1.0.0'

// Default export for convenience
export default ({
  PathwaysIntegration,
  PathwaysWizard,
  PathwaysLauncher,
  PathwaysPanel,
  quickStartPathways,
  PATHWAYS_VERSION
} as any)