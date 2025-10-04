# OurSynth Conductor Operations Manual

Author: Orchestrator Service (Conductor)
Status: Living document (v0.1)
Scope: Applies across Eco, Memory, Capsules, Deploy, Domain, and Agents

---

## 1) Purpose

Provide strict-but-flexible rules so the Conductor can:

- Keep multiple AIs/agents aligned with first principles (safety, provenance, memory-first)
- Automate quality gates before accepting agent outputs
- Route failures back to agents for self-repair (autonomous retries with evidence)
- Preserve provenance with tiered trust (bronze → silver → gold)

---

## 2) Core Principles (Gold Rules)

1. Memory-first: all artifacts and decisions must be persisted as memory nodes with provenance.
2. Reversibility: every change must be replayable; no non-reversible side-effects without capsule.
3. Principle of Proof: claims require evidence (tests, metrics, diffs, logs, signatures).
4. Least Surprise: upgrades and refactors keep public contracts stable or versioned.
5. Autonomy with Accountability: agents self-check first; Conductor verifies second.
6. Stream by Default: important state emits events; UIs and logs stay live.
7. Fail Upward: failures return with context and suggested next actions.

---

## 3) Agent Contract (JSON Schema v1)

Every agent must implement this contract for tasks and results. Keep stable; add version fields on change.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://oursynth/specs/agent-contract.schema.json",
  "title": "AgentContractV1",
  "type": "object",
  "required": ["agentId", "task", "intent", "inputs"],
  "properties": {
    "version": { "type": "string", "default": "1.0" },
    "agentId": { "type": "string" },
    "intent": { "type": "string" },
    "capsuleId": { "type": ["string", "null"] },
    "task": {
      "type": "object",
      "required": ["id", "type"],
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" },
        "constraints": { "type": "object", "additionalProperties": true },
        "acceptanceCriteria": { "type": "array", "items": { "type": "string" } },
        "deadlineMs": { "type": ["number", "null"] }
      }
    },
    "inputs": { "type": "object", "additionalProperties": true },
    "attachments": { "type": "array", "items": {"type": "string"} },
    "telemetry": {
      "type": "object",
      "properties": {
        "startTs": { "type": "number" },
        "estimatedCost": { "type": "number" },
        "modelHints": { "type": "object" }
      }
    }
  },
  "additionalProperties": false
}
```

Result envelope:

```json
{
  "$id": "https://oursynth/specs/agent-result.schema.json",
  "title": "AgentResultV1",
  "type": "object",
  "required": ["taskId", "status", "artifacts", "selfChecks"],
  "properties": {
    "version": { "type": "string", "default": "1.0" },
    "taskId": { "type": "string" },
    "status": { "type": "string", "enum": ["success", "needs-work", "failed"] },
    "artifacts": { "type": "array", "items": { "type": "object", "additionalProperties": true } },
    "diffSummary": { "type": ["string", "null"] },
    "logs": { "type": "array", "items": { "type": "string" } },
    "metrics": { "type": "object", "additionalProperties": true },
    "selfChecks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "result"],
        "properties": {
          "name": { "type": "string" },
          "result": { "type": "string", "enum": ["pass", "fail", "warn"] },
          "evidence": { "type": "string" },
          "score": { "type": ["number", "null"] }
        }
      }
    },
    "provenance": { "type": "object", "additionalProperties": true }
  },
  "additionalProperties": false
}
```

---

## 4) Quality Gates (Bronze/Silver/Gold)

- Bronze (always required to accept):
  - All outputs stored as Memory nodes, linked to task and agent.
  - Build compiles; linter passes with no errors; unit tests for touched modules run and are green or explicitly waived with rationale.
  - SBOM or dependency delta captured.
- Silver (default for merge/deploy to staging):
  - Coverage for changed lines ≥ 80% or non-applicable justification.
  - Security scan clean (no high/critical); secrets scan clean.
  - Performance budget respected or improved (define per package).
  - Reproducible Capsule generated with manifest and signature.
- Gold (public/publish/production):
  - Chaos/smoke test pass; rollback plan attached.
  - Provenance chain verified; signature countersigned by Conductor.
  - SLO impact assessed; observability dashboards updated.

Gate evaluations are machine-checkable; agents must include self-check evidence first.

---

## 5) Conductor Workflow (Begin → Middle → End)

1. Intake (Begin):
   - Validate AgentContract for incoming task; enrich with memory context and prior art.
   - Emit agent:status=active start event; allocate budget/timeout.
   - Provide acceptanceCriteria and Gold Rules as system constraints.

2. Execution Supervision (Middle):
   - Subscribe to agent streams; throttle UI updates; store logs.
   - On partials, run lightweight static checks to steer early.
   - If drift detected (violating constraints), issue corrective hint or preempt with rollback.

3. Verification and Feedback (End):
   - Run Quality Gates pipeline. Collect artifacts: diffs, test outputs, SBOM, signatures.
   - If fail: return structured Review Packet with failing checks, suggested fixes, and patch hints; optionally auto-open a repair task.
   - If pass: promote provenance tier, publish capsule, broadcast success events.

---

## 6) Review Packet (to send back for self-repair)

Structure the rejection feedback predictably so agents can auto-correct.

```json
{
  "taskId": "...",
  "summary": "Why it failed and what to change",
  "failedChecks": [
    { "gate": "Bronze/Silver/Gold", "check": "Lint", "evidence": "eslint output...", "fixHint": "Run eslint --fix; rename variables..." }
  ],
  "blocking": true,
  "proposedNextSteps": ["Add tests for X", "Mask secret Y", "Split function Z"],
  "timeboxMs": 900000
}
```

---

## 7) Decision Policy (Accept vs. Reject)

Accept when:

- Bronze passes and the task’s acceptanceCriteria are met.
- For merges/deploys: Silver passes; risk register updated.
- For public/publish: Gold passes; rollback tested.

Reject when:

- Any Bronze check fails.
- Evidence is missing or unverifiable.
- Contract drift: result doesn’t match task intent/constraints.

Escalate when:

- Trade-off requires human sign-off (security exception, SLA impact).
- Novel architecture change not covered by patterns.

---

## 8) Event Semantics (aligns with Real-Time Agent Streams)

- status: lifecycle updates and capacity/load.
- provenance: tier transitions; attach criteria and confidence.
- capsule: lifecycle with progress; artifacts snapshot.
- orchestration: gating results, review packets, promotions.

All events must include: id, type, agent, capsuleId?, payload, timestamp, severity?, provenanceTier?

---

## 9) Minimal Gating Pipeline (Pseudo)

```text
queue → fetch agent result → persist → run:
  1) build/lint/unit (scoped) → bronze
  2) secrets/security scan → silver
  3) perf/coverage budgets → silver
  4) package SBOM + sign → silver
  5) chaos/smoke, rollback rehearsal → gold
Emit review packet or promotion event.
```

---

## 10) Failure Taxonomy and Auto-Responses

- Transient (rate limit, network): backoff and retry up to N with jitter.
- Deterministic (lint/test failures): return review packet with diffs and hints.
- Policy breach (secrets, licenses): block; require human or rewrite with constraints.
- Ambiguity (underspecified task): request enrichment from Memory; re-plan.

---

## 11) Safety and Ethics Guardrails

- No PII in logs/events; redact at source.
- Refuse harmful content; clamp model prompts with guard policies.
- Cost ceilings per task; abort on runaway token usage.
- Deterministic seeds for reproducibility when feasible.

---

## 12) Interfaces to Existing Apps

- Memory: every artifact/decision becomes a node with edges to tasks, agents, capsules.
- Deploy: only promote on Silver or higher; attach SBOM and signatures.
- Domain: domain changes pass Bronze+Silver and are reversible.
- Wizard/Pathways: use Review Packets as steps; animate provenance.

---

## 13) Living Standards

- This manual is versioned; changes emit an orchestration event and open a pathway to propagate updates to agents.
- Agents must declare supported manual version; Conductor shims when needed.
