/**
 * PathwaysWizard.tsx - The Master Guide
 * "A wizard arrives precisely when needed" - Contextual guided navigation
 */

import React, { useMemo, useState } from 'react'
import { HaloCard, HaloBadge } from '@eco/halo-components'
import { WizardStepper } from './primitives/WizardStepper'
import { WizardTimeline } from './primitives/WizardTimeline'
import { useAgentStream } from '../hooks/useAgentStream'
import { usePathwayProgress } from '../hooks/usePathwayProgress'
import type {
  AgentEvent,
  AgentEventType,
  AgentStreamOptions,
  PathwayDefinition,
  PathwayStep,
  ProvenanceContext,
  ProvenanceTier
} from '../../types'
import type { UseAgentStreamOptions } from '../hooks/useAgentStream'

interface PathwaysWizardProps {
  pathway: PathwayDefinition
  currentStep: number
  onStepChange: (step: number) => void
  onComplete: (results: PathwayResults) => void
  provenance: ProvenanceContext
  tier: ProvenanceTier
  capsuleId?: string
  streamEnabled?: boolean
  streamOptions?: AgentStreamOptions
}

interface PathwayResults {
  completedSteps: string[]
  artifacts: Record<string, any>
  provenanceAdvancement?: ProvenanceTier
  duration: number
}

export const PathwaysWizard: React.FC<PathwaysWizardProps> = ({
  pathway,
  currentStep,
  onStepChange,
  onComplete,
  provenance,
  tier,
  capsuleId,
  streamEnabled = true,
  streamOptions: streamOptionsProp
}) => {
  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [startTime] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(false)

  const streamFilter = useMemo(() => {
    if (!streamEnabled) {
      return undefined
    }

    const baseFilter = {
      types: ['status', 'provenance', 'capsule'] as AgentEventType[]
    }

    if (capsuleId) {
      return {
        ...baseFilter,
        capsuleIds: [capsuleId]
      }
    }

    return baseFilter
  }, [capsuleId, streamEnabled])

  const computedStreamOptions = useMemo<UseAgentStreamOptions>(() => {
    if (streamEnabled === false) {
      return { enabled: false }
    }

    const mergedFilter = {
      ...(streamOptionsProp?.filter ?? {}),
      ...(streamFilter ?? {})
    }

    return {
      enabled: true,
      bufferSize: streamOptionsProp?.bufferSize ?? 120,
      realtime: streamOptionsProp?.realtime ?? true,
      throttleMs: streamOptionsProp?.throttleMs,
      filter: mergedFilter
    }
  }, [streamEnabled, streamOptionsProp, streamFilter])

  const {
    events,
    isConnected,
    connectionQuality
  } = useAgentStream(computedStreamOptions)

  const {
    stepProgress,
    activeSteps,
    completedSteps
  } = usePathwayProgress({
    pathway,
    events,
    capsuleId
  })

  const currentStepData = pathway.steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === pathway.steps.length - 1

  const streamingActive = computedStreamOptions.enabled !== false

  const eventFeed = useMemo(() => {
    if (!streamingActive) return [] as AgentEvent[]
    return events.slice(-4).reverse()
  }, [events, streamingActive])

  const stepsForStepper = useMemo(() => (
    pathway.steps.map((step, index) => {
      const progress = stepProgress[step.id]?.progress
      const completedByStream = completedSteps.includes(step.id)
      return {
        id: step.id,
        title: step.title,
        description: step.description,
        completed: index < currentStep || completedByStream,
        current: index === currentStep,
        locked: index > currentStep + 1,
        live: streamingActive && activeSteps.includes(step.id),
        progress
      }
    })
  ), [pathway.steps, currentStep, completedSteps, streamingActive, activeSteps, stepProgress])

  // HaloBadge supports primary | secondary | outline; use classes for tiers
  const badgeClassForTier = (t: ProvenanceTier) => {
    switch (t) {
      case 'bronze':
        return 'bg-orange-500 text-black'
      case 'silver':
        return 'bg-gray-300 text-black'
      case 'gold':
        return 'bg-yellow-400 text-black'
      default:
        return ''
    }
  }

  const handleStepComplete = async (data: any) => {
    setIsLoading(true)

    setStepData(prev => ({
      ...prev,
      [currentStepData.id]: data
    }))

    await new Promise(resolve => setTimeout(resolve, 800))

    if (isLastStep) {
      const results: PathwayResults = {
        completedSteps: pathway.steps.map(step => step.id),
        artifacts: { ...stepData, [currentStepData.id]: data },
        duration: Date.now() - startTime
      }
      onComplete(results)
    } else {
      onStepChange(currentStep + 1)
    }

    setIsLoading(false)
  }

  const handlePrevious = () => {
    if (!isFirstStep) onStepChange(currentStep - 1)
  }

  const currentStepProgress = stepProgress[currentStepData?.id ?? '']?.progress

  const formatEventTitle = (event: AgentEvent) => {
    switch (event.type) {
      case 'status':
        return `${event.agent} status`
      case 'provenance':
        return `${event.agent} advanced provenance`
      case 'capsule':
        return `${event.agent} updated ${event.capsuleId ?? 'capsule'}`
      case 'marketplace':
        return `Marketplace activity`
      case 'orchestration':
        return `Workflow orchestration`
      default:
        return 'Agent activity'
    }
  }

  const formatEventSubtitle = (event: AgentEvent) => {
    switch (event.type) {
      case 'status':
        return `State: ${event.payload?.state ?? 'unknown'}`
      case 'provenance':
        return `${event.payload?.fromTier ?? 'bronze'} → ${event.payload?.toTier ?? 'silver'}`
      case 'capsule':
        return `Step: ${event.payload?.currentStep ?? event.payload?.lifecycle ?? 'progress'} (${event.payload?.progress ?? 0}%)`
      case 'marketplace':
        return `Action: ${event.payload?.action ?? 'update'}`
      case 'orchestration':
        return `Stage: ${event.payload?.stage ?? 'flow'}`
      default:
        return ''
    }
  }

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const seconds = Math.round(diff / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.round(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className={`pathways-wizard tier-${tier}`}>
      {/* Pathway Header */}
      <div className="pathway-header mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{pathway.title}</h1>
            <p className="text-gray-300 mb-3">{pathway.description}</p>
            <div className="flex items-center gap-3">
              <HaloBadge variant="outline" className={`provenance-badge ${badgeClassForTier(tier)}`}>
                {tier.toUpperCase()} TIER
              </HaloBadge>
              <span className="text-sm text-gray-400">{pathway.estimatedDuration}min journey</span>
            </div>
          </div>

          {/* Provenance Context */}
          <div className="provenance-context">
            <div className="text-right">
              <div className="text-sm text-gray-400">Provenance Context</div>
              <div className="text-white font-medium">{provenance.userId}</div>
              <div className="text-xs text-gray-500">Session: {provenance.sessionId?.slice(0, 8)}...</div>
            </div>
          </div>
        </div>
      </div>

      <div className="wizard-content grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Step Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <WizardStepper
            steps={stepsForStepper}
            tier={tier}
            onStepClick={(stepIndex) => {
              if (stepIndex <= currentStep + 1) onStepChange(stepIndex)
            }}
          />

          {streamingActive && (
            <HaloCard variant="glass" className="p-4 bg-slate-900/50 border border-slate-700/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Live Activity</span>
                <span className={`text-xs ${isConnected ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isConnected ? 'Connected' : 'Offline'} • {connectionQuality}%
                </span>
              </div>

              <div className="space-y-2">
                {eventFeed.length === 0 && (
                  <p className="text-xs text-gray-400">No live events yet. Streaming will appear here.</p>
                )}

                {eventFeed.map(event => (
                  <div key={event.id} className="flex items-start justify-between gap-3 rounded-md bg-slate-800/60 p-2 border border-slate-700/40">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-white">{formatEventTitle(event)}</div>
                      <div className="text-[11px] text-gray-400">{formatEventSubtitle(event)}</div>
                    </div>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{formatRelativeTime(event.timestamp)}</span>
                  </div>
                ))}
              </div>
            </HaloCard>
          )}
        </div>

        {/* Center: Current Step Content */}
        <div className="lg:col-span-2">
          <HaloCard variant="glass" className="step-content-card">
            <div className="step-header mb-6">
              <div className="flex items-center gap-3 mb-3">
                <HaloBadge variant="outline" className={badgeClassForTier(currentStepData.provenanceTier)}>
                  Step {currentStep + 1}
                </HaloBadge>
                <h2 className="text-xl font-semibold text-white">{currentStepData.title}</h2>
              </div>
              <p className="text-gray-300 mb-4">{currentStepData.description}</p>

              {streamingActive && typeof currentStepProgress === 'number' && (
                <div className="text-xs text-emerald-300">
                  Live progress: {Math.round(currentStepProgress)}%
                </div>
              )}
            </div>

            {/* Dynamic Step Component */}
            <div className="step-component mb-6">
              <PathwayStepRenderer
                step={currentStepData}
                data={stepData[currentStepData.id]}
                tier={tier}
                onComplete={handleStepComplete}
                isLoading={isLoading}
              />
            </div>

            {/* Navigation Controls */}
            <div className="step-navigation flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isFirstStep ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                Previous
              </button>

              <div className="step-indicator">
                <span className="text-sm text-gray-400">{currentStep + 1} of {pathway.steps.length}</span>
              </div>

              <div className="flex gap-2">
                {currentStepData.aiSuggestions && (
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all">
                    💡 AI Hints
                  </button>
                )}

                {isLastStep && (
                  <button
                    onClick={() => handleStepComplete({})}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Completing...' : 'Complete Journey'}
                  </button>
                )}
              </div>
            </div>
          </HaloCard>
        </div>
      </div>

      {/* Bottom: Timeline */}
      <div className="pathway-timeline mt-8">
        <WizardTimeline
          events={(pathway.milestones?.map(milestone => {
            const stepIdx = pathway.steps.findIndex(s => s.id === milestone.step)
            const status = stepIdx < currentStep ? 'completed' : stepIdx === currentStep ? 'current' : 'pending'
            return {
              id: milestone.step,
              title: milestone.title,
              description: `Achieve ${milestone.tier} tier`,
              status,
              tier: milestone.tier
            }
          })) || []}
          tier={tier}
        />
      </div>

      <style>{`
        .pathways-wizard {
          --glass-bg: rgba(255, 255, 255, 0.05);
          --glass-border: rgba(255, 255, 255, 0.1);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          padding: 2rem;
        }

        /* Tier variables applied via classes (no inline styles) */
        .pathways-wizard.tier-bronze {
          --tier-primary: #FFA500;
          --tier-glow: 0 0 20px rgba(255, 165, 0, 0.3);
        }
        .pathways-wizard.tier-silver {
          --tier-primary: #C0C0C0;
          --tier-glow: 0 0 20px rgba(192, 192, 192, 0.3);
        }
        .pathways-wizard.tier-gold {
          --tier-primary: #FFD700;
          --tier-glow: 0 0 20px rgba(255, 215, 0, 0.4);
        }

        .provenance-badge { box-shadow: var(--tier-glow); animation: tier-pulse 2s infinite; }
        @keyframes tier-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }

        .step-content-card { min-height: 400px; background: rgba(0, 0, 0, 0.2); }
        .pathway-stepper .step-item.active { box-shadow: var(--tier-glow); }
      `}</style>
    </div>
  )
}

/**
 * Dynamic Step Component Renderer
 */
interface PathwayStepRendererProps {
  step: PathwayStep
  data?: any
  tier: ProvenanceTier
  onComplete: (data: any) => void
  isLoading: boolean
}

const PathwayStepRenderer: React.FC<PathwayStepRendererProps> = ({
  step,
  data,
  tier,
  onComplete,
  isLoading
}) => {
  const [formData, setFormData] = useState(data || {})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(formData)
  }

  // Render different step types
  switch (step.type) {
    case 'input':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {step.title} Information
            </label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder={`Enter ${step.title.toLowerCase()} details...`}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !formData.content}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </form>
      )

    case 'ai-assisted':
      return (
        <div className="ai-step space-y-4">
          <div className="ai-status bg-blue-900/30 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm">AI Assistant Active</span>
            </div>
            <p className="text-gray-300">Our AI is generating content for: {step.title}</p>
          </div>
          
          <button
            onClick={() => onComplete({ aiGenerated: true, content: `AI-generated ${step.title}` })}
            disabled={isLoading}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Generating...' : '🤖 Generate with AI'}
          </button>
        </div>
      )

    case 'validation':
      return (
        <div className="validation-step space-y-4">
          <div className="validation-status bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-yellow-300 font-medium mb-2">Quality Validation</h3>
            <p className="text-gray-300 mb-3">Checking {step.title.toLowerCase()} requirements...</p>
            <div className="validation-items space-y-2">
              {step.tierRequirements?.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">{req.description}</span>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => onComplete({ validated: true, tier: step.provenanceTier })}
            disabled={isLoading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Validating...' : '✅ Validate & Continue'}
          </button>
        </div>
      )

    default:
      return (
        <div className="default-step space-y-4">
          <p className="text-gray-300">Complete the {step.title} step to continue.</p>
          <button
            onClick={() => onComplete({ completed: true })}
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Processing...' : 'Mark Complete'}
          </button>
        </div>
      )
  }
}

export default PathwaysWizard