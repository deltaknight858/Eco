/**
 * WizardTimeline.tsx - Local Timeline Component
 * Vertical timeline with provenance tier styling
 */

import React from 'react'
import { HaloBadge } from '@eco/halo-components'

interface TimelineEvent {
  id: string
  title: string
  description: string
  status: 'completed' | 'current' | 'pending'
  tier?: 'bronze' | 'silver' | 'gold'
  timestamp?: string
}

interface WizardTimelineProps {
  events: TimelineEvent[]
  tier?: 'bronze' | 'silver' | 'gold'
}

const tierColors = {
  bronze: {
    bg: 'bg-orange-500',
    ring: 'ring-orange-500/30',
    text: 'text-orange-400'
  },
  silver: {
    bg: 'bg-gray-400',
    ring: 'ring-gray-400/30', 
    text: 'text-gray-300'
  },
  gold: {
    bg: 'bg-yellow-500',
    ring: 'ring-yellow-500/30',
    text: 'text-yellow-400'
  }
}

export function WizardTimeline({ events, tier = 'bronze' }: WizardTimelineProps) {
  const currentTierColors = tierColors[tier]

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {/* Connector Line */}
              {eventIdx !== events.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-600"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex items-start space-x-3">
                {/* Timeline Marker */}
                <div className="relative">
                  <div
                    className={`
                      h-10 w-10 rounded-full flex items-center justify-center
                      transition-all duration-300
                      ${event.status === 'completed'
                        ? `${currentTierColors.bg} ${currentTierColors.ring} ring-4 backdrop-blur-sm`
                        : event.status === 'current'
                        ? `bg-slate-800 border-2 border-current ${currentTierColors.text} ${currentTierColors.ring} ring-4 backdrop-blur-sm`
                        : 'bg-slate-700 border-2 border-gray-500'
                      }
                    `}
                  >
                    {event.status === 'completed' ? (
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : event.status === 'current' ? (
                      <div className={`h-3 w-3 rounded-full ${currentTierColors.bg} animate-pulse`} />
                    ) : (
                      <div className="h-3 w-3 rounded-full bg-gray-500" />
                    )}
                  </div>

                  {/* Glow effect for current step */}
                  {event.status === 'current' && (
                    <div className={`absolute inset-0 rounded-full ${currentTierColors.bg} opacity-20 animate-ping`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`
                        text-sm font-medium transition-colors
                        ${event.status === 'completed' || event.status === 'current'
                          ? 'text-white'
                          : 'text-gray-400'
                        }
                      `}>
                        {event.title}
                      </p>
                      
                      {event.tier && (
                        <div className="mt-1">
                          <HaloBadge variant={event.tier}>{event.tier}</HaloBadge>
                        </div>
                      )}
                    </div>
                    
                    {event.timestamp && (
                      <time className="text-xs text-gray-500">
                        {event.timestamp}
                      </time>
                    )}
                  </div>
                  
                  <p className={`
                    mt-2 text-sm transition-colors
                    ${event.status === 'completed' || event.status === 'current'
                      ? 'text-gray-300'
                      : 'text-gray-500'
                    }
                  `}>
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WizardTimeline