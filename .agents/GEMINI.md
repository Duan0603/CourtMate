<!-- GSD:project-start source:PROJECT.md -->

## Project

**CourtMate**

CourtMate is a mobile application built using React Native/Expo designed to help sports enthusiasts find sports matches on-demand (Grab-like matchmaking) and book court slots in real-time. The initial focus is on designing the Mobile UI/UX and Mobile User Flow.

**Core Value:** Giúp người dùng di động nhanh chóng tìm được bạn chơi thể thao xung quanh vị trí của họ tức thì (On-demand matchmaking).

### Constraints

- **Tech Stack**: React Native / Expo — Định hướng đa nền tảng iOS & Android.
- **Dữ liệu**: Mock Data — Đơn giản hóa backend để tập trung hoàn thiện trải nghiệm UI/UX.
- **Thiết kế**: Mobile Responsive & Single-hand touch targets — Nút CTA lớn nằm trong vùng dễ với của ngón cái.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- None (Greenfield project, no application code written yet)
- JavaScript (Node.js CommonJS/ESM) - Used for GSD hooks and scripts under `.agents/`
- Bash Shell Scripting - Used for GSD hooks (`.sh` files)

## Runtime

- Node.js (>= 18.x) - Executing environment for GSD core CLI (`gsd-tools.cjs`) and hooks
- None initialized yet for the root project.
- npm (internal package.json in `.agents/`)

## Frameworks

- None (No product frameworks like React, Express, NestJS, etc. are installed yet)
- GSD (Git. Ship. Done.) Framework v1.5.0 - Local agent workspace tooling under `.agents/`

## Key Dependencies

- `@opengsd/gsd-core` v1.5.0 - Project orchestration, planning, and task runner.

## Configuration

- `.gitignore` - Project level ignore configuration.
- `.agents/settings.json` - Hooks and validation setup for the agent runner.

## Platform Requirements

- Windows/macOS/Linux with Node.js and Git installed.
- Git Bash or compatible shell for running hook shell scripts.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Overview

## Naming Patterns

- **Files:** kebab-case for GSD files and scripts (e.g. `gsd-tools.cjs`, `plan-phase.md`).
- **Commits:** Follow conventional commit format (e.g. `feat(phase-01): add user schema`, `docs: initialize project`).

## Code Style

- **Indentation:** 2 spaces is standard in the GSD `.js`/`.cjs` source files.
- **Git Workflows:** Direct commits to active branches are permitted under GSD, but shipping requires a clean tree.

## Error Handling

- **GSD Scripts:** GSD commands use structured JSON error output on stderr when `GSD_JSON_ERRORS=1` is set, and exit synchronously with code `1` or `2` on failures.

## Comments

- **Action-Text Discipline:** GSD planners and executors enforce "Comment-text discipline." Verify that negative-grep target strings do not verbatim appear in source code comments or tasks to avoid triggering commit-time gates.

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## Architectural Pattern

```

```

## Layers

## Data Flow

## Abstractions & Core Concepts

- **Workspace Logic:** Uses the GSD local tooling under `.agents/` to manage project state, track requirements, and run phase loops.

## Entry Points

- None (No application entry points exist yet)

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
