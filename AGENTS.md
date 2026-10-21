# BMAD in CourtMate

When the user asks for BMAD, use the project-local skills under `.agents/skills/` and the configuration under `_bmad/`. Prefer these over same-named skills installed at user scope. Use `bmad-help` to choose a workflow when the request does not name one; then read and follow the selected skill's `SKILL.md`.

BMAD is invoked as a skill in Codex (for example, `$bmad-help` or `$bmad-prd`). `/bmad` is not a registered Codex slash command.
