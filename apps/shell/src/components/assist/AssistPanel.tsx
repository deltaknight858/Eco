/**
 * AssistPanel.tsx
 * Based on V.I.B.E/packages/ui/AgentChatPanel.tsx
 * 
 * Sliding panel with chat interface for agent interaction
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@eco/halo-components'
import { useConductor as useConductorHook } from '../hooks/useConductor'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agentId?: string
  provenance?: {
    tier: 'bronze' | 'silver' | 'gold'
    confidence: number
    sources?: string[]
  }
}

interface AssistPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedAgent?: string
  className?: string
}

export function AssistPanel({ isOpen, onClose, selectedAgent, className }: AssistPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const { conductor, activeAgents } = useConductorHook()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Use conductor service to process message
      const response = await conductor.processMessage(inputValue, selectedAgent)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        agentId: response.agentId,
        provenance: response.provenance
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
        provenance: { tier: 'bronze', confidence: 0 }
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getProvenanceBadge = (provenance?: Message['provenance']) => {
    if (!provenance) return null

    const tierColors = {
      bronze: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      silver: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
      gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    }

    return (
      <div className={cn(
        'inline-flex items-center px-2 py-1 rounded-full text-xs border',
        tierColors[provenance.tier]
      )}>
        {provenance.tier} • {Math.round(provenance.confidence * 100)}%
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-96 z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
      >
        <div className="h-full bg-slate-900/95 backdrop-blur-md border-l border-cyan-400/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-cyan-200">Eco Assistant</h2>
                {selectedAgent && (
                  <p className="text-sm text-slate-400">Agent: {selectedAgent}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Active agents indicator */}
            {activeAgents.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {activeAgents.map(agent => (
                  <div
                    key={agent.id}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30"
                  >
                    {agent.id}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-8">
                <div className="text-4xl mb-4">🤖</div>
                <p>Welcome to Eco Assistant!</p>
                <p className="text-sm mt-2">Ask me anything about your codebase.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] p-3 rounded-lg',
                      message.role === 'user'
                        ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-500/30'
                        : 'bg-slate-800/50 text-slate-200 border border-slate-600/30'
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-slate-400">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      {message.role === 'assistant' && getProvenanceBadge(message.provenance)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex space-x-2">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 min-h-[40px] max-h-32 p-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:bg-slate-700/30 border border-cyan-500/30 hover:border-cyan-500/50 disabled:border-slate-600/30 rounded-lg text-cyan-300 disabled:text-slate-500 transition-colors disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function useConductor() {
  // ...existing code...

  // Dummy conductor object for demonstration
  const conductor = {};

  // Initialize activeAgents, e.g., as an empty array or with sample data
  const activeAgents: { id: string }[] = [];

  // Add processMessage method to conductor
  const processMessage = async (message: string, agentId?: string) => {
    // Implement your logic here, e.g., call an API or process locally
    // Example response structure:
    return {
      content: "This is a sample response.",
      agentId: agentId ?? "default-agent",
      provenance: {
        tier: "silver",
        confidence: 0.85,
        sources: []
      }
    }
  }

  return {
    conductor: {
      ...conductor,
      processMessage
    },
    activeAgents
  }
}