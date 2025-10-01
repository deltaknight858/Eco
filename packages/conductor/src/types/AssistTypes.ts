/**
 * Core types for Eco Agentic System
 * Based on V.I.B.E/packages/agents/src/IAgent.ts
 */

export type AgentType = "codegen" | "mindmap" | "docs" | "analyzer" | "orchestrator"

export type UserTier = "bronze" | "silver" | "gold" | "platinum"

export interface AgentContext {
  userId: string
  sessionId: string
  workspaceId?: string
  currentFile?: string
  selectedText?: string
  projectContext?: {
    framework: string
    language: string
    packageManager: string
  }
}

export interface AgentLimitations {
  permissions: string[]
  restrictions: string[]
  maxExecutionTime: number
  maxOutputSize: number
  rateLimitPerHour: number
  tierRequired: UserTier
}

export interface AssistRequest {
  requestId: string
  agent: AgentType
  input: string
  context: AgentContext
  timestamp: number
  userTier: UserTier
}

export interface AssistResponse {
  requestId: string
  agent: AgentType
  output: string | object
  provenance: ProvenanceStamp
  limitations: AppliedLimitations
  executionTime: number
  success: boolean
  error?: string
}

export interface ProvenanceStamp {
  stampedAt: string
  requestId: string
  agent: AgentType
  tier: UserTier
  executionTime: number
  inputHash: string
  outputHash: string
  cost?: number
  metadata: Record<string, unknown>
}

export interface AppliedLimitations {
  permissions: string[]
  restrictions: string[]
  timeoutApplied: boolean
  outputTruncated: boolean
  rateLimited: boolean
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  category: "intelligence" | "workflow" | "packaging" | "design" | "observability"
  status: "MVP" | "PLANNED" | "EXPERIMENTAL"
  monetization: {
    tier: UserTier
    costPerRequest?: number
    costPerOutput?: number
  }
  limitations: AgentLimitations
}

export interface AgentSession {
  sessionId: string
  userId: string
  agent: AgentType
  startedAt: number
  lastActivity: number
  messageHistory: AssistRequest[]
  context: AgentContext
  isActive: boolean
}