import { useMemo } from 'react'
import type {
  AgentActivitySnapshot,
  AgentEvent,
  AgentEventSeverity,
  AgentStreamFilter,
  AgentStreamOptions,
  AgentStreamTransport,
  ProvenanceTier
} from '../../types'
import { useAgentStream } from './useAgentStream'

export interface UseAgentActivityOptions extends AgentStreamOptions {
  agents?: string[]
  capsuleId?: string
  windowMs?: number
  transport?: AgentStreamTransport
  enabled?: boolean
}

export interface AgentActivityState {
  activities: Record<string, AgentActivitySnapshot>
  recentEvents: AgentEvent[]
  isConnected: boolean
  connectionQuality: number
  transport: AgentStreamTransport
  latency?: number
  mode: 'live' | 'demo'
  reconnectAttempts: number
}

const DEFAULT_WINDOW = 30_000

interface BuildActivityArgs {
  events: AgentEvent[]
  agents?: string[]
  capsuleId?: string
  windowMs: number
}

function buildActivities({ events, agents, capsuleId, windowMs }: BuildActivityArgs): Record<string, AgentActivitySnapshot> {
  const boundary = Date.now() - windowMs
  const filtered = events.filter(event => {
    if (event.timestamp < boundary) return false
    if (agents && agents.length > 0 && !agents.includes(event.agent)) return false
    if (capsuleId && event.capsuleId && event.capsuleId !== capsuleId) return false
    return true
  })

  return filtered.reduce<Record<string, AgentActivitySnapshot>>((acc, event) => {
    const entry = acc[event.agent] ?? {
      agentId: event.agent,
      intensity: 0,
      lastUpdated: 0
    }

    const increment = event.severity === 'error' ? 2 : 1
    const intensity = Math.min(100, entry.intensity + increment * 10)
    const severity: AgentEventSeverity | undefined = event.severity
    const provenanceTier: ProvenanceTier | undefined = event.provenanceTier

    acc[event.agent] = {
      ...entry,
      intensity,
      lastEvent: event,
      severity,
      provenanceTier,
      lastUpdated: event.timestamp
    }

    return acc
  }, {})
}

export function useAgentActivity(options: UseAgentActivityOptions = {}): AgentActivityState {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW

  const streamFilter: AgentStreamFilter | undefined = useMemo(() => {
    const baseFilter = options.filter ?? {}
    const agentFilter = options.agents && options.agents.length > 0 ? { agents: options.agents } : {}
    const capsuleFilter = options.capsuleId ? { capsuleIds: [options.capsuleId] } : {}
    const merged = {
      ...baseFilter,
      ...agentFilter,
      ...capsuleFilter
    }
    return Object.keys(merged).length > 0 ? merged : undefined
  }, [options.filter, options.agents, options.capsuleId])

  const {
    events,
    isConnected,
    connectionQuality,
    transport,
    latency,
    mode,
    reconnectAttempts
  } = useAgentStream({
    ...options,
    filter: streamFilter,
    bufferSize: Math.max(options.bufferSize ?? 200, 200),
    transport: options.transport,
    reconnectInterval: options.reconnectInterval ?? undefined,
    enabled: options.enabled
  })

  const activities = useMemo(() => {
    return buildActivities({
      events,
      agents: options.agents,
      capsuleId: options.capsuleId,
      windowMs
    })
  }, [events, options.agents, options.capsuleId, windowMs])

  const recentEvents = useMemo(() => {
    const boundary = Date.now() - windowMs
    return events.filter(event => event.timestamp >= boundary)
  }, [events, windowMs])

  return {
    activities,
    recentEvents,
    isConnected,
    connectionQuality,
    transport,
    latency,
    mode,
    reconnectAttempts
  }
}

export default useAgentActivity
