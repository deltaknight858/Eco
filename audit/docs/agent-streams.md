# Real-Time Agent Streams (Commit 25)

Bring Eco to life with live, low-latency streams of agent activity driving UI animations, provenance updates, and capsule lifecycle progress.

---

## Overview

Eco streams agent events in real time (WebSockets or SSE) so contributors see:
- Provenance tier transitions (bronze → silver → gold)
- Capsule lifecycle progress (created → tested → signed → published)
- Orchestration and agent status changes

Neon‑glass icons glow with state, timelines animate on completion, and crowns appear dynamically for verified artifacts.

---

## Event Model

```ts
export type AgentEventType = 'status' | 'provenance' | 'capsule' | 'orchestration' | 'marketplace';

export interface AgentEvent<T = any> {
  id: string;
  type: AgentEventType;
  agent: string;
  capsuleId?: string;
  payload: T;
  timestamp: number; // epoch ms
  severity?: 'info' | 'warning' | 'error' | 'success';
  provenanceTier?: 'bronze' | 'silver' | 'gold';
}
```

Common payloads:

```ts
// Status
interface StatusPayload {
  state: 'idle' | 'active' | 'error' | 'maintenance';
  capabilities?: string[];
  load?: number; // 0..1
  lastActivity?: number;
}

// Provenance
interface ProvenancePayload {
  fromTier: 'bronze' | 'silver' | 'gold';
  toTier: 'bronze' | 'silver' | 'gold';
  confidence?: number; // 0..1
  criteria?: Record<string, unknown>;
}

// Capsule Lifecycle
interface CapsulePayload {
  lifecycle: 'created' | 'modified' | 'tested' | 'signed' | 'published';
  progress?: number; // 0..100
  artifacts?: Array<{ id: string; type: string; path?: string }>;
  pathwayId?: string;
  stepId?: string;
  currentStep?: string;
  hasErrors?: boolean;
}
```

---

## Transport Options

- WebSockets: bidirectional, lowest latency; preferred for app shells.
- Server‑Sent Events (SSE): uni‑directional, simpler to host; great for dashboards.

Fallback: Short‑poll (2–5s) with ETag/If‑None‑Match for degraded networks.

---

## Conductor Service: AgentStreamService

Responsibilities:
- Maintain client connections
- Normalize and broadcast events
- Buffer recent events for replay
- Apply filters per subscription (by agent/type/capsule)

Minimal API surface:

```ts
interface AgentStreamOptions {
  filter?: {
    agents?: string[];
    types?: AgentEventType[];
    capsuleIds?: string[];
    provenanceTiers?: Array<'bronze' | 'silver' | 'gold'>;
  };
  bufferSize?: number; // default 100
}

interface StreamConnection {
  onEvent(cb: (e: AgentEvent) => void): void;
  onStatusChange(cb: (status: { connected: boolean; quality: number }) => void): void;
  subscribe(filter: AgentStreamOptions['filter']): void;
  disconnect(): void;
}
```

---

## Frontend Hooks

### useAgentStream

```ts
const { events, isConnected, agentStatuses, connectionQuality, subscribeToAgent, subscribeToCapsule } =
  useAgentStream({ filter: { types: ['status', 'provenance', 'capsule'] } });
```

### usePathwayProgress

```ts
const { progress, currentStep, completeStep, updateStepProgress } = usePathwayProgress('capsule-lifecycle');
```

---

## UI Patterns

### Assist Panel
- Live connection indicator
- Agent grid with neon‑glass icons pulsing during activity
- Event feed (last N events) with provenance animations

### Pathways Wizard
- Stepper updates in real time from capsule events
- Tier badges animate on provenance transition
- Replay mode: play back buffered events for onboarding/education

### Neon‑Glass Icons
- Idle: subtle glow
- Active: bright pulse with increased glow intensity
- Error: red flicker overlay
- Verified: gold crown burst animation

---

## Provenance Update Logic

Rules of thumb:
- Only increase tiers in real time (bronze → silver → gold); demotions require explicit user action.
- Animate transitions with 400–800ms ease‑in‑out, delay 150ms after verification event.
- Keep crown animations lightweight (SVG morph or scale/opacity).

---

## Security & Privacy

- Authenticate stream requests (JWT, cookie, or header token)
- Authorize per capsule/team (RBAC)
- Rate limit event emission per agent
- Avoid PII in payloads; use IDs and fetch details lazily

---

## Performance Tips

- Throttle UI re‑renders (batch events every 50–100ms)
- Use requestAnimationFrame for animated state changes
- Keep buffers bounded (100–500 events per view)
- Prefer CSS transforms over layout‑changing properties

---

## Quick Start (Pseudo‑Code)

```ts
// 1) Connect
const conn = await agentStream.initializeStream(clientId, { filter: { types: ['status','provenance','capsule'] } });

// 2) Subscribe handlers
conn.onEvent(e => enqueueUIUpdate(e));
conn.onStatusChange(s => setConnectionState(s));

// 3) Filter dynamically
conn.subscribe({ capsuleIds: ['capsule-123'] });

// 4) Cleanup
return () => conn.disconnect();
```

---

## Testing & Storybook

- Use mock emitters to simulate streams (interval + deterministic scenarios)
- Provide stories for:
  1) Capsule creation stream
  2) Provenance verification stream
  3) Marketplace publishing stream

See `stories/AgentStreams.stories.tsx` for a reference demo stub.
