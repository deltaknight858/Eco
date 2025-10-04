# Agent Gating Checklist (Executable)

Status: v0.1
Goal: A compact, repeatable checklist agents must self-run before submitting results. Conductor reruns the same checks for verification.

---

## Bronze (baseline acceptance)

- Contract
  - Result matches AgentResultV1 schema
  - Task intent satisfied; acceptanceCriteria addressed explicitly
- Build & Lint
  - Build compiles with no errors
  - Lint has no errors; warnings acknowledged
- Tests
  - Unit tests for touched modules pass
  - Minimum: happy path + 1 edge case
- Provenance & Memory
  - Artifacts saved to Memory nodes with links to task and agent
  - Diff summary attached
- SBOM
  - Dependencies delta captured

## Silver (staging/merge)

- Coverage
  - Changed lines ≥ 80% coverage or justified
- Security
  - Secrets scan: no secrets in code or config
  - Vulnerability scan: no high/critical
- Performance
  - Meets per-package budgets (documented baseline)
- Capsule
  - Capsule manifest built; signed; reproducible steps verified

## Gold (publish/production)

- Chaos/Smoke
  - Smoke test on prod-like env green
  - Rollback rehearsed and documented
- Observability
  - Dashboards & alerts updated; SLO impact reviewed
- Provenance
  - Conductor countersignature present; chain verified

---

## Self-Check Evidence Template

```json
{
  "checklistVersion": "0.1",
  "results": [
    {"name": "schema", "result": "pass", "evidence": "validated against AgentResultV1"},
    {"name": "build", "result": "pass", "evidence": "tsc + vite build ok"},
    {"name": "lint", "result": "pass", "evidence": "eslint ok"},
    {"name": "unit", "result": "pass", "evidence": "jest 24 passed"},
    {"name": "coverage", "result": "warn", "evidence": "76% lines; waiver attached"},
    {"name": "secrets", "result": "pass", "evidence": "gitleaks ok"}
  ]
}
```
