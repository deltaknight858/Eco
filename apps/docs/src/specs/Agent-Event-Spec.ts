// Agent Event Spec (aligns with Real-Time Agent Streams Commit 25)
// Status: v0.1

export type AgentEventType = 'status' | 'provenance' | 'capsule' | 'orchestration' | 'marketplace';

export interface AgentEvent<T = Record<string, unknown>> {
  id: string;
  type: AgentEventType;
  agent: string;
  capsuleId?: string;
  payload: T;
  timestamp: number; // epoch ms
  severity?: 'info' | 'warning' | 'error' | 'success';
  provenanceTier?: 'bronze' | 'silver' | 'gold';
}

export interface StatusPayload {
  state: 'idle' | 'active' | 'error' | 'maintenance';
  capabilities?: string[];
  load?: number; // 0..1
  lastActivity?: number;
}

export interface ProvenancePayload {
  fromTier: 'bronze' | 'silver' | 'gold';
  toTier: 'bronze' | 'silver' | 'gold';
  confidence?: number; // 0..1
  criteria?: Record<string, unknown>;
}

export interface CapsulePayload {
  lifecycle: 'created' | 'modified' | 'tested' | 'signed' | 'published';
  progress?: number; // 0..100
  artifacts?: Array<{ id: string; type: string; path?: string }>;
  pathwayId?: string;
  stepId?: string;
  currentStep?: string;
  hasErrors?: boolean;
}

export interface OrchestrationPayload {
  gate: 'bronze' | 'silver' | 'gold';
  status: 'pass' | 'fail' | 'warn';
  checks: Array<{ name: string; result: 'pass' | 'fail' | 'warn'; evidence?: string }>;
}
