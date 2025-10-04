import type { ProvenanceTier } from './pathways'

export type AgentEventType =
  | 'status'
  | 'provenance'
  | 'capsule'
  | 'orchestration'
  | 'marketplace'
  | 'system'

export type AgentEventSeverity = 'info' | 'warning' | 'error' | 'success'

export type AgentStreamTransport = 'mock' | 'websocket' | 'sse'

export interface AgentEvent {
  id: string
  type: AgentEventType
  agent: string
  capsuleId?: string
  payload: Record<string, any>
  timestamp: number
  severity?: AgentEventSeverity
  provenanceTier?: ProvenanceTier
}

export interface AgentStatus {
  state: 'idle' | 'active' | 'error' | 'maintenance'
  capabilities?: string[]
  load?: number
  lastActivity?: number
  message?: string
}

export interface AgentStreamFilter {
  agents?: string[]
  types?: AgentEventType[]
  capsuleIds?: string[]
  provenanceTiers?: ProvenanceTier[]
}

export interface AgentStreamOptions {
  filter?: AgentStreamFilter
  realtime?: boolean
  bufferSize?: number
  throttleMs?: number
  transport?: AgentStreamTransport
  reconnectInterval?: number
}

export interface ConnectionStatus {
  connected: boolean
  quality: number
  lastUpdated: number
  transport: AgentStreamTransport
  latency?: number
  mode: 'live' | 'demo'
  reconnectAttempts: number
}

export type EventCallback = (event: AgentEvent) => void

export interface StreamConnection {
  id: string
  disconnect: () => void
  updateOptions: (options: AgentStreamOptions) => void
}

export interface StreamSubscription {
  connection: StreamConnection
  onConnectionStatusChange: (listener: (status: ConnectionStatus) => void) => () => void
}

export interface PathwayStepProgress {
  progress: number
  lastUpdated: number
}

export interface AgentStreamConfiguration {
  transport: AgentStreamTransport
  websocketUrl?: string
  sseUrl?: string
  reconnectInterval: number
  maxBuffer: number
  demoMode: boolean
  headers?: Record<string, string>
}

export interface AgentActivitySnapshot {
  agentId: string
  intensity: number
  lastEvent?: AgentEvent
  severity?: AgentEventSeverity
  status?: AgentStatus['state']
  provenanceTier?: ProvenanceTier
  lastUpdated: number
}
