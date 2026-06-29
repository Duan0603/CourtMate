# Phase 7: Community Trust & Reports - Context

**Gathered:** 2026-06-28
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the reporting mechanism for users to flag fake/incorrect tournament posts, automatic threshold-based flagging for admin review to hide posts, and the Verified Source badge for trusted organizers/clubs.
</domain>

<decisions>
## Implementation Decisions

### Report Categories
- **D-01 (Category Options):** Provide a pre-defined list of reasons (e.g., Fake, Spam, Duplicate) along with an optional "Other" text field. This balances speed of reporting for mobile users with the ability to provide detailed context when necessary.

### Auto-hide Threshold
- **D-02 (Flagging Threshold):** When a tournament receives 5 unique user reports, it is flagged for admin review and is temporarily hidden from the public feed to protect users while waiting for admin resolution.

### Verified Badge Process
- **D-03 (Badge Assignment):** The "Verified Source" badge is assigned via manual database or admin panel operation. There is no automated in-app request flow for organizers in the MVP to save development time.

### the agent's Discretion
None

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/ROADMAP.md` § Phase 7 — Defines goals, requirements, and success criteria for Phase 7.
- `.planning/REQUIREMENTS.md` § Quality Control & Moderation — Outlines requirements VERI-01, REPT-01, and REPT-02.

### Types & Schema
- `packages/shared/src/index.ts` — Shared types, user schemas, and any badge/report enums.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/frontend/src/features/auth/components/LoginForm.tsx` — Example of forms/inputs that can be adapted for the Report form.
- `apps/backend/src/modules/tournaments/tournaments.service.ts` — Where logic to calculate reports and hide tournaments will likely reside.

### Established Patterns
- Mongoose-based database modeling and NestJS modular backend pattern.
- React Native component layout with Tamagui.

### Integration Points
- `apps/frontend/src/features/tournaments/screens/` — Add a report button on the tournament detail screen and a Verified Badge icon.
- `apps/backend/src/app.module.ts` — Registering the new reports or moderation endpoints.

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

*Phase: 07-community-trust-reports-ph-c-2*
*Context gathered: 2026-06-28*
