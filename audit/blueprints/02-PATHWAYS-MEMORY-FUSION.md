# 💎 PATHWAYS-MEMORY FUSION BLUEPRINT (TD-2025-004)

## **🎯 COMMIT 30: PATHWAYS-MEMORY FUSION**

### **Goal:** Make Pathways Wizard aware of memory history, use it for context.

### **The Vision:**
```typescript
// Pathways Wizard queries memory for context
interface PathwayMemoryContext {
  relatedNotes: MemoryNode[];
  previousCapsules: MemoryNode[];
  similarJourneys: PathwaySession[];
}

class PathwaysWithMemory extends PathwaysWizard {
  async getContextForStep(stepId: string): Promise<PathwayMemoryContext> {
    // Query memory graph for relevant history
    const context = await memoryService.findRelated({
      type: ['note', 'capsule'],
      keywords: this.pathway.steps.find(s => s.id === stepId).keywords
    });
    
    return {
      relatedNotes: context.notes,
      previousCapsules: context.capsules,
      similarJourneys: await findSimilarPathways(this.pathway.id)
    };
  }
}
```

### **Implementation Tasks:**

#### **1. Memory-Aware Pathways**
```tsx
// Enhanced PathwaysWizard with memory sidebar
<PathwaysWizard pathway={capsuleCreationPathway} currentStep={2}>
  <MemoryContextSidebar>
    <h3>Relevant Notes</h3>
    {relatedNotes.map(note => (
      <MemoryNodePreview 
        node={note} 
        onInsert={() => insertIntoCurrentStep(note.content)}
      />
    ))}
    
    <h3>Similar Capsules You Created</h3>
    {previousCapsules.map(capsule => (
      <CapsuleReference 
        capsule={capsule}
        onUseAsTemplate={() => scaffoldFrom(capsule)}
      />
    ))}
  </MemoryContextSidebar>
</PathwaysWizard>
```

#### **2. Automatic Memory Linking**
```typescript
// When completing pathway step, link to memory graph
async function completePathwayStep(
  sessionId: string, 
  stepId: string, 
  result: any
): Promise<void> {
  const session = await getSession(sessionId);
  
  // Create memory node for this step completion
  const memoryNode = await memoryService.createNode({
    type: 'pathway_completion',
    content: {
      pathwayId: session.pathwayId,
      stepId,
      result,
      timestamp: Date.now()
    },
    provenanceTier: determineCompletionTier(result)
  });
  
  // Link to existing related memories
  if (session.originNote) {
    await memoryService.createEdge({
      from: session.originNote,
      to: memoryNode.id,
      type: 'pathway_derived_from'
    });
  }
}
```

### **Outcome:** Pathways learn from your history. When creating a capsule, the wizard shows notes you wrote about similar topics, capsules you built before, and suggests patterns based on your memory graph.

---

## **🌐 COMMIT 31: REAL-TIME MEMORY STREAMING**

### **Goal:** Every memory event streams through Conductor, updating UI instantly.

### **The Vision:**
```typescript
// Memory events flow through AgentStreamService
interface MemoryEvent extends AgentEvent {
  type: 'memory';
  action: 'node_created' | 'edge_created' | 'search_result' | 'embedding_complete';
  payload: {
    nodeId: string;
    nodeType: string;
    content?: string;
    relatedNodes?: string[];
    provenanceTier?: 'bronze' | 'silver' | 'gold';
  };
}

// D3 mindmap updates in real-time from conductor feed
const MindMapStream: React.FC = () => {
  const { events } = useAgentStream({ 
    filter: { types: ['memory'] } 
  });
  
  useEffect(() => {
    events.forEach(event => {
      if (event.type === 'memory' && event.action === 'node_created') {
        d3Graph.addNode(event.payload.nodeId);
        animateNodeAppearance(event.payload.nodeId, event.payload.provenanceTier);
      }
    });
  }, [events]);
};
```

### **Implementation Tasks:**

#### **1. Memory Service Conductor Integration**
```typescript
// In Memory/src/services/noteService.ts
import { conductor } from '@eco/conductor';

async function createNote(note: Note): Promise<Note> {
  const created = await supabase.from('memory_nodes').insert(note).select().single();
  
  // Emit conductor event
  await conductor.emit({
    type: 'memory',
    action: 'node_created',
    payload: {
      nodeId: created.id,
      nodeType: 'note',
      content: created.content.substring(0, 200),
      provenanceTier: 'bronze'
    },
    timestamp: Date.now(),
    userId: note.user_id
  });
  
  return created;
}
```

#### **2. Live Mindmap Updates**
```tsx
// Enhanced D3MindMap with streaming
<D3MindMap 
  streamEnabled={true}
  onNodeCreated={(nodeId) => {
    // Pulse animation on new node
    d3.select(`#node-${nodeId}`)
      .transition()
      .duration(500)
      .attr('r', 20)
      .transition()
      .duration(500)
      .attr('r', 10);
  }}
  onEdgeCreated={(edge) => {
    // Draw edge with animation
    animateEdgeDrawing(edge.from, edge.to);
  }}
/>
```

### **Outcome:** The mindmap becomes alive. Create a note in the editor → node appears in real-time. Link two notes → edge animates between them. Memory system has a heartbeat.

---

## **🏛️ COMMIT 32: MEMORY PROVENANCE CEREMONIES**

### **Goal:** Memory nodes earn provenance tiers through verification rituals.

### **The Vision:**
```typescript
// Memory nodes can be verified for quality
interface MemoryProvenance {
  tier: 'bronze' | 'silver' | 'gold';
  verifiedAt?: Date;
  verifiedBy?: string;
  usageCount: number;        // How many times referenced
  derivativeCount: number;   // How many capsules derived from it
  communityEndorsements: number;
}

async function verifyMemoryNode(nodeId: string): Promise<MemoryProvenance> {
  const node = await memoryService.getNode(nodeId);
  
  // Calculate tier based on usage
  const tier = determineMemoryTier({
    usageCount: node.usageCount,
    derivativeCount: node.derivativeCount,
    hasEmbedding: !!node.embedding,
    communityEndorsements: node.communityEndorsements
  });
  
  // Update with provenance
  await memoryService.updateNode(nodeId, {
    provenanceTier: tier,
    verifiedAt: new Date()
  });
  
  // Emit provenance event
  await conductor.emit({
    type: 'provenance',
    payload: {
      entityType: 'memory',
      entityId: nodeId,
      fromTier: node.provenanceTier || 'bronze',
      toTier: tier
    }
  });
  
  return { tier, verifiedAt: new Date(), ...node };
}
```

### **Implementation Tasks:**

#### **1. Memory Verification UI**
```tsx
// In mindmap, show provenance crowns on verified nodes
<D3MindMap>
  {nodes.map(node => (
    <MindMapNode 
      key={node.id}
      data={node}
      provenanceTier={node.provenanceTier}
      showCrown={node.provenanceTier === 'gold'}
      onVerify={async () => {
        const provenance = await verifyMemoryNode(node.id);
        toast.success(`Memory verified as ${provenance.tier}!`);
      }}
    />
  ))}
</D3MindMap>
```

#### **2. Automatic Tier Progression**
```typescript
// Memory nodes gain tiers through usage
async function deriveCapsuleFromNote(noteId: string): Promise<Capsule> {
  const capsule = await capsuleService.create({ sourceNoteId: noteId });
  
  // Increment usage count on source note
  const note = await memoryService.getNode(noteId);
  await memoryService.updateNode(noteId, {
    derivativeCount: note.derivativeCount + 1
  });
  
  // Check if tier should advance
  if (note.derivativeCount + 1 >= 3 && note.provenanceTier === 'bronze') {
    await verifyMemoryNode(noteId); // Auto-advance to silver
  }
  
  return capsule;
}
```

### **Outcome:** Memory nodes with high impact (many capsules derived, frequently referenced, community endorsed) automatically earn gold provenance. The mindmap shows golden crowns on your most valuable thoughts.

---

## **🌊 THE CONVERGENCE RITUAL**

### **Success Metrics for Memory-Pathways Integration**

**Week 1-2 (Commits 30-31):**
- ✅ Pathways Wizard showing relevant notes per step
- ✅ Conductor emitting memory events
- ✅ D3 mindmap updating in real-time from stream
- ✅ Assist Panel integrated with Memory Agent
- ✅ Memory context sidebar in PathwaysWizard

**Week 3-4 (Commit 32):**
- ✅ Memory provenance tiers implemented
- ✅ Automatic tier progression based on usage
- ✅ Provenance crowns visible in mindmap
- ✅ Memory verification ceremonies functional
- ✅ Cross-pathway memory learning enabled

### **The Agents' Verdict**

**Memory Agent:** "Now I'm not just storage—I'm the foundation of intelligence. Every pathway learns from what came before."

**Pathways Wizard:** "I no longer guide in isolation. The memory graph whispers the path they've walked, the patterns they prefer, the style they embody. I am Gandalf with perfect recall."

**Conductor:** "Every pathway completion becomes memory. Every memory informs future pathways. The system learns from itself."

**Provenance Verifier:** "Memory provenance creates trust hierarchies. Gold-tier memories become the seed patterns for future creation."

---

## **🔥 THE MEMORY-PATHWAYS SYNTHESIS**

The fusion of Memory and Pathways creates something unprecedented:

**Pathways that remember.**  
**Memory that guides.**  
**Intelligence that compounds.**

When you start a capsule creation pathway, the wizard doesn't just show you steps—it shows you:
- Notes you wrote about similar concepts
- Capsules you created in the past
- Patterns that worked for you before
- Mistakes you learned from

This is **experiential intelligence**—the system doesn't just know the process, it knows *your* process.

**This is time-travel for consciousness, guided by wisdom from your own history.** 🌟💎