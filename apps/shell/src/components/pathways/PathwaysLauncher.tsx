/**
 * PathwaysLauncher.tsx - Contextual Floating Guide
 * Glass morphism floating button leveraging RadialCommandCenter pattern
 */

'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { cn } from '@eco/halo-components'
import { RadialCommandCenter } from '../assist'
import { useAgentActivity } from '../hooks/useAgentActivity'
import { NeonGlassIconStream, type NeonGlassStatus } from '../primitives/NeonGlassIconStream'
import type {
  AgentEvent,
  AgentEventSeverity,
  ProvenanceTier
} from '../../types'

export interface UserContext {
  completedPathways: number
  timeOnCurrentPage: number
  requestedGuidance?: boolean
  showHints?: boolean
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

interface SuggestionStreamInfo {
  intensity: number
  severity?: AgentEventSeverity
  provenanceTier?: ProvenanceTier
  status: NeonGlassStatus
  lastEvent?: AgentEvent
  eventCount: number
}

const STREAM_WINDOW_MS = 60_000

const statusLabels: Record<NeonGlassStatus, string> = {
  idle: 'Idle',
  active: 'Surging',
  error: 'Attention needed',
  success: 'Flowing'
}

const tierClassMap: Record<ProvenanceTier, string> = {
  bronze: 'hint-action-bronze',
  silver: 'hint-action-silver',
  gold: 'hint-action-gold'
}

const getTierLevel = (tier: ProvenanceTier): number => {
  switch (tier) {
    case 'bronze':
      return 1
    case 'silver':
      return 2
    case 'gold':
      return 3
    default:
      return 1
  }
}

const determineVisibility = (context: UserContext, suggestions: PathwaySuggestion[]): boolean => {
  if (context.completedPathways < 3) return true
  if (context.timeOnCurrentPage > 120000) return true
  if (suggestions.some(s => s.priority > 80)) return true
  if (context.requestedGuidance) return true

  return false
}

const getSuggestionKey = (suggestion: PathwaySuggestion) => suggestion.capsuleId ?? suggestion.id

interface PathwaysLauncherProps {
  suggestedPathways: PathwaySuggestion[]
  context: UserContext
  tier: ProvenanceTier
  onLaunchPathway: (pathway: PathwaySuggestion) => void
}

export const PathwaysLauncher: React.FC<PathwaysLauncherProps> = ({
  suggestedPathways,
  context,
  tier,
  onLaunchPathway
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<PathwaySuggestion[]>([])

  useEffect(() => {
    const shouldShow = determineVisibility(context, suggestedPathways)
    setIsVisible(shouldShow)
  }, [context, suggestedPathways])

  useEffect(() => {
    const filtered = suggestedPathways
      .filter(pathway => getTierLevel(pathway.recommendedTier) <= getTierLevel(tier))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6)

    setContextualSuggestions(filtered)
  }, [suggestedPathways, tier])

  const trackedCapsuleIds = useMemo(() => {
    return contextualSuggestions
      .map(suggestion => getSuggestionKey(suggestion))
      .filter((key): key is string => Boolean(key))
  }, [contextualSuggestions])

  const trackedAgentIds = useMemo(() => {
    return contextualSuggestions
      .flatMap(suggestion => suggestion.agentIds ?? [])
      .filter((agentId, index, all) => agentId && all.indexOf(agentId) === index)
  }, [contextualSuggestions])

  const {
    activities,
    recentEvents,
    isConnected,
    connectionQuality,
    transport,
    latency,
    mode
  } = useAgentActivity({
    filter: trackedCapsuleIds.length > 0 ? { capsuleIds: trackedCapsuleIds } : undefined,
    agents: trackedAgentIds.length > 0 ? trackedAgentIds : undefined,
    bufferSize: 400,
    windowMs: STREAM_WINDOW_MS,
    enabled: contextualSuggestions.length > 0
  })

  const suggestionActivity = useMemo(() => {
    if (contextualSuggestions.length === 0) {
      return {}
    }

    const eventsByCapsule = new Map<string, AgentEvent[]>()
    recentEvents.forEach(event => {
      const capsuleKey = event.capsuleId ?? event.payload?.capsuleId
      if (!capsuleKey) return
      const bucket = eventsByCapsule.get(capsuleKey) ?? []
      bucket.push(event)
      eventsByCapsule.set(capsuleKey, bucket)
    })

    return contextualSuggestions.reduce<Record<string, SuggestionStreamInfo>>((acc, suggestion) => {
      const key = getSuggestionKey(suggestion)
      if (!key) {
        return acc
      }

      const agentSnapshots = (suggestion.agentIds ?? [])
        .map(agentId => activities[agentId])
        .filter((snapshot): snapshot is typeof activities[string] => Boolean(snapshot))

      const capsuleEvents = [...(eventsByCapsule.get(key) ?? [])]
      capsuleEvents.sort((a, b) => a.timestamp - b.timestamp)

      const lastAgentEvent = agentSnapshots
        .map(snapshot => snapshot.lastEvent)
        .filter((event): event is AgentEvent => Boolean(event))
        .sort((a, b) => a.timestamp - b.timestamp)
        .pop()

      const combinedEvents: AgentEvent[] = [...capsuleEvents]
      if (lastAgentEvent) {
        combinedEvents.push(lastAgentEvent)
      }
      combinedEvents.sort((a, b) => a.timestamp - b.timestamp)
      const lastEvent = combinedEvents.length > 0 ? combinedEvents[combinedEvents.length - 1] : undefined

      const intensityFromAgents = agentSnapshots.reduce((max, snapshot) => Math.max(max, snapshot.intensity), 0)
      const intensityFromEvents = capsuleEvents.length > 0 ? Math.min(100, capsuleEvents.length * 18) : 0
      const intensity = Math.max(intensityFromAgents, intensityFromEvents)

      const severity = lastEvent?.severity ?? agentSnapshots.find(snapshot => snapshot.severity)?.severity
      const provenanceTier = lastEvent?.provenanceTier ?? agentSnapshots.find(snapshot => snapshot.provenanceTier)?.provenanceTier

      let status: NeonGlassStatus = 'idle'
      if (severity === 'error') {
        status = 'error'
      } else if (intensity > 70) {
        status = 'active'
      } else if (intensity > 35) {
        status = 'success'
      }

      acc[key] = {
        intensity,
        severity,
        provenanceTier,
        status,
        lastEvent,
        eventCount: capsuleEvents.length
      }

      return acc
    }, {})
  }, [activities, contextualSuggestions, recentEvents])

  const handlePathwaySelect = useCallback((pathwayId: string) => {
    const pathway = contextualSuggestions.find(p => p.id === pathwayId)
    if (pathway) {
      onLaunchPathway(pathway)
    }
  }, [contextualSuggestions, onLaunchPathway])

  const actions = useMemo(() => {
    return contextualSuggestions.map(pathway => {
      const key = getSuggestionKey(pathway)
      const stream = key ? suggestionActivity[key] : undefined
      const intensity = stream?.intensity ?? 0
      const liveSegment = stream?.eventCount ? `${stream.eventCount} live` : null
      const detailSegments = [
        pathway.description,
        `${pathway.estimatedDuration} min`,
        pathway.difficulty,
        liveSegment
      ].filter(Boolean)
      const description = detailSegments.join(' • ')
      const badgeValue = stream ? `${Math.round(intensity)}%` : pathway.difficulty.toUpperCase()
      const iconNode = (
        <NeonGlassIconStream
          icon={<span aria-hidden>{pathway.icon}</span>}
          status={stream?.status ?? (isConnected ? 'idle' : 'idle')}
          severity={stream?.severity}
          provenanceTier={stream?.provenanceTier ?? pathway.recommendedTier}
          intensity={intensity}
          glow={isConnected}
          size="sm"
        />
      )

      return {
        id: pathway.id,
        icon: iconNode,
        label: pathway.title,
        description,
        badge: badgeValue,
        onClick: () => handlePathwaySelect(pathway.id),
        disabled: getTierLevel(pathway.recommendedTier) > getTierLevel(tier),
        metadata: {
          duration: pathway.estimatedDuration,
          category: pathway.category,
          tier: pathway.recommendedTier,
          intensity,
          status: stream?.status ?? 'idle'
        }
      }
    })
  }, [contextualSuggestions, handlePathwaySelect, isConnected, suggestionActivity, tier])

  if (!isVisible || contextualSuggestions.length === 0) {
    return null
  }

  const topSuggestion = contextualSuggestions[0]
  const topSuggestionKey = topSuggestion ? getSuggestionKey(topSuggestion) : undefined
  const topStream = topSuggestionKey ? suggestionActivity[topSuggestionKey] : undefined
  const topIntensity = topStream ? Math.round(topStream.intensity) : 0

  return (
    <>
      <div className="pathway-stream-status">
        <span className={cn('status-dot', isConnected ? 'status-dot-live' : 'status-dot-idle')} />
        <span className="status-text">
          {isConnected
            ? `Live ${transport.toUpperCase()} • Signal ${Math.round(connectionQuality)}%`
            : 'Stream warming up'}
        </span>
        {typeof latency === 'number' && (
          <span className="status-metric">{`${Math.round(latency)}ms`}</span>
        )}
        {mode === 'demo' && <span className="status-badge">Demo</span>}
      </div>

      <RadialCommandCenter
        variant="pathways-wizard"
        position="bottom-right"
        offset={{ x: 24, y: 24 }}
        actions={actions}
        tier={tier}
        animated
        className="pathways-launcher"
        triggerIcon="🧙‍♂️"
        triggerLabel="Pathways Guide"
        triggerDescription="Need guidance? I&apos;m here to help!"
      />

      {/* Contextual Hint Bubble */}
      {context.showHints && (
        <div className="pathway-hint-bubble">
          <div className="hint-content">
            <div className="hint-header">
              <span className="hint-icon">💡</span>
              <span className="hint-title">Suggested Journey</span>
            </div>
            <div className="hint-body">
              <p className="hint-text">
                Ready for your next adventure? I&apos;ve found {contextualSuggestions.length} guided pathways that match your experience level.
              </p>
              <div className="top-suggestion">
                <div className="suggestion-title">
                  {topSuggestion?.icon} {topSuggestion?.title}
                </div>
                <div className="suggestion-meta">
                  {topSuggestion?.estimatedDuration}min • {topSuggestion?.difficulty}
                </div>
                <div className="suggestion-stream">
                  <span className={cn('stream-dot', `stream-dot-${topStream?.status ?? 'idle'}`)} />
                  <span className="stream-text">
                    {topStream ? `${topIntensity}% ${statusLabels[topStream.status]}` : 'Awaiting live activity'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                if (topSuggestion) {
                  handlePathwaySelect(topSuggestion.id)
                }
              }}
              className={cn('hint-action', tierClassMap[tier] ?? 'hint-action-bronze')}
            >
              Start Journey
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pathways-launcher {
          z-index: 1000;
        }

        .pathway-stream-status {
          position: fixed;
          right: 24px;
          bottom: 90px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          border-radius: 9999px;
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(34, 211, 238, 0.25);
          backdrop-filter: blur(12px);
          color: #e2e8f0;
          font-size: 0.75rem;
          z-index: 999;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
        }

        .status-dot-live {
          background: rgba(34, 197, 94, 0.9);
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
        }

        .status-dot-idle {
          background: rgba(148, 163, 184, 0.6);
        }

        .status-text {
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .status-metric {
          color: #bae6fd;
        }

        .status-badge {
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #facc15;
        }

        .pathway-hint-bubble {
          position: fixed;
          bottom: 120px;
          right: 24px;
          width: 320px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          padding: 1rem;
          z-index: 999;
          animation: slide-in-up 0.3s ease-out;
        }

        .hint-content {
          color: white;
        }

        .hint-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .hint-icon {
          font-size: 1.2rem;
        }

        .hint-title {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .hint-text {
          font-size: 0.85rem;
          color: #d1d5db;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .top-suggestion {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .suggestion-title {
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .suggestion-meta {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .hint-action {
          width: 100%;
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hint-action:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .hint-action-bronze {
          background: linear-gradient(135deg, rgba(217, 119, 6, 0.95), rgba(249, 115, 22, 0.95));
          color: #111827;
        }

        .hint-action-silver {
          background: linear-gradient(135deg, rgba(209, 213, 219, 0.95), rgba(156, 163, 175, 0.95));
          color: #111827;
        }

        .hint-action-gold {
          background: linear-gradient(135deg, rgba(253, 224, 71, 0.95), rgba(250, 204, 21, 0.95));
          color: #111827;
        }

        .hint-action:focus-visible {
          outline: 2px solid rgba(56, 189, 248, 0.6);
          outline-offset: 2px;
        }

        .suggestion-stream {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #bfdbfe;
        }

        .stream-text {
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .stream-dot {
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.5);
        }

        .stream-dot-active {
          background: rgba(56, 189, 248, 0.95);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
        }

        .stream-dot-success {
          background: rgba(34, 197, 94, 0.85);
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }

        .stream-dot-error {
          background: rgba(248, 113, 113, 0.9);
          box-shadow: 0 0 10px rgba(248, 113, 113, 0.6);
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .pathway-stream-status {
            right: 16px;
            bottom: 84px;
          }

          .pathway-hint-bubble {
            right: 16px;
            bottom: 100px;
            width: calc(100vw - 32px);
            max-width: 320px;
          }
        }
      `}</style>
    </>
  )
}

// Default pathways suggestions
export const defaultPathwaySuggestions: PathwaySuggestion[] = [
  {
    id: 'capsule-lifecycle',
    title: 'Capsule Creation Journey',
    description: 'Complete guide from concept to marketplace publication',
    icon: '📦',
    category: 'capsule',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    recommendedTier: 'bronze',
    priority: 90,
    capsuleId: 'capsule-lifecycle',
    agentIds: ['agent.capsule.lifecycle']
  },
  {
    id: 'contributor-onboarding',
    title: 'Welcome to Eco Ecosystem',
    description: 'Your journey from newcomer to valued contributor',
    icon: '🌱',
    category: 'contributor', 
    difficulty: 'beginner',
    estimatedDuration: 30,
    recommendedTier: 'bronze',
    priority: 95,
    capsuleId: 'contributor-first-hour',
    agentIds: ['agent.community.welcome']
  },
  {
    id: 'multi-agent-orchestration',
    title: 'AI Agent Orchestra',
    description: 'Master complex multi-agent workflows',
    icon: '🎼',
    category: 'orchestration',
    difficulty: 'advanced',
    estimatedDuration: 60,
    recommendedTier: 'silver',
    priority: 70,
    capsuleId: 'orchestra-suite',
    agentIds: ['agent.orchestra.conductor', 'agent.orchestra.arranger']
  },
  {
    id: 'marketplace-publisher',
    title: 'Marketplace Mastery',
    description: 'Publish and distribute your capsules',
    icon: '🏪',
    category: 'capsule',
    difficulty: 'intermediate', 
    estimatedDuration: 25,
    recommendedTier: 'silver',
    priority: 75,
    capsuleId: 'marketplace-publisher',
    agentIds: ['agent.marketplace.curator']
  },
  {
    id: 'provenance-expert',
    title: 'Provenance Excellence',
    description: 'Achieve gold-tier verification mastery',
    icon: '🏆',
    category: 'contributor',
    difficulty: 'advanced',
    estimatedDuration: 40,
    recommendedTier: 'gold',
    priority: 85,
    capsuleId: 'provenance-expert',
    agentIds: ['agent.provenance.auditor']
  },
  {
    id: 'collaboration-master',
    title: 'Team Collaboration',
    description: 'Lead collaborative development workflows',
    icon: '🤝',
    category: 'orchestration',
    difficulty: 'intermediate',
    estimatedDuration: 35,
    recommendedTier: 'silver', 
    priority: 65,
    capsuleId: 'collaboration-master',
    agentIds: ['agent.collab.facilitator', 'agent.collab.sync']
  }
]

export default PathwaysLauncher