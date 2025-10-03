/**
 * PathwaysPanel.stories.tsx
 * Storybook stories for the Pathways Panel - immersive pathway experience
 */

import React from 'react'
import { PathwaysPanel } from '../PathwaysPanel'
import type { PathwayDefinition, ProvenanceContext } from '../../../types'

// Type definitions for the story
interface Meta {
  title: string
  component: any
  parameters?: any
  argTypes?: any
}

interface StoryObj {
  args?: any
  render?: (args: any) => React.ReactElement
  parameters?: any
}

const meta: Meta = {
  title: 'Eco/Pathways/PathwaysPanel',
  component: PathwaysPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Immersive pathway experience panel that provides detailed step-by-step guidance with rich visualizations, progress tracking, and intelligent assistance. The cinematic interface for pathway navigation.'
      }
    }
  },
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['guided', 'overview', 'progress'],
      description: 'Panel display mode'
    },
    tier: {
      control: { type: 'select' },
      options: ['bronze', 'silver', 'gold'],
      description: 'Current user provenance tier'
    },
    currentStep: {
      control: { type: 'number', min: 0, max: 10 },
      description: 'Current step in the pathway'
    }
  }
}

export default meta
type Story = StoryObj

// Mock pathway data
const mockPathway: PathwayDefinition = {
  id: 'capsule-lifecycle',
  title: 'Capsule Creation Journey',
  description: 'Complete guide from concept to marketplace publication with gold-tier provenance',
  category: 'capsule',
  difficulty: 'intermediate',
  estimatedDuration: 45,

  prerequisites: [
    'Basic knowledge of Eco ecosystem',
    'Access to Eco development environment'
  ],
  outcomes: [
    'Published capsule in marketplace',
    'Gold-tier provenance certification'
  ],
  
  steps: [
    {
      id: 'concept',
      title: 'Define Capsule Concept',
      description: 'Articulate your capsule\'s purpose, scope, and target audience with AI-powered suggestions',
      type: 'input',
      provenanceTier: 'bronze',
      aiSuggestions: true,
      estimatedDuration: 10,
      resources: [
        { title: 'Concept Planning Template', type: 'template', url: '#' },
        { title: 'Market Research Guide', type: 'guide', url: '#' }
      ]
    },
    {
      id: 'scaffold',
      title: 'Generate Capsule Structure',
      description: 'AI-powered scaffolding based on your concept and requirements',
      type: 'ai-assisted',
      provenanceTier: 'bronze',
      autoCompletion: true,
      estimatedDuration: 5,
      resources: [
        { title: 'Scaffolding Patterns', type: 'reference', url: '#' }
      ]
    },
    {
      id: 'develop',
      title: 'Develop Capsule Content',
      description: 'Create and refine your capsule\'s functionality with AI assistance and collaborative tools',
      type: 'action',
      provenanceTier: 'bronze',
      aiSuggestions: true,
      estimatedDuration: 20,
      resources: [
        { title: 'Development Guidelines', type: 'guide', url: '#' },
        { title: 'Code Examples', type: 'examples', url: '#' },
        { title: 'Best Practices', type: 'reference', url: '#' }
      ]
    },
    {
      id: 'test',
      title: 'Validate and Test',
      description: 'Comprehensive testing and quality assurance with automated validation',
      type: 'validation',
      provenanceTier: 'silver',
      intelligentValidation: true,
      estimatedDuration: 10,
      requirements: [
        { id: 'test-coverage', description: 'Achieve 80%+ test coverage', completed: false },
        { id: 'performance', description: 'Pass performance benchmarks', completed: false },
        { id: 'accessibility', description: 'Meet accessibility standards', completed: true }
      ]
    }
  ],
  
  progress: {
    currentStep: 0,
    completedSteps: [],
    totalProgress: 0.15,
    estimatedTimeRemaining: 35
  },
  
  collaboration: {
    activeUsers: [
      { id: 'user1', name: 'Alex Chen', avatar: '👨‍💻', status: 'online' },
      { id: 'user2', name: 'Sarah Kim', avatar: '👩‍🔬', status: 'away' }
    ],
    sharedResources: ['concept-doc', 'technical-spec'],
    recentActivity: [
      { user: 'Alex Chen', action: 'completed', target: 'concept validation', timestamp: '5 minutes ago' },
      { user: 'Sarah Kim', action: 'added', target: 'technical requirements', timestamp: '12 minutes ago' }
    ]
  }
}

const mockWorkspaceContext = {
  currentFile: 'src/components/CapsuleEditor.tsx',
  projectStructure: {
    src: ['components/', 'utils/', 'types/'],
    tests: ['unit/', 'integration/'],
    docs: ['README.md', 'API.md']
  },
  buildStatus: 'success',
  testCoverage: 78,
  provenanceTier: 'bronze' as const
}

const baseProvenance: ProvenanceContext = {
  userId: 'user-demo-001',
  sessionId: 'session-demo',
  tier: 'bronze',
  timestamp: new Date().toISOString(),
  metadata: {}
}

// Default story - Guided Mode
export const GuidedMode: Story = {
  args: {
    isOpen: true,
    pathway: mockPathway,
    tier: 'bronze',
    provenance: baseProvenance,
    collaborative: false,
    streamCapsuleId: 'capsule-panel-guided',
    onClose: () => console.log('Panel closed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Guided mode provides step-by-step navigation with detailed instructions, AI assistance, and progress tracking. The primary interface for pathway completion.'
      }
    }
  }
}

// Overview Mode
export const OverviewMode: Story = {
  args: {
    pathway: mockPathway,
    mode: 'overview',
    currentStep: 2,
    tier: 'bronze',
    context: mockWorkspaceContext,
    streamCapsuleId: 'capsule-panel-overview',
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Overview mode shows the complete pathway map with progress visualization, milestone tracking, and step navigation. Ideal for understanding the full journey.'
      }
    }
  }
}

// Progress Mode
export const ProgressMode: Story = {
  args: {
    pathway: {
      ...mockPathway,
      progress: {
        currentStep: 2,
        completedSteps: [0, 1],
        totalProgress: 0.65,
        estimatedTimeRemaining: 15
      }
    },
    mode: 'progress',
    currentStep: 2,
    tier: 'silver',
    context: mockWorkspaceContext,
    streamCapsuleId: 'capsule-panel-progress',
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Progress mode focuses on tracking completion, time estimates, and achievement milestones. Perfect for monitoring advancement through complex pathways.'
      }
    }
  }
}

// Silver Tier Experience
export const SilverTierExperience: Story = {
  args: {
    pathway: {
      ...mockPathway,
      steps: mockPathway.steps.map(step => ({
        ...step,
        intelligentValidation: step.type === 'validation',
        enhancedFeatures: step.provenanceTier === 'silver'
      }))
    },
    mode: 'guided',
    currentStep: 3, // Validation step
    tier: 'silver',
    context: {
      ...mockWorkspaceContext,
      provenanceTier: 'silver',
      testCoverage: 85,
      hasSecurityScan: true
    },
    streamCapsuleId: 'capsule-panel-silver',
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Silver-tier experience with intelligent validation, enhanced AI assistance, and advanced quality metrics. Shows premium features for experienced users.'
      }
    }
  }
}

// Collaborative Session
export const CollaborativeSession: Story = {
  args: {
    pathway: {
      ...mockPathway,
      collaboration: {
        ...mockPathway.collaboration,
        activeUsers: [
          { id: 'user1', name: 'Alex Chen', avatar: '👨‍💻', status: 'online', currentStep: 2 },
          { id: 'user2', name: 'Sarah Kim', avatar: '👩‍🔬', status: 'online', currentStep: 1 },
          { id: 'user3', name: 'Jordan Lee', avatar: '👩‍💻', status: 'away', currentStep: 3 }
        ],
        liveChat: true,
        sharedScreen: true
      }
    },
    mode: 'guided',
    currentStep: 2,
    tier: 'silver',
    context: mockWorkspaceContext,
    collaborative: true,
    streamCapsuleId: 'capsule-panel-collab',
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed'),
    onCollaborate: (action: string) => console.log('Collaboration action:', action)
  },
  parameters: {
    docs: {
      description: {
        story: 'Collaborative pathway session with multiple active users, real-time updates, live chat, and shared resources. Demonstrates team-based pathway completion.'
      }
    }
  }
}

// Error State Handling
export const ErrorHandling: Story = {
  args: {
    pathway: {
      ...mockPathway,
      steps: mockPathway.steps.map((step, index) => ({
        ...step,
        error: index === 2 ? 'Build failed: Missing dependency @eco/validator' : undefined,
        warnings: index === 1 ? ['Performance optimization recommended', 'Consider adding more tests'] : []
      }))
    },
    mode: 'guided',
    currentStep: 2,
    tier: 'bronze',
    context: {
      ...mockWorkspaceContext,
      buildStatus: 'failed',
      errors: ['Missing dependency: @eco/validator', 'Type error in CapsuleEditor.tsx:45']
    },
    streamCapsuleId: 'capsule-panel-error',
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed'),
    onError: (error: string) => console.log('Error handled:', error)
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state handling with diagnostic information, suggested fixes, and recovery guidance. Shows how the panel helps users overcome obstacles.'
      }
    }
  }
}

// Interactive Demo
export const InteractiveDemo: Story = {
  render: () => {
    const [mode, setMode] = React.useState<'guided' | 'overview' | 'progress'>('guided')
    const [currentStep, setCurrentStep] = React.useState(0)
    const [tier, setTier] = React.useState<'bronze' | 'silver' | 'gold'>('bronze')
    const [collaborative, setCollaborative] = React.useState(false)
    
    return (
      <div className="relative min-h-screen">
        {/* Demo Controls */}
        <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 space-y-3 z-50">
          <h3 className="text-white font-medium">Demo Controls</h3>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-sm"
              title="Select panel mode"
            >
              <option value="guided">Guided</option>
              <option value="overview">Overview</option>
              <option value="progress">Progress</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Current Step</label>
            <input
              type="range"
              min="0"
              max={mockPathway.steps.length - 1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value))}
              className="w-full"
              title="Current pathway step"
            />
            <span className="text-sm text-gray-400">{currentStep + 1} of {mockPathway.steps.length}</span>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-sm"
              title="Select user tier"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center text-sm text-gray-300">
              <input
                type="checkbox"
                checked={collaborative}
                onChange={(e) => setCollaborative(e.target.checked)}
                className="mr-2"
              />
              Collaborative Mode
            </label>
          </div>
        </div>
        
        {/* Panel Component */}
        <PathwaysPanel
          isOpen={true}
          pathway={mockPathway}
          tier={tier}
          provenance={{
            userId: 'user-demo-001',
            sessionId: 'session-demo',
            tier: tier,
            timestamp: new Date().toISOString(),
            metadata: {}
          }}
          collaborative={collaborative}
          streamCapsuleId="capsule-panel-interactive"
          onClose={() => console.log('Closed')}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with full control over panel mode, step navigation, tier selection, and collaborative features. Explore all panel capabilities in real-time.'
      }
    }
  }
}

// Loading States
export const LoadingState: Story = {
  args: {
    pathway: null,
    mode: 'guided',
    currentStep: 0,
    tier: 'bronze',
    context: mockWorkspaceContext,
    loading: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while pathway data is being fetched or AI assistance is being prepared. Shows skeleton UI and progress indicators.'
      }
    }
  }
}

// Empty State
export const EmptyState: Story = {
  args: {
    pathway: null,
    mode: 'overview',
    currentStep: 0,
    tier: 'bronze',
    context: mockWorkspaceContext,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results),
    onClose: () => console.log('Panel closed'),
    onBrowsePathways: () => console.log('Browse pathways clicked')
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty state when no pathway is selected. Provides discovery options and featured pathways to get users started.'
      }
    }
  }
}