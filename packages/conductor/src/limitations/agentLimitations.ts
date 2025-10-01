/**
 * Agent Limitations & Guardrails
 * Defines what each agent can and cannot do based on user tiers
 */

import type { AgentType, UserTier, AgentLimitations } from '../types/AssistTypes'

export const agentLimitations: Record<AgentType, AgentLimitations> = {
    mindmap: {
        permissions: ["visualize", "analyze", "suggest_relationships"],
        restrictions: ["no_code_modification", "read_only_access", "no_file_creation"],
        maxExecutionTime: 30000, // 30 seconds
        maxOutputSize: 50000, // 50KB
        rateLimitPerHour: 20,
        tierRequired: "bronze"
    },

    codegen: {
        permissions: ["scaffold", "generate", "suggest", "template_creation"],
        restrictions: ["no_deployment", "no_git_commits", "sandbox_only", "no_file_writes"],
        maxExecutionTime: 60000, // 60 seconds
        maxOutputSize: 100000, // 100KB
        rateLimitPerHour: 10,
        tierRequired: "silver"
    },

    docs: {
        permissions: ["suggest", "format", "analyze", "generate_examples"],
        restrictions: ["no_auto_publish", "review_required", "no_external_links"],
        maxExecutionTime: 45000, // 45 seconds
        maxOutputSize: 75000, // 75KB
        rateLimitPerHour: 15,
        tierRequired: "bronze"
    },

    analyzer: {
        permissions: ["scan", "analyze", "report", "suggest_improvements"],
        restrictions: ["read_only", "no_modifications", "no_external_calls"],
        maxExecutionTime: 120000, // 2 minutes
        maxOutputSize: 200000, // 200KB
        rateLimitPerHour: 5,
        tierRequired: "gold"
    },

    orchestrator: {
        permissions: ["coordinate", "sequence", "validate", "optimize_workflows"],
        restrictions: ["no_autonomous_execution", "human_approval_required"],
        maxExecutionTime: 180000, // 3 minutes
        maxOutputSize: 500000, // 500KB
        rateLimitPerHour: 3,
        tierRequired: "platinum"
    },
    capsule: {
        permissions: [],
        restrictions: [],
        maxExecutionTime: 0,
        maxOutputSize: 0,
        rateLimitPerHour: 0,
        tierRequired: "bronze"
    }
}

export const tierLimitations: Record<UserTier, {
  maxConcurrentSessions: number
  maxRequestsPerDay: number
  maxOutputSizeMultiplier: number
  priorityLevel: number
}> = {
  bronze: {
    maxConcurrentSessions: 1,
    maxRequestsPerDay: 50,
    maxOutputSizeMultiplier: 1,
    priorityLevel: 1
  },
  silver: {
    maxConcurrentSessions: 2,
    maxRequestsPerDay: 150,
    maxOutputSizeMultiplier: 2,
    priorityLevel: 2
  },
  gold: {
    maxConcurrentSessions: 5,
    maxRequestsPerDay: 500,
    maxOutputSizeMultiplier: 5,
    priorityLevel: 3
  },
  platinum: {
    maxConcurrentSessions: 10,
    maxRequestsPerDay: -1, // unlimited
    maxOutputSizeMultiplier: 10,
    priorityLevel: 4
  }
}

export function canUserAccessAgent(userTier: UserTier, agentType: AgentType): boolean {
  const agentRequirement = agentLimitations[agentType].tierRequired
  const tierOrder: UserTier[] = ["bronze", "silver", "gold", "platinum"]
  
  const userLevel = tierOrder.indexOf(userTier)
  const requiredLevel = tierOrder.indexOf(agentRequirement)
  
  return userLevel >= requiredLevel
}

export function getEffectiveLimitations(userTier: UserTier, agentType: AgentType): AgentLimitations {
  const baseLimitations = agentLimitations[agentType]
  const tierMultiplier = tierLimitations[userTier].maxOutputSizeMultiplier
  
  return {
    ...baseLimitations,
    maxOutputSize: baseLimitations.maxOutputSize * tierMultiplier,
    rateLimitPerHour: Math.floor(baseLimitations.rateLimitPerHour * tierMultiplier)
  }
}