/**
 * CapsulePanel.tsx
 * Guided capsule creation workflow using HaloCard + HaloStepper
 */

'use client'

import { useState, useEffect } from 'react'
import { cn, HaloCard, HaloBadge, HaloButton } from '@eco/halo-components'
import { useConductor } from '../hooks/useConductor'
import type { CapsuleSpec } from '../../../../../packages/conductor/src/agents/CapsuleAgent'

interface CapsulePanelProps {
  isOpen: boolean
  onClose: () => void
  onCapsuleCreated?: (capsule: any) => void
  className?: string
}

interface CapsuleFormData {
  name: string
  description: string
  category: 'component' | 'workflow' | 'service' | 'documentation'
  version: string
  dependencies: string[]
  useAI: boolean
  aiProvider?: 'openai' | 'vertex' | 'azure'
  aiPrompt?: string
  buildCommands: string[]
  testFramework: 'vitest' | 'jest' | 'playwright'
  testCoverage: number
  deploymentPlatform: 'vercel' | 'azure' | 'aws' | 'docker'
  documentation: string
  tags: string[]
}

const initialFormData: CapsuleFormData = {
  name: '',
  description: '',
  category: 'component',
  version: '1.0.0',
  dependencies: [],
  useAI: false,
  buildCommands: ['npm run build'],
  testFramework: 'vitest',
  testCoverage: 80,
  deploymentPlatform: 'vercel',
  documentation: '',
  tags: []
}

export function CapsulePanel({ isOpen, onClose, onCapsuleCreated, className }: CapsulePanelProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<CapsuleFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<any>(null)
  
  const { conductor } = useConductor()

  const steps = [
    {
      id: 'specification',
      title: 'Specification',
      description: 'Define your capsule basics',
      icon: '📝'
    },
    {
      id: 'content',
      title: 'Content',
      description: 'Create or generate content',
      icon: '🎨'
    },
    {
      id: 'dependencies',
      title: 'Dependencies',
      description: 'Manage dependencies',
      icon: '📦'
    },
    {
      id: 'testing',
      title: 'Testing',
      description: 'Configure testing',
      icon: '🧪'
    },
    {
      id: 'deployment',
      title: 'Deployment',
      description: 'Setup deployment',
      icon: '🚀'
    },
    {
      id: 'review',
      title: 'Review',
      description: 'Review and create',
      icon: '✅'
    }
  ]

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      setFormData(initialFormData)
      setErrors({})
      setPreviewData(null)
    }
  }, [isOpen])

  const updateFormData = (updates: Partial<CapsuleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
    // Clear related errors
    const newErrors = { ...errors }
    Object.keys(updates).forEach(key => {
      delete newErrors[key]
    })
    setErrors(newErrors)
  }

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (stepIndex) {
      case 0: // Specification
        if (!formData.name.trim()) newErrors.name = 'Capsule name is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (formData.name.length > 100) newErrors.name = 'Name must be under 100 characters'
        break
        
      case 1: // Content
        if (formData.useAI && !formData.aiPrompt?.trim()) {
          newErrors.aiPrompt = 'AI prompt is required when using AI generation'
        }
        break
        
      case 2: // Dependencies
        // Dependencies are optional, no validation needed
        break
        
      case 3: // Testing
        if (formData.testCoverage < 0 || formData.testCoverage > 100) {
          newErrors.testCoverage = 'Coverage must be between 0 and 100'
        }
        break
        
      case 4: // Deployment
        // Deployment config is optional for now
        break
        
      case 5: // Review
        // Generate preview data
        generatePreviewData()
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generatePreviewData = () => {
    const preview = {
      spec: {
        name: formData.name,
        description: formData.description,
        version: formData.version,
        category: formData.category,
        dependencies: formData.dependencies,
        estimatedSize: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)}MB`,
        buildTime: `${Math.floor(Math.random() * 60) + 30}s`,
        testCount: Math.floor(Math.random() * 20) + 10,
        provenanceTier: formData.useAI ? 'silver' : 'gold'
      },
      validation: {
        nameAvailable: true,
        dependenciesValid: true,
        securityScore: Math.floor(Math.random() * 20) + 80,
        qualityScore: Math.floor(Math.random() * 15) + 85
      }
    }
    
    setPreviewData(preview)
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        handleCreateCapsule()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateCapsule = async () => {
    setIsLoading(true)
    
    try {
      // Find capsule agent
      const capsuleAgent = conductor.getActiveAgents().find((agent: any) => agent.type === 'capsule')
      if (!capsuleAgent) {
        throw new Error('Capsule agent not available')
      }
      
      // Create command based on form data
      let command = `create capsule '${formData.name}'`
      
      if (formData.useAI && formData.aiPrompt) {
        command = `generate capsule from prompt: ${formData.aiPrompt}`
      }
      
      const response = await conductor.sendMessage(command, capsuleAgent.id)
      
      // Notify parent component
      onCapsuleCreated?.(response)
      
      // Close panel
      onClose()
    } catch (error) {
      setErrors({ general: error instanceof Error ? error.message : 'Failed to create capsule' })
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Specification
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Capsule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                placeholder="e.g., My Component Library"
                maxLength={100}
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 resize-none"
                placeholder="Describe what your capsule does..."
                rows={3}
                maxLength={500}
              />
              {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFormData({ category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  aria-label="Select capsule category"
                  title="Choose the type of capsule you want to create"
                >
                  <option value="component">Component</option>
                  <option value="workflow">Workflow</option>
                  <option value="service">Service</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => updateFormData({ version: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                  placeholder="1.0.0"
                />
              </div>
            </div>
          </div>
        )
        
      case 1: // Content
        return (
          <div className="space-y-6">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.useAI}
                  onChange={(e) => updateFormData({ useAI: e.target.checked })}
                  className="w-4 h-4 text-cyan-500 bg-slate-800 border-slate-600 rounded focus:ring-cyan-400/20"
                />
                <span className="text-sm font-medium text-slate-200">
                  Use AI to generate content
                </span>
              </label>
            </div>
            
            {formData.useAI && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={formData.aiProvider || 'openai'}
                    onChange={(e) => updateFormData({ aiProvider: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                    aria-label="Select AI provider"
                    title="Choose the AI provider for capsule generation"
                  >
                    <option value="openai">OpenAI GPT-4</option>
                    <option value="vertex">Google Vertex AI</option>
                    <option value="azure">Azure OpenAI</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    AI Prompt
                  </label>
                  <textarea
                    value={formData.aiPrompt || ''}
                    onChange={(e) => updateFormData({ aiPrompt: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 resize-none"
                    placeholder="Describe what you want the AI to generate..."
                    rows={4}
                  />
                  {errors.aiPrompt && <p className="text-red-400 text-xs mt-1">{errors.aiPrompt}</p>}
                </div>
              </>
            )}
            
            {!formData.useAI && (
              <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
                <h4 className="text-sm font-medium text-slate-200 mb-2">Manual Content Creation</h4>
                <p className="text-xs text-slate-400 mb-3">
                  You'll be able to add files, assets, and documentation after the capsule is created.
                </p>
                <div className="flex flex-wrap gap-2">
                  <HaloBadge variant="outline">📁 Source Files</HaloBadge>
                  <HaloBadge variant="outline">🎨 Assets</HaloBadge>
                  <HaloBadge variant="outline">📖 Documentation</HaloBadge>
                  <HaloBadge variant="outline">🔧 Examples</HaloBadge>
                </div>
              </div>
            )}
          </div>
        )
        
      case 2: // Dependencies
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Dependencies
              </label>
              <div className="space-y-2">
                {formData.dependencies.map((dep, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={dep}
                      onChange={(e) => {
                        const newDeps = [...formData.dependencies]
                        newDeps[index] = e.target.value
                        updateFormData({ dependencies: newDeps })
                      }}
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                      placeholder="package-name@version"
                    />
                    <button
                      onClick={() => {
                        const newDeps = formData.dependencies.filter((_, i) => i !== index)
                        updateFormData({ dependencies: newDeps })
                      }}
                      className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => updateFormData({ dependencies: [...formData.dependencies, ''] })}
                  className="w-full py-2 border-2 border-dashed border-slate-600/50 hover:border-cyan-400/50 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  + Add Dependency
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
              <h4 className="text-sm font-medium text-slate-200 mb-2">Common Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {['react', '@types/react', 'typescript', 'tailwindcss', 'vitest'].map(dep => (
                  <button
                    key={dep}
                    onClick={() => {
                      if (!formData.dependencies.includes(dep)) {
                        updateFormData({ dependencies: [...formData.dependencies, dep] })
                      }
                    }}
                    className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-full text-cyan-300 text-xs transition-colors"
                  >
                    + {dep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
        
      case 3: // Testing
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Test Framework
              </label>
              <select
                value={formData.testFramework}
                onChange={(e) => updateFormData({ testFramework: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                aria-label="Select test framework"
                title="Choose the testing framework for your capsule"
              >
                <option value="vitest">Vitest</option>
                <option value="jest">Jest</option>
                <option value="playwright">Playwright</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Coverage Threshold: {formData.testCoverage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.testCoverage}
                onChange={(e) => updateFormData({ testCoverage: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Test coverage threshold percentage"
                title="Set minimum test coverage percentage"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              {errors.testCoverage && <p className="text-red-400 text-xs mt-1">{errors.testCoverage}</p>}
            </div>
            
            <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
              <h4 className="text-sm font-medium text-slate-200 mb-2">Test Strategy</h4>
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Unit tests for all components</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Integration tests for workflows</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Accessibility testing included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✅</span>
                  <span>Performance benchmarks</span>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 4: // Deployment
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Deployment Platform
              </label>
              <select
                value={formData.deploymentPlatform}
                onChange={(e) => updateFormData({ deploymentPlatform: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                aria-label="Select deployment platform"
                title="Choose the platform for deploying your capsule"
              >
                <option value="vercel">Vercel</option>
                <option value="azure">Azure Static Web Apps</option>
                <option value="aws">AWS S3 + CloudFront</option>
                <option value="docker">Docker Container</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
                <h4 className="text-sm font-medium text-slate-200 mb-2">Deployment Features</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>🚀 Automatic deployments</span>
                    <HaloBadge tier="gold">Included</HaloBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔒 HTTPS encryption</span>
                    <HaloBadge tier="gold">Included</HaloBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>📊 Performance monitoring</span>
                    <HaloBadge tier="silver">Available</HaloBadge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🌍 Global CDN</span>
                    <HaloBadge tier="gold">Included</HaloBadge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 5: // Review
        if (!previewData) return <div>Loading preview...</div>
        
        return (
          <div className="space-y-6">
            <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Capsule Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Name:</span>
                  <span className="text-slate-200 ml-2">{previewData.spec.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Version:</span>
                  <span className="text-slate-200 ml-2">{previewData.spec.version}</span>
                </div>
                <div>
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200 ml-2">{previewData.spec.category}</span>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Size:</span>
                  <span className="text-slate-200 ml-2">{previewData.spec.estimatedSize}</span>
                </div>
                <div>
                  <span className="text-slate-400">Build Time:</span>
                  <span className="text-slate-200 ml-2">{previewData.spec.buildTime}</span>
                </div>
                <div>
                  <span className="text-slate-400">Provenance Tier:</span>
                  <HaloBadge tier={previewData.spec.provenanceTier} className="ml-2">
                    {previewData.spec.provenanceTier}
                  </HaloBadge>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
              <h4 className="text-sm font-medium text-slate-200 mb-3">Quality Assessment</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Security Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${previewData.validation.securityScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-200">{previewData.validation.securityScore}/100</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Quality Score</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${previewData.validation.qualityScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-200">{previewData.validation.qualityScore}/100</span>
                  </div>
                </div>
              </div>
            </div>
            
            {errors.general && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">{errors.general}</p>
              </div>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={cn(
        'fixed inset-y-0 right-0 w-full max-w-2xl z-50 transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        className
      )}>
        <HaloCard className="h-full rounded-none border-l border-r-0 border-t-0 border-b-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-cyan-200">Create Capsule</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 hover:border-slate-500/50 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ×
                </button>
              </div>
              
              {/* Stepper */}
              <div className="flex items-center space-x-4 overflow-x-auto">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(index)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                        index === currentStep
                          ? "bg-cyan-400/20 text-cyan-400 border border-cyan-400/30"
                          : index < currentStep
                          ? "bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30"
                          : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700"
                      )}
                    >
                      <span className="text-sm">{step.icon}</span>
                      <span className="text-sm font-medium">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-slate-600 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  {steps[currentStep].icon} {steps[currentStep].title}
                </h3>
                <p className="text-sm text-slate-400">
                  {steps[currentStep].description}
                </p>
              </div>
              
              {renderStepContent()}
            </div>
            
            {/* Footer */}
            <div className="p-6 border-t border-slate-700/50">
              <div className="flex justify-between">
                <HaloButton
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </HaloButton>
                
                <HaloButton
                  onClick={handleNext}
                  disabled={isLoading}
                >
                  {currentStep === steps.length - 1 ? 'Create Capsule' : 'Next'}
                </HaloButton>
              </div>
            </div>
          </div>
        </HaloCard>
      </div>
    </>
  )
}