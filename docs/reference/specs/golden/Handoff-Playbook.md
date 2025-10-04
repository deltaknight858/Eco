# Epic Handoff — Oursynth Golden Live Docs Playbook

This playbook turns the three Golden Pages into a smooth, repeatable operational flow. It’s concise, executable, and kind to future-you.

Links

- Page I: `./Inevitability-Charter.md`
- Page II: `./Covenant-in-Code.md`
- Page III: `./Self-Perfecting-Cycle.md`
- Policy-as-data: `../policies/covenant.policy.json` (schema: `../schemas/covenant.schema.json`)
- Gates baseline: `../policies/quality-gates.yml`
- Schemas: `../schemas/` | Examples: `../examples/`

## Day 0 — Boot the covenant

- Adopt `specs/policies/covenant.policy.json` as the single source for decision semantics.
- Keep `quality-gates.yml` as the default budgets and thresholds; override via covenant if needed.
- Ensure event producers conform to `specs/Agent-Event-Spec.ts`.

## Day 1 — Operate the R3 cycle

- Seed (review):
  - Persist result, logs, metrics, memory edges.
  - Tag proximity to gate (optimal/sub-optimal/near-failure/critical-failure).
- Mirror (refine):
  - Emit a Kairos Issue (template provided) with constraints and must-add-tests.
  - Produce/refine a review packet (`ReviewPacketV1`).
- Delta (redeploy-sim):
  - Sandbox patch; run failing task + regression + edge variants.
  - Compare vs baselines; require green or escalate.
- Oracle (stream & stamp):
  - Emit orchestration events; stamp provenance; countersign Gold.

## Evidence and envelopes

- Agent Oath → `specs/examples/agent-oath.example.json` (conforms to `AgentResultV1`).
- Review Packet → `specs/examples/review-packet.example.json` (conforms to `ReviewPacketV1`).
- Provenance Stamp → `specs/examples/provenance-stamp.example.json`.
- Kairos Packet → `specs/examples/kairos-packet.example.json`.
- Determinism Hints → `specs/examples/determinism-hints.example.json`.

## Waivers and countersignatures

- Waiver requests must:
  - Specify the exact gate signal being waived (e.g. `coverage.changedLines>=0.80`).
  - Provide compensating evidence (e.g. additional tests in adjacent modules, perf margin elsewhere).
  - Include an expiration or trigger for re-evaluation.
- Gold requires Conductor countersignature and a rollback rehearsal record.

## Rollback rehearsal (gold drill)

- Prove: a one-command rollback restores prior state.
- Capture: rehearsal timestamp, script path, and smoke output.
- Stamp: include rehearsal evidence in the provenance stamp.

## Streams in practice

- Emit `status`, `provenance`, `capsule`, and `orchestration` events as work proceeds.
- Severity semantics:
  - `warning` indicates proximity to a gate edge; triggers Kairos if near-failure.
  - `error` requires immediate review packet emission.

## Minimal checklists

- PR checklist (see template):
  - Tier target and evidence attached.
  - Risk register uptick (if needed).
  - Observability updated for Gold.
- Kairos checklist:
  - Moment, proximity, constraints.
  - Must-add-tests flag set when coverage is implicated.

## Try it

- Use `tools/validate.ps1` to validate examples against schemas (Node or Python optional).

## Glossary

- Capsule: A reproducible, signed artifact with manifest and replay steps.
- Memory: The graph of moments (nodes) and meaning (edges); the lineage substrate.
- Countersignature: Conductor’s cryptographic co-approval for Gold artifacts.

— Handed off with care. Keep the streams alive, and crown on rhythm.