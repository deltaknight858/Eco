/**
 * CapsuleAgent.ts
 * Core capsule lifecycle management agent
 */

import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import type { Agent, AgentResponse, AgentType } from '../types/AssistTypes'
import { MarketplaceService } from '../services/MarketplaceService'
import { TemplateGenerator } from '../ai/TemplateGenerator'

// Enhanced Capsule Interfaces
export interface CapsuleSpec {
  // Basic Metadata
  name: string
  description: string
  version: string
  category: 'component' | 'workflow' | 'service' | 'documentation'
  
  // Provenance Information
  provenanceTier?: 'bronze' | 'silver' | 'gold'
  createdBy: string
  agentGenerated?: boolean
  aiProvider?: 'openai' | 'vertex' | 'azure'
  
  // Technical Specifications
  dependencies: string[]
  buildInstructions: BuildSpec
  testInstructions: TestSpec
  deploymentConfig: DeploymentSpec
  
  // Capsule Content
  sourceCode: FileMap
  assets: AssetMap
  documentation: string
  examples: ExampleMap
  
  // Verification Metadata
  signature?: string
  sbom?: SBOM
  securityScan?: SecurityReport
}

export interface BuildSpec {
  commands: string[]
  environment: Record<string, string>
  outputDirectory: string
  artifacts: string[]
}

export interface TestSpec {
  framework: 'vitest' | 'jest' | 'playwright'
  commands: string[]
  coverage: {
    threshold: number
    include: string[]
    exclude: string[]
  }
}

export interface DeploymentSpec {
  platform: 'vercel' | 'azure' | 'aws' | 'docker'
  configuration: Record<string, any>
  environment: Record<string, string>
  healthCheck?: string
}

export interface FileMap {
  [filePath: string]: {
    content: string
    encoding: 'utf-8' | 'base64'
    size: number
    checksum: string
  }
}

export interface AssetMap {
  [assetPath: string]: {
    url?: string
    content?: Buffer
    mimeType: string
    size: number
    checksum: string
  }
}

export interface ExampleMap {
  [exampleName: string]: {
    description: string
    code: string
    preview?: string
    dependencies: string[]
  }
}

export interface SBOM {
  version: string
  components: Array<{
    name: string
    version: string
    license: string
    vulnerabilities: number
    lastUpdated: string
  }>
  totalVulnerabilities: number
  riskScore: number
}

export interface SecurityReport {
  scanDate: string
  vulnerabilities: Vulnerability[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

export interface Vulnerability {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  component: string
  fix?: string
}

export interface CapsuleResponse {
  id: string
  spec: CapsuleSpec
  status: 'draft' | 'building' | 'testing' | 'ready' | 'published' | 'error'
  createdAt: string
  updatedAt: string
  buildLogs?: string[]
  testResults?: TestResults
  errors?: string[]
}

export interface TestResults {
  passed: number
  failed: number
  skipped: number
  coverage: number
  details: Array<{
    suite: string
    test: string
    status: 'pass' | 'fail' | 'skip'
    duration: number
    error?: string
  }>
}

export interface CapsuleBundleResponse {
  id: string
  bundleUrl: string
  signature: string
  metadata: CapsuleMetadata
  size: number
  checksum: string
}

export interface CapsuleMetadata {
  name: string
  version: string
  description: string
  author: string
  createdAt: string
  provenanceTier: 'bronze' | 'silver' | 'gold'
  dependencies: string[]
  tags: string[]
}

export interface VerificationResponse {
  isValid: boolean
  tier: 'bronze' | 'silver' | 'gold'
  confidence: number
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }>
  signature: {
    valid: boolean
    signer: string
    timestamp: string
  }
}

export interface PublishResponse {
  success: boolean
  capsuleId: string
  marketplaceUrl: string
  downloadCount: number
  publishedAt: string
}

export interface ProvenanceResponse {
  id: string
  tier: 'bronze' | 'silver' | 'gold'
  confidence: number
  timestamp: string
  verifiedBy: string
  lineage: Array<{
    action: string
    timestamp: string
    actor: string
    details: Record<string, any>
  }>
}

export interface ValidationResponse {
  isValid: boolean
  errors: string[]
  warnings: string[]
  signature: {
    valid: boolean
    algorithm: string
    publicKey: string
  }
}

export interface LineageResponse {
  capsuleId: string
  lineage: Array<{
    id: string
    action: 'created' | 'modified' | 'published' | 'verified'
    timestamp: string
    actor: string
    changes?: string[]
    parentId?: string
  }>
  dependencies: Array<{
    name: string
    version: string
    relationship: 'runtime' | 'build' | 'test'
  }>
}

// Zod Validation Schemas
const CapsuleSpecSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  category: z.enum(['component', 'workflow', 'service', 'documentation']),
  provenanceTier: z.enum(['bronze', 'silver', 'gold']).optional(),
  createdBy: z.string().min(1),
  agentGenerated: z.boolean().optional(),
  aiProvider: z.enum(['openai', 'vertex', 'azure']).optional(),
  dependencies: z.array(z.string()),
  buildInstructions: z.object({
    commands: z.array(z.string()),
    environment: z.record(z.string()),
    outputDirectory: z.string(),
    artifacts: z.array(z.string())
  }),
  testInstructions: z.object({
    framework: z.enum(['vitest', 'jest', 'playwright']),
    commands: z.array(z.string()),
    coverage: z.object({
      threshold: z.number().min(0).max(100),
      include: z.array(z.string()),
      exclude: z.array(z.string())
    })
  }),
  deploymentConfig: z.object({
    platform: z.enum(['vercel', 'azure', 'aws', 'docker']),
    configuration: z.record(z.any()),
    environment: z.record(z.string()),
    healthCheck: z.string().optional()
  }),
  sourceCode: z.record(z.object({
    content: z.string(),
    encoding: z.enum(['utf-8', 'base64']),
    size: z.number(),
    checksum: z.string()
  })),
  assets: z.record(z.object({
    url: z.string().optional(),
    content: z.any().optional(),
    mimeType: z.string(),
    size: z.number(),
    checksum: z.string()
  })),
  documentation: z.string(),
  examples: z.record(z.object({
    description: z.string(),
    code: z.string(),
    preview: z.string().optional(),
    dependencies: z.array(z.string())
  })),
  signature: z.string().optional(),
  sbom: z.object({
    version: z.string(),
    components: z.array(z.object({
      name: z.string(),
      version: z.string(),
      license: z.string(),
      vulnerabilities: z.number(),
      lastUpdated: z.string()
    })),
    totalVulnerabilities: z.number(),
    riskScore: z.number()
  }).optional(),
  securityScan: z.object({
    scanDate: z.string(),
    vulnerabilities: z.array(z.object({
      id: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      component: z.string(),
      fix: z.string().optional()
    })),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
    recommendations: z.array(z.string())
  }).optional()
})

export class CapsuleAgent implements Agent {
  id: string
  type: AgentType = 'capsule'
  status: 'idle' | 'active' | 'error' = 'idle'
  capabilities: string[] = [
    'create_capsule',
    'export_capsule',
    'verify_capsule',
    'publish_capsule',
    'scaffold_template',
    'generate_ai_capsule',
    'search_marketplace',
    'publish_to_marketplace',
    'get_marketplace_analytics'
  ]
  
  private capsules: Map<string, CapsuleResponse> = new Map()
  private marketplace: MarketplaceService
  private templateGenerator: TemplateGenerator

  constructor() {
    this.id = uuidv4()
    this.marketplace = new MarketplaceService()
    this.templateGenerator = new TemplateGenerator()
  }  async processMessage(message: string): Promise<AgentResponse> {
    this.status = 'active'
    
    try {
      // Parse command from natural language
      const command = this.parseCommand(message)
      
      switch (command.action) {
        case 'create':
          return await this.handleCreateCapsule(command.params)
        case 'export':
          return await this.handleExportCapsule(command.params)
        case 'verify':
          return await this.handleVerifyCapsule(command.params)
        case 'publish':
          return await this.handlePublishCapsule(command.params)
        case 'scaffold':
          return await this.handleScaffoldTemplate(command.params)
        case 'generate':
          return await this.handleGenerateAI(command.params)
        case 'list':
          return await this.handleListCapsules()
        case 'status':
          return await this.handleCapsuleStatus(command.params)
        case 'search':
          return await this.handleSearchMarketplace(command.params)
        case 'marketplace':
          return await this.handleMarketplacePublish(command.params)
        case 'analytics':
          return await this.handleMarketplaceAnalytics()
        default:
          throw new Error(`Unknown command: ${command.action}`)
      }
    } catch (error) {
      this.status = 'error'
      return {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0.1,
        agentId: this.id,
        provenance: {
          tier: 'bronze',
          confidence: 0.1,
          sources: ['error-handler']
        }
      }
    } finally {
      this.status = 'idle'
    }
  }

  // Core Capsule Operations
  async createCapsule(spec: CapsuleSpec): Promise<CapsuleResponse> {
    // Validate input
    const validatedSpec = CapsuleSpecSchema.parse(spec)
    
    const capsuleId = uuidv4()
    const capsule: CapsuleResponse = {
      id: capsuleId,
      spec: validatedSpec,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buildLogs: [],
      testResults: undefined,
      errors: []
    }
    
    this.capsules.set(capsuleId, capsule)
    
    // Trigger build process
    this.triggerBuild(capsuleId)
    
    return capsule
  }

  async exportCapsule(id: string): Promise<CapsuleBundleResponse> {
    const capsule = this.capsules.get(id)
    if (!capsule) {
      throw new Error(`Capsule ${id} not found`)
    }
    
    if (capsule.status !== 'ready') {
      throw new Error(`Capsule ${id} is not ready for export (status: ${capsule.status})`)
    }
    
    // Create bundle
    const bundle = await this.createBundle(capsule)
    
    return {
      id: bundle.id,
      bundleUrl: bundle.url,
      signature: bundle.signature,
      metadata: {
        name: capsule.spec.name,
        version: capsule.spec.version,
        description: capsule.spec.description,
        author: capsule.spec.createdBy,
        createdAt: capsule.createdAt,
        provenanceTier: capsule.spec.provenanceTier || 'bronze',
        dependencies: capsule.spec.dependencies,
        tags: [capsule.spec.category]
      },
      size: bundle.size,
      checksum: bundle.checksum
    }
  }

  async verifyCapsule(id: string): Promise<VerificationResponse> {
    const capsule = this.capsules.get(id)
    if (!capsule) {
      throw new Error(`Capsule ${id} not found`)
    }
    
    const checks = await this.runVerificationChecks(capsule)
    const tier = this.calculateProvenanceTier(checks)
    const confidence = this.calculateConfidence(checks)
    
    return {
      isValid: checks.every(check => check.status !== 'fail'),
      tier,
      confidence,
      checks,
      signature: {
        valid: capsule.spec.signature ? true : false,
        signer: capsule.spec.createdBy,
        timestamp: capsule.createdAt
      }
    }
  }

  async publishCapsule(id: string): Promise<PublishResponse> {
    const capsule = this.capsules.get(id)
    if (!capsule) {
      throw new Error(`Capsule ${id} not found`)
    }
    
    const verification = await this.verifyCapsule(id)
    if (!verification.isValid) {
      throw new Error('Capsule failed verification and cannot be published')
    }
    
    // Simulate marketplace publishing
    const marketplaceUrl = `https://eco-marketplace.dev/capsules/${id}`
    
    return {
      success: true,
      capsuleId: id,
      marketplaceUrl,
      downloadCount: 0,
      publishedAt: new Date().toISOString()
    }
  }

  // AI-Enhanced Methods
  async scaffoldFromTemplate(template: string): Promise<CapsuleResponse> {
    const templateSpec = await this.getTemplate(template)
    return await this.createCapsule(templateSpec)
  }

  async generateFromAI(prompt: string, agent: string): Promise<CapsuleResponse> {
    // This would integrate with real AI providers in production
    const aiGeneratedSpec = await this.generateSpecFromPrompt(prompt, agent)
    return await this.createCapsule({
      ...aiGeneratedSpec,
      agentGenerated: true,
      aiProvider: agent as any
    })
  }

  // Helper Methods
  private parseCommand(message: string): { action: string; params: any } {
    const lowercaseMessage = message.toLowerCase()
    
    if (lowercaseMessage.includes('create capsule')) {
      const name = this.extractQuotedString(message) || 'Untitled Capsule'
      return { action: 'create', params: { name } }
    }
    
    if (lowercaseMessage.includes('export capsule')) {
      const name = this.extractCapsuleName(message)
      return { action: 'export', params: { name } }
    }
    
    if (lowercaseMessage.includes('verify capsule')) {
      const name = this.extractCapsuleName(message)
      return { action: 'verify', params: { name } }
    }
    
    if (lowercaseMessage.includes('publish capsule')) {
      return { action: 'publish', params: {} }
    }
    
    if (lowercaseMessage.includes('scaffold')) {
      const template = this.extractTemplate(message)
      return { action: 'scaffold', params: { template } }
    }
    
    if (lowercaseMessage.includes('generate') && lowercaseMessage.includes('from')) {
      return { action: 'generate', params: { prompt: message } }
    }
    
    if (lowercaseMessage.includes('list capsules')) {
      return { action: 'list', params: {} }
    }
    
    if (lowercaseMessage.includes('status')) {
      return { action: 'status', params: {} }
    }
    
    return { action: 'help', params: {} }
  }

  private extractQuotedString(text: string): string | null {
    const match = text.match(/'([^']*)'|"([^']*)"/)
    return match ? (match[1] || match[2]) : null
  }

  private extractCapsuleName(text: string): string {
    const match = text.match(/capsule\s+([a-zA-Z0-9-_]+)/)
    return match ? match[1] : 'unknown'
  }

  private extractTemplate(text: string): string {
    const match = text.match(/from\s+([a-zA-Z0-9-_]+)/)
    return match ? match[1] : 'default'
  }

  private async triggerBuild(capsuleId: string): Promise<void> {
    const capsule = this.capsules.get(capsuleId)
    if (!capsule) return
    
    capsule.status = 'building'
    capsule.buildLogs = ['Starting build process...']
    
    // Simulate build process
    setTimeout(async () => {
      try {
        capsule.buildLogs?.push('Running build commands...')
        capsule.buildLogs?.push('Build completed successfully')
        
        capsule.status = 'testing'
        capsule.buildLogs?.push('Starting tests...')
        
        // Simulate test results
        capsule.testResults = {
          passed: 12,
          failed: 0,
          skipped: 1,
          coverage: 89.5,
          details: [
            { suite: 'component', test: 'renders correctly', status: 'pass', duration: 45 },
            { suite: 'component', test: 'handles props', status: 'pass', duration: 32 },
            { suite: 'integration', test: 'full workflow', status: 'skip', duration: 0 }
          ]
        }
        
        capsule.status = 'ready'
        capsule.updatedAt = new Date().toISOString()
        
        this.capsules.set(capsuleId, capsule)
      } catch (error) {
        capsule.status = 'error'
        capsule.errors = [error instanceof Error ? error.message : 'Build failed']
        this.capsules.set(capsuleId, capsule)
      }
    }, 2000)
  }

  private async createBundle(capsule: CapsuleResponse): Promise<{
    id: string
    url: string
    signature: string
    size: number
    checksum: string
  }> {
    // In production, this would create actual bundle files
    const bundleId = uuidv4()
    const signature = await this.signCapsule(capsule)
    
    return {
      id: bundleId,
      url: `https://cdn.eco-marketplace.dev/bundles/${bundleId}.capsule.zip`,
      signature,
      size: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
      checksum: `sha256:${uuidv4().replace(/-/g, '')}`
    }
  }

  private async signCapsule(capsule: CapsuleResponse): Promise<string> {
    // In production, this would use actual Ed25519 signing
    const data = JSON.stringify(capsule.spec)
    return `ed25519:${Buffer.from(data).toString('base64').slice(0, 64)}`
  }

  private async runVerificationChecks(capsule: CapsuleResponse): Promise<Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }>> {
    return [
      {
        name: 'Build Success',
        status: capsule.status === 'ready' ? 'pass' : 'fail',
        message: capsule.status === 'ready' ? 'Build completed successfully' : 'Build failed or incomplete'
      },
      {
        name: 'Test Coverage',
        status: (capsule.testResults?.coverage || 0) >= 80 ? 'pass' : 'warning',
        message: `Test coverage: ${capsule.testResults?.coverage || 0}%`
      },
      {
        name: 'Dependencies',
        status: capsule.spec.dependencies.length > 0 ? 'pass' : 'warning',
        message: `${capsule.spec.dependencies.length} dependencies declared`
      },
      {
        name: 'Documentation',
        status: capsule.spec.documentation.length > 100 ? 'pass' : 'warning',
        message: capsule.spec.documentation.length > 100 ? 'Comprehensive documentation provided' : 'Documentation could be more detailed'
      },
      {
        name: 'Security Scan',
        status: capsule.spec.securityScan ? 'pass' : 'warning',
        message: capsule.spec.securityScan ? 'Security scan completed' : 'No security scan performed'
      }
    ]
  }

  private calculateProvenanceTier(checks: Array<{ status: string }>): 'bronze' | 'silver' | 'gold' {
    const passCount = checks.filter(check => check.status === 'pass').length
    const totalChecks = checks.length
    const passRate = passCount / totalChecks
    
    if (passRate >= 0.9) return 'gold'
    if (passRate >= 0.7) return 'silver'
    return 'bronze'
  }

  private calculateConfidence(checks: Array<{ status: string }>): number {
    const passCount = checks.filter(check => check.status === 'pass').length
    const warningCount = checks.filter(check => check.status === 'warning').length
    const totalChecks = checks.length
    
    return (passCount + warningCount * 0.5) / totalChecks
  }

  private async getTemplate(templateName: string): Promise<CapsuleSpec> {
    // Mock template system - in production this would fetch from template registry
    const templates: Record<string, Partial<CapsuleSpec>> = {
      'react-component': {
        name: 'React Component Template',
        description: 'Template for creating React components',
        category: 'component',
        dependencies: ['react', '@types/react'],
        buildInstructions: {
          commands: ['npm run build'],
          environment: { NODE_ENV: 'production' },
          outputDirectory: 'dist',
          artifacts: ['dist/**/*']
        },
        testInstructions: {
          framework: 'vitest',
          commands: ['npm test'],
          coverage: { threshold: 80, include: ['src/**/*'], exclude: ['**/*.test.ts'] }
        }
      }
    }
    
    const template = templates[templateName] || templates['react-component']
    
    return {
      ...template,
      name: template.name || 'Untitled',
      description: template.description || 'Generated from template',
      version: '1.0.0',
      category: template.category || 'component',
      createdBy: 'template-system',
      dependencies: template.dependencies || [],
      buildInstructions: template.buildInstructions || {
        commands: [],
        environment: {},
        outputDirectory: 'dist',
        artifacts: []
      },
      testInstructions: template.testInstructions || {
        framework: 'vitest',
        commands: [],
        coverage: { threshold: 0, include: [], exclude: [] }
      },
      deploymentConfig: {
        platform: 'vercel',
        configuration: {},
        environment: {}
      },
      sourceCode: {},
      assets: {},
      documentation: 'Generated from template',
      examples: {}
    } as CapsuleSpec
  }

  private async generateSpecFromPrompt(prompt: string, agent: string): Promise<CapsuleSpec> {
    // Mock AI generation - in production this would call real AI APIs
    return {
      name: 'AI Generated Capsule',
      description: `Generated from prompt: ${prompt.slice(0, 100)}...`,
      version: '1.0.0',
      category: 'component',
      createdBy: 'ai-system',
      agentGenerated: true,
      aiProvider: agent as any,
      dependencies: ['react', '@types/react'],
      buildInstructions: {
        commands: ['npm run build'],
        environment: { NODE_ENV: 'production' },
        outputDirectory: 'dist',
        artifacts: ['dist/**/*']
      },
      testInstructions: {
        framework: 'vitest',
        commands: ['npm test'],
        coverage: { threshold: 70, include: ['src/**/*'], exclude: ['**/*.test.ts'] }
      },
      deploymentConfig: {
        platform: 'vercel',
        configuration: {},
        environment: {}
      },
      sourceCode: {
        'src/component.tsx': {
          content: `// AI Generated Component\nexport function GeneratedComponent() {\n  return <div>Hello from AI!</div>\n}`,
          encoding: 'utf-8',
          size: 100,
          checksum: 'sha256:abc123'
        }
      },
      assets: {},
      documentation: `# ${prompt}\n\nThis capsule was generated using AI based on your prompt.`,
      examples: {
        'basic-usage': {
          description: 'Basic usage example',
          code: '<GeneratedComponent />',
          dependencies: []
        }
      }
    }
  }

  // Command Handlers
  private async handleCreateCapsule(params: any): Promise<AgentResponse> {
    const spec: CapsuleSpec = {
      name: params.name || 'New Capsule',
      description: 'A new capsule created via chat',
      version: '1.0.0',
      category: 'component',
      createdBy: 'user',
      dependencies: [],
      buildInstructions: {
        commands: ['npm run build'],
        environment: {},
        outputDirectory: 'dist',
        artifacts: []
      },
      testInstructions: {
        framework: 'vitest',
        commands: ['npm test'],
        coverage: { threshold: 80, include: [], exclude: [] }
      },
      deploymentConfig: {
        platform: 'vercel',
        configuration: {},
        environment: {}
      },
      sourceCode: {},
      assets: {},
      documentation: '',
      examples: {}
    }
    
    const capsule = await this.createCapsule(spec)
    
    return {
      content: `✅ Created capsule "${capsule.spec.name}" (ID: ${capsule.id})\n\nStatus: ${capsule.status}\nCreated: ${new Date(capsule.createdAt).toLocaleString()}\n\nThe capsule is being built. You can check its status or export it once ready.`,
      confidence: 0.9,
      agentId: this.id,
      provenance: {
        tier: 'silver',
        confidence: 0.9,
        sources: ['capsule-agent']
      }
    }
  }

  private async handleExportCapsule(params: any): Promise<AgentResponse> {
    try {
      const capsule = Array.from(this.capsules.values()).find(c => 
        c.spec.name.toLowerCase().includes(params.name?.toLowerCase() || '')
      )
      
      if (!capsule) {
        return {
          content: `❌ Capsule "${params.name}" not found. Use "list capsules" to see available capsules.`,
          confidence: 0.8,
          agentId: this.id,
          provenance: { tier: 'bronze', confidence: 0.8 }
        }
      }
      
      const bundle = await this.exportCapsule(capsule.id)
      
      return {
        content: `📦 Exported capsule "${capsule.spec.name}"\n\n📁 Bundle: ${bundle.bundleUrl}\n🔒 Signature: ${bundle.signature.slice(0, 32)}...\n📊 Size: ${(bundle.size / 1024 / 1024).toFixed(2)} MB\n🏷️ Tier: ${bundle.metadata.provenanceTier}`,
        confidence: 0.95,
        agentId: this.id,
        provenance: {
          tier: 'gold',
          confidence: 0.95,
          sources: ['capsule-export']
        }
      }
    } catch (error) {
      return {
        content: `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0.3,
        agentId: this.id,
        provenance: { tier: 'bronze', confidence: 0.3 }
      }
    }
  }

  private async handleVerifyCapsule(params: any): Promise<AgentResponse> {
    const capsule = Array.from(this.capsules.values()).find(c => 
      c.spec.name.toLowerCase().includes(params.name?.toLowerCase() || '')
    )
    
    if (!capsule) {
      return {
        content: `❌ Capsule "${params.name}" not found.`,
        confidence: 0.8,
        agentId: this.id,
        provenance: { tier: 'bronze', confidence: 0.8 }
      }
    }
    
    const verification = await this.verifyCapsule(capsule.id)
    
    const checkSummary = verification.checks.map(check => 
      `${check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌'} ${check.name}: ${check.message}`
    ).join('\n')
    
    return {
      content: `🔍 Verification Results for "${capsule.spec.name}"\n\n${verification.isValid ? '✅ VALID' : '❌ INVALID'}\n🏆 Tier: ${verification.tier}\n📊 Confidence: ${Math.round(verification.confidence * 100)}%\n\n${checkSummary}`,
      confidence: verification.confidence,
      agentId: this.id,
      provenance: {
        tier: verification.tier,
        confidence: verification.confidence,
        sources: ['capsule-verification']
      }
    }
  }

  private async handlePublishCapsule(params: any): Promise<AgentResponse> {
    const readyCapsules = Array.from(this.capsules.values()).filter(c => c.status === 'ready')
    
    if (readyCapsules.length === 0) {
      return {
        content: `❌ No capsules ready for publishing. Build and verify your capsules first.`,
        confidence: 0.8,
        agentId: this.id,
        provenance: { tier: 'bronze', confidence: 0.8 }
      }
    }
    
    const capsule = readyCapsules[0] // Publish the first ready capsule
    const result = await this.publishCapsule(capsule.id)
    
    return {
      content: `🚀 Published capsule "${capsule.spec.name}"\n\n🌐 Marketplace: ${result.marketplaceUrl}\n📥 Downloads: ${result.downloadCount}\n📅 Published: ${new Date(result.publishedAt).toLocaleString()}`,
      confidence: 0.95,
      agentId: this.id,
      provenance: {
        tier: 'gold',
        confidence: 0.95,
        sources: ['capsule-marketplace']
      }
    }
  }

  private async handleScaffoldTemplate(params: any): Promise<AgentResponse> {
    const capsule = await this.scaffoldFromTemplate(params.template)
    
    return {
      content: `🏗️ Scaffolded capsule from template "${params.template}"\n\nCapsule: ${capsule.spec.name}\nID: ${capsule.id}\nStatus: ${capsule.status}\n\nThe capsule is being built from the template.`,
      confidence: 0.85,
      agentId: this.id,
      provenance: {
        tier: 'silver',
        confidence: 0.85,
        sources: ['template-system']
      }
    }
  }

  private async handleGenerateAI(params: any): Promise<AgentResponse> {
    const capsule = await this.generateFromAI(params.prompt, 'openai')
    
    return {
      content: `🤖 Generated AI capsule from your prompt\n\nCapsule: ${capsule.spec.name}\nID: ${capsule.id}\nStatus: ${capsule.status}\nAI Provider: ${capsule.spec.aiProvider}\n\nThe AI-generated capsule is being built and tested.`,
      confidence: 0.8,
      agentId: this.id,
      provenance: {
        tier: 'silver',
        confidence: 0.8,
        sources: ['ai-generation']
      }
    }
  }

  private async handleListCapsules(): Promise<AgentResponse> {
    if (this.capsules.size === 0) {
      return {
        content: `📋 No capsules found. Create your first capsule with "create capsule 'My Capsule'"`,
        confidence: 0.9,
        agentId: this.id,
        provenance: { tier: 'silver', confidence: 0.9 }
      }
    }
    
    const capsuleList = Array.from(this.capsules.values()).map(capsule => 
      `📦 ${capsule.spec.name} (${capsule.id.slice(0, 8)})\n   Status: ${capsule.status} | Tier: ${capsule.spec.provenanceTier || 'bronze'} | Created: ${new Date(capsule.createdAt).toLocaleDateString()}`
    ).join('\n\n')
    
    return {
      content: `📋 Your Capsules (${this.capsules.size})\n\n${capsuleList}`,
      confidence: 0.95,
      agentId: this.id,
      provenance: {
        tier: 'gold',
        confidence: 0.95,
        sources: ['capsule-registry']
      }
    }
  }

  private async handleCapsuleStatus(params: any): Promise<AgentResponse> {
    const activeCapsules = Array.from(this.capsules.values()).filter(c => 
      c.status === 'building' || c.status === 'testing'
    )
    
    if (activeCapsules.length === 0) {
      return {
        content: `✅ All capsules are idle. No active build or test processes.`,
        confidence: 0.9,
        agentId: this.id,
        provenance: { tier: 'silver', confidence: 0.9 }
      }
    }
    
    const statusList = activeCapsules.map(capsule => 
      `⚡ ${capsule.spec.name}: ${capsule.status}\n   Latest: ${capsule.buildLogs?.slice(-1)[0] || 'No logs'}`
    ).join('\n\n')
    
    return {
      content: `⚡ Active Capsule Processes\n\n${statusList}`,
      confidence: 0.9,
      agentId: this.id,
      provenance: { tier: 'silver', confidence: 0.9 }
    }
  }

  /**
   * Search marketplace for capsules
   */
  private async handleSearchMarketplace(params: any): Promise<AgentResponse> {
    const query = params.query || ''
    const filters = params.filters || {}

    const searchResults = await this.marketplace.searchCapsules({
      query,
      ...filters
    })

    return {
      content: `Found ${searchResults.totalCount} capsules matching "${query}":

**Featured Capsules:**
${searchResults.featured.slice(0, 3).map(listing => 
  `• **${listing.title}** (${listing.category}) - ${listing.downloads} downloads, ⭐ ${this.getAverageRating(listing).toFixed(1)}`
).join('\n')}

**Search Results:**
${searchResults.listings.slice(0, 5).map(listing => 
  `• **${listing.title}** by ${listing.publisher.name} - ${listing.pricing.model === 'free' ? 'Free' : `$${listing.pricing.price}`}`
).join('\n')}

Use "marketplace install <capsule-id>" to install a capsule.`,
      confidence: 0.95,
      agentId: this.id,
      provenance: {
        tier: 'silver',
        confidence: 0.95,
        sources: ['marketplace-search', 'capsule-database']
      }
    }
  }

  /**
   * Publish capsule to marketplace
   */
  private async handleMarketplacePublish(params: any): Promise<AgentResponse> {
    const capsuleName = params.name
    if (!capsuleName) {
      throw new Error('Capsule name required for marketplace publishing')
    }

    const capsule = this.capsules.get(capsuleName)
    if (!capsule) {
      throw new Error(`Capsule "${capsuleName}" not found`)
    }

    // Publish to marketplace
    const listing = await this.marketplace.publishCapsule(capsule.spec, {
      id: 'user-123', // In real implementation, get from auth context
      name: 'Developer',
      verified: false
    })

    return {
      content: `Successfully published "${capsule.spec.name}" to the marketplace! 🎉

**Listing Details:**
• **ID:** ${listing.id}
• **Category:** ${listing.category}
• **Status:** ${listing.status}
• **Moderation:** ${listing.moderationStatus}

Your capsule is now under review and will be available publicly once approved.
Track your listing at: marketplace/listings/${listing.id}`,
      confidence: 0.9,
      agentId: this.id,
      provenance: {
        tier: 'gold',
        confidence: 0.9,
        sources: ['marketplace-api', 'capsule-verification']
      }
    }
  }

  /**
   * Get marketplace analytics
   */
  private async handleMarketplaceAnalytics(): Promise<AgentResponse> {
    const analytics = await this.marketplace.getMarketplaceAnalytics()

    return {
      content: `**Marketplace Analytics** 📊

**Overview:**
• Total Listings: ${analytics.totalListings}
• Total Downloads: ${analytics.totalDownloads.toLocaleString()}
• Average Rating: ⭐ ${analytics.averageRating.toFixed(1)}/5.0

**Top Categories:**
${analytics.topCategories.slice(0, 5).map(cat => 
  `• ${cat.category}: ${cat.count} capsules`
).join('\n')}

**Recent Activity:**
${analytics.recentActivity.slice(0, 3).map(activity => 
  `• ${activity.eventType} on "${activity.listingTitle}" - ${new Date(activity.timestamp).toLocaleDateString()}`
).join('\n')}

The marketplace is growing with high-quality, provenance-verified capsules! 🚀`,
      confidence: 0.92,
      agentId: this.id,
      provenance: {
        tier: 'gold',
        confidence: 0.92,
        sources: ['marketplace-analytics', 'real-time-data']
      }
    }
  }

  private getAverageRating(listing: any): number {
    if (!listing.ratings || listing.ratings.length === 0) return 0
    return listing.ratings.reduce((sum: number, rating: any) => sum + rating.rating, 0) / listing.ratings.length
  }
}