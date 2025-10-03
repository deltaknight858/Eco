# Agent Streams – Real-Time Activity in Eco

The Agent Streams system provides live visibility into agent, capsule, and provenance activity throughout the Eco experience. It powers the cinematic feedback loops in Commit 25 by broadcasting structured events that front-end components can subscribe to.

## Event Model

Every message flowing through the stream conforms to the shared `AgentEvent` contract exported from `apps/shell/src/types/agentStreams.ts`:

- **type** — the high-level category (`status`, `capsule`, `provenance`, `orchestration`, or `marketplace`).
- **agent** — identifier for the emitting agent (`codegen`, `provenance-verifier`, etc.).
- **capsuleId** — capsule or flow associated with the event (where applicable).
- **payload** — structured details that components can render.
- **provenanceTier** — the resulting tier for provenance events.
- **severity** — UI hint for emphasizing errors vs. success moments.

The shared types module also defines `AgentStreamOptions`, `AgentStatus`, `ConnectionStatus`, and helper shapes for pathway progress tracking.

## AgentStreamService

Front-end code interacts with `AgentStreamService` (`apps/shell/src/services/AgentStreamService.ts`). Key features:

- Maintains lightweight subscriber registry with filters for agents, event types, capsules, and provenance tiers.
- Buffers the latest 200 events for instant replay when new listeners join.
- Emits a demo heartbeat (with synthetic activity) so Storybook and local development feel alive without a backend.
- Tracks connection health and publishes `ConnectionStatus` updates to any hook subscribers.

The service exposes:

```ts
const service = AgentStreamService.getInstance()
const connection = service.subscribe(options, (event) => { /* ... */ })
connection.updateOptions(nextOptions) // refine filters on the fly
connection.disconnect() // stop receiving events

service.emit(customEvent) // broadcast an event manually (useful for tests)
service.getBufferedEvents(filter?) // replay historical events
service.onConnectionStatusChange(listener)
```

## Hooks

Two hooks make streaming ergonomic inside React components:

- **`useAgentStream`** — manages subscription lifecycles, keeps a bounded `events` array, surfaces `agentStatuses`, and exposes helpers to change filters (`subscribeToAgent`, `subscribeToCapsule`) or clear history.
- **`usePathwayProgress`** — consumes agent events plus the active pathway to derive live step progress, active steps, and completed steps. Any capsule progress or provenance event automatically updates the wizard UI.

Both hooks live under `apps/shell/src/components/hooks/`.

## UI Integration

`PathwaysWizard` now accepts optional streaming props:

```tsx
<PathwaysWizard
  pathway={pathway}
  currentStep={currentStep}
  provenance={provenance}
  tier={tier}
  capsuleId="capsule-demo-123"
  streamEnabled
/>
```

When enabled, the wizard:

- Highlights steps with live agent activity.
- Displays recent events in a "Live Activity" card with connection status.
- Surfaces real-time progress percentages for the current step.

`PathwaysPanel` forwards convenience props (`streamCapsuleId`, `streamEnabled`, `streamOptions`) directly into the wizard so higher-level screens stay declarative.

## Extending or Replacing the Demo Stream

The current implementation uses synthetic data for immediacy. To connect to a real WebSocket/SSE backend:

1. Replace the demo generator inside `AgentStreamService.generateDemoActivity()` with calls to your transport layer.
2. Update `subscribe()` to initialize the WebSocket, replay buffered events, and route messages into `emit()`.
3. Keep the existing filter logic and helpers—UI components will continue to work without modification.

## Testing Tips

- In Storybook, the mock stream generates activity automatically. Use the `capsuleId` args in stories to isolate feeds per scenario.
- For unit tests, you can inject synthetic events via `service.emit(event)` and assert on `useAgentStream` state.

This lightweight streaming layer turns the Eco UI into a living dashboard while remaining backend-agnostic—swap the demo transport for a production bridge whenever you are ready.
