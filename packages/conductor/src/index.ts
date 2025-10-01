/**
 * @eco/conductor - Agentic Orchestration Service
 * 
 * Main entry point for the Eco Conductor package.
 * Provides orchestration, limitations, and provenance for AI agents.
 */

// Core services
export { ConductorService } from './services/ConductorService'
export { ProvenanceService } from './services/ProvenanceService'

// Agent limitations
export { 
  agentLimitations, 
  tierLimitations, 
  canUserAccessAgent, 
  getEffectiveLimitations 
} from './limitations/agentLimitations'

// Types
export type {
  AgentType,
  UserTier,
  AgentContext,
  AgentLimitations,
  AssistRequest,
  AssistResponse,
  ProvenanceStamp,
  AppliedLimitations,
  AgentCapability,
  AgentSession,
  Agent,
  AgentMessage,
  AgentResponse,
  ConductorConfig
} from './types/AssistTypes'

// Convenience factory
export function createConductor() {
  const { ConductorService } = require('./services/ConductorService')
  return new ConductorService()
}