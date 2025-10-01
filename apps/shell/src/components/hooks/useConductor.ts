/**
 * useConductor.ts
 * React hook for integrating with the Conductor service
 */

import { useState, useEffect, useCallback } from 'react'
import { ConductorService, type Agent, type AgentMessage, type AgentResponse } from '../../../../../packages/conductor/src'

interface UseConductorReturn {
  conductor: ConductorService
  activeAgents: Agent[]
  isLoading: boolean
  error: string | null
  addAgent: (type: string, config?: any) => Promise<Agent>
  removeAgent: (agentId: string) => Promise<void>
  sendMessage: (message: string, agentId?: string) => Promise<AgentResponse>
  clearError: () => void
}

export function useConductor(): UseConductorReturn {
  const [conductor] = useState(() => new ConductorService())
  const [activeAgents, setActiveAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update active agents list
  const updateActiveAgents = useCallback(() => {
    setActiveAgents(conductor.getActiveAgents())
  }, [conductor])

  // Initialize conductor and set up listeners
  useEffect(() => {
    updateActiveAgents()

    // Set up event listeners for conductor state changes
    const handleAgentAdded = () => updateActiveAgents()
    const handleAgentRemoved = () => updateActiveAgents()
    const handleAgentStatusChanged = () => updateActiveAgents()

    // In a real implementation, these would be proper event listeners
    // For now, we'll poll for changes
    const interval = setInterval(updateActiveAgents, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [conductor, updateActiveAgents])

  const addAgent = useCallback(async (type: string, config?: any): Promise<Agent> => {
    setIsLoading(true)
    setError(null)

    try {
      const agent = await conductor.addAgent(type, config)
      updateActiveAgents()
      // If addAgent does not return an Agent, fetch the agent from conductor after adding
      if (typeof agent === 'undefined') {
        const agents = conductor.getActiveAgents()
        return agents[agents.length - 1]
      }
      return agent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add agent'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [conductor, updateActiveAgents])

  const removeAgent = useCallback(async (agentId: string): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      await conductor.removeAgent(agentId)
      updateActiveAgents()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove agent'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [conductor, updateActiveAgents])

  const sendMessage = useCallback(async (message: string, agentId?: string): Promise<AgentResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await conductor.processMessage(message, agentId)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process message'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [conductor])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    conductor,
    activeAgents,
    isLoading,
    error,
    addAgent,
    removeAgent,
    sendMessage,
    clearError
  }
}