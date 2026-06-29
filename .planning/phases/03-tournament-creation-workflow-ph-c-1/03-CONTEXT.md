# Phase 3: Tournament Creation Workflow (Phúc - 1) - Context

**Gathered:** 2026-06-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the frontend form UI and backend API endpoints allowing organizers to create sports tournaments, specifying rules, categories, fees, and location. Created tournaments are immediately published to the hub.
</domain>

<decisions>
## Implementation Decisions

### Form Layout Style
- **D-01:** Implement a step-by-step wizard (Split into basic info, categories, and rules for easier navigation). This manages cognitive load given the number of required fields.

### Rules Entry Method
- **D-02:** Support both rich text editor and file upload (PDF/Image) for providing tournament rules. Organizers can either type out rules or upload an existing PDF/Image ruleset.

### Category & Fee Structure
- **D-03:** Implement dynamic pricing per category (e.g., Men's Singles $10, Mixed Doubles $15). This provides realism and flexibility for tournaments with varying entry fees.

### Venue Input
- **D-04:** Use a simple text field for venue input where the organizer types the venue name/address. This is the simplest approach for the MVP.

### the agent's Discretion
None

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` § Phase 3 — Defines goals, requirements, and success criteria for Phase 3.
- `.planning/REQUIREMENTS.md` § Tournament Creation (Organizer Workflow) — Outlines requirement TOUR-03.

### Types & Schema
- `packages/shared/src/index.ts` — Shared types and user schemas, including user roles needed for authorization.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/src/features/auth/components/LoginForm.tsx` — Shows how Tamagui inputs and form handling are set up (can be used as reference for wizard steps).

### Established Patterns
- React Native component layout with Tamagui.
- Mongoose-based database modeling and NestJS modular backend pattern.

### Integration Points
- `apps/frontend/src/App.tsx` / `apps/frontend/src/navigation/types.ts` — Navigation routes for the Tournament Creation wizard.
- `apps/backend/src/app.module.ts` — Registering the new Tournament module.
</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope
</deferred>

---

*Phase: 03-tournament-creation-workflow-ph-c-1*
*Context gathered: 2026-06-26*
