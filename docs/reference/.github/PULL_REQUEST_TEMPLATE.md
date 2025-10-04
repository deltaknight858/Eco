# Oursynth PR — R3 + Covenant Checklist

## Summary

- What changed and why?
- Intent and acceptance criteria:

## Tier Target

- [ ] Bronze
- [ ] Silver
- [ ] Gold (requires countersign + rollback rehearsal)

## Evidence (attach or link)

- Bronze
  - [ ] memory.persisted (artifacts, logs)
  - [ ] build.green
  - [ ] lint.clean
  - [ ] tests.touched.green
  - [ ] sbom.delta
- Silver
  - [ ] coverage.changedLines >= 0.80 (or waiver)
  - [ ] secrets.clean (e.g. gitleaks)
  - [ ] vulns.none.highOrCritical
  - [ ] perf.withinBudget
  - [ ] capsule.signed.reproducible
- Gold
  - [ ] smoke.prodLike.green
  - [ ] rollback.rehearsed (attach script + timestamp)
  - [ ] provenance.chain.verified
  - [ ] conductor.countersign (attach)
  - [ ] observability.slo.reviewed (diffs attached)

## Waivers (if any)

- Gate(s) waived:
- Compensating evidence:
- Expiration/re-eval trigger:

## Risks & Observability

- Risk register updated? [ ] yes / [ ] n/a
- Dashboards/alerts updated? [ ] yes / [ ] n/a

## Notes

- Anything reviewers should know.
