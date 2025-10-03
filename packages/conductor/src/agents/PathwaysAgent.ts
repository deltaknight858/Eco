/**
 * PathwaysAgent.ts - The Gandalf of Eco
 * Guided journey navigation and contextual assistance
 */

import { v4 as uuidv4 } from 'uuid'
import type { ProvenanceTier } from '../types/AssistTypes'

// Core Pathways Types
export interface PathwayDefinition {
  id: string
  title: string
  description: string
  category: 'capsule' | 'contributor' | 'orchestration' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number // minutes
  
  steps: PathwayStep[]
  milestones?: PathwayMilestone[]
  prerequisites: string[]
  outcomes: string[]
  
  provenanceMapping: {
    [stepId: string]: {
      tier: ProvenanceTier
      validation: ValidationCriteria
      artifacts: ArtifactDefinition[]
    }
  }
  
  configurable: boolean
  variants: PathwayVariant[]
  personalizable: boolean
  
  aiAssisted: boolean
  suggestionsEnabled: boolean
  autoValidation: boolean
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
  conditionalFlow?: ConditionalFlow[]
  skipConditions?: SkipCondition[]
  
  aiSuggestions?: boolean
  autoCompletion?: boolean
  intelligentValidation?: boolean
}

export interface PathwayMilestone {
  step: string
  title: string
  tier: ProvenanceTier
  description?: string
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
}

export interface UserContext {
  userId: string
  tier: ProvenanceTier
  completedPathways: number
  currentPage: string
  timeOnCurrentPage: number
  lastActivity: string
  skills: string[]
  preferences: Record<string, any>
  requestedGuidance: boolean
  showHints: boolean
}

export interface ProvenanceContext {
  userId: string
  sessionId?: string
  tier: ProvenanceTier
  timestamp: string
  metadata?: Record<string, any>
}

export interface JourneySession {
  id: string
  pathwayId: string
  userId: string
  startedAt: string
  currentStep: number
  stepData: Record<string, any>
  collaborators?: string[]
  status: 'active' | 'paused' | 'completed' | 'abandoned'
}

export interface ValidationCriteria {
  rules: ValidationRule[]
  automatable: boolean
  requiredTier: ProvenanceTier
}

export interface ValidationRule {
  id: string
  description: string
  validator: string
  required: boolean
}

export interface ArtifactDefinition {
  id: string
  name: string
  type: string
  description: string
  required: boolean
}

export interface TierRequirement {
  id: string
  description: string
  tier: ProvenanceTier
  validator: string
}

export interface PathwayVariant {
  id: string
  name: string
  description: string
  modifications: PathwayModification[]
}

export interface PathwayModification {
  stepId: string
  operation: 'add' | 'remove' | 'modify'
  data: any
}

export interface ConditionalFlow {
  condition: string
  nextStep: string
}

export interface SkipCondition {
  condition: string
  reason: string
}

/**
 * Pathways Agent - Core Implementation
 */
export class PathwaysAgent {
  private pathways: Map<string, PathwayDefinition> = new Map()
  private sessions: Map<string, JourneySession> = new Map()
  private userContexts: Map<string, UserContext> = new Map()

  constructor() {
    this.initializeBuiltInPathways()
  }

  // Pathway Discovery
  async discoverPathways(context: UserContext): Promise<PathwaySuggestion[]> {
    const suggestions: PathwaySuggestion[] = []
    
    for (const pathway of this.pathways.values()) {
      const suggestion = await this.evaluatePathwaySuitability(pathway, context)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority)
  }

  async getPathwayDefinition(id: string): Promise<PathwayDefinition | null> {
    return this.pathways.get(id) || null
  }

  async customizePathway(
    id: string, 
    customization: Record<string, any>
  ): Promise<PathwayDefinition | null> {
    const basePathway = this.pathways.get(id)
    if (!basePathway) return null

    // Apply customizations
    const customizedPathway = JSON.parse(JSON.stringify(basePathway))
    customizedPathway.id = uuidv4()
    
    // Apply customization logic here
    return customizedPathway
  }

  // Journey Management
  async startJourney(pathwayId: string, context: UserContext): Promise<JourneySession> {
    const pathway = this.pathways.get(pathwayId)
    if (!pathway) {
      throw new Error(`Pathway ${pathwayId} not found`)
    }

    const session: JourneySession = {
      id: uuidv4(),
      pathwayId,
      userId: context.userId,
      startedAt: new Date().toISOString(),
      currentStep: 0,
      stepData: {},
      status: 'active'
    }

    this.sessions.set(session.id, session)
    return session
  }

  async updateProgress(
    sessionId: string, 
    stepId: string, 
    data: any
  ): Promise<{ updated: boolean; nextStep?: number }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.stepData[stepId] = data
    this.sessions.set(sessionId, session)

    return { updated: true }
  }

  async completeStep(sessionId: string, stepId: string): Promise<{ completed: boolean; nextStep?: number }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const pathway = this.pathways.get(session.pathwayId)
    if (!pathway) {
      throw new Error(`Pathway ${session.pathwayId} not found`)
    }

    const currentStepIndex = pathway.steps.findIndex(step => step.id === stepId)
    if (currentStepIndex === -1) {
      throw new Error(`Step ${stepId} not found`)
    }

    // Advance to next step
    const nextStep = currentStepIndex + 1
    if (nextStep < pathway.steps.length) {
      session.currentStep = nextStep
    } else {
      session.status = 'completed'
    }

    this.sessions.set(sessionId, session)

    return { 
      completed: true, 
      nextStep: nextStep < pathway.steps.length ? nextStep : undefined 
    }
  }

  // Provenance Integration
  async validateStepProvenance(stepId: string, data: any): Promise<{ valid: boolean; tier: ProvenanceTier }> {
    // Mock provenance validation
    const tier: ProvenanceTier = data.complexity > 0.8 ? 'gold' : 
                                 data.complexity > 0.5 ? 'silver' : 'bronze'
    
    return { valid: true, tier }
  }

  async advanceProvenanceTier(sessionId: string): Promise<{ advanced: boolean; newTier: ProvenanceTier }> {
    // Mock tier advancement
    return { advanced: true, newTier: 'silver' }
  }

  async generateProvenanceReport(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    return {
      sessionId,
      pathwayId: session.pathwayId,
      completedSteps: Object.keys(session.stepData).length,
      tier: 'silver',
      timestamp: new Date().toISOString()
    }
  }

  // Collaboration Features
  async shareJourney(sessionId: string, collaborators: string[]): Promise<{ shared: boolean; journeyId: string }> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.collaborators = collaborators
    this.sessions.set(sessionId, session)

    return { shared: true, journeyId: sessionId }
  }

  async joinSharedJourney(journeyId: string, userId: string): Promise<{ joined: boolean }> {
    const session = this.sessions.get(journeyId)
    if (!session) {
      throw new Error(`Journey ${journeyId} not found`)
    }

    if (!session.collaborators) {
      session.collaborators = []
    }

    if (!session.collaborators.includes(userId)) {
      session.collaborators.push(userId)
    }

    this.sessions.set(journeyId, session)
    return { joined: true }
  }

  // Private Helper Methods
  private async evaluatePathwaySuitability(
    pathway: PathwayDefinition, 
    context: UserContext
  ): Promise<PathwaySuggestion | null> {
    // Calculate priority based on user context
    let priority = 50

    // Tier compatibility
    const tierLevel = this.getTierLevel(context.tier)
    const minRequiredTier = Math.min(...pathway.steps.map(step => this.getTierLevel(step.provenanceTier)))
    
    if (tierLevel < minRequiredTier) {
      return null // User doesn't have required tier
    }

    // Adjust priority based on context
    if (context.completedPathways < 3 && pathway.difficulty === 'beginner') {
      priority += 30
    }

    if (context.skills.some(skill => pathway.title.toLowerCase().includes(skill.toLowerCase()))) {
      priority += 20
    }

    if (pathway.category === 'contributor' && context.completedPathways === 0) {
      priority += 40
    }

    return {
      id: pathway.id,
      title: pathway.title,
      description: pathway.description,
      icon: this.getPathwayIcon(pathway.category),
      category: pathway.category,
      difficulty: pathway.difficulty,
      estimatedDuration: pathway.estimatedDuration,
      recommendedTier: this.getRecommendedTier(pathway),
      priority
    }
  }

  private getTierLevel(tier: ProvenanceTier): number {
    switch (tier) {
      case 'bronze': return 1
      case 'silver': return 2
      case 'gold': return 3
      default: return 1
    }
  }

  private getPathwayIcon(category: string): string {
    switch (category) {
      case 'capsule': return '📦'
      case 'contributor': return '🌱'
      case 'orchestration': return '🎼'
      case 'custom': return '⚙️'
      default: return '🧙‍♂️'
    }
  }

  private getRecommendedTier(pathway: PathwayDefinition): ProvenanceTier {
    const maxTier = Math.max(...pathway.steps.map(step => this.getTierLevel(step.provenanceTier)))
    switch (maxTier) {
      case 3: return 'gold'
      case 2: return 'silver'
      default: return 'bronze'
    }
  }

  private initializeBuiltInPathways(): void {
    // Capsule Lifecycle Pathway
    const capsuleLifecyclePathway: PathwayDefinition = {
      id: 'capsule-lifecycle',
      title: 'Capsule Creation Journey',
      description: 'Complete guide from concept to marketplace publication',
      category: 'capsule',
      difficulty: 'intermediate',
      estimatedDuration: 45,
      
      steps: [
        {
          id: 'concept',
          title: 'Define Capsule Concept',
          description: 'Articulate your capsule\'s purpose and scope',
          type: 'input',
          provenanceTier: 'bronze',
          aiSuggestions: true
        },
        {
          id: 'scaffold',
          title: 'Generate Capsule Structure',
          description: 'AI-powered scaffolding based on your concept',
          type: 'ai-assisted',
          provenanceTier: 'bronze',
          autoCompletion: true
        },
        {
          id: 'develop',
          title: 'Develop Capsule Content',
          description: 'Create and refine your capsule\'s functionality',
          type: 'action',
          provenanceTier: 'bronze',
          aiSuggestions: true
        },
        {
          id: 'test',
          title: 'Validate and Test',
          description: 'Comprehensive testing and quality assurance',
          type: 'validation',
          provenanceTier: 'silver',
          intelligentValidation: true
        },
        {
          id: 'sign',
          title: 'Cryptographic Signing',
          description: 'Secure your capsule with digital signature',
          type: 'action',
          provenanceTier: 'silver',
          autoCompletion: true
        },
        {
          id: 'verify',
          title: 'Provenance Verification',
          description: 'Achieve gold-tier provenance certification',
          type: 'validation',
          provenanceTier: 'gold',
          intelligentValidation: true
        },
        {
          id: 'publish',
          title: 'Marketplace Publication',
          description: 'Share your capsule with the community',
          type: 'action',
          provenanceTier: 'gold',
          aiSuggestions: true
        }
      ],
      
      milestones: [
        { step: 'concept', title: 'Idea Captured', tier: 'bronze' },
        { step: 'develop', title: 'Prototype Ready', tier: 'bronze' },
        { step: 'test', title: 'Quality Assured', tier: 'silver' },
        { step: 'verify', title: 'Provenance Certified', tier: 'gold' },
        { step: 'publish', title: 'Community Shared', tier: 'gold' }
      ],

      prerequisites: [],
      outcomes: ['Marketplace-ready capsule', 'Gold-tier provenance', 'Community recognition'],
      provenanceMapping: {},
      configurable: true,
      variants: [],
      personalizable: true,
      aiAssisted: true,
      suggestionsEnabled: true,
      autoValidation: true
    }

    // Contributor Onboarding Pathway
    const contributorOnboardingPathway: PathwayDefinition = {
      id: 'contributor-onboarding',
      title: 'Welcome to Eco Ecosystem',
      description: 'Your journey from newcomer to valued contributor',
      category: 'contributor',
      difficulty: 'beginner',
      estimatedDuration: 30,
      
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Eco',
          description: 'Understanding the ecosystem and your role',
          type: 'input',
          provenanceTier: 'bronze'
        },
        {
          id: 'profile',
          title: 'Setup Your Profile',
          description: 'Create your contributor identity',
          type: 'input',
          provenanceTier: 'bronze'
        },
        {
          id: 'first-capsule',
          title: 'Create Your First Capsule',
          description: 'Hands-on introduction to capsule creation',
          type: 'ai-assisted',
          provenanceTier: 'bronze'
        },
        {
          id: 'provenance-stamp',
          title: 'Earn Your First Provenance Stamp',
          description: 'Understanding quality and verification',
          type: 'validation',
          provenanceTier: 'silver'
        },
        {
          id: 'community',
          title: 'Join the Community',
          description: 'Connect with other contributors',
          type: 'action',
          provenanceTier: 'silver'
        },
        {
          id: 'marketplace-debut',
          title: 'Your Marketplace Debut',
          description: 'Publish your first capsule to the marketplace',
          type: 'action',
          provenanceTier: 'gold'
        }
      ],

      milestones: [
        { step: 'welcome', title: 'Welcomed', tier: 'bronze' },
        { step: 'first-capsule', title: 'First Creation', tier: 'bronze' },
        { step: 'provenance-stamp', title: 'Quality Recognized', tier: 'silver' },
        { step: 'marketplace-debut', title: 'Community Contributor', tier: 'gold' }
      ],

      prerequisites: [],
      outcomes: ['Active community member', 'Published capsule', 'Silver+ provenance tier'],
      provenanceMapping: {},
      configurable: false,
      variants: [],
      personalizable: true,
      aiAssisted: true,
      suggestionsEnabled: true,
      autoValidation: false
    }

    this.pathways.set(capsuleLifecyclePathway.id, capsuleLifecyclePathway)
    this.pathways.set(contributorOnboardingPathway.id, contributorOnboardingPathway)
  }
}

export default PathwaysAgent