import type {
  AgentEvent,
  AgentEventSeverity,
  AgentStreamConfiguration,
  AgentStreamFilter,
  AgentStreamOptions,
  AgentStreamTransport,
  ConnectionStatus,
  StreamConnection
} from '../types'
import type { AgentStatus, EventCallback } from '../types'

interface SubscriberRecord {
  id: string
  callback: EventCallback
  options: AgentStreamOptions
}

const DEFAULT_CONFIG: AgentStreamConfiguration = {
  transport: 'mock',
  reconnectInterval: 5000,
  maxBuffer: 200,
  demoMode: true,
  websocketUrl: undefined,
  sseUrl: undefined,
  headers: undefined
}

export class AgentStreamService {
  private static instance: AgentStreamService

  private subscribers = new Map<string, SubscriberRecord>()
  private connectionListeners = new Map<string, (status: ConnectionStatus) => void>()
  private bufferedEvents: AgentEvent[] = []
  private config: AgentStreamConfiguration = { ...DEFAULT_CONFIG }
  private currentStatus: ConnectionStatus = {
    connected: false,
    quality: 0,
    lastUpdated: Date.now(),
    transport: 'mock',
    latency: undefined,
    mode: 'demo',
    reconnectAttempts: 0
  }
  private demoTimer: NodeJS.Timeout | null = null
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null
  private websocket?: WebSocket
  private eventSource?: EventSource
  private connectionMode: 'live' | 'demo' = 'demo'

  static getInstance(): AgentStreamService {
    if (!AgentStreamService.instance) {
      AgentStreamService.instance = new AgentStreamService()
    }
    return AgentStreamService.instance
  }

  static configure(config: Partial<AgentStreamConfiguration>) {
    const service = AgentStreamService.getInstance()
    service.config = {
      ...service.config,
      ...config
    }
    service.restartConnection()
  }

  subscribe(options: AgentStreamOptions = {}, callback: EventCallback): StreamConnection {
    const id = this.generateId()
    const record: SubscriberRecord = {
      id,
      callback,
      options: {
        bufferSize: 100,
        realtime: true,
        transport: this.config.transport,
        reconnectInterval: this.config.reconnectInterval,
        ...options
      }
    }

    this.subscribers.set(id, record)
    this.ensureConnection()

    const bufferSize = record.options.bufferSize ?? this.config.maxBuffer
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
        this.ensureConnection()
      }
    }
  }

  onConnectionStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    const id = this.generateId()
    this.connectionListeners.set(id, listener)
    listener(this.currentStatus)
    this.ensureConnection()
    return () => {
      this.connectionListeners.delete(id)
      this.checkForShutdown()
    }
  }

  emit(event: AgentEvent): void {
    this.handleIncomingEvent(event)
  }

  getBufferedEvents(filter?: AgentStreamFilter): AgentEvent[] {
    if (!filter) return [...this.bufferedEvents]
    return this.bufferedEvents.filter(event => this.matchesFilter(event, filter))
  }

  private restartConnection() {
    this.shutdownConnections()
    if (this.subscribers.size > 0 || this.connectionListeners.size > 0) {
      this.ensureConnection()
    }
  }

  private ensureConnection() {
    if (this.subscribers.size === 0 && this.connectionListeners.size === 0) {
      this.shutdownConnections()
      return
    }

    const transport = this.resolveTransport()

    if (transport === 'websocket') {
      this.startWebSocket()
      return
    }

    if (transport === 'sse') {
      this.startEventSource()
      return
    }

    this.startDemoStream()
  }

  private resolveTransport(): AgentStreamTransport {
    const requested = Array.from(this.subscribers.values())[0]?.options.transport ?? this.config.transport
    return requested ?? this.config.transport
  }

  private startWebSocket() {
    if (typeof window === 'undefined' || typeof window.WebSocket === 'undefined' || !this.config.websocketUrl) {
      this.startDemoStream()
      return
    }

    if (this.websocket && this.websocket.readyState <= 1) {
      return
    }

    this.shutdownConnections(false)

    try {
      this.websocket = new window.WebSocket(this.config.websocketUrl)
    } catch (error) {
      console.error('AgentStreamService: WebSocket init failed, falling back to demo mode', error)
      this.handleConnectionError('websocket')
      return
    }

    this.websocket.onopen = () => {
      this.connectionMode = 'live'
      this.currentStatus.reconnectAttempts = 0
      this.updateConnectionStatus({
        connected: true,
        transport: 'websocket',
        mode: 'live'
      })
    }

    this.websocket.onmessage = (event) => {
      this.handleIncomingPayload(event.data, 'websocket')
    }

    this.websocket.onerror = (error) => {
      console.error('AgentStreamService: WebSocket error', error)
      this.handleConnectionError('websocket')
    }

    this.websocket.onclose = () => {
      this.handleConnectionError('websocket')
    }
  }

  private startEventSource() {
    if (typeof window === 'undefined' || !(window as any).EventSource || !this.config.sseUrl) {
      this.startDemoStream()
      return
    }

    if (this.eventSource && this.currentStatus.transport === 'sse') {
      return
    }

    this.shutdownConnections(false)

    try {
      this.eventSource = new window.EventSource(this.config.sseUrl)
    } catch (error) {
      console.error('AgentStreamService: SSE init failed, falling back to demo mode', error)
      this.handleConnectionError('sse')
      return
    }

    this.eventSource.onopen = () => {
      this.connectionMode = 'live'
      this.currentStatus.reconnectAttempts = 0
      this.updateConnectionStatus({
        connected: true,
        transport: 'sse',
        mode: 'live'
      })
    }

    this.eventSource.onmessage = (event) => {
      this.handleIncomingPayload(event.data, 'sse')
    }

    this.eventSource.onerror = (error) => {
      console.error('AgentStreamService: SSE error', error)
      this.handleConnectionError('sse')
    }
  }

  private handleIncomingPayload(data: any, transport: AgentStreamTransport) {
    if (!data) return

    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      if (Array.isArray(parsed)) {
        parsed.forEach(item => this.handleIncomingEvent(this.normalizeEvent(item, transport)))
      } else {
        this.handleIncomingEvent(this.normalizeEvent(parsed, transport))
      }
    } catch (error) {
      console.error('AgentStreamService: Failed to parse incoming payload', error, data)
    }
  }

  private normalizeEvent(input: any, transport: AgentStreamTransport): AgentEvent {
    const now = Date.now()
    const event: AgentEvent = {
      id: input?.id ?? this.generateId(),
      type: input?.type ?? 'system',
      agent: input?.agent ?? 'unknown-agent',
      capsuleId: input?.capsuleId,
      payload: input?.payload ?? input ?? {},
      timestamp: typeof input?.timestamp === 'number' ? input.timestamp : now,
      severity: input?.severity,
      provenanceTier: input?.provenanceTier ?? input?.payload?.provenanceTier
    }

    if (!event.severity) {
      event.severity = this.calculateSeverity(event.type, event.payload)
    }

    const latency = Math.max(0, now - event.timestamp)
    const quality = this.calculateQuality(latency)

    this.updateConnectionStatus({
      connected: true,
      transport,
      latency,
      quality,
      mode: this.connectionMode
    })

    return event
  }

  private handleIncomingEvent(event: AgentEvent) {
    this.bufferedEvents = [...this.bufferedEvents.slice(-(this.config.maxBuffer - 1)), event]

    this.subscribers.forEach(record => {
      if (this.matchesFilter(event, record.options.filter)) {
        record.callback(event)
      }
    })
  }

  private handleConnectionError(transport: AgentStreamTransport) {
    this.updateConnectionStatus({
      connected: false,
      transport,
      mode: this.config.demoMode ? 'demo' : 'live',
      quality: 0
    })

    if (this.config.demoMode) {
      this.startDemoStream()
    }

    const interval = this.config.reconnectInterval
    if (interval <= 0) {
      return
    }

    if (this.reconnectHandle) {
      return
    }

    const attempt = this.currentStatus.reconnectAttempts + 1
    this.currentStatus.reconnectAttempts = attempt

    this.reconnectHandle = setTimeout(() => {
      this.reconnectHandle = null
      this.ensureConnection()
    }, interval * Math.min(5, attempt))
  }

  private shutdownConnections(stopDemo = true) {
    if (this.websocket) {
      try {
        this.websocket.onopen = null
        this.websocket.onclose = null
        this.websocket.onerror = null
        this.websocket.onmessage = null
        this.websocket.close()
      } catch (error) {
        console.warn('AgentStreamService: error closing WebSocket', error)
      }
      this.websocket = undefined
    }

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = undefined
    }

    if (this.reconnectHandle) {
      clearTimeout(this.reconnectHandle)
      this.reconnectHandle = null
    }

    if (stopDemo && this.demoTimer) {
      clearInterval(this.demoTimer)
      this.demoTimer = null
    }
  }

  private unsubscribe(id: string) {
    this.subscribers.delete(id)
    this.checkForShutdown()
  }

  private checkForShutdown() {
    if (this.subscribers.size === 0 && this.connectionListeners.size === 0) {
      this.shutdownConnections()
      this.updateConnectionStatus({
        connected: false,
        mode: this.config.demoMode ? 'demo' : 'live',
        quality: 0
      })
    }
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

  private startDemoStream() {
    if (!this.config.demoMode) {
      return
    }

    if (this.demoTimer) {
      return
    }

    this.connectionMode = 'demo'
    this.updateConnectionStatus({
      connected: true,
      transport: 'mock',
      mode: 'demo',
      quality: 95
    })

    this.demoTimer = setInterval(() => {
      if (this.subscribers.size === 0) {
        return
      }
      const event = this.createDemoEvent()
      this.handleIncomingEvent(event)
    }, 3000)
  }

  private updateConnectionStatus(partial: Partial<ConnectionStatus>) {
    this.currentStatus = {
      ...this.currentStatus,
      ...partial,
      lastUpdated: Date.now()
    }

    this.connectionListeners.forEach(listener => listener(this.currentStatus))
  }

  private createDemoEvent(): AgentEvent {
    const now = Date.now()
    const eventTypes: AgentEvent['type'][] = ['status', 'provenance', 'capsule', 'orchestration', 'marketplace']
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
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
    if (type === 'provenance' && payload?.toTier === 'gold') {
      return 'success'
    }

    if (type === 'status' && payload?.state === 'error') {
      return 'error'
    }

    if (type === 'marketplace' && payload?.action === 'published') {
      return 'success'
    }

    return 'info'
  }

  private calculateQuality(latency: number): number {
    if (!latency || latency <= 0) {
      return 100
    }
    const score = Math.max(0, 100 - Math.log(latency + 1) * 20)
    return Math.round(score)
  }

  private generateId(): string {
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID()
    }

    return `agent-event-${Math.random().toString(36).slice(2)}`
  }
}

export default AgentStreamService
