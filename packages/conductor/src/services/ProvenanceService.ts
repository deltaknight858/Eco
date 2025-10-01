/**
 * Provenance Service
 * Extended from V.I.B.E/packages/core/hooks.ts - useProvenance()
 * 
 * Handles provenance stamping, audit trails, and compliance tracking
 * for all agent interactions in the Eco ecosystem.
 */

import { v4 as uuidv4 } from 'uuid'
import type { ProvenanceStamp } from '../types/AssistTypes'

export class ProvenanceService {
  private stamps: Map<string, ProvenanceStamp> = new Map()

  /**
   * Create a new provenance stamp for an agent interaction
   */
  async createStamp(params: {
    requestId: string
    agent: string
    tier: string
    executionTime: number
    inputHash: string
    outputHash: string
    metadata: Record<string, unknown>
  }): Promise<ProvenanceStamp> {
    const stamp: ProvenanceStamp = {
      stampedAt: new Date().toISOString(),
      requestId: params.requestId,
      agent: params.agent as any,
      tier: params.tier as any,
      executionTime: params.executionTime,
      inputHash: params.inputHash,
      outputHash: params.outputHash,
      cost: this.calculateCost(params.tier, params.agent, params.executionTime),
      metadata: {
        ...params.metadata,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    }

    // Store stamp for audit trail
    this.stamps.set(params.requestId, stamp)

    // In production, this would also:
    // - Send to audit log service
    // - Store in blockchain for immutable provenance
    // - Trigger compliance checks
    // - Update user metrics

    return stamp
  }

  /**
   * Retrieve provenance stamp by request ID
   */
  async getStamp(requestId: string): Promise<ProvenanceStamp | null> {
    return this.stamps.get(requestId) || null
  }

  /**
   * Get provenance timeline for a user or session
   */
  async getTimeline(userId: string, limit: number = 50): Promise<ProvenanceStamp[]> {
    // Mock implementation - in production would query database
    return Array.from(this.stamps.values())
      .filter(stamp => stamp.metadata.userId === userId)
      .sort((a, b) => new Date(b.stampedAt).getTime() - new Date(a.stampedAt).getTime())
      .slice(0, limit)
  }

  /**
   * Calculate cost for agent usage
   */
  private calculateCost(tier: string, agent: string, executionTime: number): number {
    const baseCosts = {
      mindmap: { bronze: 0.01, silver: 0.02, gold: 0.05, platinum: 0.10 },
      codegen: { bronze: 0.05, silver: 0.10, gold: 0.20, platinum: 0.40 },
      docs: { bronze: 0.02, silver: 0.04, gold: 0.08, platinum: 0.15 },
      analyzer: { bronze: 0.10, silver: 0.15, gold: 0.25, platinum: 0.50 },
      orchestrator: { bronze: 0.20, silver: 0.30, gold: 0.50, platinum: 1.00 }
    }

    const baseRate = baseCosts[agent as keyof typeof baseCosts]?.[tier as keyof typeof baseCosts.mindmap] || 0.01
    const timeMultiplier = Math.max(1, executionTime / 1000 / 10) // Per 10 seconds
    
    return Math.round((baseRate * timeMultiplier) * 100) / 100
  }

  /**
   * Generate audit report for compliance
   */
  async generateAuditReport(params: {
    userId?: string
    dateFrom: Date
    dateTo: Date
    agent?: string
  }): Promise<{
    totalRequests: number
    totalCost: number
    agentBreakdown: Record<string, number>
    tierBreakdown: Record<string, number>
    stamps: ProvenanceStamp[]
  }> {
    const stamps = Array.from(this.stamps.values())
      .filter(stamp => {
        const stampDate = new Date(stamp.stampedAt)
        const withinDateRange = stampDate >= params.dateFrom && stampDate <= params.dateTo
        const matchesUser = !params.userId || stamp.metadata.userId === params.userId
        const matchesAgent = !params.agent || stamp.agent === params.agent
        
        return withinDateRange && matchesUser && matchesAgent
      })

    const agentBreakdown: Record<string, number> = {}
    const tierBreakdown: Record<string, number> = {}
    let totalCost = 0

    stamps.forEach(stamp => {
      agentBreakdown[stamp.agent] = (agentBreakdown[stamp.agent] || 0) + 1
      tierBreakdown[stamp.tier] = (tierBreakdown[stamp.tier] || 0) + 1
      totalCost += stamp.cost || 0
    })

    return {
      totalRequests: stamps.length,
      totalCost: Math.round(totalCost * 100) / 100,
      agentBreakdown,
      tierBreakdown,
      stamps
    }
  }

  /**
   * Validate provenance integrity
   */
  async validateIntegrity(requestId: string): Promise<{
    isValid: boolean
    issues: string[]
  }> {
    const stamp = await this.getStamp(requestId)
    if (!stamp) {
      return { isValid: false, issues: ['Stamp not found'] }
    }

    const issues: string[] = []

    // Validate timestamp
    const stampTime = new Date(stamp.stampedAt).getTime()
    const now = Date.now()
    if (stampTime > now) {
      issues.push('Future timestamp detected')
    }

    // Validate execution time
    if (stamp.executionTime < 0 || stamp.executionTime > 300000) { // 5 minutes max
      issues.push('Invalid execution time')
    }

    // Validate cost calculation
    const expectedCost = this.calculateCost(stamp.tier, stamp.agent, stamp.executionTime)
    if (Math.abs((stamp.cost || 0) - expectedCost) > 0.01) {
      issues.push('Cost calculation mismatch')
    }

    return {
      isValid: issues.length === 0,
      issues
    }
  }
}