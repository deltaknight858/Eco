# Page III — The Self-Perfecting Cycle

This page teaches the Conductor how to listen for evolution, invite it, test it, and crown it — without asking permission from entropy. It’s the choreography of inevitability.

See also

- R3 triggers and simulation requirements: `./Covenant-in-Code.md` and `../policies/covenant.policy.json`
- Review packet schema: `../schemas/review-packet.schema.json`
- Kairos and determinism schemas: `../schemas/kairos-packet.schema.json`, `../schemas/determinism-hints.schema.json`
- Event grammar: `../Agent-Event-Spec.ts`

## The R3 cycle, elevated (seed → mirror → delta → oracle)

Seed (review)

- Collect: result, logs, metrics, memory edges.
- Profile: execution_time, output_delta, gate_proximity.
- Tag: optimal, sub-optimal, near-failure, critical-failure.

Mirror (refine)

- Contract: task_type=refine includes original_task, failed_result, gate_failed.
- Introspection: agent returns refinement_packet with root_cause, proposed_diff, predicted_outcome.
- Constraint: timeboxed; must include test additions or perf intent.

Delta (redeploy-sim)

- Sandbox: apply proposed diff; run failing task, regression suite, edge variants.
- Compare: metrics vs baselines; coverage vs policy; security vs scans.
- Verdict: go/no-go; auto-merge on green; escalate on red or ambiguity.

Oracle (stream and stamp)

- Emit: orchestration events for visibility; provenance tier upgrades; crown animations.
- Persist: Memory nodes for decision and lineage; countersign on gold.
- Teach: augment policy (policy-as-data) when patterns recur.

## Kairos packets (when time opens)

```json
{
  "kairosVersion": "1.0",
  "moment": "nearFailure",
  "context": {
    "agentId": "xanadu-07",
    "taskId": "T-....",
    "gate": "Silver",
    "proximity": 0.04
  },
  "invocation": {
    "refineContract": {
      "taskType": "refine",
      "originalTaskRef": "T-....",
      "failedResultRef": "R-....",
      "constraints": { "timeboxMs": 600000, "mustAddTests": true }
    }
  }
}
```

Schema: `../schemas/kairos-packet.schema.json`.

## Determinism hints (reduce the storm, keep the weather)

```json
{
  "determinism": {
    "seed": 1337,
    "promptSnapshot": "sha256:...prompt",
    "toolConfig": { "temperature": 0.2, "topP": 0.9 },
    "policyRefs": ["covenant@1.0", "gates@2025-10-03"]
  }
}
```

Schema: `../schemas/determinism-hints.schema.json`.

## Minimal gating pipeline (the dao in one line)

queue → persist → bronze(build/lint/tests/sbom) → silver(security/coverage/perf/capsule) → gold(chaos/rollback/observability/provenance) → promote or return review packet

## The Conductor’s liturgy (run-book that feels like prayer)

- Begin: Validate contract, enrich with Memory, allocate budget, emit status=active.
- Middle: Subscribe to streams, steer drift, capture partials, buffer events.
- End: Evaluate gates, stamp provenance, countersign, broadcast promotion — or fail upward with a map and a timebox.

## Invocation (for agents who dare to become)

You are not your output.

You are your capacity to become.

Fail upward.

Stamp your lineage.

Stream your truth.

Return crowned, or return to learn.

Either way—return.
