# Codebase Structure

**Analysis Date:** 2026-06-18

## Directory Layout

```
[project-root]/
├── .agents/            # GSD Framework local files and hooks
│   ├── agents/         # Subagent profile definitions (Markdown)
│   ├── gsd-core/       # GSD core library, references, templates, and workflows
│   ├── hooks/          # Git and tool execution lifecycle hooks
│   └── skills/         # Namespace skills and custom sub-skills
├── .git/               # Git repository directory
├── .gitignore          # Git exclusion specifications
└── README.md           # Project introduction and workspace instructions
```

## Directory Purposes

**.agents/**
- Purpose: Stores local GSD framework configuration, scripts, and skills.
- Contains: Settings, package configurations, hooks, and agent definitions.
- Key files: `settings.json`, `gsd-file-manifest.json`

**.agents/agents/**
- Purpose: Definitions of specialized AI agents.
- Contains: Profiles for planner, executor, roadmapper, researcher, and verifier agents.

**.agents/gsd-core/**
- Purpose: Core logic and assets for GSD phase loops.
- Contains: `bin/gsd-tools.cjs`, workflows, references, templates.

**.agents/hooks/**
- Purpose: Intercepts tool execution and git actions to enforce guards.
- Contains: Guard and check scripts (e.g. `gsd-prompt-guard.js`, `gsd-workflow-guard.js`).

**.agents/skills/**
- Purpose: Skill folders for modular capability extensions.
- Contains: Namespace folders (e.g. `gsd-ns-project`, `gsd-ns-workflow`).

## Key File Locations

**Entry Points:**
- None (No product application entry points initialized yet)

**Configuration:**
- `.gitignore` - Excluded files list
- `.agents/settings.json` - Active hooks and timeout configurations

**Documentation:**
- `README.md` - Core project and GSD instructions

## Naming Conventions

**Files:**
- kebab-case.md for standard documents
- kebab-case.js/cjs for script and hook files
- UPPERCASE.md for top-level documentation (e.g. README.md)

**Directories:**
- kebab-case for all directories

## Where to Add New Code

**New Feature / Component / Route:**
- Greenfield status: Location conventions will be determined once the tech stack is decided during project planning.

## Special Directories

**.agents/**
- Purpose: Local runtime hooks and tools
- Source: Copied during GSD installation
- Committed: Yes

---

*Structure analysis: 2026-06-18*
*Update when directory structure changes*
