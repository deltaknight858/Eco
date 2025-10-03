/**
 * WizardStepper.tsx - Local Lightweight Stepper Component
 * Horizontal step navigation with eco glass morphism styling
 */

import React from 'react'

interface WizardStepperProps {
  steps: Array<{
    id: string
    title: string
    description?: string
    completed: boolean
    current: boolean
    locked?: boolean
    live?: boolean
    progress?: number
  }>
  onStepClick?: (index: number) => void
  tier?: 'bronze' | 'silver' | 'gold'
}

const tierColors = {
  bronze: 'from-orange-400 to-orange-600',
  silver: 'from-gray-300 to-gray-500', 
  gold: 'from-yellow-400 to-yellow-600'
}

export function WizardStepper({ 
  steps, 
  onStepClick, 
  tier = 'bronze' 
}: WizardStepperProps) {
  const currentTierGradient = tierColors[tier]

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {/* Step Circle */}
          <div
            className={`
              relative flex items-center justify-center
              w-12 h-12 rounded-full border-2 
              transition-all duration-300 cursor-pointer
              ${step.completed 
                ? `bg-gradient-to-r ${currentTierGradient} border-transparent text-white shadow-lg`
                : step.current
                ? `border-current bg-gradient-to-r ${currentTierGradient} bg-opacity-20 backdrop-blur-sm`
                : step.locked
                ? 'border-gray-600 bg-gray-800/50 text-gray-500 cursor-not-allowed'
                : 'border-gray-500 bg-slate-800/50 text-gray-400 hover:border-gray-400 backdrop-blur-sm'
              }
            `}
            onClick={() => !step.locked && onStepClick?.(index)}
          >
            {step.live && !step.completed && (
              <div className="absolute -inset-1 rounded-full border border-emerald-400/60 animate-ping" />
            )}

            {step.completed ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-sm font-semibold">{index + 1}</span>
            )}
            
            {/* Current step glow */}
            {step.current && (
              <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${currentTierGradient} opacity-30 animate-pulse`} />
            )}
          </div>

          {/* Step Info */}
          <div className="flex-1 ml-4">
            <div
              className={`
                text-sm font-medium transition-colors
                ${step.completed || step.current 
                  ? 'text-white' 
                  : step.locked 
                  ? 'text-gray-500' 
                  : 'text-gray-300'
                }
              `}
            >
              {step.title}
            </div>
            {step.description && (
              <div className="text-xs text-gray-400 mt-1">
                {step.description}
              </div>
            )}

            {typeof step.progress === 'number' && step.progress > 0 && !step.completed && (
              <div className="mt-2 text-xs text-emerald-300">
                Live progress: {Math.min(100, Math.round(step.progress))}%
              </div>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`
                flex-1 h-1 mx-4 rounded-full transition-all duration-500
                ${step.completed
                  ? `bg-gradient-to-r ${currentTierGradient}`
                  : step.current
                  ? `bg-gradient-to-r ${currentTierGradient} opacity-60`
                  : 'bg-gray-700'
                }
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default WizardStepper