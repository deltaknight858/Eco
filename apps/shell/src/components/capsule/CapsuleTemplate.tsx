/**
 * CapsuleTemplate.tsx
 * AI-powered capsule template generation interface
 */

import React, { useState, useEffect } from 'react'
import { cn, HaloCard, HaloBadge, HaloButton } from '@eco/halo-components'
import type { 
  CapsuleTemplate as CapsuleTemplateType, 
  AIGenerationRequest,
  TemplateConfig
} from '../../../../../packages/conductor/src/ai/TemplateGenerator'

// Extend CapsuleTemplateType to include difficulty and estimatedTime
type CapsuleTemplateExtended = CapsuleTemplateType & {
  difficulty?: string
  estimatedTime?: string
}
import { useConductor } from '../hooks/useConductor'

// Extended interfaces for UI components
interface TemplateCustomization {
  name: string
  description: string
  includeTests: boolean
  includeDocumentation: boolean
  includeCICD: boolean
  codeStyle: 'typescript' | 'javascript'
  framework: 'react' | 'vue' | 'svelte' | 'vanilla'
}

// Component Interfaces
interface CapsuleTemplateProps {
  onTemplateGenerated?: (template: CapsuleTemplateType) => void
  onCreateCapsule?: (template: CapsuleTemplateType, customization: TemplateCustomization) => void
  className?: string
}
interface TemplatePreviewProps {
  template: CapsuleTemplateExtended | null
  customization: TemplateCustomization
  onCustomizationChange: (customization: TemplateCustomization) => void
  onGenerateNew: () => void
  onCreateCapsule: () => void
}

interface TemplateGeneratorProps {
  onGenerate: (request: AIGenerationRequest) => void
  loading: boolean
}

interface BuiltInTemplatesProps {
  onSelectTemplate: (template: CapsuleTemplateType) => void
}

// Main CapsuleTemplate Component
export const CapsuleTemplateComponent: React.FC<CapsuleTemplateProps> = ({
  onTemplateGenerated,
  onCreateCapsule,
  className
}) => {
  const { conductor } = useConductor()
  const [activeTab, setActiveTab] = useState<'ai' | 'builtin'>('ai')
  const [generatedTemplate, setGeneratedTemplate] = useState<CapsuleTemplateType | null>(null)
  const [loading, setLoading] = useState(false)
  const [customization, setCustomization] = useState<TemplateCustomization>({
    name: '',
    description: '',
    includeTests: true,
    includeDocumentation: true,
    includeCICD: false,
    codeStyle: 'typescript',
    framework: 'react'
  })

  // Generate template using AI
  const handleGenerateTemplate = async (request: AIGenerationRequest) => {
    if (!conductor) return

    setLoading(true)
    try {
      // Use CapsuleAgent to generate template
      const response = await conductor.sendMessage(
        `generate template for "${request.prompt}" with category ${request.category} and requirements: ${request.requirements?.join(', ')}`
      )
      
      // Parse response and create template
      const template: CapsuleTemplateType = {
        id: `ai-${Date.now()}`,
        name: request.prompt,
        description: `AI-generated template for ${request.prompt}`,
        category: (request.category as any) || 'react-component',
        aiGenerated: true,
        aiProvider: 'openai',
        generationPrompt: request.prompt,
        confidence: 0.85,
        scaffold: {
          files: generateTemplateFiles(request),
          dependencies: Object.keys(getDependenciesForType(request.category)),
          scripts: getScriptsForType(request.category),
          configuration: getConfigurationForType(request.category)
        },
        parameters: [],
        variations: [],
        examples: [],
        qualityScore: 85,
        testCoverage: 80,
        securityScore: 90,
        performanceScore: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: request.requirements || [],
        author: 'AI Template Generator',
        license: 'MIT'
      }

      setGeneratedTemplate(template)
      onTemplateGenerated?.(template)
    } catch (error) {
      console.error('Template generation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle template selection from built-ins
  const handleSelectBuiltInTemplate = (template: CapsuleTemplateType) => {
    setGeneratedTemplate(template)
    onTemplateGenerated?.(template)
  }

  // Handle capsule creation
  const handleCreateCapsule = () => {
    if (generatedTemplate) {
      onCreateCapsule?.(generatedTemplate, customization)
    }
  }

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b border-slate-600/30">
        <h1 className="text-2xl font-bold text-slate-200 mb-2">
          Capsule Templates
        </h1>
        <p className="text-slate-400">
          Generate AI-powered templates or choose from curated collection
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-600/30">
        <div className="px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'ai'
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
              )}
            >
              🤖 AI Generator
            </button>
            <button
              onClick={() => setActiveTab('builtin')}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === 'builtin'
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
              )}
            >
              📚 Built-in Templates
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'ai' ? (
          <>
            {/* Generator Panel */}
            <div className="w-96 border-r border-slate-600/30 p-6 overflow-y-auto">
              <TemplateGenerator
                onGenerate={handleGenerateTemplate}
                loading={loading}
              />
            </div>

            {/* Preview Panel */}
            <div className="flex-1 overflow-y-auto">
              <TemplatePreview
                template={generatedTemplate}
                customization={customization}
                onCustomizationChange={setCustomization}
                onGenerateNew={() => setGeneratedTemplate(null)}
                onCreateCapsule={handleCreateCapsule}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 p-6">
            <BuiltInTemplates onSelectTemplate={handleSelectBuiltInTemplate} />
          </div>
        )}
      </div>
    </div>
  )
}

// Template Generator Component
const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({
  onGenerate,
  loading
}) => {
  const [request, setRequest] = useState<AIGenerationRequest>({
    prompt: '',
    category: 'react-component',
    requirements: [],
    preferences: {
      typeScript: true,
      testFramework: 'vitest',
      cssFramework: 'tailwind',
      complexity: 'medium'
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (request.prompt.trim()) {
      onGenerate(request)
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-200">Generate Template</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            What do you want to build?
          </label>
          <textarea
            value={request.prompt}
            onChange={(e) => setRequest({ ...request, prompt: e.target.value })}
            placeholder="Describe your project in detail... e.g., 'A responsive data dashboard with charts and filters'"
            className="w-full h-24 px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 resize-none focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Template Type
          </label>
          <select
            value={request.category}
            onChange={(e) => setRequest({ ...request, category: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            aria-label="Template type"
          >
            <option value="react-component">React Component</option>
            <option value="api-service">API Service</option>
            <option value="workflow">Workflow</option>
            <option value="documentation">Documentation</option>
            <option value="ai-agent">AI Agent</option>
            <option value="integration">Integration</option>
          </select>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Features & Technologies
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'typescript', 'testing', 'linting', 'formatting',
              'storybook', 'tailwind', 'api-integration', 'state-management',
              'authentication', 'database', 'deployment', 'monitoring'
            ].map(feature => (
              <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={request.requirements?.includes(feature) || false}
                  onChange={(e) => {
                    const current = request.requirements || []
                    const updated = e.target.checked
                      ? [...current, feature]
                      : current.filter((f: string) => f !== feature)
                    setRequest({ ...request, requirements: updated })
                  }}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
                />
                <span className="text-slate-300 text-sm capitalize">
                  {feature.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Framework */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Primary Framework
          </label>
          <select
            value={request.context?.targetFramework || 'react'}
            onChange={(e) => setRequest({ 
              ...request, 
              context: { ...request.context, targetFramework: e.target.value }
            })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            aria-label="Primary framework"
          >
            <option value="react">React</option>
            <option value="vue">Vue.js</option>
            <option value="angular">Angular</option>
            <option value="svelte">Svelte</option>
            <option value="next">Next.js</option>
            <option value="node">Node.js</option>
            <option value="express">Express</option>
            <option value="fastify">Fastify</option>
          </select>
        </div>

        {/* Generate Button */}
        <HaloButton
          type="submit"
          variant="primary"
          className="w-full"
          disabled={loading || !request.prompt.trim()}
        >
          {loading ? 'Generating...' : '🚀 Generate Template'}
        </HaloButton>
      </form>

      {/* AI Tips */}
      <div className="mt-8 p-4 bg-slate-800/30 border border-slate-600/30 rounded-lg">
        <h4 className="text-sm font-medium text-slate-300 mb-2">💡 AI Tips</h4>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Be specific about your requirements</li>
          <li>• Mention your target users or use cases</li>
          <li>• Include any specific libraries you want to use</li>
          <li>• Describe the data structure if applicable</li>
        </ul>
      </div>
    </div>
  )
}

// Template Preview Component
const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  customization,
  onCustomizationChange,
  onGenerateNew,
  onCreateCapsule
}) => {
  if (!template) {
    return (
      <div className="p-12 text-center">
        <div className="text-8xl mb-6">🤖</div>
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          AI Template Generator
        </h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Describe what you want to build and our AI will generate a complete,
          production-ready template with all the necessary files and configuration.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-200">{template.name}</h2>
          <p className="text-slate-400">{template.description}</p>
        </div>
        <div className="flex space-x-3">
          <HaloButton variant="ghost" onClick={onGenerateNew}>
            Generate New
          </HaloButton>
          <HaloButton variant="primary" onClick={onCreateCapsule}>
            Create Capsule
          </HaloButton>
        </div>
      </div>

      {/* Template Info */}
      <HaloCard>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-sm text-slate-400">Category</div>
              <div className="text-slate-200 capitalize">{template.category}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Quality</div>
              <div className="text-slate-200">{template.qualityScore}%</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Version</div>
              <div className="text-slate-200">{template.version}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400">Files</div>
              <div className="text-slate-200">{template.scaffold.files.length}</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {template.tags.map(tag => (
              <HaloBadge key={tag} variant="secondary">{tag}</HaloBadge>
            ))}
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-3">Included Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(template.scaffold.configuration).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    value ? "bg-green-400" : "bg-slate-600"
                  )}></div>
                  <span className="text-sm text-slate-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </HaloCard>

      {/* Customization */}
      <HaloCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Customize Template</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Capsule Name
              </label>
              <input
                type="text"
                value={customization.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomizationChange({ ...customization, name: e.target.value })}
                placeholder="my-awesome-component"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={customization.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomizationChange({ ...customization, description: e.target.value })}
                placeholder="Brief description of your capsule"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Code Style
              </label>
              <select
                value={customization.codeStyle}
                onChange={(e) => onCustomizationChange({ ...customization, codeStyle: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                aria-label="Code style"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Framework
              </label>
              <select
                value={customization.framework}
                onChange={(e) => onCustomizationChange({ ...customization, framework: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
                aria-label="Framework"
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="svelte">Svelte</option>
                <option value="vanilla">Vanilla</option>
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-6 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customization.includeTests}
                onChange={(e) => onCustomizationChange({ ...customization, includeTests: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
              />
              <span className="text-slate-300">Include test files</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customization.includeDocumentation}
                onChange={(e) => onCustomizationChange({ ...customization, includeDocumentation: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
              />
              <span className="text-slate-300">Include documentation</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={customization.includeCICD}
                onChange={(e) => onCustomizationChange({ ...customization, includeCICD: e.target.checked })}
                className="rounded border-slate-600 bg-slate-800 text-cyan-400 focus:ring-cyan-400/20"
              />
              <span className="text-slate-300">Include CI/CD configuration</span>
            </label>
          </div>
        </div>
      </HaloCard>

      {/* File Structure Preview */}
      <HaloCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">File Structure</h3>
          <div className="bg-slate-900/50 rounded-lg p-4 font-mono text-sm">
            <FileTree files={template.scaffold.files} />
          </div>
        </div>
      </HaloCard>
    </div>
  )
}

// Built-in Templates Component
const BuiltInTemplates: React.FC<BuiltInTemplatesProps> = ({
  onSelectTemplate
}) => {
  const templates = getBuiltInTemplates()

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-200 mb-6">Built-in Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <HaloCard key={template.id} className="hover:scale-105 transition-transform cursor-pointer" onClick={() => onSelectTemplate(template)}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-200">{template.name}</h3>
                <HaloBadge variant="secondary">{template.category}</HaloBadge>
              </div>
              
              <p className="text-slate-300 text-sm mb-4">{template.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-slate-700/50 text-xs text-slate-400 rounded">
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-1 bg-slate-700/50 text-xs text-slate-400 rounded">
                    +{template.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>{template.difficulty}</span>
                <span>{template.estimatedTime}</span>
              </div>
            </div>
          </HaloCard>
        ))}
      </div>
    </div>
  )
}

// File Tree Component
const FileTree: React.FC<{ files: any[] }> = ({ files }) => {
  return (
    <div className="space-y-1">
      {files.map((file, index) => (
        <div key={index} className="flex items-center space-x-2 text-slate-300">
          <span className="text-slate-500">
            {file.type === 'directory' ? '📁' : '📄'}
          </span>
          <span>{file.path}</span>
        </div>
      ))}
    </div>
  )
}

// Helper functions
function generateTemplateFiles(request: AIGenerationRequest): any[] {
  const files = [
    { path: 'package.json', type: 'file', content: '{}' },
    { path: 'README.md', type: 'file', content: `# ${request.prompt}` }
  ]

  if (request.category === 'react-component') {
    files.push(
      { path: 'src/index.tsx', type: 'file', content: '// Component code' },
      { path: 'src/index.test.tsx', type: 'file', content: '// Tests' }
    )
  }

  return files
}

function getDependenciesForType(type: string): Record<string, string> {
  const base = { react: '^18.0.0' }
  
  switch (type) {
    case 'component': return { ...base }
    case 'service': return { express: '^4.18.0' }
    default: return base
  }
}

function getDevDependenciesForType(type: string): Record<string, string> {
  return {
    '@types/react': '^18.0.0',
    typescript: '^5.0.0',
    vite: '^4.0.0'
  }
}

function getScriptsForType(type: string): Record<string, string> {
  return {
    dev: 'vite',
    build: 'vite build',
    test: 'vitest'
  }
}

// Returns configuration flags for a given template type
function getConfigurationForType(type: string): TemplateConfig {
  switch (type) {
    case 'react-component':
      return {
        buildSystem: 'vite',
        testFramework: 'vitest',
        linting: 'eslint',
        formatting: 'prettier',
        typeScript: true,
        cssFramework: 'tailwind',
        stateManagement: 'none'
      }
    case 'api-service':
      return {
        buildSystem: 'webpack',
        testFramework: 'jest',
        linting: 'eslint',
        formatting: 'prettier',
        typeScript: true,
        cssFramework: 'none',
        stateManagement: 'none'
      }
    default:
      return {
        buildSystem: 'vite',
        testFramework: 'vitest',
        linting: 'eslint',
        formatting: 'prettier',
        typeScript: true,
        cssFramework: 'none',
        stateManagement: 'none'
      }
  }
}
function getBuiltInTemplates(): CapsuleTemplateExtended[] {
  return [
    {
      id: 'react-component-basic',
      name: 'React Component',
      description: 'Basic React component with TypeScript and tests',
      category: 'react-component',
      aiGenerated: false,
      aiProvider: 'openai',
      generationPrompt: '',
      confidence: 1.0,
      scaffold: {
        files: [
          { path: 'src/Component.tsx', type: 'source', content: '', size: 0, checksum: '' },
          { path: 'src/Component.test.tsx', type: 'test', content: '', size: 0, checksum: '' },
          { path: 'src/index.ts', type: 'source', content: '', size: 0, checksum: '' }
        ],
        dependencies: ['react@^18.0.0'],
        scripts: { dev: 'vite', build: 'vite build' },
        configuration: {
          buildSystem: 'vite',
          testFramework: 'vitest',
          linting: 'eslint',
          formatting: 'prettier',
          typeScript: true,
          cssFramework: 'tailwind',
          stateManagement: 'none'
        }
      },
      parameters: [],
      variations: [],
      examples: [],
      qualityScore: 95,
      testCoverage: 90,
      securityScore: 95,
      performanceScore: 90,
      tags: ['react', 'typescript', 'component'],
      difficulty: 'beginner',
      estimatedTime: '15-30 minutes',
      author: 'Eco Team',
      version: '1.0.0',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
      license: 'MIT'
    },
    {
      id: 'api-service-express',
      name: 'Express API Service',
      description: 'RESTful API service with Express and TypeScript',
      category: 'api-service',
      aiGenerated: false,
      aiProvider: 'openai',
      generationPrompt: '',
      confidence: 1.0,
      scaffold: {
        files: [
          { path: 'src/server.ts', type: 'source', content: '', size: 0, checksum: '' },
          { path: 'src/routes/index.ts', type: 'source', content: '', size: 0, checksum: '' },
          { path: 'src/middleware/index.ts', type: 'source', content: '', size: 0, checksum: '' }
        ],
        dependencies: ['express@^4.18.0'],
        scripts: { dev: 'nodemon src/server.ts', build: 'tsc' },
        configuration: {
          buildSystem: 'webpack',
          testFramework: 'jest',
          linting: 'eslint',
          formatting: 'prettier',
          typeScript: true,
          cssFramework: 'none',
          stateManagement: 'none'
        }
      },
      parameters: [],
      variations: [],
      examples: [],
      qualityScore: 90,
      testCoverage: 85,
      securityScore: 88,
      performanceScore: 85,
      tags: ['express', 'api', 'typescript', 'rest'],
      difficulty: 'intermediate',
      estimatedTime: '45-90 minutes',
      author: 'Eco Team',
      version: '1.0.0',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
      license: 'MIT'
    }
  ]
}

export default CapsuleTemplateComponent