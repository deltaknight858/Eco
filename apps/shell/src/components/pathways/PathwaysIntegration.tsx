/**
 * PathwaysIntegration.tsx - Main integration component
 * Connects Pathways Wizard with the existing Eco ecosystem
 */

import React, { useState, useEffect } from 'react'
import { PathwaysWizard, PathwaysLauncher, PathwaysPanel, defaultPathwaySuggestions } from '../pathways'
import { useConductor } from '../hooks/useConductor'
import type { 
  PathwayDefinition, 
  PathwaySuggestion, 
  UserContext, 
  ProvenanceContext,
  ProvenanceTier 
} from '../../types/pathways'

interface PathwaysIntegrationProps {
  userId: string
  tier: ProvenanceTier
  className?: string
}

export const PathwaysIntegration: React.FC<PathwaysIntegrationProps> = ({
  userId,
  tier,
  className
}) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentPathway, setCurrentPathway] = useState<PathwayDefinition | null>(null)
  const [userContext, setUserContext] = useState<UserContext>({
    userId,
    tier,
    completedPathways: 0,
    currentPage: window.location.pathname,
    timeOnCurrentPage: 0,
    lastActivity: new Date().toISOString(),
    skills: [],
    preferences: {},
    requestedGuidance: false,
    showHints: true
  })

  const { conductor } = useConductor()

  // Track time on current page
  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      setUserContext(prev => ({
        ...prev,
        timeOnCurrentPage: Date.now() - startTime
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Mock pathways data - in real implementation, this would come from the conductor
  const mockPathways: PathwayDefinition[] = [
    {
      id: 'capsule-lifecycle',
      title: 'Capsule Creation Journey',
      description: 'Complete guide from concept to marketplace publication',
      category: 'capsule',
      difficulty: 'intermediate',
      estimatedDuration: 45,
      steps: [
        {
          id: 'concept',
          title: 'Define Capsule Concept',
          description: 'Articulate your capsule\'s purpose and scope',
          type: 'input',
          provenanceTier: 'bronze'
        },
        {
          id: 'scaffold',
          title: 'Generate Capsule Structure',
          description: 'AI-powered scaffolding based on your concept',
          type: 'ai-assisted',
          provenanceTier: 'bronze'
        },
        {
          id: 'develop',
          title: 'Develop Capsule Content',
          description: 'Create and refine your capsule\'s functionality',
          type: 'action',
          provenanceTier: 'bronze'
        },
        {
          id: 'test',
          title: 'Validate and Test',
          description: 'Comprehensive testing and quality assurance',
          type: 'validation',
          provenanceTier: 'silver'
        },
        {
          id: 'publish',
          title: 'Marketplace Publication',
          description: 'Share your capsule with the community',
          type: 'action',
          provenanceTier: 'gold'
        }
      ],
      milestones: [
        { step: 'concept', title: 'Idea Captured', tier: 'bronze' },
        { step: 'develop', title: 'Prototype Ready', tier: 'bronze' },
        { step: 'test', title: 'Quality Assured', tier: 'silver' },
        { step: 'publish', title: 'Community Shared', tier: 'gold' }
      ],
      prerequisites: [],
      outcomes: ['Marketplace-ready capsule', 'Gold-tier provenance'],
      provenanceMapping: {},
      configurable: true,
      variants: [],
      personalizable: true,
      aiAssisted: true,
      suggestionsEnabled: true,
      autoValidation: true
    }
  ]

  const handleLaunchPathway = async (suggestion: PathwaySuggestion) => {
    // Find the full pathway definition
    const pathway = mockPathways.find(p => p.id === suggestion.id)
    if (pathway) {
      setCurrentPathway(pathway)
      setIsPanelOpen(true)
    }
  }

  const handleClosePath = () => {
    setIsPanelOpen(false)
    setCurrentPathway(null)
  }

  const provenanceContext: ProvenanceContext = {
    userId,
    tier,
    timestamp: new Date().toISOString(),
    sessionId: 'pathway-session-' + Date.now()
  }

  return (
    <div className={className}>
      {/* Contextual Pathways Launcher */}
      <PathwaysLauncher
        suggestedPathways={defaultPathwaySuggestions}
        context={userContext}
        tier={tier}
        onLaunchPathway={handleLaunchPathway}
      />

      {/* Immersive Pathways Panel */}
      {currentPathway && (
        <PathwaysPanel
          isOpen={isPanelOpen}
          onClose={handleClosePath}
          pathway={currentPathway}
          collaborative={false}
          provenance={provenanceContext}
          tier={tier}
        />
      )}

      {/* Integration with existing Assist Panel */}
      <style>
        {`
        /* Global styles for pathway integration */
        .pathway-integration {
          z-index: 1000;
        }

        /* Enhanced assist panel for pathways */
        .assist-panel[data-agent="pathways"] {
          background: linear-gradient(135deg, 
            rgba(139, 69, 19, 0.1) 0%, 
            rgba(160, 82, 45, 0.1) 100%);
          border-left-color: #8B4513;
        }

        .assist-panel[data-agent="pathways"] .agent-indicator {
          color: #DEB887;
        }

        /* Wizard-themed glass morphism */
        .pathways-glass {
          background: rgba(139, 69, 19, 0.1);
          border: 1px solid rgba(222, 184, 135, 0.2);
          backdrop-filter: blur(20px);
        }

        /* Cinematic animations */
        @keyframes wizard-entrance {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
            filter: blur(10px);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05) translateY(-5px);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        .pathway-entrance {
          animation: wizard-entrance 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Step progression effects */
        @keyframes step-complete {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .step-completed {
          animation: step-complete 0.5s ease;
        }

        /* Tier progression glow */
        .tier-bronze { box-shadow: 0 0 20px rgba(255, 165, 0, 0.3); }
        .tier-silver { box-shadow: 0 0 20px rgba(192, 192, 192, 0.3); }
        .tier-gold { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4); }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .pathways-panel {
            width: 100vw !important;
          }
          
          .pathway-hint-bubble {
            width: calc(100vw - 32px) !important;
            right: 16px !important;
          }
        }
        `}
      </style>
    </div>
  )
}

/**
 * Hook for accessing Pathways functionality
 */
export const usePathways = () => {
  const [isPathwayActive, setIsPathwayActive] = useState(false)
  const [currentJourney, setCurrentJourney] = useState<string | null>(null)

  const startJourney = (pathwayId: string) => {
    setCurrentJourney(pathwayId)
    setIsPathwayActive(true)
  }

  const endJourney = () => {
    setCurrentJourney(null)
    setIsPathwayActive(false)
  }

  const pauseJourney = () => {
    setIsPathwayActive(false)
  }

  const resumeJourney = () => {
    if (currentJourney) {
      setIsPathwayActive(true)
    }
  }

  return {
    isPathwayActive,
    currentJourney,
    startJourney,
    endJourney,
    pauseJourney,
    resumeJourney
  }
}

export default PathwaysIntegration