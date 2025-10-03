/**
 * PathwaysPanel.tsx - Immersive Journey Interface
 * Sliding panel with cinematic transitions and provenance highlights
 */

import React, { useState, useEffect } from 'react'
import { PathwaysWizard } from './PathwaysWizard'
// Update the import path to the actual location of your types
// Update this path to the actual location of your types file.
// For example, if types are in 'apps/shell/src/types', use:
import type {
  AgentStreamOptions,
  PathwayDefinition,
  ProvenanceContext,
  ProvenanceTier
} from '../../types/index'
// If you do not have a types file, create one at 'apps/shell/src/types/index.ts' and export the required types.

interface PathwaysPanelProps {
  isOpen: boolean
  onClose: () => void
  pathway: PathwayDefinition
  collaborative?: boolean
  provenance: ProvenanceContext
  tier: ProvenanceTier
  streamCapsuleId?: string
  streamEnabled?: boolean
  streamOptions?: AgentStreamOptions
}

interface CollaborationState {
  participants: Array<{
    id: string
    name: string
    avatar: string
    status: 'active' | 'idle' | 'away'
    currentStep: number
  }>
  sharedCursors: Array<{
    userId: string
    position: { x: number; y: number }
    color: string
  }>
  voiceChat: {
    enabled: boolean
    participants: string[]
    currentSpeaker?: string
  }
}

export const PathwaysPanel: React.FC<PathwaysPanelProps> = ({
  isOpen,
  onClose,
  pathway,
  collaborative = false,
  provenance,
  tier,
  streamCapsuleId,
  streamEnabled = true,
  streamOptions
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    participants: [],
    sharedCursors: [],
    voiceChat: { enabled: false, participants: [] }
  })

  // Panel animation states
  const [panelState, setPanelState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')

  useEffect(() => {
    if (isOpen && panelState === 'closed') {
      setPanelState('opening')
      setTimeout(() => setPanelState('open'), 300)
    } else if (!isOpen && panelState === 'open') {
      setPanelState('closing')
      setTimeout(() => setPanelState('closed'), 300)
    }
  }, [isOpen, panelState])

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
    
    // Sync with collaborators if in collaborative mode
    if (collaborative) {
      syncStepWithCollaborators(step)
    }
  }

  const handleComplete = async (results: any) => {
    setIsCompleting(true)
    
    try {
      // Process completion
      await processPathwayCompletion(results)
      
      // Show completion celebration
      showCompletionCelebration()
      
      // Close panel after celebration
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Pathway completion error:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const syncStepWithCollaborators = async (step: number) => {
    // Mock collaboration sync
    console.log(`Syncing step ${step} with collaborators`)
  }

  const processPathwayCompletion = async (results: any) => {
    // Mock completion processing
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const showCompletionCelebration = () => {
    // Trigger confetti and celebration animations
    const event = new CustomEvent('pathway-completed', {
      detail: { pathway: pathway.id, tier }
    })
    window.dispatchEvent(event)
  }

  if (panelState === 'closed') {
    return null
  }

  const progressPercent = Math.round((((currentStep + 1) / pathway.steps.length) * 100) / 5) * 5

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`pathway-backdrop ${panelState}`}
        onClick={onClose}
      />

      {/* Main Panel */}
      <div className={`pathway-panel ${panelState}`}>
        {/* Panel Header */}
        <div className="panel-header">
          <div className="header-content">
            {/* Breadcrumb */}
            <div className="pathway-breadcrumb">
              <div className="breadcrumb-item">Pathways</div>
              <div className="breadcrumb-separator">›</div>
              <div className="breadcrumb-item">{pathway.category}</div>
              <div className="breadcrumb-separator">›</div>
              <div className="breadcrumb-item active">{pathway.title}</div>
            </div>

            {/* Controls */}
            <div className="header-controls">
              {collaborative && (
                <div className="collaboration-controls">
                  <CollaborationIndicator state={collaborationState} />
                </div>
              )}
              
              <button 
                onClick={onClose}
                className="close-button"
                aria-label="Close pathways panel"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div 
              className={`progress-bar tier-bg-${tier} progress-w-${progressPercent}`}
            />
          </div>
        </div>

        {/* Panel Content */}
        <div className="panel-content">
          <div className="main-content">
            <PathwaysWizard
              pathway={pathway}
              currentStep={currentStep}
              onStepChange={handleStepChange}
              onComplete={handleComplete}
              provenance={provenance}
              tier={tier}
              capsuleId={streamCapsuleId ?? pathway.id}
              streamEnabled={streamEnabled}
              streamOptions={streamOptions}
            />
          </div>

          {/* Collaborative Panel */}
          {collaborative && (
            <div className="collaborative-sidebar">
              <CollaborativeFeatures 
                state={collaborationState}
                onStateChange={setCollaborationState}
              />
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="panel-footer">
          <div className="footer-content">
            <div className="pathway-progress">
              <span className="progress-text">
                Step {currentStep + 1} of {pathway.steps.length}
              </span>
              <span className={`tier-indicator tier-${tier}`}>
                {tier.toUpperCase()} TIER
              </span>
            </div>
            
            <div className="footer-actions">
              <button className="help-button">
                💡 Get Help
              </button>
              <button className="save-button">
                💾 Save Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Overlay */}
      {isCompleting && (
        <div className="completion-overlay">
          <div className="completion-content">
            <div className="completion-icon">🎉</div>
            <h2>Journey Complete!</h2>
            <p>Congratulations on completing the {pathway.title} pathway.</p>
            <div className="completion-stats">
              <div className="stat">
                <span className="stat-value">{pathway.steps.length}</span>
                <span className="stat-label">Steps Completed</span>
              </div>
              <div className="stat">
                <span className={`stat-value tier-color-${tier}`}>
                  {tier.toUpperCase()}
                </span>
                <span className="stat-label">Tier Achieved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pathway-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 998;
          transition: opacity 0.3s ease;
        }

        .pathway-backdrop.opening,
        .pathway-backdrop.open {
          opacity: 1;
        }

        .pathway-backdrop.closing {
          opacity: 0;
        }

        .pathway-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 60vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          z-index: 999;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
        }

        .pathway-panel.opening,
        .pathway-panel.closing {
          transform: translateX(100%);
        }

        .pathway-panel.open {
          transform: translateX(0);
        }

        .panel-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .pathway-breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        .breadcrumb-item.active {
          color: white;
          font-weight: 500;
        }

        .breadcrumb-separator {
          color: #6b7280;
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .close-button {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .progress-container {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        /* Progress bar dynamic widths (5% increments) */
        ${[...Array(21)].map((_,i)=>`.progress-w-${i*5}{width:${i*5}%}`).join('\n')}
        /* Tier background colors for progress */
        .tier-bg-bronze { background: #FFA500; }
        .tier-bg-silver { background: #C0C0C0; }
        .tier-bg-gold { background: #FFD700; }

        .panel-content {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .main-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .collaborative-sidebar {
          width: 300px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .panel-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pathway-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .progress-text {
          color: #d1d5db;
          font-size: 0.875rem;
        }

        .tier-indicator {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        .tier-indicator.tier-bronze {
          color: #FFA500;
        }
        .tier-indicator.tier-silver {
          color: #C0C0C0;
        }
        .tier-indicator.tier-gold {
          color: #FFD700;
        }

        .footer-actions {
          display: flex;
          gap: 0.75rem;
        }

        .help-button,
        .save-button {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .help-button:hover,
        .save-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .completion-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fade-in 0.3s ease;
        }

        .completion-content {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          color: white;
          max-width: 400px;
        }
  /* Avatar z-index layering */
  .z-level-0 { z-index: 10; }
  .z-level-1 { z-index: 9; }
  .z-level-2 { z-index: 8; }

        .completion-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 0.6s ease infinite alternate;
        }

        .completion-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .completion-content p {
          color: #d1d5db;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .completion-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .tier-color-bronze {
          color: #FFA500;
        }
        .tier-color-silver {
          color: #C0C0C0;
        }
        .tier-color-gold {
          color: #FFD700;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .pathway-panel {
            width: 80vw;
          }
        }

        @media (max-width: 768px) {
          .pathway-panel {
            width: 100vw;
          }
          
          .collaborative-sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

/**
 * Collaboration Indicator Component
 */
interface CollaborationIndicatorProps {
  state: CollaborationState
}

const CollaborationIndicator: React.FC<CollaborationIndicatorProps> = ({ state }) => {
  return (
    <div className="collaboration-indicator">
      <div className="participant-avatars">
        {state.participants.slice(0, 3).map((participant, index) => (
          <div 
            key={participant.id}
            className={`participant-avatar ${participant.status} z-level-${index}`}
            title={`${participant.name} - ${participant.status}`}
          >
            <img src={participant.avatar} alt={participant.name} />
            <div className="status-dot" />
          </div>
        ))}
        {state.participants.length > 3 && (
          <div className="more-participants">
            +{state.participants.length - 3}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Collaborative Features Sidebar
 */
interface CollaborativeFeaturesProps {
  state: CollaborationState
  onStateChange: (state: CollaborationState) => void
}

const CollaborativeFeatures: React.FC<CollaborativeFeaturesProps> = ({
  state,
  onStateChange
}) => {
  return (
    <div className="collaborative-features">
      <div className="feature-section">
        <h3>Team Members</h3>
        <div className="participants-list">
          {state.participants.map(participant => (
            <div key={participant.id} className="participant-item">
              <img src={participant.avatar} alt={participant.name} />
              <div className="participant-info">
                <div className="participant-name">{participant.name}</div>
                <div className="participant-step">Step {participant.currentStep + 1}</div>
              </div>
              <div className={`participant-status ${participant.status}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="feature-section">
        <h3>Voice Chat</h3>
        <div className="voice-controls">
          <button 
            className={`voice-toggle ${state.voiceChat.enabled ? 'active' : ''}`}
            onClick={() => onStateChange({
              ...state,
              voiceChat: { ...state.voiceChat, enabled: !state.voiceChat.enabled }
            })}
          >
            {state.voiceChat.enabled ? '🔊' : '🔇'} 
            {state.voiceChat.enabled ? 'Leave Call' : 'Join Call'}
          </button>
        </div>
      </div>

      <div className="feature-section">
        <h3>Comments</h3>
        <div className="comments-area">
          <div className="comment-input">
            <input 
              type="text" 
              placeholder="Add a comment..."
              className="comment-field"
            />
            <button className="send-comment">Send</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PathwaysPanel