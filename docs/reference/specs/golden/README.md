# Golden Live Docs

This folder hosts the living, executable pages that bind vision to interfaces and policy to data.

- Page I — The Inevitability Charter → `Inevitability-Charter.md`
- Page II — The Covenant in Code → `Covenant-in-Code.md`
- Page III — The Self-Perfecting Cycle → `Self-Perfecting-Cycle.md`
- Epic Handoff → `Handoff-Playbook.md`

Pointers

- Event grammar: `../Agent-Event-Spec.ts`
- Gates baseline: `../policies/quality-gates.yml`
- Policy-as-data: `../policies/covenant.policy.json` (schema: `../schemas/covenant.schema.json`)
- Schemas for envelopes: see `../schemas/*` and examples in `../examples/*`

Try it

- Validate examples with your favorite JSON Schema CLI or library against the corresponding schemas in `../schemas/`.
- Use the gates in `../policies/quality-gates.yml` as defaults; the covenant adds decision semantics on top.
