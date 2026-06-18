# Technology Stack

**Analysis Date:** 2026-06-18

## Languages

**Primary:**
- None (Greenfield project, no application code written yet)

**Tooling & Hook Automation:**
- JavaScript (Node.js CommonJS/ESM) - Used for GSD hooks and scripts under `.agents/`
- Bash Shell Scripting - Used for GSD hooks (`.sh` files)

## Runtime

**Environment:**
- Node.js (>= 18.x) - Executing environment for GSD core CLI (`gsd-tools.cjs`) and hooks

**Package Manager:**
- None initialized yet for the root project.
- npm (internal package.json in `.agents/`)

## Frameworks

**Core:**
- None (No product frameworks like React, Express, NestJS, etc. are installed yet)

**Workflow & Orchestration:**
- GSD (Git. Ship. Done.) Framework v1.5.0 - Local agent workspace tooling under `.agents/`

## Key Dependencies

**Tooling (under .agents/):**
- `@opengsd/gsd-core` v1.5.0 - Project orchestration, planning, and task runner.

## Configuration

**Project Setup:**
- `.gitignore` - Project level ignore configuration.
- `.agents/settings.json` - Hooks and validation setup for the agent runner.

## Platform Requirements

**Development:**
- Windows/macOS/Linux with Node.js and Git installed.
- Git Bash or compatible shell for running hook shell scripts.

---

*Stack analysis: 2026-06-18*
*Update after major dependency changes*
