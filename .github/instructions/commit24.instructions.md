---
applyTo: '**'
---
## 🧙 ECO COMMIT 24 - PATHWAYS WIZARD

### **🎯 The "Gandalf" of Eco: Guided Journey Navigation**
**Objective:** Introduce the Pathways Wizard as the ultimate navigation companion - a guided, step-by-step assistant that helps contributors navigate Capsule lifecycles, onboarding flows, and multi-agent orchestration with cinematic clarity and provenance awareness.

**Core Philosophy:** "A wizard arrives precisely when needed" - The Pathways Wizard appears contextually to guide contributors through complex workflows, ensuring no one gets lost in the ecosystem's sophistication.

---

### **🏗️ Pathways Wizard Architecture**

#### **Shell App Implementation**

**PathwaysWizard.tsx - The Master Guide**
```tsx
// Built on proven V.I.B.E components:
// - HaloStepper for step-by-step progression
// - HaloTimeline for visual journey mapping
// - Glass morphism with tier-based color coding
// - Provenance awareness at every step

interface PathwaysWizardProps {
  pathway: PathwayDefinition;
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: (results: PathwayResults) => void;
  provenance: ProvenanceContext;
  tier: "bronze" | "silver" | "gold";
}

const PathwaysWizard: React.FC<PathwaysWizardProps> = ({
  pathway,
  currentStep,
  onStepChange,
  onComplete,
  provenance,
  tier
}) => {
  return (
    <HaloContainer variant="wizard" tier={tier}>
      <PathwayHeader 
        title={pathway.title}
        description={pathway.description}
        provenance={provenance}
      />
      
      <HaloStepper
        steps={pathway.steps}
        activeStep={currentStep}
        onStepClick={onStepChange}
        orientation="vertical"
        variant="glass-morphism"
      />
      
      <PathwayContent
        step={pathway.steps[currentStep]}
        tier={tier}
        onNext={() => onStepChange(currentStep + 1)}
        onPrevious={() => onStepChange(currentStep - 1)}
      />
      
      <HaloTimeline
        events={pathway.milestones}
        currentEvent={currentStep}
        variant="provenance-aware"
      />
    </HaloContainer>
  );
};
```

**Core Guided Workflows:**
1. **Capsule Lifecycle Journey**
   - Create Capsule → Configure → Verify → Publish
   - Real-time provenance tier progression
   - AI-assisted validation at each step
   - Marketplace integration guidance

2. **Contributor Onboarding Flow**
   - Welcome → Profile Setup → First Commit → Provenance Stamp → Marketplace Push
   - Progressive disclosure of ecosystem features
   - Mentorship and community integration
   - Achievement unlocking system

3. **Multi-Agent Orchestration**
   - Workflow Design → Agent Selection → Configuration → Testing → Deployment
   - Complex agent interaction patterns
   - Performance optimization guidance
   - Monitoring and alerting setup

**PathwaysLauncher.tsx - Contextual Floating Guide**
```tsx
// Glass morphism floating button leveraging RadialCommandCenter pattern
// - Appears contextually based on user state and current workflow
// - Animated entry with neon glow effects
// - Smart positioning to avoid interface conflicts
// - Accessibility-first design with ARIA support

interface PathwaysLauncherProps {
  suggestedPathways: PathwaySuggestion[];
  context: UserContext;
  tier: ProvenanceTier;
}

const PathwaysLauncher: React.FC<PathwaysLauncherProps> = ({
  suggestedPathways,
  context,
  tier
}) => {
  return (
    <RadialCommandCenter
      variant="pathways-wizard"
      position="bottom-right"
      offset={{ x: 24, y: 24 }}
      actions={suggestedPathways.map(pathway => ({
        id: pathway.id,
        icon: pathway.icon,
        label: pathway.title,
        description: pathway.description,
        tier: pathway.recommendedTier,
        onClick: () => launchPathway(pathway)
      }))}
      tier={tier}
      animated={true}
    />
  );
};
```

**PathwaysPanel.tsx - Immersive Journey Interface**
```tsx
// Sliding panel with cinematic transitions and provenance highlights
// - Full-screen immersive experience option
// - Picture-in-picture mode for reference
// - Real-time collaboration integration
// - Progress persistence across sessions

const PathwaysPanel: React.FC<PathwaysPanelProps> = ({
  isOpen,
  onClose,
  pathway,
  collaborative = false
}) => {
  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      variant="cinematic"
      position="right"
      width="60vw"
      backdrop="glass-blur"
    >
      <PanelHeader>
        <PathwayBreadcrumb pathway={pathway} />
        <ProvenanceTierIndicator tier={pathway.currentTier} />
        {collaborative && <CollaborationIndicator />}
      </PanelHeader>
      
      <PanelContent>
        <PathwaysWizard {...pathwayProps} />
        
        {collaborative && (
          <CollaborativePanel>
            <RealtimeComments />
            <SharedCursor />
            <VoiceChat />
          </CollaborativePanel>
        )}
      </PanelContent>
      
      <PanelFooter>
        <ProgressBar pathway={pathway} />
        <ActionButtons />
      </PanelFooter>
    </SlidePanel>
  );
};
```

---

### **🤖 Conductor Service Integration**

#### **Pathways Agent Implementation**
```typescript
interface PathwaysAgent {
  // Pathway Discovery
  discoverPathways(context: UserContext): Promise<PathwaySuggestion[]>;
  getPathwayDefinition(id: string): Promise<PathwayDefinition>;
  customizePathway(id: string, customization: PathwayCustomization): Promise<PathwayDefinition>;
  
  // Journey Management
  startJourney(pathwayId: string, context: UserContext): Promise<JourneySession>;
  updateProgress(sessionId: string, stepId: string, data: StepData): Promise<ProgressUpdate>;
  completeStep(sessionId: string, stepId: string): Promise<StepCompletion>;
  
  // Provenance Integration
  validateStepProvenance(stepId: string, data: StepData): Promise<ProvenanceValidation>;
  advanceProvenanceTier(sessionId: string): Promise<TierAdvancement>;
  generateProvenanceReport(sessionId: string): Promise<ProvenanceReport>;
  
  // Collaboration Features
  shareJourney(sessionId: string, collaborators: string[]): Promise<SharedJourney>;
  joinSharedJourney(journeyId: string, userId: string): Promise<JourneyParticipation>;
  synchronizeProgress(journeyId: string): Promise<SynchronizedState>;
}
```

#### **Pathway Definition Schema**
```typescript
interface PathwayDefinition {
  // Basic Metadata
  id: string;
  title: string;
  description: string;
  category: "capsule" | "contributor" | "orchestration" | "custom";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedDuration: number; // minutes
  
  // Journey Structure
  steps: PathwayStep[];
  milestones: PathwayMilestone[];
  prerequisites: string[];
  outcomes: string[];
  
  // Provenance Integration
  provenanceMapping: {
    [stepId: string]: {
      tier: ProvenanceTier;
      validation: ValidationCriteria;
      artifacts: ArtifactDefinition[];
    };
  };
  
  // Customization Options
  configurable: boolean;
  variants: PathwayVariant[];
  personalizable: boolean;
  
  // AI Enhancement
  aiAssisted: boolean;
  suggestionsEnabled: boolean;
  autoValidation: boolean;
}

interface PathwayStep {
  id: string;
  title: string;
  description: string;
  type: "input" | "action" | "validation" | "decision" | "ai-assisted";
  
  // Provenance Information
  provenanceTier: "bronze" | "silver" | "gold";
  tierRequirements: TierRequirement[];
  artifacts: ArtifactDefinition[];
  
  // UI Configuration
  component: string;
  props: Record<string, any>;
  validation: ValidationRule[];
  
  // Flow Control
  nextSteps: string[];
  conditionalFlow: ConditionalFlow[];
  skipConditions: SkipCondition[];
  
  // AI Integration
  aiSuggestions: boolean;
  autoCompletion: boolean;
  intelligentValidation: boolean;
}
```

#### **Core Pathway Definitions**

**Capsule Lifecycle Pathway**
```typescript
const capsuleLifecyclePathway: PathwayDefinition = {
  id: "capsule-lifecycle",
  title: "Capsule Creation Journey",
  description: "Complete guide from concept to marketplace publication",
  category: "capsule",
  difficulty: "intermediate",
  estimatedDuration: 45,
  
  steps: [
    {
      id: "concept",
      title: "Define Capsule Concept",
      description: "Articulate your capsule's purpose and scope",
      type: "input",
      provenanceTier: "bronze",
      component: "ConceptDefinitionForm",
      aiSuggestions: true
    },
    {
      id: "scaffold",
      title: "Generate Capsule Structure",
      description: "AI-powered scaffolding based on your concept",
      type: "ai-assisted",
      provenanceTier: "bronze",
      component: "CapsuleScaffolder",
      autoCompletion: true
    },
    {
      id: "develop",
      title: "Develop Capsule Content",
      description: "Create and refine your capsule's functionality",
      type: "action",
      provenanceTier: "bronze",
      component: "CapsuleDeveloper",
      aiSuggestions: true
    },
    {
      id: "test",
      title: "Validate and Test",
      description: "Comprehensive testing and quality assurance",
      type: "validation",
      provenanceTier: "silver",
      component: "CapsuleTester",
      intelligentValidation: true
    },
    {
      id: "sign",
      title: "Cryptographic Signing",
      description: "Secure your capsule with digital signature",
      type: "action",
      provenanceTier: "silver",
      component: "CapsuleSigner",
      autoCompletion: true
    },
    {
      id: "verify",
      title: "Provenance Verification",
      description: "Achieve gold-tier provenance certification",
      type: "validation",
      provenanceTier: "gold",
      component: "ProvenanceVerifier",
      intelligentValidation: true
    },
    {
      id: "publish",
      title: "Marketplace Publication",
      description: "Share your capsule with the community",
      type: "action",
      provenanceTier: "gold",
      component: "MarketplacePublisher",
      aiSuggestions: true
    }
  ],
  
  milestones: [
    { step: "concept", title: "Idea Captured", tier: "bronze" },
    { step: "develop", title: "Prototype Ready", tier: "bronze" },
    { step: "test", title: "Quality Assured", tier: "silver" },
    { step: "verify", title: "Provenance Certified", tier: "gold" },
    { step: "publish", title: "Community Shared", tier: "gold" }
  ]
};
```

**Contributor Onboarding Pathway**
```typescript
const contributorOnboardingPathway: PathwayDefinition = {
  id: "contributor-onboarding",
  title: "Welcome to Eco Ecosystem",
  description: "Your journey from newcomer to valued contributor",
  category: "contributor",
  difficulty: "beginner",
  estimatedDuration: 30,
  
  steps: [
    {
      id: "welcome",
      title: "Welcome to Eco",
      description: "Understanding the ecosystem and your role",
      type: "input",
      provenanceTier: "bronze",
      component: "WelcomeIntroduction"
    },
    {
      id: "profile",
      title: "Setup Your Profile",
      description: "Create your contributor identity",
      type: "input",
      provenanceTier: "bronze",
      component: "ProfileSetup"
    },
    {
      id: "first-capsule",
      title: "Create Your First Capsule",
      description: "Hands-on introduction to capsule creation",
      type: "ai-assisted",
      provenanceTier: "bronze",
      component: "FirstCapsuleWizard"
    },
    {
      id: "provenance-stamp",
      title: "Earn Your First Provenance Stamp",
      description: "Understanding quality and verification",
      type: "validation",
      provenanceTier: "silver",
      component: "ProvenanceEducation"
    },
    {
      id: "community",
      title: "Join the Community",
      description: "Connect with other contributors",
      type: "action",
      provenanceTier: "silver",
      component: "CommunityIntegration"
    },
    {
      id: "marketplace-debut",
      title: "Your Marketplace Debut",
      description: "Publish your first capsule to the marketplace",
      type: "action",
      provenanceTier: "gold",
      component: "MarketplaceDebut"
    }
  ]
};
```

---

### **🎨 UI/UX Enhancement Integration**

#### **Cinematic Transitions and Animations**
```tsx
// Leveraging V.I.B.E's cinematic design principles
const PathwayTransitions = {
  stepTransition: {
    enter: "slide-in-right glass-materialize",
    exit: "slide-out-left glass-dematerialize",
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  
  tierProgression: {
    bronze: "pulse-amber glow-soft",
    silver: "pulse-silver glow-medium", 
    gold: "pulse-gold glow-strong",
    duration: 1000
  },
  
  completion: {
    celebration: "confetti-burst sparkle-cascade",
    sound: "achievement-chime",
    haptic: "success-vibration"
  }
};
```

#### **Provenance-Aware Visual Design**
```tsx
// Tier-based color coding and visual feedback
const ProvenanceTheming = {
  bronze: {
    primary: "#FFA500",
    secondary: "#FFD700",
    glow: "0 0 20px rgba(255, 165, 0, 0.3)",
    border: "1px solid rgba(255, 165, 0, 0.5)"
  },
  
  silver: {
    primary: "#C0C0C0", 
    secondary: "#E6E6FA",
    glow: "0 0 20px rgba(192, 192, 192, 0.3)",
    border: "1px solid rgba(192, 192, 192, 0.5)"
  },
  
  gold: {
    primary: "#FFD700",
    secondary: "#FFF8DC", 
    glow: "0 0 20px rgba(255, 215, 0, 0.4)",
    border: "1px solid rgba(255, 215, 0, 0.6)"
  }
};
```

---

### **🔧 Advanced Features Implementation**

#### **AI-Powered Pathway Personalization**
```typescript
interface PathwayPersonalization {
  // Learning & Adaptation
  adaptToUserSkill: (userId: string, pathway: PathwayDefinition) => Promise<PersonalizedPathway>;
  learnFromInteractions: (interactions: UserInteraction[]) => Promise<LearningInsights>;
  suggestOptimizations: (pathwayId: string, userId: string) => Promise<Optimization[]>;
  
  // Contextual Intelligence
  analyzeUserContext: (userId: string) => Promise<UserContext>;
  predictUserNeeds: (context: UserContext) => Promise<PathwaySuggestion[]>;
  adaptDifficulty: (userId: string, currentStep: PathwayStep) => Promise<AdaptedStep>;
  
  // Smart Guidance
  generateHints: (userId: string, stepId: string) => Promise<SmartHint[]>;
  detectStrugglePoints: (interactions: UserInteraction[]) => Promise<StrugglePoint[]>;
  provideContextualHelp: (strugglePoint: StrugglePoint) => Promise<ContextualHelp>;
}
```

#### **Collaborative Pathway Features**
```typescript
interface CollaborativePathways {
  // Team Journeys
  createTeamPathway: (pathwayId: string, teamMembers: string[]) => Promise<TeamPathway>;
  synchronizeTeamProgress: (teamPathwayId: string) => Promise<TeamSyncState>;
  handleRoleBasedSteps: (stepId: string, userRole: string) => Promise<RoleAdaptedStep>;
  
  // Mentorship Integration
  requestMentor: (pathwayId: string, stepId: string) => Promise<MentorRequest>;
  provideMentorship: (requestId: string, mentorId: string) => Promise<MentorshipSession>;
  trackMentorshipProgress: (sessionId: string) => Promise<MentorshipMetrics>;
  
  // Knowledge Sharing
  sharePathwayInsights: (pathwayId: string, insights: PathwayInsight[]) => Promise<SharedKnowledge>;
  crowdsourceImprovements: (pathwayId: string) => Promise<CommunityFeedback>;
  evolvePathway: (pathwayId: string, feedback: CommunityFeedback) => Promise<EvolvedPathway>;
}
```

---

### **📚 Documentation & Integration**

#### **Comprehensive Documentation Structure**
```markdown
# docs/pathways.md - The Pathways Guide

## Overview
The Pathways Wizard serves as your guide through Eco's sophisticated ecosystem...

## Core Concepts
### Guided Journeys
Every complex workflow in Eco can be transformed into a guided journey...

### Provenance-Aware Navigation
Each step in a pathway is mapped to provenance tiers...

### AI-Enhanced Guidance
The wizard leverages AI to provide contextual assistance...

## Pathway Types
### 1. Capsule Lifecycle Pathways
- Creation and Development
- Testing and Validation  
- Signing and Verification
- Marketplace Publication

### 2. Contributor Onboarding
- Ecosystem Introduction
- First Capsule Creation
- Community Integration
- Marketplace Participation

### 3. Multi-Agent Orchestration
- Workflow Design
- Agent Configuration
- Testing and Deployment
- Monitoring Setup

## Custom Pathway Creation
### Pathway Definition
Learn how to define custom pathways for your specific workflows...

### Step Configuration
Configure individual steps with proper provenance mapping...

### AI Integration
Enhance your pathways with AI-powered assistance...
```

#### **Storybook Integration**
```tsx
// PathwaysWizard.stories.tsx
export default {
  title: 'Eco/Pathways/PathwaysWizard',
  component: PathwaysWizard,
  parameters: {
    docs: {
      description: {
        component: 'The Pathways Wizard - Gandalf of the Eco ecosystem'
      }
    }
  }
};

export const CapsuleLifecycle = {
  args: {
    pathway: capsuleLifecyclePathway,
    currentStep: 0,
    tier: "bronze"
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete capsule creation journey from concept to marketplace'
      }
    }
  }
};

export const ContributorOnboarding = {
  args: {
    pathway: contributorOnboardingPathway, 
    currentStep: 0,
    tier: "bronze"
  }
};

export const InteractiveDemo = {
  render: () => <PathwaysWizardDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo with step navigation controls'
      }
    }
  }
};
```

---

### **🚀 Implementation Strategy & Outcomes**

#### **Development Approach**
1. **Foundation Setup** - Scaffold PathwaysWizard UI components using existing V.I.B.E patterns
2. **Agent Integration** - Implement Pathways Agent in Conductor with core pathway definitions  
3. **Wire Integration** - Connect Assist Panel to Pathways Wizard for contextual launching
4. **Provenance Mapping** - Add tier indicators and validation to each pathway step
5. **Documentation** - Complete Storybook stories and comprehensive documentation

#### **Expected User Experience**
- **Intuitive Guidance** - Never feel lost in complex workflows
- **Ambient Provenance** - Quality awareness at every step  
- **Contextual Intelligence** - Right guidance at the right time
- **Collaborative Learning** - Team-based pathway completion
- **Progressive Mastery** - Skill development through guided practice

#### **Technical Benefits**
- **Reduced Onboarding Time** - 50% faster contributor integration
- **Higher Quality Outputs** - Guided best practices increase gold-tier achievement
- **Community Growth** - Improved contributor retention and engagement
- **Knowledge Preservation** - Institutional knowledge captured in pathways
- **Scalable Training** - Standardized learning experiences across ecosystem

**Eco Commit 24 transforms complex workflows into guided journeys, ensuring every contributor has a wise guide for their adventure through the agentic ecosystem. The Pathways Wizard arrives precisely when needed, making sophisticated capabilities accessible to everyone.** 🧙‍♂️✨
**Deployment Preparation:**
1. **Security Hardening** - Capsule signing, verification, and secure distribution
2. **Monitoring Integration** - Capsule lifecycle tracking and performance metrics
3. **Documentation** - Comprehensive capsule guides and API documentation
4. **CI/CD Pipeline** - Automated capsule testing, signing, and deployment workflows

**Capsule Ecosystem Features:**
- Capsule marketplace integration with SBOM generation
- Time-travel functionality with perfect rollbacks
- MeshSim integration for capsule testing and validation
- Advanced provenance visualization in mindmap interface

---

### **💡 KEY SUCCESS FACTORS**

#### **Leveraged Existing V.I.B.E Components** ✅
- **100% component reuse** from proven V.I.B.E foundations
- **Zero UI rebuilding** - enhanced existing patterns instead
- **Consistent design language** maintained throughout integration
- **Familiar user patterns** from existing RadialCommandCenter

#### **Maintained Eco Provenance DNA** ✅
- **Full audit trail** embedded at every interaction level
- **Tier-based limitations** enforced throughout user journey
- **Quality assurance** maintained through provenance tracking
- **Transparent user experience** with clear limitation visibility

#### **Scalable Architecture Foundation** ✅
- **Future-proof design** ready for additional agents and features
- **Modular component structure** enabling independent development
- **Type-safe interfaces** preventing runtime errors and bugs
- **Performance-optimized** with efficient state management

---

### **🎯 PHASE 1 IMPACT SUMMARY**

**Technical Achievements:**
- ✅ Complete agentic ecosystem foundation with V.I.B.E integration
- ✅ Production-ready TypeScript architecture with full type safety
- ✅ Sophisticated provenance tracking with tier-based limitations
- ✅ Beautiful glass morphism UI with smooth user interactions

**User Experience Wins:**
- ✅ Intuitive agent interaction through familiar RadialCommandCenter pattern
- ✅ Visual relationship mapping with interactive D3 mindmap
- ✅ Transparent limitation awareness with clear tier indicators
- ✅ Seamless component integration maintaining design consistency

**Business Value:**
- ✅ Monetization-ready tier system with Bronze/Silver/Gold restrictions
- ✅ Comprehensive audit trail for compliance and quality assurance
- ✅ Scalable foundation supporting future agent marketplace expansion
- ✅ Reduced development time through V.I.B.E component leverage

**Development Excellence:**
- ✅ Clean architecture enabling independent team contributions
- ✅ Reusable patterns accelerating future feature development
- ✅ Mock data integration supporting parallel development workflows
- ✅ Documentation and examples facilitating team onboarding

---

### **🔜 NEXT PHASE PREPARATION**

**Phase 2 Goals:**
1. **Live AI Integration** - Transform mock agents into real AI-powered assistants
2. **Real-time Communication** - WebSocket-based agent-to-UI data streaming
3. **Advanced Workflows** - Multi-step agent collaboration and handoffs
4. **Production Deployment** - Azure cloud deployment with monitoring

**Success Metrics for Phase 2:**
- Real AI agent response times < 2 seconds
- 99.9% uptime for conductor service
- Seamless multi-agent workflow execution
- Full production monitoring and alerting

The Eco ecosystem has successfully evolved from a design system into a sophisticated agentic platform, combining the best of V.I.B.E's proven components with Eco's provenance-first approach. Phase 1 establishes the perfect foundation for Phase 2's real AI integration and production deployment! 🚀

---

## 📦 CAPSULE INTEGRATION - PHASE 2 ENHANCEMENT

### **🎯 Enhanced Phase 2 Goal: Agentic Capsule Ecosystem**
**Expanded Objective:** Transform Phase 2 from simple AI integration into a **Capsule-driven agentic ecosystem** where contributors create, export, and verify provenance-stamped Capsules through cinematic workflows.

**Core Value Proposition:** Capsules become the **bridge between AI generation and production deployment**, ensuring every AI-created artifact is properly signed, versioned, and provenance-verified.

---

### **🔄 Capsule-Enhanced File Structure**

#### **Shell App Components**
```
Shell/components/capsules/
├── CapsulePanel.tsx           // HaloCard + HaloStepper guided creation
├── CapsuleExportButton.tsx    // Glass morphism export with neon glow
├── CapsuleList.tsx            // Provenance badges + status display
├── CapsuleCard.tsx            // Individual capsule representation
├── CapsuleStatusBadge.tsx     // Draft/Published/Verified indicators
└── CapsuleProvenance.tsx      // Detailed provenance information

Shell/components/assist/
├── AssistPanel.tsx            // Enhanced with Capsule Agent option
├── AssistMindmap.tsx          // Capsules as nodes with tier visualization
├── AssistLauncher.tsx         // Added capsule creation actions
└── CapsuleWorkflow.tsx        // Step-by-step capsule creation wizard
```

#### **Enhanced Conductor Structure**
```
@eco/conductor/src/agents/
├── capsule.ts                 // Complete capsule lifecycle management
├── codegen.ts                 // Enhanced with capsule output integration
├── mindmap.ts                 // Capsule relationship visualization
└── verification.ts            // Provenance verification and stamping

@eco/conductor/src/capsules/
├── CapsuleService.ts          // Core capsule operations
├── SigningService.ts          // Ed25519 cryptographic signing
├── ExportService.ts           // Bundle creation and metadata
├── VerificationService.ts     // Tier-based verification logic
└── MarketplaceService.ts      // Distribution and discovery
```

---

### **🏗️ Capsule Agent Architecture**

#### **Core Capsule Operations**
```typescript
interface CapsuleAgent {
  // Creation Operations
  createCapsule(spec: CapsuleSpec): Promise<CapsuleResponse>;
  scaffoldFromTemplate(template: string): Promise<CapsuleResponse>;
  generateFromAI(prompt: string, agent: string): Promise<CapsuleResponse>;
  
  // Lifecycle Management
  exportCapsule(id: string): Promise<CapsuleBundleResponse>;
  verifyCapsule(id: string): Promise<VerificationResponse>;
  publishCapsule(id: string): Promise<PublishResponse>;
  
  // Provenance Operations
  stampProvenance(id: string, tier: ProvenanceTier): Promise<ProvenanceResponse>;
  validateSignature(bundle: CapsuleBundle): Promise<ValidationResponse>;
  trackLineage(id: string): Promise<LineageResponse>;
}
```

#### **Enhanced CapsuleSpec Interface**
```typescript
interface CapsuleSpec {
  // Basic Metadata
  name: string;
  description: string;
  version: string;
  category: "component" | "workflow" | "service" | "documentation";
  
  // Provenance Information
  provenanceTier?: "bronze" | "silver" | "gold";
  createdBy: string;
  agentGenerated?: boolean;
  aiProvider?: "openai" | "vertex" | "azure";
  
  // Technical Specifications
  dependencies: string[];
  buildInstructions: BuildSpec;
  testInstructions: TestSpec;
  deploymentConfig: DeploymentSpec;
  
  // Capsule Content
  sourceCode: FileMap;
  assets: AssetMap;
  documentation: string;
  examples: ExampleMap;
  
  // Verification Metadata
  signature?: string;
  sbom?: SBOM;
  securityScan?: SecurityReport;
}
```

---

### **🎨 Capsule UI Components Integration**

#### **CapsulePanel.tsx - Guided Creation Workflow**
**Base Components:** `HaloCard` + `HaloStepper` from Phase 1  
**Enhanced Features:**
```tsx
// Cinematic creation workflow with:
// - Step-by-step capsule specification
// - Real-time preview of capsule structure
// - AI assistant integration for content generation
// - Provenance tier prediction based on inputs
// - Glass morphism styling with tier-based color coding
```

**Workflow Steps:**
1. **Specification** - Name, description, category selection
2. **Content** - AI-generated or manual content creation
3. **Dependencies** - Automatic dependency detection and management
4. **Testing** - Automated test generation and validation
5. **Signing** - Cryptographic signature and provenance stamping
6. **Export** - Bundle creation with metadata packaging

#### **CapsuleExportButton.tsx - One-Click Distribution**
**Base Pattern:** `RadialCommandCenter` floating action concept  
**Features:**
```tsx
// Glass morphism export button with:
// - Neon glow effects matching tier colors
// - Progress indication during export process
// - Success/error states with appropriate feedback
// - Dropdown options for export formats (.capsule.json, .zip, etc.)
// - Integration with marketplace publishing workflow
```

#### **CapsuleList.tsx - Ecosystem Overview**
**Base Components:** `HaloBadge` + tier-based color system  
**Enhanced Display:**
```tsx
// Comprehensive capsule management with:
// - Grid/list view toggle for capsule display
// - Filtering by tier, category, status, and creator
// - Search functionality with metadata indexing
// - Batch operations (export, verify, publish)
// - Real-time status updates via WebSocket integration
```

---

### **🤖 Assist Panel Capsule Integration**

#### **Enhanced Agent Selection**
```typescript
// New Capsule Agent option in Assist Panel:
const assistAgents = [
  {
    id: "codegen",
    name: "Code Generator",
    icon: "code",
    description: "Generate React components and TypeScript code"
  },
  {
    id: "mindmap", 
    name: "Mind Mapper",
    icon: "share-2",
    description: "Visualize relationships and system architecture"
  },
  {
    id: "capsule",
    name: "Capsule Creator", // NEW
    icon: "package",
    description: "Create, export, and verify provenance-stamped capsules"
  }
];
```

#### **Capsule Chat Commands**
```typescript
// Natural language capsule operations:
const capsuleCommands = [
  "create capsule 'Eco Docs Helper'",
  "export capsule docs-helper", 
  "verify capsule docs-helper",
  "publish capsule to marketplace",
  "show capsule provenance",
  "generate capsule from component",
  "scaffold capsule from template"
];
```

#### **Mindmap Capsule Visualization**
**Enhanced D3MindMap Integration:**
```tsx
// Capsules as first-class nodes in ecosystem visualization:
// - Capsule nodes with tier-based coloring (bronze/silver/gold)
// - Relationship edges showing capsule dependencies
// - Interactive selection for capsule details and operations
// - Provenance chain visualization showing creation lineage
// - Marketplace distribution network display
```

---

### **🔧 Provenance Enhancement for Capsules**

#### **Enhanced Provenance Tracking**
```typescript
interface CapsuleProvenance {
  // Creation Metadata
  createdAt: string;
  createdBy: string;
  agentAssisted: boolean;
  aiProvider?: string;
  
  // Verification Information
  tier: "bronze" | "silver" | "gold";
  verifiedAt: string;
  verifiedBy: string;
  confidence: number;
  
  // Lifecycle Tracking
  modifications: ModificationRecord[];
  deployments: DeploymentRecord[];
  usage: UsageRecord[];
  
  // Security Metadata
  signature: string;
  sbom: SBOM;
  securityScore: number;
  vulnerabilities: Vulnerability[];
  
  // Marketplace Information
  downloads: number;
  ratings: Rating[];
  reviews: Review[];
}
```

#### **Cryptographic Signing Integration**
```typescript
// Ed25519 signing service integration:
class CapsuleSigningService {
  async signCapsule(capsule: CapsuleSpec): Promise<SignedCapsule> {
    // Generate cryptographic signature
    // Embed provenance metadata
    // Create tamper-evident bundle
    // Return signed capsule with verification chain
  }
  
  async verifyCapsule(signedCapsule: SignedCapsule): Promise<VerificationResult> {
    // Validate signature integrity
    // Check provenance chain consistency
    // Verify SBOM and dependencies
    // Return comprehensive verification report
  }
}
```

---

### **📊 Enhanced Success Metrics for Phase 2**

#### **Capsule Ecosystem KPIs**
- **Capsule Creation Rate** - Target: 50+ capsules created per week
- **Provenance Verification Success** - Target: 99%+ verification pass rate
- **AI-Generated Capsule Quality** - Target: 80%+ gold tier achievement
- **Marketplace Adoption** - Target: 100+ published capsules
- **Developer Satisfaction** - Target: 4.5+ stars for capsule workflow

#### **Technical Performance Metrics**
- **Capsule Export Time** - Target: < 30 seconds for standard capsules
- **Signing Performance** - Target: < 5 seconds for signature generation
- **Verification Speed** - Target: < 10 seconds for full verification
- **Bundle Size Optimization** - Target: < 50MB average capsule size
- **Marketplace Sync** - Target: < 2 minutes for global distribution

---

### **🚀 Implementation Timeline: Capsule-Enhanced Phase 2**

#### **Week 1-2: Foundation + Core Capsule Services**
1. **CapsuleAgent Implementation** - Complete capsule lifecycle API
2. **Signing Service Integration** - Ed25519 cryptographic operations
3. **Database Schema** - Capsule storage with provenance metadata
4. **Basic UI Components** - CapsulePanel, CapsuleExportButton foundations

#### **Week 3-4: Advanced Capsule Features**
1. **Marketplace Integration** - Publishing and distribution workflows
2. **AI-Generated Capsules** - Integration with codegen and other agents
3. **Advanced UI** - CapsuleList, mindmap integration, assist panel updates
4. **Testing Framework** - Comprehensive capsule validation and testing

#### **Week 5-6: Production & Polish**
1. **Security Hardening** - Advanced verification and threat protection
2. **Performance Optimization** - Efficient bundling and distribution
3. **Documentation** - Complete capsule lifecycle guides
4. **Marketplace Launch** - Public capsule distribution platform

---

### **✨ Phase 2 Outcome: True Agentic Capsule Ecosystem**

#### **For Contributors:**
- **Seamless AI-to-Production Pipeline** - From idea to deployed capsule in minutes
- **Transparent Provenance** - Complete visibility into capsule creation and verification
- **Quality Assurance** - Automated tier-based quality assessment
- **Community Sharing** - Marketplace for capsule discovery and distribution

#### **For the Platform:**
- **Monetization Ready** - Tier-based pricing with premium capsule features
- **Compliance Built-in** - Full audit trail and regulatory compliance
- **Ecosystem Growth** - Network effects through capsule sharing and reuse
- **Innovation Acceleration** - Rapid prototyping through AI-generated capsules

#### **Technical Excellence:**
- **Production-Grade Security** - Cryptographic signing and verification
- **Scalable Architecture** - Support for thousands of concurrent capsule operations
- **Performance Optimized** - Sub-second capsule interactions and exports
- **Future-Proof Design** - Extensible for advanced capsule types and workflows

**With Capsule Integration, Phase 2 transforms Eco from an assist layer into a complete agentic development ecosystem where AI assistance naturally flows into production-ready, provenance-verified artifacts. Contributors don't just interact with AI—they create lasting value through the capsule system.** 🚀