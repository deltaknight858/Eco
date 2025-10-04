---
name: "Kairos: Refine Invocation"
about: Trigger an R3 refine flow from a near-failure or critical signal
labels: [kairos, refine]
---

# Kairos: Refine Invocation

## Moment

- moment: nearFailure | subOptimal | criticalFailure
- proximity (0..1):

## Context

- agentId:
- taskId:
- gate: Bronze | Silver | Gold

## Invocation

- taskType: refine
- originalTaskRef:
- failedResultRef:
- constraints:
  - timeboxMs:
  - mustAddTests: true | false

## Attachments

- Review packet (if exists): link or JSON
- Determinism hints (optional): link or JSON

## Expected Outcome

- Predicted diffs:
- Test additions:
- Performance intent:
