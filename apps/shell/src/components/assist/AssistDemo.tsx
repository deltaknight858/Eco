/**
 * AssistDemo.tsx
 * Demo component showing the full assist integration
 */

'use client'

import { useState } from 'react'
import { AssistLauncher } from './AssistLauncher'
import { AssistPanel } from './AssistPanel'
import { AssistMindmap } from './AssistMindmap'

// Mock data for demonstration
const mockNodes = [
  { id: 'conductor', label: 'Conductor', type: 'agent' as const, tier: 'gold' as const, status: 'active' as const },
  { id: 'codegen', label: 'Code Gen', type: 'agent' as const, tier: 'silver' as const, status: 'idle' as const },
  { id: 'mindmap', label: 'Mind Map', type: 'agent' as const, tier: 'bronze' as const, status: 'idle' as const },
  { id: 'docs', label: 'Docs', type: 'agent' as const, tier: 'silver' as const, status: 'idle' as const },
  { id: 'analyzer', label: 'Analyzer', type: 'agent' as const, tier: 'gold' as const, status: 'idle' as const },
  { id: 'task1', label: 'Generate Component', type: 'task' as const },
  { id: 'task2', label: 'Update Docs', type: 'task' as const },
  { id: 'dep1', label: 'TypeScript', type: 'dependency' as const },
  { id: 'dep2', label: 'React', type: 'dependency' as const },
  { id: 'output1', label: 'Component.tsx', type: 'output' as const },
  { id: 'output2', label: 'README.md', type: 'output' as const }
]

const mockLinks = [
  { source: 'conductor', target: 'codegen', type: 'orchestrates' as const },
  { source: 'conductor', target: 'docs', type: 'orchestrates' as const },
  { source: 'codegen', target: 'task1', type: 'produces' as const },
  { source: 'docs', target: 'task2', type: 'produces' as const },
  { source: 'task1', target: 'dep1', type: 'depends' as const },
  { source: 'task1', target: 'dep2', type: 'depends' as const },
  { source: 'task1', target: 'output1', type: 'produces' as const },
  { source: 'task2', target: 'output2', type: 'produces' as const },
  { source: 'analyzer', target: 'dep1', type: 'consumes' as const },
  { source: 'analyzer', target: 'dep2', type: 'consumes' as const }
]

export function AssistDemo() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>()
  const [showMindmap, setShowMindmap] = useState(false)

  const handleOpenPanel = (agent?: string) => {
    setSelectedAgent(agent)
    setIsPanelOpen(true)
  }

  const handleNodeClick = (node: any) => {
    if (node.type === 'agent') {
      handleOpenPanel(node.id)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
            Eco Assist Demo
          </h1>
          <p className="text-slate-400 mb-6">
            Demonstration of the agentic ecosystem integration with V.I.B.E components
          </p>
          
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setShowMindmap(!showMindmap)}
              className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-cyan-300 transition-colors"
            >
              {showMindmap ? 'Hide' : 'Show'} Agent Mindmap
            </button>
            <button
              onClick={() => handleOpenPanel('conductor')}
              className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 hover:border-violet-500/50 rounded-lg text-violet-300 transition-colors"
            >
              Open Conductor Chat
            </button>
          </div>
        </div>

        {showMindmap && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-cyan-200">Agent Ecosystem Visualization</h2>
            <AssistMindmap
              nodes={mockNodes}
              links={mockLinks}
              onNodeClick={handleNodeClick}
              onNodeHover={(node) => console.log('Hovered:', node)}
              width={800}
              height={500}
              className="mx-auto"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature cards */}
          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-cyan-200">🤖 Conductor Service</h3>
            <p className="text-slate-300 text-sm mb-4">
              Orchestrates multiple AI agents with tier-based limitations and provenance tracking.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Agent lifecycle management</li>
              <li>• Rate limiting by tier</li>
              <li>• Provenance stamping</li>
              <li>• Error handling & recovery</li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-violet-200">🎛️ Radial Launcher</h3>
            <p className="text-slate-300 text-sm mb-4">
              Glass morphism floating action button with expandable agent selection menu.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• V.I.B.E RadialCommandCenter based</li>
              <li>• Smooth animations</li>
              <li>• Agent-specific icons</li>
              <li>• Context-aware tooltips</li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-emerald-200">💬 Chat Interface</h3>
            <p className="text-slate-300 text-sm mb-4">
              Sliding panel with agent chat interface and provenance display.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• V.I.B.E AgentChatPanel based</li>
              <li>• Message provenance badges</li>
              <li>• Agent status indicators</li>
              <li>• Glass morphism styling</li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-amber-200">🧠 Mind Map</h3>
            <p className="text-slate-300 text-sm mb-4">
              Interactive D3 visualization of agent relationships and dependencies.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• V.I.B.E D3MindMap based</li>
              <li>• Force-directed layout</li>
              <li>• Tier-based node styling</li>
              <li>• Interactive zoom & pan</li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-rose-200">🏷️ Provenance DNA</h3>
            <p className="text-slate-300 text-sm mb-4">
              Embedded tier system throughout the ecosystem for quality assurance.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Bronze, Silver, Gold tiers</li>
              <li>• Confidence scoring</li>
              <li>• Source attribution</li>
              <li>• Audit trail logging</li>
            </ul>
          </div>

          <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-indigo-200">⚡ Integration</h3>
            <p className="text-slate-300 text-sm mb-4">
              Seamless integration with existing Halo components and V.I.B.E foundation.
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• TypeScript + React</li>
              <li>• Tailwind CSS styling</li>
              <li>• Modular architecture</li>
              <li>• Mock data ready</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Assist Launcher */}
      <AssistLauncher
        onOpenPanel={handleOpenPanel}
        isActive={isPanelOpen}
      />

      {/* Assist Panel */}
      <AssistPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedAgent={selectedAgent}
      />
    </div>
  )
}