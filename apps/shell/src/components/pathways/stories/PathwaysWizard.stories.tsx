/**
 * PathwaysWizard.stories.tsx
 * Storybook stories for the Pathways Wizard - "Gandalf of the Eco ecosystem"
 */

import React from 'react'
import { PathwaysWizard } from '../PathwaysWizard'
import type { PathwayDefinition, ProvenanceContext, ProvenanceTier } from '../../../types'

interface Meta<TComponent = any> {
  title: string
  component: TComponent
  parameters?: any
  argTypes?: any
}

const meta: Meta<typeof PathwaysWizard> = {
  title: 'Eco/Pathways/PathwaysWizard',
  component: PathwaysWizard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The Pathways Wizard - Gandalf of the Eco ecosystem. Provides guided, step-by-step assistance for complex workflows with cinematic clarity and provenance awareness.'
      }
    }
  },
  argTypes: {
    tier: {
      control: { type: 'select' },
      options: ['bronze', 'silver', 'gold'],
      description: 'Current user provenance tier'
    },
    currentStep: {
      control: { type: 'number', min: 0, max: 6 },
      description: 'Current step in the pathway'
    }
  }
}

export default meta
type Story = {
  args?: any
  render?: (args: any) => React.ReactElement
  parameters?: any
}

// Mock pathway definitions
const capsuleLifecyclePathway: PathwayDefinition = {
  id: 'capsule-lifecycle',
  title: 'Capsule Creation Journey',
  description: 'Complete guide from concept to marketplace publication with gold-tier provenance',
  category: 'capsule',
  difficulty: 'intermediate',
  estimatedDuration: 45,
  
  steps: [
    {
      id: 'concept',
      title: 'Define Capsule Concept',
      description: 'Articulate your capsule\'s purpose, scope, and target audience',
      type: 'input',
      provenanceTier: 'bronze',
      aiSuggestions: true
    },
    {
      id: 'scaffold',
      title: 'Generate Capsule Structure',
      description: 'AI-powered scaffolding based on your concept and requirements',
      type: 'ai-assisted',
      provenanceTier: 'bronze',
      autoCompletion: true
    },
    {
      id: 'develop',
      title: 'Develop Capsule Content',
      description: 'Create and refine your capsule\'s functionality with AI assistance',
      type: 'action',
      provenanceTier: 'bronze',
      aiSuggestions: true
    },
    {
      id: 'test',
      title: 'Validate and Test',
      description: 'Comprehensive testing and quality assurance with automated validation',
      type: 'validation',
      provenanceTier: 'silver',
      intelligentValidation: true,
      tierRequirements: [
        { id: 'test-coverage', description: 'Achieve 80%+ test coverage', tier: 'silver', validator: 'coverage-check' },
        { id: 'performance', description: 'Pass performance benchmarks', tier: 'silver', validator: 'perf-test' }
      ]
    },
    {
      id: 'sign',
      title: 'Cryptographic Signing',
      description: 'Secure your capsule with Ed25519 digital signature',
      type: 'action',
      provenanceTier: 'silver',
      autoCompletion: true
    },
    {
      id: 'verify',
      title: 'Provenance Verification',
      description: 'Achieve gold-tier provenance certification with full audit trail',
      type: 'validation',
      provenanceTier: 'gold',
      intelligentValidation: true,
      tierRequirements: [
        { id: 'security-scan', description: 'Pass security vulnerability scan', tier: 'gold', validator: 'security-check' },
        { id: 'sbom-generation', description: 'Generate complete SBOM', tier: 'gold', validator: 'sbom-validator' }
      ]
    },
    {
      id: 'publish',
      title: 'Marketplace Publication',
      description: 'Share your capsule with the community and enable distribution',
      type: 'action',
      provenanceTier: 'gold',
      aiSuggestions: true
    }
  ],
  
  milestones: [
    { step: 'concept', title: 'Idea Captured', tier: 'bronze', description: 'Clear concept definition' },
    { step: 'develop', title: 'Prototype Ready', tier: 'bronze', description: 'Working prototype created' },
    { step: 'test', title: 'Quality Assured', tier: 'silver', description: 'Testing complete' },
    { step: 'verify', title: 'Provenance Certified', tier: 'gold', description: 'Gold-tier verification' },
    { step: 'publish', title: 'Community Shared', tier: 'gold', description: 'Published to marketplace' }
  ],

  prerequisites: [],
  outcomes: ['Marketplace-ready capsule', 'Gold-tier provenance', 'Community recognition'],
  provenanceMapping: {},
  configurable: true,
  variants: [],
  personalizable: true,
  aiAssisted: true,
  suggestionsEnabled: true,
  autoValidation: true
}

const contributorOnboardingPathway: PathwayDefinition = {
  id: 'contributor-onboarding',
  title: 'Welcome to Eco Ecosystem',
  description: 'Your journey from newcomer to valued contributor',
  category: 'contributor',
  difficulty: 'beginner',
  estimatedDuration: 30,
  
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Eco',
      description: 'Understanding the ecosystem, its values, and your role',
      type: 'input',
      provenanceTier: 'bronze'
    },
    {
      id: 'profile',
      title: 'Setup Your Profile',
      description: 'Create your contributor identity and preferences',
      type: 'input',
      provenanceTier: 'bronze'
    },
    {
      id: 'first-capsule',
      title: 'Create Your First Capsule',
      description: 'Hands-on introduction to capsule creation with AI guidance',
      type: 'ai-assisted',
      provenanceTier: 'bronze'
    },
    {
      id: 'provenance-stamp',
      title: 'Earn Your First Provenance Stamp',
      description: 'Understanding quality, verification, and tier advancement',
      type: 'validation',
      provenanceTier: 'silver'
    },
    {
      id: 'community',
      title: 'Join the Community',
      description: 'Connect with other contributors and explore collaboration',
      type: 'action',
      provenanceTier: 'silver'
    },
    {
      id: 'marketplace-debut',
      title: 'Your Marketplace Debut',
      description: 'Publish your first capsule to the marketplace',
      type: 'action',
      provenanceTier: 'gold'
    }
  ],

  milestones: [
    { step: 'welcome', title: 'Welcomed', tier: 'bronze' },
    { step: 'first-capsule', title: 'First Creation', tier: 'bronze' },
    { step: 'provenance-stamp', title: 'Quality Recognized', tier: 'silver' },
    { step: 'marketplace-debut', title: 'Community Contributor', tier: 'gold' }
  ],

  prerequisites: [],
  outcomes: ['Active community member', 'Published capsule', 'Silver+ provenance tier'],
  provenanceMapping: {},
  configurable: false,
  variants: [],
  personalizable: true,
  aiAssisted: true,
  suggestionsEnabled: true,
  autoValidation: false
}

// Mock provenance context
const mockProvenanceContext: ProvenanceContext = {
  userId: 'user-demo-001',
  sessionId: 'session-wizard-demo',
  tier: 'bronze',
  timestamp: new Date().toISOString(),
  metadata: {
    source: 'storybook-demo',
    version: '1.0.0'
  }
}

// Default story - Capsule Lifecycle Journey
export const CapsuleLifecycle: Story = {
  args: {
    pathway: capsuleLifecyclePathway,
    currentStep: 0,
    tier: 'bronze',
    provenance: mockProvenanceContext,
    capsuleId: 'capsule-lifecycle-demo',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete capsule creation journey from concept to marketplace publication. Demonstrates the full wizard workflow with AI assistance, validation steps, and tier progression.'
      }
    }
  }
}

// Contributor Onboarding Story
export const ContributorOnboarding: Story = {
  args: {
    pathway: contributorOnboardingPathway,
    currentStep: 0,
    tier: 'bronze',
    provenance: mockProvenanceContext,
    capsuleId: 'contributor-onboarding-demo',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Onboarding completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'New contributor onboarding experience. Shows how newcomers are guided through ecosystem introduction, profile setup, and first capsule creation.'
      }
    }
  }
}

// Advanced User - Silver Tier
export const SilverTierJourney: Story = {
  args: {
    pathway: capsuleLifecyclePathway,
    currentStep: 3, // Starting at validation step
    tier: 'silver',
    provenance: { ...mockProvenanceContext, tier: 'silver' },
    capsuleId: 'capsule-lifecycle-stream',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'Silver-tier user experience. Shows advanced validation capabilities and intelligent assistance for experienced contributors.'
      }
    }
  }
}

// Expert User - Gold Tier
export const GoldTierExpertise: Story = {
  args: {
    pathway: capsuleLifecyclePathway,
    currentStep: 5, // Starting at verification step
    tier: 'gold',
    provenance: { ...mockProvenanceContext, tier: 'gold' },
    capsuleId: 'capsule-lifecycle-gold',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'Gold-tier expert experience. Demonstrates advanced provenance verification and marketplace publication capabilities.'
      }
    }
  }
}

// Mid-Journey Progress
export const MidJourneyProgress: Story = {
  args: {
    pathway: capsuleLifecyclePathway,
    currentStep: 2, // Development step
    tier: 'bronze',
    provenance: mockProvenanceContext,
    capsuleId: 'capsule-lifecycle-mid',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'Mid-journey progress demonstration. Shows how users can resume their pathway and continue from where they left off.'
      }
    }
  }
}

// Interactive Demo with Controls
export const InteractiveDemo: Story = {
  render: (args: any) => {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [tier, setTier] = React.useState<ProvenanceTier>('bronze')
    
    return (
      <div className="space-y-4">
        <div className="flex gap-4 p-4 bg-slate-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Current Step
            </label>
            <input
              type="range"
              min="0"
              max={capsuleLifecyclePathway.steps.length - 1}
              value={currentStep}
              onChange={(e) => setCurrentStep(parseInt(e.target.value))}
              className="w-32"
              title="Select current pathway step"
              aria-label="Current pathway step"
            />
            <span className="text-sm text-gray-400 ml-2">{currentStep}</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="tier-select">
              Tier
            </label>
            <select
              id="tier-select"
              value={tier}
              onChange={(e) => setTier(e.target.value as ProvenanceTier)}
              className="bg-slate-700 text-white px-2 py-1 rounded"
              title="Select user provenance tier"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>
        </div>
        
        <PathwaysWizard
          pathway={capsuleLifecyclePathway}
          currentStep={currentStep}
          tier={tier}
          provenance={{ ...mockProvenanceContext, tier }}
          capsuleId="capsule-lifecycle-interactive"
          streamEnabled
          onStepChange={setCurrentStep}
          onComplete={(results) => console.log('Completed:', results)}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with step navigation controls and tier selection. Use the controls above to explore different states of the wizard.'
      }
    }
  }
}

// Accessibility Demo
export const AccessibilityDemo: Story = {
  args: {
    pathway: contributorOnboardingPathway,
    currentStep: 0,
    tier: 'bronze',
    provenance: mockProvenanceContext,
    capsuleId: 'contributor-accessibility',
    streamEnabled: true,
    onStepChange: (step: number) => console.log('Step changed to:', step),
    onComplete: (results: any) => console.log('Pathway completed:', results)
  },
  parameters: {
    docs: {
      description: {
        story: 'Accessibility-focused demonstration. Shows keyboard navigation, screen reader support, and ARIA compliance throughout the wizard experience.'
      }
    },
    a11y: {
      element: '.pathways-wizard',
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true
          },
          {
            id: 'keyboard',
            enabled: true
          },
          {
            id: 'aria-*',
            enabled: true
          }
        ]
      }
    }
  }
}