import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AgentStreamService from '../../services/AgentStreamService'
import type {
  AgentEvent,
  AgentStatus,
  AgentStreamFilter,
  AgentStreamOptions,
  ConnectionStatus,
  EventCallback,
  AgentStreamTransport
} from '../../types'

export interface UseAgentStreamOptions extends AgentStreamOptions {
  enabled?: boolean
  reconnectInterval?: number
}

interface AgentStreamState {
  events: AgentEvent[]
  agentStatuses: Record<string, AgentStatus>
  isConnected: boolean
  connectionQuality: number
  lastEvent?: AgentEvent
  transport: AgentStreamTransport
  latency?: number
  mode: 'live' | 'demo'
  reconnectAttempts: number
}

const DEFAULT_STATE: AgentStreamState = {
  events: [],
  agentStatuses: {},
  isConnected: false,
  connectionQuality: 0,
  lastEvent: undefined,
  transport: 'mock',
  latency: undefined,
  mode: 'demo',
  reconnectAttempts: 0
}

export function useAgentStream(options: UseAgentStreamOptions = {}): AgentStreamState & {
  subscribeToAgent: (agentId: string) => void
  subscribeToCapsule: (capsuleId: string) => void
  setFilter: (filter: AgentStreamFilter) => void
  clearEvents: () => void
  emitDemoEvent: (event: AgentEvent) => void
  getEventHistory: (filter?: AgentStreamFilter) => AgentEvent[]
} {
  const [state, setState] = useState<AgentStreamState>(DEFAULT_STATE)
  const subscriptionRef = useRef<ReturnType<AgentStreamService['subscribe']> | null>(null)
  const filterRef = useRef<AgentStreamFilter | undefined>(options.filter)
  const service = useMemo(() => AgentStreamService.getInstance(), [])

  useEffect(() => {
    if (options.enabled === false) {
      subscriptionRef.current?.disconnect()
      subscriptionRef.current = null
      filterRef.current = undefined
      setState(() => ({ ...DEFAULT_STATE }))
      return
    }

    const eventHandler: EventCallback = (event) => {
      setState(prev => {
        const nextEvents = [...prev.events, event].slice(-(options.bufferSize ?? 100))
        const nextStatuses = { ...prev.agentStatuses }

        if (event.type === 'status') {
          nextStatuses[event.agent] = {
            ...(event.payload as AgentStatus),
            lastActivity: event.timestamp
          }
        } else {
          if (nextStatuses[event.agent]) {
            nextStatuses[event.agent] = {
              ...nextStatuses[event.agent],
              lastActivity: event.timestamp
            }
          }
        }

        return {
          events: nextEvents,
          agentStatuses: nextStatuses,
          isConnected: prev.isConnected,
          connectionQuality: prev.connectionQuality,
          lastEvent: event,
          transport: prev.transport,
          latency: prev.latency,
          mode: prev.mode,
          reconnectAttempts: prev.reconnectAttempts
        }
      })
    }

    subscriptionRef.current = service.subscribe(options, eventHandler)
    filterRef.current = options.filter

    const unsubscribeStatus = service.onConnectionStatusChange((status: ConnectionStatus) => {
      setState(prev => ({
        ...prev,
        isConnected: status.connected,
        connectionQuality: status.quality,
        transport: status.transport,
        latency: status.latency,
        mode: status.mode,
        reconnectAttempts: status.reconnectAttempts
      }))
    })

    return () => {
      subscriptionRef.current?.disconnect()
      subscriptionRef.current = null
      unsubscribeStatus()
      setState(() => ({ ...DEFAULT_STATE }))
    }
  }, [options.enabled, options.filter, options.bufferSize, options.realtime, options.throttleMs, options.transport, options.reconnectInterval, service])

  const updateFilter = useCallback((filter: AgentStreamFilter) => {
    filterRef.current = filter
    subscriptionRef.current?.updateOptions({
      ...options,
      filter
    })
    setState(prev => ({ ...prev, events: [] }))
  }, [options])

  const subscribeToAgent = useCallback((agentId: string) => {
    updateFilter({
      ...(filterRef.current ?? {}),
      agents: [agentId]
    })
  }, [updateFilter])

  const subscribeToCapsule = useCallback((capsuleId: string) => {
    updateFilter({
      ...(filterRef.current ?? {}),
      capsuleIds: [capsuleId]
    })
  }, [updateFilter])

  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: []
    }))
  }, [])

  const emitDemoEvent = useCallback((event: AgentEvent) => {
    service.emit(event)
  }, [service])

  const getEventHistory = useCallback((filter?: AgentStreamFilter) => {
    return service.getBufferedEvents(filter)
  }, [service])

  return {
    ...state,
    subscribeToAgent,
    subscribeToCapsule,
    setFilter: updateFilter,
    clearEvents,
    emitDemoEvent,
    getEventHistory
  }
}

export default useAgentStream
