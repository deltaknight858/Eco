/**
 * PathwaysLauncher.stories.tsx
 * Storybook stories for the Pathways Launcher - floating contextual guide
 */

import React from 'react'
import { PathwaysLauncher } from '../PathwaysLauncher'

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
  title: 'Eco/Pathways/PathwaysLauncher',
  component: PathwaysLauncher,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Floating contextual guide that suggests relevant pathways based on current context. Appears as a beautiful, semi-transparent card that enhances rather than interrupts the user experience.'
      }
    }
  },
  argTypes: {
    position: {
      control: { type: 'select' },
      options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
      description: 'Position of the floating launcher'
    },
    tier: {
      control: { type: 'select' },
      options: ['bronze', 'silver', 'gold'],
      description: 'Current user provenance tier'
    },
    autoShow: {
      control: { type: 'boolean' },
      description: 'Whether to show the launcher automatically'
    }
  }
}

export default meta
type Story = StoryObj

// Mock context data
const mockSuggestions = [
  {
    id: 'capsule-lifecycle',
    title: 'Complete Capsule Journey',
    description: 'From concept to marketplace publication',
    icon: '🚀',
    category: 'capsule' as const,
    difficulty: 'intermediate' as const,
    estimatedDuration: 45,
    recommendedTier: 'bronze' as const,
    priority: 1
  },
  {
    id: 'quality-improvement',
    title: 'Quality Enhancement Path',
    description: 'Elevate your work to silver tier',
    icon: '⭐',
    category: 'contributor' as const,
    difficulty: 'intermediate' as const,
    estimatedDuration: 20,
    recommendedTier: 'silver' as const,
    priority: 2
  },
  {
    id: 'collaboration-setup',
    title: 'Team Collaboration Setup',
    description: 'Set up shared workspace and permissions',
    icon: '🤝',
    category: 'orchestration' as const,
    difficulty: 'beginner' as const,
    estimatedDuration: 15,
    recommendedTier: 'bronze' as const,
    priority: 3
  }
]

const mockWorkspaceContext = {
  currentFile: 'src/components/CapsuleEditor.tsx',
  gitStatus: 'modified',
  buildStatus: 'success',
  hasTests: true,
  testCoverage: 78,
  provenanceTier: 'bronze' as const,
  recentActivity: ['file-edit', 'test-run', 'build'],
  completedPathways: 0,
  timeOnCurrentPage: 0
}

// Default story - Bottom Right Position
export const BottomRight: Story = {
  args: {
    tier: 'bronze',
    context: mockWorkspaceContext,
    suggestedPathways: mockSuggestions,
    onLaunchPathway: (pathway: any) => console.log('Selected pathway:', pathway)
  },
  parameters: {
    docs: {
      description: {
        story: 'Default floating launcher showing contextual pathway suggestions based on current workspace activity.'
      }
    }
  }
}

// Top Left Position
export const TopLeft: Story = {
  args: {
    tier: 'silver',
    context: mockWorkspaceContext,
    suggestedPathways: mockSuggestions,
    onLaunchPathway: (pathway: any) => console.log('Selected pathway:', pathway)
  },
  parameters: {
    docs: {
      description: {
        story: 'Launcher for silver tier users with enhanced pathway suggestions.'
      }
    }
  }
}

// Gold Tier User
export const GoldTierExperience: Story = {
  args: {
    tier: 'gold',
    context: {
      ...mockWorkspaceContext,
      provenanceTier: 'gold',
      testCoverage: 92,
      hasSecurityScan: true,
      hasSBOM: true
    },
    suggestedPathways: [
      {
        id: 'advanced-optimization',
        title: 'Performance Optimization',
        description: 'Advanced techniques for gold-tier performance',
        icon: '⚡',
        category: 'orchestration' as const,
        difficulty: 'advanced' as const,
        estimatedDuration: 30,
        recommendedTier: 'gold' as const,
        priority: 1
      },
      {
        id: 'marketplace-showcase',
        title: 'Marketplace Showcase',
        description: 'Feature your work in the spotlight',
        icon: '🌟',
        category: 'contributor' as const,
        difficulty: 'advanced' as const,
        estimatedDuration: 25,
        recommendedTier: 'gold' as const,
        priority: 2
      }
    ],
    onLaunchPathway: (pathway: any) => console.log('Selected pathway:', pathway)
  },
  parameters: {
    docs: {
      description: {
        story: 'Gold-tier user experience with advanced pathway suggestions and premium features.'
      }
    }
  }
}

// Context-Aware Suggestions
export const ContextAware: Story = {
  args: {
    position: 'bottom-right',
    tier: 'bronze',
    context: {
      currentFile: 'tests/integration.test.ts',
      gitStatus: 'staged',
      buildStatus: 'failed',
      hasTests: true,
      testCoverage: 45,
      provenanceTier: 'bronze',
      recentActivity: ['test-failure', 'debug-session', 'error-fix']
    },
    suggestions: [
      {
        id: 'debugging-mastery',
        title: 'Debugging & Testing Path',
        description: 'Master debugging techniques and improve test coverage',
        relevanceScore: 0.96,
        estimatedDuration: 35,
        category: 'debugging'
      },
      {
        id: 'ci-cd-setup',
        title: 'CI/CD Pipeline Setup',
        description: 'Prevent build failures with automated testing',
        relevanceScore: 0.84,
        estimatedDuration: 40,
        category: 'devops'
      }
    ],
    autoShow: true,
    onPathwaySelect: (pathwayId: string) => console.log('Selected pathway:', pathwayId),
    onDismiss: () => console.log('Launcher dismissed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Context-aware suggestions based on current workspace state, build failures, and test coverage issues.'
      }
    }
  }
}

// Minimized State
export const Minimized: Story = {
  args: {
    position: 'bottom-right',
    tier: 'silver',
    context: mockWorkspaceContext,
    suggestions: mockSuggestions,
    autoShow: false,
    minimized: true,
    onPathwaySelect: (pathwayId: string) => console.log('Selected pathway:', pathwayId),
    onDismiss: () => console.log('Launcher dismissed'),
    onExpand: () => console.log('Launcher expanded')
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimized launcher state - shows as a small floating icon that can be expanded when needed.'
      }
    }
  }
}

// Interactive Demo
export const InteractiveDemo: Story = {
  render: () => {
    const [position, setPosition] = React.useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
    const [tier, setTier] = React.useState<'bronze' | 'silver' | 'gold'>('bronze')
    const [minimized, setMinimized] = React.useState(false)
    
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Demo Controls */}
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 space-y-3 z-50">
          <h3 className="text-white font-medium">Demo Controls</h3>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Position</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as any)}
              className="bg-slate-700 text-white px-2 py-1 rounded text-sm"
              title="Select launcher position"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
            </select>
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
                checked={minimized}
                onChange={(e) => setMinimized(e.target.checked)}
                className="mr-2"
              />
              Minimized
            </label>
          </div>
        </div>
        
        {/* Simulated Workspace */}
        <div className="p-8 pt-24">
          <div className="max-w-4xl mx-auto bg-slate-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Simulated Workspace</h2>
            <div className="space-y-4 text-gray-300">
              <p>Current File: <code className="bg-slate-700 px-2 py-1 rounded">src/components/CapsuleEditor.tsx</code></p>
              <p>Git Status: <span className="text-yellow-400">Modified</span></p>
              <p>Build Status: <span className="text-green-400">Success</span></p>
              <p>Test Coverage: <span className="text-blue-400">78%</span></p>
            </div>
          </div>
        </div>
        
        {/* Launcher Component */}
        <PathwaysLauncher
          suggestedPathways={mockSuggestions}
          tier={tier}
          context={mockWorkspaceContext}
          onLaunchPathway={(pathwayId: any) => console.log('Selected:', pathwayId)}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with position controls, tier selection, and minimize/expand functionality. Explore different launcher configurations in a simulated workspace environment.'
      }
    }
  }
}

// No Suggestions State
export const NoSuggestions: Story = {
  args: {
    position: 'bottom-right',
    tier: 'bronze',
    context: mockWorkspaceContext,
    suggestions: [],
    autoShow: true,
    onPathwaySelect: (pathwayId: string) => console.log('Selected pathway:', pathwayId),
    onDismiss: () => console.log('Launcher dismissed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Launcher state when no contextual suggestions are available. Shows fallback content and exploration options.'
      }
    }
  }
}

// Loading State
export const LoadingState: Story = {
  args: {
    position: 'bottom-right',
    tier: 'silver',
    context: mockWorkspaceContext,
    suggestions: [],
    autoShow: true,
    loading: true,
    onPathwaySelect: (pathwayId: string) => console.log('Selected pathway:', pathwayId),
    onDismiss: () => console.log('Launcher dismissed')
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state while the launcher analyzes context and fetches relevant pathway suggestions.'
      }
    }
  }
}