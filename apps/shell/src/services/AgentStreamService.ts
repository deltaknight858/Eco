import type {
  AgentEvent,
  AgentEventSeverity,
  AgentStreamFilter,
  AgentStreamOptions,
  ConnectionStatus,
  StreamConnection
} from '../types'
import type { AgentStatus, EventCallback } from '../types'

interface SubscriberRecord {
  id: string
  callback: EventCallback
  options: AgentStreamOptions
}

export class AgentStreamService {
  private static instance: AgentStreamService

  private subscribers = new Map<string, SubscriberRecord>()
  private connectionListeners = new Map<string, (status: ConnectionStatus) => void>()
  private bufferedEvents: AgentEvent[] = []
  private currentStatus: ConnectionStatus = {
    connected: false,
    quality: 0,
    lastUpdated: Date.now()
  }
  private demoTimer: NodeJS.Timeout | null = null

  static getInstance(): AgentStreamService {
    if (!AgentStreamService.instance) {
      AgentStreamService.instance = new AgentStreamService()
    }
    return AgentStreamService.instance
  }

  subscribe(options: AgentStreamOptions = {}, callback: EventCallback): StreamConnection {
    const id = this.generateId()
    const record: SubscriberRecord = {
      id,
      callback,
      options: {
        bufferSize: 100,
        realtime: true,
        ...options
      }
    }

    this.subscribers.set(id, record)
    this.ensureDemoStream()
    this.updateConnectionStatus({ connected: true })

    // Replay buffered events according to buffer size
    const bufferSize = record.options.bufferSize ?? 100
    if (bufferSize > 0) {
      const replay = this.bufferedEvents.slice(-bufferSize)
      replay.forEach(event => {
        if (this.matchesFilter(event, record.options.filter)) {
          callback(event)
        }
      })
    }

    return {
      id,
      disconnect: () => this.unsubscribe(id),
      updateOptions: (nextOptions: AgentStreamOptions) => {
        const existing = this.subscribers.get(id)
        if (existing) {
          existing.options = {
            ...existing.options,
            ...nextOptions
          }
        }
      }
    }
  }

  onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    const id = this.generateId()
    this.connectionListeners.set(id, listener)
    listener(this.currentStatus)
    this.ensureDemoStream()
    return () => {
      this.connectionListeners.delete(id)
      this.checkForShutdown()
    }
  }

  emit(event: AgentEvent): void {
    this.bufferedEvents = [...this.bufferedEvents.slice(-199), event]

    this.subscribers.forEach(record => {
      if (this.matchesFilter(event, record.options.filter)) {
        record.callback(event)
      }
    })
  }

  getBufferedEvents(filter?: AgentStreamFilter): AgentEvent[] {
    if (!filter) return [...this.bufferedEvents]
    return this.bufferedEvents.filter(event => this.matchesFilter(event, filter))
  }

  private unsubscribe(id: string) {
    this.subscribers.delete(id)
    this.checkForShutdown()
  }

  private matchesFilter(event: AgentEvent, filter?: AgentStreamFilter): boolean {
    if (!filter) return true

    if (filter.types && filter.types.length > 0 && !filter.types.includes(event.type)) {
      return false
    }

    if (filter.agents && filter.agents.length > 0 && !filter.agents.includes(event.agent)) {
      return false
    }

    if (filter.capsuleIds && filter.capsuleIds.length > 0 && (!event.capsuleId || !filter.capsuleIds.includes(event.capsuleId))) {
      return false
    }

    if (filter.provenanceTiers && filter.provenanceTiers.length > 0 && (!event.provenanceTier || !filter.provenanceTiers.includes(event.provenanceTier))) {
      return false
    }

    return true
  }

  private ensureDemoStream() {
    if (this.demoTimer || (this.subscribers.size === 0 && this.connectionListeners.size === 0)) {
      return
    }

    this.demoTimer = setInterval(() => {
      this.generateDemoActivity()
    }, 3000)
  }

  private checkForShutdown() {
    if (this.subscribers.size === 0 && this.connectionListeners.size === 0 && this.demoTimer) {
      clearInterval(this.demoTimer)
      this.demoTimer = null
      this.updateConnectionStatus({ connected: false, quality: 0 })
    }
  }

  private updateConnectionStatus(partial: Partial<ConnectionStatus>) {
    this.currentStatus = {
      connected: partial.connected ?? this.currentStatus.connected,
      quality: partial.quality ?? (this.currentStatus.connected ? this.currentStatus.quality : 0),
      lastUpdated: Date.now()
    }

    this.connectionListeners.forEach(listener => listener(this.currentStatus))
  }

  private generateDemoActivity() {
    if (this.subscribers.size === 0) {
      return
    }

    const event = this.createDemoEvent()
    this.updateConnectionStatus({
      connected: true,
      quality: 90 + Math.round(Math.random() * 10)
    })
    this.emit(event)
  }

  private createDemoEvent(): AgentEvent {
    const now = Date.now()
    const eventType: AgentEvent['type'][] = ['status', 'provenance', 'capsule', 'orchestration', 'marketplace']
    const type = eventType[Math.floor(Math.random() * eventType.length)]
    const agents = ['codegen', 'capsule-creator', 'provenance-verifier', 'marketplace']
    const agent = agents[Math.floor(Math.random() * agents.length)]
    const capsuleId = `capsule-${['alpha', 'beta', 'gamma'][Math.floor(Math.random() * 3)]}`

    const payload = this.createDemoPayload(type, capsuleId)

    return {
      id: this.generateId(),
      type,
      agent,
      capsuleId: type === 'status' ? undefined : capsuleId,
      payload,
      timestamp: now,
      severity: this.calculateSeverity(type, payload),
      provenanceTier: payload?.toTier ?? payload?.tier ?? undefined
    }
  }

  private createDemoPayload(type: AgentEvent['type'], capsuleId: string): Record<string, any> {
    switch (type) {
      case 'status': {
        const states: AgentStatus['state'][] = ['idle', 'active', 'maintenance']
        const state = states[Math.floor(Math.random() * states.length)]
        return {
          state,
          capabilities: ['analysis', 'validation', 'codegen'].slice(0, 1 + Math.floor(Math.random() * 3)),
          load: Math.random(),
          lastActivity: Date.now() - Math.floor(Math.random() * 1000)
        }
      }
      case 'provenance': {
        const tiers: Array<{ fromTier: string; toTier: string }> = [
          { fromTier: 'bronze', toTier: 'silver' },
          { fromTier: 'silver', toTier: 'gold' }
        ]
        const { fromTier, toTier } = tiers[Math.floor(Math.random() * tiers.length)]
        return {
          capsuleId,
          fromTier,
          toTier,
          confidence: 0.8 + Math.random() * 0.2,
          criteria: ['tests', 'sbom', 'security'].slice(0, 1 + Math.floor(Math.random() * 3))
        }
      }
      case 'capsule': {
        const steps = ['concept', 'develop', 'test', 'publish']
        const currentStep = steps[Math.floor(Math.random() * steps.length)]
        const progress = Math.min(100, Math.max(10, Math.round(Math.random() * 100)))
        return {
          capsuleId,
          lifecycle: currentStep,
          progress,
          currentStep,
          artifacts: ['README.md', 'capsule.json'].slice(0, 1 + Math.floor(Math.random() * 2))
        }
      }
      case 'orchestration':
        return {
          capsuleId,
          workflow: 'multi-agent-design',
          stage: ['planning', 'coordination', 'handoff'][Math.floor(Math.random() * 3)]
        }
      case 'marketplace':
        return {
          capsuleId,
          action: ['listing-created', 'metadata-validated', 'published'][Math.floor(Math.random() * 3)]
        }
      default:
        return {}
    }
  }

  private calculateSeverity(type: AgentEvent['type'], payload: Record<string, any>): AgentEventSeverity {
    if (type === 'provenance' && payload.toTier === 'gold') {
      return 'success'
    }

    if (type === 'status' && payload.state === 'error') {
      return 'error'
    }

    return 'info'
  }

  private generateId(): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }

    return `agent-event-${Math.random().toString(36).slice(2)}`
  }
}

export default AgentStreamService
