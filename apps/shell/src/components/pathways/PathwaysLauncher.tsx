/**
 * PathwaysLauncher.tsx - Contextual Floating Guide
 * Glass morphism floating button leveraging RadialCommandCenter pattern
 */

import React, { useState, useEffect } from 'react'
import { RadialCommandCenter } from '../assist'
// If the file does not exist, create RadialCommandCenter.tsx in ../assist/ or adjust the path accordingly.
// Define missing types locally (or update import path if types exist elsewhere)
export type ProvenanceTier = 'bronze' | 'silver' | 'gold'

export interface UserContext {
  completedPathways: number
  timeOnCurrentPage: number
  requestedGuidance?: boolean
  showHints?: boolean
}

export interface PathwaySuggestion {
  id: string
  title: string
  description: string
  icon: string
  category: 'capsule' | 'contributor' | 'orchestration' | 'custom'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  recommendedTier: ProvenanceTier
  priority: number
}

interface PathwaysLauncherProps {
  suggestedPathways: PathwaySuggestion[]
  context: UserContext
  tier: ProvenanceTier
  onLaunchPathway: (pathway: PathwaySuggestion) => void
}

export const PathwaysLauncher: React.FC<PathwaysLauncherProps> = ({
  suggestedPathways,
  context,
  tier,
  onLaunchPathway
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<PathwaySuggestion[]>([])

  // Smart visibility based on user context
  useEffect(() => {
    const shouldShow = determineVisibility(context, suggestedPathways)
    setIsVisible(shouldShow)
  }, [context, suggestedPathways])

  // Filter and prioritize suggestions based on context
  useEffect(() => {
    const filtered = suggestedPathways
      .filter(pathway => getTierLevel(pathway.recommendedTier) <= getTierLevel(tier))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6) // Show top 6 suggestions

    setContextualSuggestions(filtered)
  }, [suggestedPathways, tier])

  const getTierLevel = (tier: ProvenanceTier): number => {
    switch (tier) {
      case 'bronze': return 1
      case 'silver': return 2  
      case 'gold': return 3
      default: return 1
    }
  }

  const determineVisibility = (context: UserContext, suggestions: PathwaySuggestion[]): boolean => {
    // Show launcher if:
    // 1. User is new (less than 3 completed pathways)
    // 2. User is stuck (same page for >2 minutes)
    // 3. User has high-priority suggestions available
    // 4. User explicitly requested guidance

    if (context.completedPathways < 3) return true
    if (context.timeOnCurrentPage > 120000) return true // 2 minutes
    if (suggestions.some(s => s.priority > 80)) return true
    if (context.requestedGuidance) return true

    return false
  }

  const handlePathwaySelect = (pathwayId: string) => {
    const pathway = contextualSuggestions.find(p => p.id === pathwayId)
    if (pathway) {
      onLaunchPathway(pathway)
    }
  }

  if (!isVisible || contextualSuggestions.length === 0) {
    return null
  }

  const tierColors = {
    bronze: '#FFA500',
    silver: '#C0C0C0', 
    gold: '#FFD700'
  }

  const actions = contextualSuggestions.map(pathway => ({
    id: pathway.id,
    icon: pathway.icon,
    label: pathway.title,
    description: pathway.description,
    color: tierColors[pathway.recommendedTier],
    badge: pathway.difficulty,
    onClick: () => handlePathwaySelect(pathway.id),
  disabled: getTierLevel(pathway.recommendedTier) > getTierLevel(tier),
    metadata: {
      duration: pathway.estimatedDuration,
      category: pathway.category,
      tier: pathway.recommendedTier
    }
  }))

  return (
    <>
      <RadialCommandCenter
        variant="pathways-wizard"
        position="bottom-right"
        offset={{ x: 24, y: 24 }}
        actions={actions}
        tier={tier}
        animated={true}
        className="pathways-launcher"
        triggerIcon="🧙‍♂️"
        triggerLabel="Pathways Guide"
        triggerDescription="Need guidance? I'm here to help!"
      />

      {/* Contextual Hint Bubble */}
      {context.showHints && (
        <div className="pathway-hint-bubble">
          <div className="hint-content">
            <div className="hint-header">
              <span className="hint-icon">💡</span>
              <span className="hint-title">Suggested Journey</span>
            </div>
            <div className="hint-body">
              <p className="hint-text">
                Ready for your next adventure? I've found {contextualSuggestions.length} guided pathways that match your experience level.
              </p>
              <div className="top-suggestion">
                <div className="suggestion-title">
                  {contextualSuggestions[0]?.icon} {contextualSuggestions[0]?.title}
                </div>
                <div className="suggestion-meta">
                  {contextualSuggestions[0]?.estimatedDuration}min • {contextualSuggestions[0]?.difficulty}
                </div>
              </div>
            </div>
            <button 
              onClick={() => handlePathwaySelect(contextualSuggestions[0]?.id)}
              className="hint-action"
            >
              Start Journey
            </button>
          </div>
        </div>
      )}

      <style>{`
        .pathways-launcher {
          z-index: 1000;
        }

        .pathway-hint-bubble {
          position: fixed;
          bottom: 120px;
          right: 24px;
          width: 320px;
          background: rgba(0, 0, 0, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          padding: 1rem;
          z-index: 999;
          animation: slide-in-up 0.3s ease-out;
        }

        .hint-content {
          color: white;
        }

        .hint-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .hint-icon {
          font-size: 1.2rem;
        }

        .hint-title {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .hint-text {
          font-size: 0.85rem;
          color: #d1d5db;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .top-suggestion {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .suggestion-title {
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .suggestion-meta {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .hint-action {
          width: 100%;
          padding: 0.5rem;
          background: ${tierColors[tier]};
          color: black;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hint-action:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        @keyframes slide-in-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .pathway-hint-bubble {
            right: 16px;
            bottom: 100px;
            width: calc(100vw - 32px);
            max-width: 320px;
          }
        }
      `}</style>
    </>
  )
}

// Default pathways suggestions
export const defaultPathwaySuggestions: PathwaySuggestion[] = [
  {
    id: 'capsule-lifecycle',
    title: 'Capsule Creation Journey',
    description: 'Complete guide from concept to marketplace publication',
    icon: '📦',
    category: 'capsule',
    difficulty: 'intermediate',
    estimatedDuration: 45,
    recommendedTier: 'bronze',
    priority: 90
  },
  {
    id: 'contributor-onboarding',
    title: 'Welcome to Eco Ecosystem',
    description: 'Your journey from newcomer to valued contributor',
    icon: '🌱',
    category: 'contributor', 
    difficulty: 'beginner',
    estimatedDuration: 30,
    recommendedTier: 'bronze',
    priority: 95
  },
  {
    id: 'multi-agent-orchestration',
    title: 'AI Agent Orchestra',
    description: 'Master complex multi-agent workflows',
    icon: '🎼',
    category: 'orchestration',
    difficulty: 'advanced',
    estimatedDuration: 60,
    recommendedTier: 'silver',
    priority: 70
  },
  {
    id: 'marketplace-publisher',
    title: 'Marketplace Mastery',
    description: 'Publish and distribute your capsules',
    icon: '🏪',
    category: 'capsule',
    difficulty: 'intermediate', 
    estimatedDuration: 25,
    recommendedTier: 'silver',
    priority: 75
  },
  {
    id: 'provenance-expert',
    title: 'Provenance Excellence',
    description: 'Achieve gold-tier verification mastery',
    icon: '🏆',
    category: 'contributor',
    difficulty: 'advanced',
    estimatedDuration: 40,
    recommendedTier: 'gold',
    priority: 85
  },
  {
    id: 'collaboration-master',
    title: 'Team Collaboration',
    description: 'Lead collaborative development workflows',
    icon: '🤝',
    category: 'orchestration',
    difficulty: 'intermediate',
    estimatedDuration: 35,
    recommendedTier: 'silver', 
    priority: 65
  }
]

export default PathwaysLauncher