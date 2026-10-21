---
name: bmad
description: Entry point for BMAD workflows in this repository. Use when the user asks to use BMAD, needs BMAD help, or wants to choose a BMAD workflow.
---

# BMAD entry point

Use the project-local BMAD skills in `{project-root}/.agents/skills` and configuration in `{project-root}/_bmad`. Prefer these skills over same-named user-level skills so the workflow matches this project's installed BMAD version. First determine the user's intent from their request and the project context.

- If the user is asking what BMAD can do or which workflow to choose, read and follow `bmad-help`.
- If the user names a specific BMAD skill or workflow, read and follow that skill.
- If the request clearly matches a specific BMAD skill, read and follow that skill without making the user choose again.
- If several workflows could fit and the choice affects the result, explain the options briefly and ask the user to choose.

Do not treat this entry point as a replacement for the selected workflow's instructions. Read the selected `SKILL.md` and follow it before doing the work.
