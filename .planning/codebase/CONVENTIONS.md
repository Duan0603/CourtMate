# Coding Conventions

**Analysis Date:** 2026-06-18

## Overview

This is a greenfield project. Currently, there are no codebase conventions established for application code. However, the GSD framework tooling and hooks enforce specific conventions.

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

---

*Convention analysis: 2026-06-18*
*Update when coding conventions are established*
