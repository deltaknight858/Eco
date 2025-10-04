// Local UI-facing Pathways types shared by Shell components

export type ProvenanceTier = 'bronze' | 'silver' | 'gold'

export interface ProvenanceContext {
  userId: string
  sessionId?: string
  tier: ProvenanceTier
  timestamp: string
  metadata?: Record<string, any>
}

export interface PathwayMilestone {
  step: string
  title: string
  tier: ProvenanceTier
  description?: string
}

export interface TierRequirement {
  id: string
  description: string
  tier: ProvenanceTier
  validator: string
}

export interface ValidationRule {
  id: string
  description: string
  validator: string
  required?: boolean
}

export interface ArtifactDefinition {
  id: string
  name: string
  type: string
  description: string
  required: boolean
}

export interface PathwayStep {
  id: string
  title: string
  description: string
  type: 'input' | 'action' | 'validation' | 'decision' | 'ai-assisted'
  provenanceTier: ProvenanceTier
  tierRequirements?: TierRequirement[]
  artifacts?: ArtifactDefinition[]
  component?: string
  props?: Record<string, any>
  validation?: ValidationRule[]
  nextSteps?: string[]
  conditionalFlow?: Array<{ condition: string; nextStep: string }>
  skipConditions?: Array<{ condition: string; reason: string }>
  aiSuggestions?: boolean
  autoCompletion?: boolean
  intelligentValidation?: boolean
  estimatedDuration?: number
  resources?: Array<{ title: string; type: string; url: string }>
  requirements?: Array<{ id: string; description: string; completed?: boolean }>
  enhancedFeatures?: boolean
}

export interface PathwayDefinition {
  id: string
  title: string
  description: string
  category: 'capsule' | 'contributor' | 'orchestration' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  steps: PathwayStep[]
  milestones?: PathwayMilestone[]
  prerequisites: string[]
  outcomes: string[]
  provenanceMapping?: Record<string, any>
  configurable?: boolean
  variants?: any[]
  personalizable?: boolean
  aiAssisted?: boolean
  suggestionsEnabled?: boolean
  autoValidation?: boolean
  progress?: {
    currentStep: number
    completedSteps: number[]
    totalProgress: number
    estimatedTimeRemaining?: number
  }
  collaboration?: {
    activeUsers: Array<{
      id: string
      name: string
      avatar: string
      status: string
      currentStep?: number
    }>
    sharedResources?: string[]
    recentActivity?: Array<{ user: string; action: string; target: string; timestamp: string }>
    liveChat?: boolean
    sharedScreen?: boolean
  }
}

export interface PathwaySuggestion {
  id: string
  title: string
  description: string
  icon: string
  category: 'capsule' | 'contributor' | 'orchestration' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  recommendedTier: ProvenanceTier
  priority: number
  capsuleId?: string
  agentIds?: string[]
}

export interface UserContext {
  userId: string
  tier: ProvenanceTier
  completedPathways: number
  currentPage: string
  timeOnCurrentPage: number
  lastActivity: string
  skills: string[]
  preferences: Record<string, unknown>
  requestedGuidance: boolean
  showHints: boolean
}

