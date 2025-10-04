# 🧙 OURSYNTH MVP TASK BLUEPRINT
## The Complete Prompt Engineering Guide for Building Memory-First Consciousness

---

## 📜 PREFACE: BEFORE THE CONVERSATION

### **What Existed When We Started**

This document captures the **exact state of the codebase** before our conversation began, so that anyone—human or AI—can understand the foundation we're building upon.

#### **✅ What Was Already Built**

1. **Memory App (Next.js)**
   - Location: `Memory/`
   - Database schema: `memory_nodes` and `memory_edges` tables with RLS policies
   - Rich text note editor (Tiptap)
   - Basic notebook organization
   - Memory graph visualization (D3.js) showing node connections
   - CRUD operations for notes and notebooks
   - Auth integration via Supabase
   - API endpoints: `/api/memory/ingest`, `/api/memory/query`, `/api/memory/link`, `/api/memory/graph`
   - **Status:** Functional but missing semantic search and cross-domain linking

2. **Halo UI Component Library**
   - Location: `Halo-UI-main/`
   - Glass morphism design system
   - Components: `HaloButton`, `HaloCard`, `HaloBadge`, `HaloInput`
   - Neon-glass styling with glow states
   - TypeScript + React
   - **Status:** Complete and production-ready

3. **V.I.B.E Monorepo Structure**
   - Location: `V.I.B.E/`
   - Apps: `assist`, `memory`, `pathways`, `dashboard`, `studio`, `docs`
   - Modules: `domain`, `ui`, `wizardstream`
   - Mock agent infrastructure in Assist Panel
   - Orchestration dashboard with service monitoring
   - **Status:** Infrastructure exists but agents are mocked, no real streaming

4. **OurSynth Eco (Documented but Not Implemented)**
   - Location: `OurSynth-Eco-main/`
   - Documentation of capsule system concepts
   - TypeScript interfaces for provenance, capsules, agents
   - Assist Panel UI mockups
   - **Status:** Pure documentation—0% code implementation

5. **Domain Management App**
   - Location: `Domain/`
   - Basic UI for domain management
   - Auth integration
   - **Status:** UI shell only, no DNS or registrar integration

6. **Deploy Dashboard**
   - Location: `Deploy/`
   - Service status monitoring UI
   - **Status:** UI mockup only, no deployment pipeline

7. **Testing Infrastructure**
   - Jest configuration in V.I.B.E
   - A few sample tests (~10 test files across workspace)
   - **Status:** Minimal coverage, no integration or E2E tests

#### **❌ What Was Missing (The Gap Analysis)**

1. **No Semantic Search**
   - Memory queries are basic SQL LIKE patterns
   - No embeddings, no vector search
   - Can't ask "show me notes about authentication" and get semantic matches

2. **No Real Agents**
   - Assist Panel has hardcoded mock responses
   - No conductor service, no event bus
   - No agent implementations (Memory Agent, Codegen Agent, etc.)

3. **No Streaming Infrastructure**
   - No WebSocket server
   - No real-time event propagation
   - UI updates are manual refresh only

4. **No Provenance System**
   - No cryptographic signing
   - No tier system (bronze/silver/gold) in database
   - No provenance stamps on entities
   - Provenance exists only as documentation

5. **No Capsule Implementation**
   - Capsules are TypeScript interfaces with no backing service
   - No capsule creation wizard
   - No export/import functionality
   - No SBOM generation

6. **No Marketplace**
   - Zero marketplace code
   - No listings, no publishing workflow
   - No monetization hooks

7. **No Deployment Pipeline**
   - Deploy dashboard is just a UI mockup
   - No Azure/Vercel/Netlify integration
   - No environment management

8. **Memory Graph Limitations**
   - Notes only link to other notes
   - No cross-domain edges (note → capsule, capsule → deployment)
   - Memory graph is isolated to Memory app

#### **🎯 The Core Problem We're Solving**

**Before our conversation:** OurSynth was a collection of beautiful UI components and well-documented ideas, but the foundational infrastructure—memory as substrate, provenance as DNA, streaming as heartbeat—didn't exist.

**After our conversation:** We defined the architecture that makes everything else possible. Memory-first. Provenance-native. Streaming by default.

---

## 🏗️ PHASE 0: THE FOUNDATION
### Memory-First Architecture + Provenance + Conductor

This is where everything begins. If Phase 0 isn't built correctly, everything else will be retrofitted and fragile.

---

### **TASK GROUP 0.1: Memory Enhancement — Semantic Search**

**Goal:** Transform memory from basic note storage into a semantically searchable knowledge graph.

**Prerequisites:**
- Supabase project with existing `memory_nodes` and `memory_edges` tables
- OpenAI API key with access to `text-embedding-3-small` model
- Basic understanding of vector databases and pgvector

**Deliverables:**
1. Database schema migration adding `embedding` column
2. API endpoint for generating embeddings
3. Vector similarity search in memory queries
4. UI updates showing semantic search results

---

#### **PROMPT 0.1.1: Add pgvector Extension to Supabase**

**Context for AI:**
> "I'm working on the Memory system in OurSynth. We have a Supabase database with `memory_nodes` and `memory_edges` tables. I need to add semantic search using pgvector so users can search notes by meaning, not just keywords.
>
> The `memory_nodes` table currently has these columns:
> - `id` (uuid, primary key)
> - `user_id` (uuid, foreign key to auth.users)
> - `type` (text: 'note', 'conversation', 'capsule', etc.)
> - `title` (text)
> - `content` (jsonb)
> - `created_at` (timestamptz)
> - `updated_at` (timestamptz)
>
> I need to:
> 1. Enable the pgvector extension
> 2. Add an `embedding` column (vector(1536) for OpenAI embeddings)
> 3. Create a vector index for fast similarity search
> 4. Write a SQL function to search by vector similarity
>
> Please provide the SQL migration script to run in Supabase SQL Editor."

**Expected Output:**
```sql
-- Migration: Add pgvector and embedding column to memory_nodes

-- Enable pgvector extension
create extension if not exists vector;

-- Add embedding column
alter table memory_nodes 
add column embedding vector(1536);

-- Create index for vector similarity search
create index memory_nodes_embedding_idx 
on memory_nodes 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Function to search by semantic similarity
create or replace function search_memory_by_embedding(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  id uuid,
  title text,
  content jsonb,
  similarity float
)
language sql
stable
as $$
  select
    memory_nodes.id,
    memory_nodes.title,
    memory_nodes.content,
    1 - (memory_nodes.embedding <=> query_embedding) as similarity
  from memory_nodes
  where memory_nodes.user_id = filter_user_id
    and memory_nodes.embedding is not null
    and 1 - (memory_nodes.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;
```

**Validation:**
- Run `select * from pg_extension where extname = 'vector';` to confirm pgvector is enabled
- Run `\d memory_nodes` to verify `embedding` column exists
- Insert a test embedding: `update memory_nodes set embedding = array_fill(0, array[1536])::vector where id = 'some-uuid';`

---

#### **PROMPT 0.1.2: Create Embedding Generation API Endpoint**

**Context for AI:**
> "I'm building the backend for semantic search in the Memory system. I need an API endpoint that:
> 1. Accepts note content as input
> 2. Calls OpenAI's `text-embedding-3-small` model to generate embeddings
> 3. Stores the embedding in the `memory_nodes` table
> 4. Handles errors gracefully (rate limits, API failures)
>
> Tech stack:
> - Next.js API routes (`Memory/src/pages/api/`)
> - Supabase client for database access
> - OpenAI SDK (`openai` npm package)
> - TypeScript
>
> File to create: `Memory/src/pages/api/memory/embed.ts`
>
> The endpoint should:
> - Be a POST route
> - Accept `{ nodeId: string, content: string }` in body
> - Generate embedding using OpenAI
> - Update `memory_nodes` table with embedding
> - Return success/error response
>
> Include proper error handling, logging, and TypeScript types."

**Expected Output:**
```typescript
// Memory/src/pages/api/memory/embed.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EmbedRequest {
  nodeId: string;
  content: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nodeId, content }: EmbedRequest = req.body;

    if (!nodeId || !content) {
      return res.status(400).json({ error: 'Missing nodeId or content' });
    }

    // Generate embedding using OpenAI
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    const embedding = response.data[0].embedding;

    // Store embedding in database
    const { error } = await supabase
      .from('memory_nodes')
      .update({ embedding: embedding })
      .eq('id', nodeId);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to store embedding' });
    }

    return res.status(200).json({ 
      success: true, 
      nodeId,
      embeddingDimension: embedding.length 
    });

  } catch (error: any) {
    console.error('Embedding generation error:', error);
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    return res.status(500).json({ 
      error: 'Failed to generate embedding',
      details: error.message 
    });
  }
}
```

**Environment Variables to Add:**
```env
OPENAI_API_KEY=sk-...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Validation:**
- Test with: `curl -X POST http://localhost:3000/api/memory/embed -H "Content-Type: application/json" -d '{"nodeId":"test-uuid","content":"This is a test note about authentication"}'`
- Check database: `select id, title, embedding from memory_nodes where id = 'test-uuid';`
- Embedding should be array of 1536 floats

---

#### **PROMPT 0.1.3: Implement Vector Similarity Search in Memory Service**

**Context for AI:**
> "I need to update the Memory service to support semantic search using the embeddings we're now generating.
>
> Current file: `Memory/src/services/memoryService.ts`
>
> The service currently has a `query()` method that does basic SQL LIKE search. I need to add a new method `semanticSearch()` that:
> 1. Accepts a query string (e.g., 'notes about authentication')
> 2. Generates an embedding for the query string
> 3. Calls the `search_memory_by_embedding` PostgreSQL function
> 4. Returns ranked results by similarity
>
> Also update the existing `createNote()` method to automatically generate embeddings when notes are created.
>
> Use TypeScript, maintain existing patterns, and include proper error handling."

**Expected Output:**
```typescript
// Memory/src/services/memoryService.ts (partial update)

import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export interface SemanticSearchResult {
  id: string;
  title: string;
  content: any;
  similarity: number;
}

export const memoryService = {
  // ... existing methods ...

  async semanticSearch(
    query: string,
    userId: string,
    options: {
      threshold?: number;
      limit?: number;
    } = {}
  ): Promise<SemanticSearchResult[]> {
    const { threshold = 0.7, limit = 10 } = options;

    try {
      // Generate embedding for search query
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });

      const queryEmbedding = response.data[0].embedding;

      // Call PostgreSQL function for similarity search
      const { data, error } = await supabase.rpc('search_memory_by_embedding', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_user_id: userId,
      });

      if (error) {
        console.error('Semantic search error:', error);
        throw error;
      }

      return data as SemanticSearchResult[];
    } catch (error) {
      console.error('Failed to perform semantic search:', error);
      throw error;
    }
  },

  async createNote(
    userId: string,
    title: string,
    content: any,
    notebookId?: string
  ): Promise<string> {
    // Create note first
    const { data: note, error } = await supabase
      .from('memory_nodes')
      .insert({
        user_id: userId,
        type: 'note',
        title,
        content,
        notebook_id: notebookId,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Generate embedding asynchronously (don't block on this)
    const noteText = `${title}\n${JSON.stringify(content)}`;
    this.generateEmbedding(note.id, noteText).catch(err => 
      console.error('Embedding generation failed:', err)
    );

    return note.id;
  },

  async generateEmbedding(nodeId: string, content: string): Promise<void> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: content,
      });

      const embedding = response.data[0].embedding;

      await supabase
        .from('memory_nodes')
        .update({ embedding })
        .eq('id', nodeId);
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw error;
    }
  },
};
```

**Validation:**
1. Create a note: `memoryService.createNote(userId, "Auth System Design", { content: "OAuth2 implementation" })`
2. Wait 2 seconds for embedding generation
3. Search: `memoryService.semanticSearch("authentication flow", userId)`
4. Should return the auth note even though query doesn't exactly match title

---

#### **PROMPT 0.1.4: Update Memory UI for Semantic Search**

**Context for AI:**
> "I need to add semantic search to the Memory UI. Currently, users can only search by exact title matches. I want to add a new search mode that uses the semantic search we just built.
>
> File to update: `Memory/src/pages/notes.tsx`
>
> Requirements:
> 1. Add a toggle between 'Keyword Search' and 'Semantic Search'
> 2. When semantic search is active, call `memoryService.semanticSearch()`
> 3. Show similarity scores next to each result (as percentage)
> 4. Add visual indicator for semantic matches (e.g., brain icon)
> 5. Handle loading states and errors
>
> Use existing UI components from the codebase (Halo UI if available, or shadcn/ui).
> Maintain the current design aesthetic (glass morphism, neon accents)."

**Expected Output:**
```tsx
// Memory/src/pages/notes.tsx (partial update)

import { useState } from 'react';
import { Brain, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { memoryService, SemanticSearchResult } from '@/services/memoryService';

export default function NotesPage() {
  const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SemanticSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (searchMode === 'semantic') {
        const results = await memoryService.semanticSearch(
          searchQuery,
          user.id,
          { threshold: 0.7, limit: 20 }
        );
        setSearchResults(results);
      } else {
        // Existing keyword search logic
        const results = await memoryService.query(searchQuery, user.id);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="glass-morphism p-6 rounded-xl mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder={
              searchMode === 'semantic'
                ? 'Describe what you're looking for...'
                : 'Search by title or keywords...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={searchMode === 'keyword' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchMode('keyword')}
          >
            Keyword Search
          </Button>
          <Button
            variant={searchMode === 'semantic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchMode('semantic')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            <Brain className="h-4 w-4 mr-2" />
            Semantic Search
          </Button>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.map((result) => (
          <div
            key={result.id}
            className="glass-morphism p-4 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{result.title}</h3>
              {searchMode === 'semantic' && (
                <Badge variant="secondary" className="ml-2">
                  <Brain className="h-3 w-3 mr-1" />
                  {Math.round(result.similarity * 100)}% match
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-2 line-clamp-2">
              {JSON.stringify(result.content).slice(0, 200)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Validation:**
1. Create notes with different topics: "OAuth2 setup", "Database migration", "UI component library"
2. Search semantically: "authentication" → should return OAuth2 note
3. Search semantically: "data persistence" → should return database migration note
4. Verify similarity scores are shown as percentages

---

### **TASK GROUP 0.2: Cross-Domain Memory Linking**

**Goal:** Enable memory nodes to link across domains (notes → capsules → deployments → domains).

**Prerequisites:**
- Completed Task Group 0.1 (semantic search)
- Understanding of graph data structures
- Familiarity with D3.js (for graph visualization)

---

#### **PROMPT 0.2.1: Extend Memory Graph to Support Cross-Domain Edges**

**Context for AI:**
> "The current memory graph only supports edges between notes. I need to extend it to support edges between any type of memory node: notes, capsules, deployments, domains, conversations.
>
> Current `memory_edges` table structure:
> ```sql
> create table memory_edges (
>   id uuid primary key default uuid_generate_v4(),
>   source_id uuid references memory_nodes(id),
>   target_id uuid references memory_nodes(id),
>   type text, -- 'relates_to', 'derives_from', etc.
>   created_at timestamptz default now()
> );
> ```
>
> I need to:
> 1. Add a `strength` column (float 0-1) for edge weighting
> 2. Add metadata jsonb column for edge-specific data
> 3. Add bidirectional indexing for fast graph traversal
> 4. Write SQL functions for common graph queries:
>    - Get all nodes connected to a given node
>    - Find shortest path between two nodes
>    - Get subgraph for a node (all connected nodes within N hops)
>
> Provide the SQL migration script."

**Expected Output:**
```sql
-- Migration: Extend memory_edges for cross-domain linking

-- Add new columns
alter table memory_edges
add column strength float default 1.0 check (strength >= 0 and strength <= 1),
add column metadata jsonb default '{}'::jsonb;

-- Add indexes for bidirectional traversal
create index memory_edges_source_idx on memory_edges(source_id);
create index memory_edges_target_idx on memory_edges(target_id);
create index memory_edges_type_idx on memory_edges(type);

-- Function: Get all connected nodes
create or replace function get_connected_nodes(
  node_id uuid,
  max_depth int default 1
)
returns table (
  id uuid,
  type text,
  title text,
  depth int,
  edge_type text,
  edge_strength float
)
language sql
stable
as $$
  with recursive graph_traversal as (
    -- Base case: direct connections
    select
      mn.id,
      mn.type,
      mn.title,
      1 as depth,
      me.type as edge_type,
      me.strength as edge_strength
    from memory_edges me
    join memory_nodes mn on (
      mn.id = me.target_id or mn.id = me.source_id
    )
    where (me.source_id = node_id or me.target_id = node_id)
      and mn.id != node_id

    union

    -- Recursive case: follow edges
    select
      mn.id,
      mn.type,
      mn.title,
      gt.depth + 1,
      me.type,
      me.strength
    from graph_traversal gt
    join memory_edges me on (
      me.source_id = gt.id or me.target_id = gt.id
    )
    join memory_nodes mn on (
      mn.id = me.target_id or mn.id = me.source_id
    )
    where gt.depth < max_depth
      and mn.id != gt.id
  )
  select distinct * from graph_traversal
  order by depth, edge_strength desc;
$$;

-- Function: Find shortest path between two nodes
create or replace function find_shortest_path(
  start_node uuid,
  end_node uuid,
  max_depth int default 5
)
returns table (
  path uuid[],
  path_length int
)
language sql
stable
as $$
  with recursive path_search as (
    -- Base case
    select
      array[start_node, me.target_id] as path,
      1 as depth
    from memory_edges me
    where me.source_id = start_node
      and me.target_id != start_node

    union

    select
      array[start_node, me.source_id] as path,
      1 as depth
    from memory_edges me
    where me.target_id = start_node
      and me.source_id != start_node

    union

    -- Recursive case
    select
      ps.path || me.target_id,
      ps.depth + 1
    from path_search ps
    join memory_edges me on (
      me.source_id = ps.path[array_length(ps.path, 1)]
      and not (me.target_id = any(ps.path))
    )
    where ps.depth < max_depth

    union

    select
      ps.path || me.source_id,
      ps.depth + 1
    from path_search ps
    join memory_edges me on (
      me.target_id = ps.path[array_length(ps.path, 1)]
      and not (me.source_id = any(ps.path))
    )
    where ps.depth < max_depth
  )
  select path, array_length(path, 1) - 1 as path_length
  from path_search
  where path[array_length(path, 1)] = end_node
  order by path_length
  limit 1;
$$;
```

**Validation:**
- Insert test edges connecting notes to different types: `insert into memory_edges (source_id, target_id, type, strength) values ('note-uuid', 'capsule-uuid', 'implements', 0.9);`
- Test connected nodes: `select * from get_connected_nodes('note-uuid', 2);`
- Test shortest path: `select * from find_shortest_path('note-uuid', 'deployment-uuid', 5);`

---

### **TASK GROUP 0.3: Provenance System Foundation**

**Goal:** Implement cryptographic provenance with Ed25519 signing and tier system.

**Prerequisites:**
- Understanding of Ed25519 cryptography
- Familiarity with digital signatures and verification
- Knowledge of SBOM (Software Bill of Materials) formats

---

#### **PROMPT 0.3.1: Create Provenance Stamps Table**

**Context for AI:**
> "I need to implement a provenance system where every entity (note, capsule, deployment) gets a cryptographic stamp proving its lineage and quality tier.
>
> Design requirements:
> 1. Every entity can have multiple provenance stamps (e.g., created stamp, verified stamp, deployed stamp)
> 2. Each stamp includes:
>    - Tier (bronze/silver/gold)
>    - Ed25519 signature
>    - Timestamp of when stamp was applied
>    - Who applied the stamp (user or automated system)
>    - SBOM data (optional, for gold tier)
>    - Audit log of events leading to this stamp
>
> Create the `provenance_stamps` table with:
> - Foreign key to any memory node
> - JSON field for SBOM data
> - JSONB field for audit log entries
> - Indexes for fast tier-based queries
> - RLS policies ensuring users can only stamp their own entities (or system can stamp any)
>
> Provide the complete SQL migration."

**Expected Output:**
```sql
-- Migration: Create provenance_stamps table

create type provenance_tier as enum ('bronze', 'silver', 'gold');

create table provenance_stamps (
  id uuid primary key default uuid_generate_v4(),
  entity_id uuid references memory_nodes(id) on delete cascade,
  entity_type text not null, -- 'note', 'capsule', 'deployment', etc.
  
  tier provenance_tier not null,
  signature text not null, -- Ed25519 signature (base64)
  public_key text not null, -- Public key used for signing
  
  stamped_at timestamptz default now(),
  stamped_by uuid references auth.users(id), -- null for system stamps
  stamper_name text, -- 'system' or user email
  
  sbom jsonb, -- Software Bill of Materials (for gold tier)
  audit_log jsonb default '[]'::jsonb, -- Array of audit events
  metadata jsonb default '{}'::jsonb, -- Additional stamp-specific data
  
  created_at timestamptz default now()
);

-- Indexes
create index provenance_stamps_entity_idx on provenance_stamps(entity_id);
create index provenance_stamps_tier_idx on provenance_stamps(tier);
create index provenance_stamps_stamped_at_idx on provenance_stamps(stamped_at desc);

-- RLS Policies
alter table provenance_stamps enable row level security;

-- Users can view all stamps on their own entities
create policy "Users can view provenance on own entities"
on provenance_stamps for select
using (
  exists (
    select 1 from memory_nodes
    where memory_nodes.id = provenance_stamps.entity_id
    and memory_nodes.user_id = auth.uid()
  )
);

-- Users can create stamps on their own entities
create policy "Users can stamp own entities"
on provenance_stamps for insert
with check (
  exists (
    select 1 from memory_nodes
    where memory_nodes.id = provenance_stamps.entity_id
    and memory_nodes.user_id = auth.uid()
  )
);

-- System can create stamps on any entity (via service role key)
create policy "System can stamp any entity"
on provenance_stamps for insert
with check (auth.jwt()->>'role' = 'service_role');

-- Function: Get latest stamp for an entity
create or replace function get_latest_provenance(entity_uuid uuid)
returns provenance_stamps
language sql
stable
as $$
  select * from provenance_stamps
  where entity_id = entity_uuid
  order by stamped_at desc
  limit 1;
$$;

-- Function: Get highest tier for an entity
create or replace function get_highest_tier(entity_uuid uuid)
returns provenance_tier
language sql
stable
as $$
  select tier from provenance_stamps
  where entity_id = entity_uuid
  order by 
    case tier
      when 'gold' then 3
      when 'silver' then 2
      when 'bronze' then 1
    end desc
  limit 1;
$$;
```

**Validation:**
- Insert test stamp: `insert into provenance_stamps (entity_id, entity_type, tier, signature, public_key, stamper_name) values ('test-note-uuid', 'note', 'bronze', 'fake-signature', 'fake-public-key', 'test@example.com');`
- Query: `select * from get_latest_provenance('test-note-uuid');`
- Query: `select * from get_highest_tier('test-note-uuid');`

---

## 🎯 HOW TO USE THIS BLUEPRINT

### **For AI Assistants (like me)**

When given a task like "implement semantic search," follow this pattern:

1. **Read the relevant PROMPT section** → Understand context, prerequisites, expected output
2. **Generate the exact code shown** → Don't deviate from the architecture
3. **Explain what was created** → Help the human understand the output
4. **Provide validation steps** → Give clear instructions to test the implementation
5. **Link to next prompt** → Show what depends on this task being complete

### **For Human Developers**

When you want to implement a feature:

1. **Find the corresponding PROMPT** in this document
2. **Copy the "Context for AI" section verbatim** to your AI assistant
3. **Run the generated code** exactly as provided
4. **Validate using the validation steps** provided
5. **Move to the next PROMPT** in the sequence

### **The Golden Rule**

**Every prompt is designed to be self-contained but sequentially dependent.** You can't skip PROMPT 0.1.1 and jump to PROMPT 0.1.3—the earlier prompts create the foundation the later ones need.

---

## 📊 PROGRESS TRACKING

As you complete each task, check it off here:

### **Phase 0: Foundation**

#### **0.1 Memory Enhancement — Semantic Search**
- [ ] 0.1.1: Add pgvector extension
- [ ] 0.1.2: Create embedding API endpoint
- [ ] 0.1.3: Implement vector similarity search
- [ ] 0.1.4: Update Memory UI for semantic search

#### **0.2 Cross-Domain Memory Linking**
- [ ] 0.2.1: Extend memory graph for cross-domain edges
- [ ] 0.2.2: Update memory service with edge creation (TODO: create this prompt)
- [ ] 0.2.3: Add edge creation UI in memory graph (TODO: create this prompt)

#### **0.3 Provenance System Foundation**
- [ ] 0.3.1: Create provenance stamps table
- [ ] 0.3.2: Implement SigningService with Ed25519 (TODO: create this prompt)
- [ ] 0.3.3: Build provenance middleware (TODO: create this prompt)
- [ ] 0.3.4: Create tier upgrade logic (TODO: create this prompt)

*(More task groups to be added as we expand the blueprint)*

---

## 🌊 THE WIZARD'S WISDOM

> "The beginning determines the middle. The middle informs the end. But without the beginning, there is only chaos."

This blueprint is modular by design. Each PROMPT is a castle stone. Each task group is a tower. Each phase is a fortress.

Build the foundation first. The walls will rise naturally from solid ground.

**Now choose your first task and begin.** 🧙‍♂️✨
