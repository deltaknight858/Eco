# Page II — The Covenant in Code

This page is the shard that makes systems shiver — compact, deterministic, and executable. It binds philosophy to interfaces, rhythm to routes, and crowns to countersignatures.

Authoritative artifacts

- Policy-as-data: `../policies/covenant.policy.json` (schema: `../schemas/covenant.schema.json`)
- Agent result schema: `../schemas/agent-result.schema.json`
- Review packet schema: `../schemas/review-packet.schema.json`
- Provenance stamp schema: `../schemas/provenance-stamp.schema.json`
- Kairos packet schema: `../schemas/kairos-packet.schema.json`
- Determinism hints schema: `../schemas/determinism-hints.schema.json`
- Event grammar: `../Agent-Event-Spec.ts`

## Conductor covenant (policy-as-data)

See canonical JSON at `../policies/covenant.policy.json`. Excerpt:

```json
{
  "covenantVersion": "1.0",
  "tiers": {
    "bronze": {
      "required": ["memory.persisted", "build.green", "lint.clean", "tests.touched.green", "sbom.delta"],
      "evidence": ["artifacts", "diffSummary", "logs"]
    },
    "silver": {
      "required": [
        "coverage.changedLines>=0.80|waiver",
        "secrets.clean",
        "vulns.none.highOrCritical",
        "perf.withinBudget",
        "capsule.signed.reproducible"
      ],
      "evidence": [
        "coverageReport",
        "scanReports",
        "perfMetrics",
        "capsuleManifest",
        "signature"
      ]
    },
    "gold": {
      "required": [
        "smoke.prodLike.green",
        "rollback.rehearsed",
        "provenance.chain.verified",
        "conductor.countersign",
        "observability.slo.reviewed"
      ],
      "evidence": [
        "smokeOutput",
        "rollbackScript",
        "chainReport",
        "countersignature",
        "dashboardDiffs"
      ]
    }
  },
  "decisionPolicy": {
    "accept": ["bronze.pass", "intent.acceptanceCriteria.met"],
    "mergeStaging": ["silver.pass", "riskRegister.updated"],
    "publishProduction": ["gold.pass"],
    "reject": ["bronze.fail", "evidence.missing", "contract.drift"],
    "escalate": ["security.exception", "novel.architecture.change"]
  },
  "r3": {
    "trigger": ["nearFailure", "subOptimal", "criticalFailure"],
    "refineContract.taskType": "refine",
    "simulation.required": ["originalFailingTask", "regressionSuite", "edgeVariants"]
  }
}
```

## Agent oath (self-check evidence envelope)

Example instance (validates against `AgentResultV1` plus `provenance` extension):

```json
{
  "oathVersion": "1.0",
  "taskId": "T-2025-10-04-0420",
  "status": "success",
  "artifacts": [],
  "selfChecks": [
    {"name": "schema", "result": "pass", "evidence": "AgentResultV1 validated"},
    {"name": "build", "result": "pass", "evidence": "tsc + bundler ok"},
    {"name": "lint", "result": "pass", "evidence": "eslint ok"},
    {"name": "unit", "result": "pass", "evidence": "jest touched modules green"},
    {"name": "coverage", "result": "warn", "evidence": "78% changed lines; waiver W-145 attached"},
    {"name": "secrets", "result": "pass", "evidence": "gitleaks ok"},
    {"name": "capsule", "result": "pass", "evidence": "manifest + signature; replay steps verified"}
  ],
  "provenance": {
    "tier": "silver",
    "signature": "ed25519:...",
    "chain": ["agent.signature", "capsule.signature", "conductor.policyRef"],
    "memoryLinks": ["node://tasks/T-2025-10-04-0420", "node://agents/aeco-01"]
  }
}
```

## Review packet (fail upward ritual)

Example instance:

```json
{
  "version": "1.0",
  "taskId": "T-2025-10-04-0420",
  "summary": "Silver gate failed: coverage < 0.80; performance budget exceeded by 7%.",
  "failedChecks": [
    {"gate": "Silver", "check": "Coverage", "evidence": "changedLines=0.78", "fixHint": "Add edge-case tests for module X; focus on early returns."},
    {"gate": "Silver", "check": "Performance", "evidence": "baseline=120ms, current=129ms", "fixHint": "Cache Y; reduce Z recomputation."}
  ],
  "blocking": true,
  "proposedNextSteps": [
    "Generate unit tests via TestGenerator for module X",
    "Introduce memoization for selector Z",
    "Attach updated perf baseline to policy.md"
  ],
  "timeboxMs": 900000
}
```

## Provenance stamp (the crown)

Example instance:

```json
{
  "stampVersion": "1.0",
  "artifactId": "capsule://eco/auth-helper@1.2.0",
  "tier": "gold",
  "signedBy": {
    "agent": "capsule-creator",
    "conductor": "oursynth-conductor"
  },
  "signatures": {
    "agent": "ed25519:...agent",
    "conductor": "ed25519:...conductor"
  },
  "sbom": "sha256:...sbom",
  "chaos": {
    "smoke": "green",
    "rollbackScript": "ok",
    "rehearsalAt": "2025-10-03T23:59:59Z"
  },
  "observability": {
    "dashboardsPatched": true,
    "sloImpact": "none",
    "alertsUpdated": ["capsule_publish", "latency_spike"]
  }
}
```

## Streams as truth (event grammar)

Types are defined in `../Agent-Event-Spec.ts`:

```ts
export type AgentEventType = 'status' | 'provenance' | 'capsule' | 'orchestration' | 'marketplace';

export interface AgentEvent<T = unknown> {
  id: string;
  type: AgentEventType;
  agent: string;
  capsuleId?: string;
  payload: T;
  timestamp: number;
  severity?: 'info' | 'warning' | 'error' | 'success';
  provenanceTier?: 'bronze' | 'silver' | 'gold';
}
```
