/**
 * TemplateGenerator.ts
 * AI-powered capsule template generation with smart scaffolding
 */

import { v4 as uuidv4 } from 'uuid'
import type { CapsuleSpec } from '../agents/CapsuleAgent'
import type { AgentType } from '../types/AssistTypes'

// Template Interfaces
export interface CapsuleTemplate {
  // Template Metadata
  id: string
  name: string
  description: string
  category: "react-component" | "api-service" | "workflow" | "documentation" | "ai-agent" | "integration"
  
  // AI Generation
  aiGenerated: boolean
  aiProvider: "openai" | "vertex" | "azure"
  generationPrompt: string
  confidence: number
  
  // Template Structure
  scaffold: {
    files: TemplateFile[]
    dependencies: string[]
    scripts: Record<string, string>
    configuration: TemplateConfig
  }
  
  // Customization Options
  parameters: TemplateParameter[]
  variations: TemplateVariation[]
  examples: TemplateExample[]
  
  // Quality Metrics
  qualityScore: number
  testCoverage: number
  securityScore: number
  performanceScore: number
  
  // Metadata
  createdAt: string
  updatedAt: string
  version: string
  tags: string[]
  author: string
  license: string
}

export interface TemplateFile {
  path: string
  content: string
  type: 'source' | 'config' | 'documentation' | 'test' | 'asset'
  language?: string
  size: number
  checksum: string
}

export interface TemplateConfig {
  buildSystem: 'vite' | 'webpack' | 'rollup' | 'parcel'
  testFramework: 'vitest' | 'jest' | 'playwright' | 'cypress'
  linting: 'eslint' | 'biome' | 'none'
  formatting: 'prettier' | 'biome' | 'none'
  typeScript: boolean
  cssFramework: 'tailwind' | 'styled-components' | 'emotion' | 'css-modules' | 'none'
  stateManagement: 'zustand' | 'redux' | 'context' | 'none'
}

export interface TemplateParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
  description: string
  defaultValue: any
  required: boolean
  options?: string[]
  validation?: string
}

export interface TemplateVariation {
  id: string
  name: string
  description: string
  changes: TemplateChange[]
  preview?: string
}

export interface TemplateChange {
  file: string
  operation: 'create' | 'modify' | 'delete'
  content?: string
  patch?: string
}

export interface TemplateExample {
  id: string
  name: string
  description: string
  code: string
  preview?: string
  interactive: boolean
}

export interface AIGenerationRequest {
  prompt: string
  category: string
  requirements: string[]
  preferences: {
    typeScript: boolean
    testFramework: string
    cssFramework: string
    complexity: 'simple' | 'medium' | 'complex'
  }
  context?: {
    existingProject?: boolean
    targetFramework?: string
    performanceRequirements?: string[]
  }
}

export interface AIGenerationResponse {
  template: CapsuleTemplate
  reasoning: string
  alternatives: CapsuleTemplate[]
  improvements: string[]
  estimatedTime: number
}

export class TemplateGenerator {
  private templates: Map<string, CapsuleTemplate> = new Map()
  private aiProviders: Map<string, any> = new Map()

  constructor() {
    this.initializeBuiltInTemplates()
    this.setupAIProviders()
  }

  /**
   * Generate a capsule template using AI
   */
  async generateFromAI(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    const startTime = Date.now()

    // Analyze the request and select best AI provider
    const provider = this.selectAIProvider(request)
    
    // Generate the template structure
    const template = await this.generateTemplateStructure(request, provider)
    
    // Generate file contents
    await this.generateFileContents(template, request)
    
    // Assess quality and generate improvements
    const qualityAssessment = this.assessTemplateQuality(template)
    template.qualityScore = qualityAssessment.score
    
    // Generate alternatives
    const alternatives = await this.generateAlternatives(request, template)
    
    const executionTime = Date.now() - startTime

    return {
      template,
      reasoning: this.generateReasoning(request, template),
      alternatives: alternatives.slice(0, 3),
      improvements: qualityAssessment.improvements,
      estimatedTime: executionTime
    }
  }

  /**
   * Get available template categories
   */
  getTemplateCategories(): { category: string; count: number; description: string }[] {
    const categories = new Map<string, number>()
    
    this.templates.forEach(template => {
      categories.set(template.category, (categories.get(template.category) || 0) + 1)
    })

    return [
      { category: 'react-component', count: categories.get('react-component') || 0, description: 'Reusable React components with TypeScript' },
      { category: 'api-service', count: categories.get('api-service') || 0, description: 'REST/GraphQL API services and integrations' },
      { category: 'workflow', count: categories.get('workflow') || 0, description: 'Automation workflows and business processes' },
      { category: 'documentation', count: categories.get('documentation') || 0, description: 'Documentation sites and knowledge bases' },
      { category: 'ai-agent', count: categories.get('ai-agent') || 0, description: 'AI-powered agents and integrations' },
      { category: 'integration', count: categories.get('integration') || 0, description: 'Third-party service integrations' }
    ]
  }

  /**
   * Get built-in templates for a category
   */
  getBuiltInTemplates(category?: string): CapsuleTemplate[] {
    let templates = Array.from(this.templates.values())
    
    if (category) {
      templates = templates.filter(t => t.category === category)
    }
    
    return templates.sort((a, b) => b.qualityScore - a.qualityScore)
  }

  /**
   * Customize a template with parameters
   */
  async customizeTemplate(templateId: string, parameters: Record<string, any>): Promise<CapsuleTemplate> {
    const baseTemplate = this.templates.get(templateId)
    if (!baseTemplate) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Clone the template
    const customizedTemplate: CapsuleTemplate = JSON.parse(JSON.stringify(baseTemplate))
    customizedTemplate.id = uuidv4()
    customizedTemplate.name = `${baseTemplate.name} (Customized)`
    
    // Apply parameter customizations
    await this.applyParameterCustomizations(customizedTemplate, parameters)
    
    // Update metadata
    customizedTemplate.updatedAt = new Date().toISOString()
    
    return customizedTemplate
  }

  /**
   * Map template category to capsule spec category
   */
  private mapTemplateCategory(templateCategory: string): 'component' | 'workflow' | 'service' | 'documentation' {
    switch (templateCategory) {
      case 'react-component':
        return 'component'
      case 'api-service':
        return 'service'
      case 'workflow':
        return 'workflow'
      case 'documentation':
        return 'documentation'
      case 'ai-agent':
        return 'service'
      case 'integration':
        return 'service'
      default:
        return 'component'
    }
  }

  /**
   * Convert template to capsule specification
   */
  async templateToCapsule(template: CapsuleTemplate, metadata: {
    name: string
    description: string
    version: string
  }): Promise<CapsuleSpec> {
    const fileMap = new Map<string, string>()
    const assetMap = new Map<string, any>()

    // Process template files
    template.scaffold.files.forEach(file => {
      if (file.type === 'asset') {
        assetMap.set(file.path, { content: file.content, size: file.size })
      } else {
        fileMap.set(file.path, file.content)
      }
    })

    const capsuleSpec: CapsuleSpec = {
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      category: this.mapTemplateCategory(template.category),
      
      provenanceTier: this.determineProvenanceTier(template),
      createdBy: 'ai-template-generator',
      agentGenerated: true,
      aiProvider: template.aiProvider,
      
      dependencies: template.scaffold.dependencies,
      buildInstructions: {
        buildCommand: template.scaffold.scripts.build || 'npm run build',
        testCommand: template.scaffold.scripts.test || 'npm test',
        environment: {
          node: '>=18.0.0',
          npm: '>=8.0.0'
        }
      },
      testInstructions: {
        framework: template.scaffold.configuration.testFramework,
        coverage: template.testCoverage,
        commands: ['test', 'test:coverage']
      },
      deploymentConfig: {
        platform: 'vercel',
        buildCommand: template.scaffold.scripts.build || 'npm run build',
        outputDirectory: 'dist'
      },
      
      sourceCode: Object.fromEntries(fileMap),
      assets: Object.fromEntries(assetMap),
      documentation: this.generateDocumentation(template),
      examples: template.examples.reduce((acc, example) => {
        acc.set(example.name, {
          code: example.code,
          description: example.description,
          interactive: example.interactive
        })
        return acc
      }, new Map())
    }

    return capsuleSpec
  }

  // Private implementation methods
  private initializeBuiltInTemplates(): void {
    const builtInTemplates: Partial<CapsuleTemplate>[] = [
      {
        name: "React Component Starter",
        description: "Modern React component with TypeScript, Storybook, and tests",
        category: "react-component",
        aiGenerated: false,
        scaffold: {
          dependencies: [
            "react@^18.0.0",
            "typescript@^5.0.0", 
            "@types/react@^18.0.0",
            "vitest@^1.0.0",
            "@testing-library/react@^14.0.0"
          ],
          scripts: {
            "dev": "vite",
            "build": "tsc && vite build",
            "test": "vitest",
            "storybook": "storybook dev -p 6006"
          },
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
        qualityScore: 92,
        testCoverage: 85,
        securityScore: 95,
        performanceScore: 88
      },
      {
        name: "API Service Template",
        description: "Express.js API service with TypeScript, validation, and documentation",
        category: "api-service",
        aiGenerated: false,
        scaffold: {
          dependencies: [
            "express@^4.18.0",
            "typescript@^5.0.0",
            "zod@^3.22.0",
            "cors@^2.8.5",
            "helmet@^7.0.0"
          ],
          scripts: {
            "dev": "tsx watch src/index.ts",
            "build": "tsc",
            "start": "node dist/index.js",
            "test": "vitest"
          },
          configuration: {
            buildSystem: 'vite',
            testFramework: 'vitest',
            linting: 'eslint',
            formatting: 'prettier',
            typeScript: true,
            cssFramework: 'none',
            stateManagement: 'none'
          }
        },
        qualityScore: 89,
        testCoverage: 78,
        securityScore: 92,
        performanceScore: 85
      },
      {
        name: "Documentation Site",
        description: "VitePress documentation site with search and deployment",
        category: "documentation",
        aiGenerated: false,
        scaffold: {
          dependencies: [
            "vitepress@^1.0.0",
            "vue@^3.3.0",
            "markdown-it@^13.0.0"
          ],
          scripts: {
            "dev": "vitepress dev docs",
            "build": "vitepress build docs",
            "preview": "vitepress preview docs"
          },
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
        qualityScore: 87,
        testCoverage: 65,
        securityScore: 90,
        performanceScore: 92
      }
    ]

    builtInTemplates.forEach((templateData, index) => {
      const template: CapsuleTemplate = {
        id: `template-${index + 1}`,
        name: templateData.name!,
        description: templateData.description!,
        category: templateData.category!,
        
        aiGenerated: templateData.aiGenerated!,
        aiProvider: 'openai',
        generationPrompt: '',
        confidence: 95,
        
        scaffold: templateData.scaffold!,
        
        parameters: this.generateDefaultParameters(templateData.category!),
        variations: [],
        examples: this.generateDefaultExamples(templateData.category!),
        
        qualityScore: templateData.qualityScore!,
        testCoverage: templateData.testCoverage!,
        securityScore: templateData.securityScore!,
        performanceScore: templateData.performanceScore!,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        tags: this.generateTags(templateData.category!),
        author: 'Eco AI Template Generator',
        license: 'MIT'
      }

      this.templates.set(template.id, template)
    })
  }

  private setupAIProviders(): void {
    // Mock AI provider configurations
    this.aiProviders.set('openai', {
      name: 'OpenAI GPT-4',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      capabilities: ['code-generation', 'documentation', 'testing'],
      strengths: ['react', 'typescript', 'modern-patterns']
    })

    this.aiProviders.set('vertex', {
      name: 'Google Vertex AI',
      endpoint: 'https://vertex-ai.googleapis.com/v1/projects',
      capabilities: ['code-generation', 'optimization', 'analysis'],
      strengths: ['performance', 'scalability', 'cloud-native']
    })

    this.aiProviders.set('azure', {
      name: 'Azure OpenAI',
      endpoint: 'https://api.cognitive.microsoft.com/sts/v1.0',
      capabilities: ['code-generation', 'security', 'enterprise'],
      strengths: ['enterprise', 'security', 'integration']
    })
  }

  private selectAIProvider(request: AIGenerationRequest): string {
    // Select best AI provider based on request
    if (request.category === 'react-component') return 'openai'
    if (request.category === 'api-service') return 'vertex'
    if (request.preferences.complexity === 'complex') return 'vertex'
    return 'openai'
  }

  private async generateTemplateStructure(
    request: AIGenerationRequest, 
    provider: string
  ): Promise<CapsuleTemplate> {
    // Mock AI template generation
    const template: CapsuleTemplate = {
      id: uuidv4(),
      name: this.generateTemplateName(request),
      description: request.prompt,
      category: request.category as any,
      
      aiGenerated: true,
      aiProvider: provider as any,
      generationPrompt: request.prompt,
      confidence: Math.floor(Math.random() * 20) + 80,
      
      scaffold: {
        files: [],
        dependencies: this.generateDependencies(request),
        scripts: this.generateScripts(request),
        configuration: {
          buildSystem: 'vite',
          testFramework: request.preferences.testFramework as any || 'vitest',
          linting: 'eslint',
          formatting: 'prettier',
          typeScript: request.preferences.typeScript,
          cssFramework: request.preferences.cssFramework as any || 'tailwind',
          stateManagement: 'none'
        }
      },
      
      parameters: this.generateParametersFromRequest(request),
      variations: [],
      examples: [],
      
      qualityScore: 0,
      testCoverage: 0,
      securityScore: 0,
      performanceScore: 0,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      tags: this.extractTagsFromPrompt(request.prompt),
      author: 'AI Template Generator',
      license: 'MIT'
    }

    return template
  }

  private async generateFileContents(template: CapsuleTemplate, request: AIGenerationRequest): Promise<void> {
    const files: TemplateFile[] = []

    // Generate core files based on category
    switch (template.category) {
      case 'react-component':
        files.push(...this.generateReactComponentFiles(request))
        break
      case 'api-service':
        files.push(...this.generateAPIServiceFiles(request))
        break
      case 'workflow':
        files.push(...this.generateWorkflowFiles(request))
        break
      case 'documentation':
        files.push(...this.generateDocumentationFiles(request))
        break
    }

    // Add common files
    files.push(...this.generateCommonFiles(request))

    template.scaffold.files = files
  }

  private generateReactComponentFiles(request: AIGenerationRequest): TemplateFile[] {
    const files: TemplateFile[] = []

    // Main component file
    const componentContent = `import React from 'react'

interface Props {
  // Component props based on: ${request.prompt}
}

export const Component: React.FC<Props> = () => {
  return (
    <div>
      {/* AI-generated component based on: ${request.prompt} */}
    </div>
  )
}

export default Component`

    files.push({
      path: 'src/Component.tsx',
      content: componentContent,
      type: 'source',
      language: 'typescript',
      size: componentContent.length,
      checksum: this.calculateChecksum(componentContent)
    })

    // Test file
    const testContent = `import { render, screen } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    // Add more specific tests based on component functionality
  })
})`

    files.push({
      path: 'src/Component.test.tsx',
      content: testContent,
      type: 'test',
      language: 'typescript',
      size: testContent.length,
      checksum: this.calculateChecksum(testContent)
    })

    return files
  }

  private generateAPIServiceFiles(request: AIGenerationRequest): TemplateFile[] {
    const files: TemplateFile[] = []

    // Main server file
    const serverContent = `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.use(cors())
app.use(express.json())

// API routes based on: ${request.prompt}
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`)
})`

    files.push({
      path: 'src/index.ts',
      content: serverContent,
      type: 'source',
      language: 'typescript',
      size: serverContent.length,
      checksum: this.calculateChecksum(serverContent)
    })

    return files
  }

  private generateWorkflowFiles(request: AIGenerationRequest): TemplateFile[] {
    // Generate workflow-specific files
    return []
  }

  private generateDocumentationFiles(request: AIGenerationRequest): TemplateFile[] {
    // Generate documentation-specific files
    return []
  }

  private generateCommonFiles(request: AIGenerationRequest): TemplateFile[] {
    const files: TemplateFile[] = []

    // Package.json
    const packageJson = {
      name: this.generatePackageName(request),
      version: '1.0.0',
      description: request.prompt,
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        test: 'vitest'
      },
      dependencies: {},
      devDependencies: {}
    }

    files.push({
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      type: 'config',
      language: 'json',
      size: JSON.stringify(packageJson).length,
      checksum: this.calculateChecksum(JSON.stringify(packageJson))
    })

    // README.md
    const readmeContent = `# ${this.generateTemplateName(request)}

${request.prompt}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`
`

    files.push({
      path: 'README.md',
      content: readmeContent,
      type: 'documentation',
      language: 'markdown',
      size: readmeContent.length,
      checksum: this.calculateChecksum(readmeContent)
    })

    return files
  }

  private generateDependencies(request: AIGenerationRequest): string[] {
    const deps = new Set<string>()

    // Base dependencies based on category
    if (request.category === 'react-component') {
      deps.add('react@^18.0.0')
      deps.add('@types/react@^18.0.0')
    }

    if (request.preferences.typeScript) {
      deps.add('typescript@^5.0.0')
    }

    if (request.preferences.cssFramework === 'tailwind') {
      deps.add('tailwindcss@^3.3.0')
    }

    deps.add('vite@^4.4.0')
    deps.add(request.preferences.testFramework + '@^1.0.0')

    return Array.from(deps)
  }

  private generateScripts(request: AIGenerationRequest): Record<string, string> {
    return {
      dev: 'vite',
      build: 'tsc && vite build',
      test: 'vitest',
      lint: 'eslint src --ext ts,tsx',
      format: 'prettier --write src'
    }
  }

  private generateDefaultParameters(category: string): TemplateParameter[] {
    const common: TemplateParameter[] = [
      {
        name: 'name',
        type: 'string',
        description: 'Component/service name',
        defaultValue: '',
        required: true
      },
      {
        name: 'description',
        type: 'string',
        description: 'Brief description',
        defaultValue: '',
        required: true
      }
    ]

    switch (category) {
      case 'react-component':
        return [
          ...common,
          {
            name: 'styleFramework',
            type: 'select',
            description: 'CSS framework',
            defaultValue: 'tailwind',
            required: false,
            options: ['tailwind', 'styled-components', 'emotion', 'css-modules']
          }
        ]
      default:
        return common
    }
  }

  private generateDefaultExamples(category: string): TemplateExample[] {
    switch (category) {
      case 'react-component':
        return [
          {
            id: uuidv4(),
            name: 'Basic Usage',
            description: 'Simple component usage example',
            code: '<Component prop="value" />',
            interactive: true
          }
        ]
      default:
        return []
    }
  }

  private generateTags(category: string): string[] {
    const tags = [category]
    
    switch (category) {
      case 'react-component':
        tags.push('react', 'typescript', 'component')
        break
      case 'api-service':
        tags.push('api', 'service', 'backend')
        break
    }
    
    return tags
  }

  private generateTemplateName(request: AIGenerationRequest): string {
    const words = request.prompt.split(' ').slice(0, 3)
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Template'
  }

  private generatePackageName(request: AIGenerationRequest): string {
    return request.prompt.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  private extractTagsFromPrompt(prompt: string): string[] {
    const commonTags = ['react', 'api', 'service', 'component', 'ui', 'workflow', 'automation']
    return commonTags.filter(tag => prompt.toLowerCase().indexOf(tag) !== -1)
  }

  private generateParametersFromRequest(request: AIGenerationRequest): TemplateParameter[] {
    return [
      {
        name: 'name',
        type: 'string',
        description: 'Template name',
        defaultValue: this.generateTemplateName(request),
        required: true
      },
      {
        name: 'useTypeScript',
        type: 'boolean',
        description: 'Use TypeScript',
        defaultValue: request.preferences.typeScript,
        required: false
      }
    ]
  }

  private assessTemplateQuality(template: CapsuleTemplate): { score: number; improvements: string[] } {
    let score = 60
    const improvements: string[] = []

    // Check file structure
    if (template.scaffold.files.length > 5) score += 10
    else improvements.push('Add more comprehensive file structure')

    // Check dependencies
    if (template.scaffold.dependencies.length > 3) score += 10
    else improvements.push('Consider adding more useful dependencies')

    // Check TypeScript usage
    if (template.scaffold.configuration.typeScript) score += 15
    else improvements.push('Consider adding TypeScript for better type safety')

    // Check testing
    const hasTests = template.scaffold.files.some(f => f.type === 'test')
    if (hasTests) score += 15
    else improvements.push('Add test files for better quality assurance')

    return { score: Math.min(100, score), improvements }
  }

  private async generateAlternatives(request: AIGenerationRequest, baseTemplate: CapsuleTemplate): Promise<CapsuleTemplate[]> {
    // Generate 2-3 alternative approaches
    const alternatives: CapsuleTemplate[] = []

    // Alternative 1: Different tech stack
    const alt1 = JSON.parse(JSON.stringify(baseTemplate))
    alt1.id = uuidv4()
    alt1.name = baseTemplate.name + ' (Alternative Stack)'
    alt1.scaffold.configuration.cssFramework = 'styled-components'
    alternatives.push(alt1)

    // Alternative 2: Simplified version
    const alt2 = JSON.parse(JSON.stringify(baseTemplate))
    alt2.id = uuidv4()
    alt2.name = baseTemplate.name + ' (Simplified)'
    alt2.scaffold.files = alt2.scaffold.files.slice(0, 3) // Fewer files
    alternatives.push(alt2)

    return alternatives
  }

  private generateReasoning(request: AIGenerationRequest, template: CapsuleTemplate): string {
    return `Generated ${template.category} template based on the prompt "${request.prompt}". 
Selected ${template.aiProvider} for optimal ${template.category} generation. 
Included ${template.scaffold.files.length} files with ${template.scaffold.dependencies.length} dependencies.
Quality score: ${template.qualityScore}/100 based on structure, testing, and best practices.`
  }

  private async applyParameterCustomizations(template: CapsuleTemplate, parameters: Record<string, any>): Promise<void> {
    // Apply parameter-based customizations to template files
    template.scaffold.files.forEach(file => {
      Object.entries(parameters).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        file.content = file.content.replace(new RegExp(placeholder, 'g'), String(value))
      })
    })
  }

  private determineProvenanceTier(template: CapsuleTemplate): 'bronze' | 'silver' | 'gold' {
    if (template.qualityScore >= 90) return 'gold'
    if (template.qualityScore >= 75) return 'silver'
    return 'bronze'
  }

  private generateDocumentation(template: CapsuleTemplate): string {
    return `# ${template.name}

${template.description}

## Features

${template.scaffold.files.map(f => `- ${f.path}`).join('\n')}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

Generated by Eco AI Template Generator.`
  }

  private calculateChecksum(content: string): string {
    // Simple checksum calculation
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16)
  }
}