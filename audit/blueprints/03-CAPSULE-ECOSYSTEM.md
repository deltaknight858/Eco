# 🔥 CAPSULE ECOSYSTEM BLUEPRINT (TD-2025-005)

## **📦 COMMIT 33: CAPSULE CREATION WORKFLOW**

### **Goal:** Users can create, sign, and export provenance-stamped capsules

### **The Vision:**

```typescript
// Complete capsule lifecycle with Memory integration
interface CapsuleWithMemory extends CapsuleSpec {
  originMemoryId?: string;     // Source note/conversation
  memoryLineage: string[];     // All related memory nodes
  provenanceChain: ProvenanceStamp[];
  aiGenerated: boolean;
  templateUsed?: string;
}

class CapsuleLifecycleService {
  async createFromMemory(memoryId: string): Promise<Capsule>;
  async generateFromPrompt(prompt: string): Promise<Capsule>;
  async signAndVerify(capsuleId: string): Promise<ProvenanceStamp>;
  async exportToMarketplace(capsuleId: string): Promise<MarketplaceListing>;
}
```

### **Implementation Tasks:**

#### **1. Capsule Database Schema**

```sql
-- Create capsules table
CREATE TABLE capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  category TEXT CHECK (category IN ('component', 'workflow', 'service', 'documentation')),
  
  -- Memory integration
  origin_memory_id UUID REFERENCES memory_nodes(id),
  
  -- Content
  source_code JSONB,
  assets JSONB,
  documentation TEXT,
  examples JSONB,
  
  -- Metadata
  dependencies JSONB,
  build_instructions JSONB,
  test_instructions JSONB,
  deployment_config JSONB,
  
  -- Provenance
  provenance_tier TEXT CHECK (provenance_tier IN ('bronze', 'silver', 'gold')) DEFAULT 'bronze',
  signature TEXT,
  sbom JSONB,
  security_scan JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- RLS
  CONSTRAINT capsules_user_access CHECK (auth.uid() = created_by)
);

-- Enable RLS
ALTER TABLE capsules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own capsules" ON capsules
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create capsules" ON capsules
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own capsules" ON capsules
  FOR UPDATE USING (auth.uid() = created_by);
```

#### **2. Capsule Service Implementation**

```typescript
// In packages/conductor/src/services/CapsuleService.ts
export class CapsuleService {
  async createFromMemory(memoryId: string): Promise<Capsule> {
    const memory = await memoryService.getNode(memoryId);
    
    const capsule = await supabase
      .from('capsules')
      .insert({
        name: `Capsule from ${memory.title}`,
        description: memory.content.substring(0, 200),
        origin_memory_id: memoryId,
        source_code: {},
        provenance_tier: 'bronze'
      })
      .select()
      .single();
    
    // Create memory edge
    await memoryService.createEdge({
      from: memoryId,
      to: capsule.id,
      type: 'derives_from'
    });
    
    // Emit conductor event
    await conductor.emit({
      type: 'capsule',
      action: 'created',
      payload: { capsuleId: capsule.id, originMemory: memoryId }
    });
    
    return capsule;
  }
  
  async generateFromAI(prompt: string, agentType: string): Promise<Capsule> {
    // Use AI to generate capsule spec
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a capsule generator. Create a detailed capsule specification based on the user prompt.'
        },
        { role: 'user', content: prompt }
      ]
    });
    
    const spec = JSON.parse(aiResponse.choices[0].message.content);
    
    const capsule = await this.create({
      ...spec,
      ai_generated: true,
      ai_provider: 'openai',
      ai_model: 'gpt-4'
    });
    
    return capsule;
  }
}
```

#### **3. Pathways Wizard Integration**

```tsx
// Enhanced PathwaysWizard for capsule creation
<PathwaysWizard 
  pathway={capsuleCreationPathway}
  currentStep={currentStep}
  onStepComplete={async (stepId, result) => {
    if (stepId === 'concept') {
      // Create capsule from concept
      const capsule = await capsuleService.create({
        name: result.name,
        description: result.description,
        category: result.category
      });
      
      setCurrentCapsule(capsule);
    }
    
    if (stepId === 'generate') {
      // AI-generate content
      const generated = await capsuleService.generateFromAI(
        result.prompt,
        'codegen'
      );
      
      await capsuleService.update(currentCapsule.id, {
        source_code: generated.source_code,
        examples: generated.examples
      });
    }
  }}
>
  <CapsulePreview capsule={currentCapsule} />
</PathwaysWizard>
```

### **Success Metric:** User creates note → clicks "Create Capsule" → AI generates capsule spec → user refines → signs → exports as verified artifact

---

## **🏪 COMMIT 34: MARKETPLACE FOUNDATION**

### **Goal:** Capsules can be published, discovered, and monetized

### **The Vision:**

```typescript
// Marketplace with provenance-based trust
interface MarketplaceListing {
  id: string;
  capsule_id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  
  // Provenance display
  provenance_tier: 'bronze' | 'silver' | 'gold';
  verification_badges: string[];
  security_score: number;
  
  // Monetization
  pricing_model: 'free' | 'one-time' | 'subscription';
  price: number;
  currency: string;
  
  // Analytics
  download_count: number;
  star_count: number;
  usage_analytics: any;
  
  // Publisher
  publisher_id: string;
  publisher_reputation: number;
  
  created_at: string;
  featured: boolean;
}
```

### **Implementation Tasks:**

#### **1. Marketplace Database Schema**

```sql
-- Create marketplace listings table
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID REFERENCES capsules(id) ON DELETE CASCADE,
  
  -- Display
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  
  -- Monetization
  pricing_model TEXT CHECK (pricing_model IN ('free', 'one-time', 'subscription')) DEFAULT 'free',
  price DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Analytics
  download_count INTEGER DEFAULT 0,
  star_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Publisher
  publisher_id UUID REFERENCES auth.users(id),
  publisher_reputation INTEGER DEFAULT 0,
  
  -- Status
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  approved BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- RLS
  CONSTRAINT listings_publisher_access CHECK (auth.uid() = publisher_id)
);

-- Enable RLS
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published listings" ON marketplace_listings
  FOR SELECT USING (status = 'published' AND approved = TRUE);

CREATE POLICY "Publishers can manage their listings" ON marketplace_listings
  FOR ALL USING (auth.uid() = publisher_id);
```

#### **2. Marketplace UI Components**

```tsx
// MarketplacePage.tsx
export const MarketplacePage: React.FC = () => {
  const [filter, setFilter] = useState<MarketplaceFilter>({
    category: 'all',
    tier: 'all',
    pricing: 'all'
  });
  
  const { data: listings } = useQuery({
    queryKey: ['marketplace', filter],
    queryFn: () => marketplaceService.search(filter)
  });
  
  return (
    <PageLayout title="Eco Marketplace">
      <MarketplaceFilters 
        filter={filter} 
        onChange={setFilter} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings?.map(listing => (
          <CapsuleCard 
            key={listing.id}
            listing={listing}
            showProvenanceBadge={true}
            showPricing={true}
            onDownload={() => handleDownload(listing)}
          />
        ))}
      </div>
    </PageLayout>
  );
};

// CapsuleCard.tsx with provenance display
export const CapsuleCard: React.FC<{ listing: MarketplaceListing }> = ({ listing }) => {
  return (
    <HaloCard variant="glass" className="capsule-card">
      <div className="flex items-start justify-between">
        <h3>{listing.title}</h3>
        <ProvenanceCrown tier={listing.capsule.provenance_tier} />
      </div>
      
      <p className="text-gray-400">{listing.description}</p>
      
      <div className="flex items-center gap-2 mt-4">
        <ProvenanceBadge tier={listing.capsule.provenance_tier} />
        <PricingBadge 
          model={listing.pricing_model} 
          price={listing.price} 
        />
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>⬇️ {listing.download_count}</span>
          <span>⭐ {listing.star_count}</span>
          <span>👁️ {listing.view_count}</span>
        </div>
        
        <DownloadButton 
          listing={listing}
          disabled={!hasAccess(listing)}
        />
      </div>
    </HaloCard>
  );
};
```

#### **3. Publishing Workflow**

```tsx
// Capsule publish flow
<PathwaysWizard pathway={publishPathway} onComplete={async (result) => {
  // 1. Verify capsule meets marketplace standards
  const verification = await capsuleService.verify(result.capsuleId);
  
  if (verification.tier === 'bronze') {
    toast.warning('Bronze tier capsules have limited marketplace visibility');
  }
  
  // 2. Create marketplace listing
  const listing = await marketplaceService.createListing({
    capsule_id: result.capsuleId,
    title: result.title,
    description: result.description,
    tags: result.tags,
    pricing_model: result.pricing.model,
    price: result.pricing.price
  });
  
  // 3. Submit for review (if not auto-approved)
  if (verification.tier !== 'gold') {
    await marketplaceService.submitForReview(listing.id);
    toast.info('Listing submitted for review');
  } else {
    await marketplaceService.publish(listing.id);
    toast.success('Gold tier capsule auto-published!');
  }
}}>
  <CapsuleVerificationStep />
  <ListingDetailsStep />
  <PricingStep />
  <ReviewStep />
</PathwaysWizard>
```

### **Success Metric:** User publishes gold-tier capsule → appears in marketplace instantly → another user discovers via tier filter → downloads with one click

---

## **⚡ COMMIT 35: REAL-TIME MARKETPLACE STREAMING**

### **Goal:** Marketplace activity streams live to all users

### **The Vision:**

```typescript
// Marketplace events in conductor
interface MarketplaceEvent extends AgentEvent {
  type: 'marketplace';
  action: 'published' | 'downloaded' | 'starred' | 'featured' | 'updated';
  payload: {
    listingId: string;
    capsuleId: string;
    publisherId: string;
    tier: 'bronze' | 'silver' | 'gold';
    category: string;
    downloadCount?: number;
    newRating?: number;
  };
}
```

### **Implementation Tasks:**

#### **1. Live Marketplace Feed**

```tsx
// Marketplace with live updates
export const LiveMarketplaceFeed: React.FC = () => {
  const { events } = useAgentStream({
    filter: { types: ['marketplace'] }
  });
  
  return (
    <div className="live-feed">
      <h3>Live Activity</h3>
      {events.slice(0, 10).map(event => (
        <div key={event.id} className="feed-item">
          {event.action === 'published' && (
            <span>
              🎉 New {event.payload.tier} capsule published: 
              <Link to={`/marketplace/${event.payload.listingId}`}>
                {event.payload.title}
              </Link>
            </span>
          )}
          
          {event.action === 'downloaded' && (
            <span>
              ⬇️ {event.payload.downloadCount} downloads for popular capsule
            </span>
          )}
          
          {event.action === 'featured' && (
            <span>
              ⭐ Featured: Gold tier capsule promoted to homepage
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
```

#### **2. Trending Algorithm**

```typescript
// Real-time trending calculation
class TrendingService {
  async calculateTrending(timeWindow: number = 3600000): Promise<MarketplaceListing[]> {
    const recentEvents = await conductor.getEvents({
      types: ['marketplace'],
      since: Date.now() - timeWindow
    });
    
    const scores = new Map<string, number>();
    
    recentEvents.forEach(event => {
      const weight = this.getEventWeight(event.action);
      const tierMultiplier = this.getTierMultiplier(event.payload.tier);
      const score = weight * tierMultiplier;
      
      scores.set(
        event.payload.listingId,
        (scores.get(event.payload.listingId) || 0) + score
      );
    });
    
    return this.getListingsByScore(scores);
  }
  
  private getEventWeight(action: string): number {
    switch (action) {
      case 'downloaded': return 10;
      case 'starred': return 5;
      case 'viewed': return 1;
      case 'published': return 3;
      default: return 0;
    }
  }
  
  private getTierMultiplier(tier: string): number {
    switch (tier) {
      case 'gold': return 3;
      case 'silver': return 2;
      case 'bronze': return 1;
      default: return 1;
    }
  }
}
```

### **Success Metric:** User publishes capsule → appears in "Recently Published" feed instantly → download count updates in real-time → trending algorithm promotes popular capsules

---

## **🌟 STRATEGIC IMPACT**

### **For Contributors:**
- **Creation to monetization pipeline** — Memory → Capsule → Marketplace in one flow
- **Provenance-driven trust** — Gold tier capsules command premium pricing
- **AI-assisted development** — Generate capsules from natural language prompts
- **Historical context** — Build on previous work, learn from patterns

### **For the Platform:**
- **Network effects** — More capsules = more valuable marketplace
- **Quality emergence** — Provenance tiers create natural quality hierarchy
- **Revenue streams** — Transaction fees, premium features, enterprise licensing
- **Community growth** — Marketplace attracts both creators and consumers

### **Technical Excellence:**
- **Memory-native capsules** — Every capsule traces back to originating thought
- **Real-time marketplace** — Live activity feeds and trending algorithms
- **Cryptographic trust** — Ed25519 signatures and SBOM verification
- **AI-enhanced creation** — Natural language to deployable artifacts

**The Capsule Ecosystem transforms individual thoughts into a thriving economy of reusable, verified, and monetizable artifacts.** 📦💫