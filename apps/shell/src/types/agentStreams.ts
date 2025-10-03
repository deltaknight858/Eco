import type { ProvenanceTier } from './pathways'

export type AgentEventType =
  | 'status'
  | 'provenance'
  | 'capsule'
  | 'orchestration'
  | 'marketplace'
  | 'system'

export type AgentEventSeverity = 'info' | 'warning' | 'error' | 'success'

export interface AgentEvent {
  id: string
  type: AgentEventType
  agent: string
  capsuleId?: string
  payload: Record<string, any>
  timestamp: number
  severity: AgentEventSeverity
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
}

export interface ConnectionStatus {
  connected: boolean
  quality: number
  lastUpdated: number
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
