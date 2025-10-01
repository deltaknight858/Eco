/**
 * AssistLauncher.tsx
 * Based on V.I.B.E/packages/ui/RadialCommandCenter.tsx
 * 
 * Floating action button with glass morphism that opens the assist panel
 */

'use client'

import { useState } from 'react'
import { cn } from '@eco/halo-components'

interface AssistLauncherProps {
  onOpenPanel: (agent?: string) => void
  isActive?: boolean
  className?: string
}

export function AssistLauncher({ onOpenPanel, isActive = false, className }: AssistLauncherProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const agents = [
    { id: 'codegen', icon: '🤖', label: 'Code Gen', description: 'Generate code and components' },
    { id: 'mindmap', icon: '🧠', label: 'Mind Map', description: 'Visualize relationships' },
    { id: 'docs', icon: '📚', label: 'Docs', description: 'Documentation assistance' },
    { id: 'analyzer', icon: '🔍', label: 'Analyze', description: 'Code analysis and insights' }
  ]

  const handleAgentSelect = (agentId: string) => {
    onOpenPanel(agentId)
    setIsExpanded(false)
  }

  return (
    <div className={cn('fixed bottom-6 right-6 z-50', className)}>
      {/* Expanded radial menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-3">
          {agents.map((agent, index) => (
            <div
              key={agent.id}
              className="flex items-center justify-end group"
              style={{
                animation: `slideInRadial 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Agent label */}
              <div className="mr-4 px-3 py-2 bg-slate-900/90 backdrop-blur-sm border border-cyan-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="text-sm font-medium text-cyan-200">{agent.label}</div>
                <div className="text-xs text-slate-400">{agent.description}</div>
              </div>
              
              {/* Agent button */}
              <button
                onClick={() => handleAgentSelect(agent.id)}
                className="w-12 h-12 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-cyan-400/30 rounded-full flex items-center justify-center text-xl hover:from-cyan-500/20 hover:to-cyan-600/20 hover:border-cyan-400/60 hover:shadow-cyan-400/30 hover:shadow-lg transition-all duration-300 hover:scale-110"
              >
                {agent.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main launcher button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 hover:scale-110',
          'bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-md',
          'border-2 border-cyan-400/40 hover:border-cyan-400/80',
          'shadow-lg hover:shadow-cyan-400/30 hover:shadow-xl',
          'hover:from-cyan-500/20 hover:to-cyan-600/20',
          isActive && 'from-cyan-500/30 to-cyan-600/30 border-cyan-400/80 shadow-cyan-400/40',
          isExpanded && 'rotate-45'
        )}
      >
        {isExpanded ? '×' : '🤖'}
      </button>

      {/* Background overlay when expanded */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <style jsx>{`
        @keyframes slideInRadial {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}