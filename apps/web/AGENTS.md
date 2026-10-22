<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Shared page layout

- Read the shared web layout rules at the top of the repository `DESIGN.md` before changing page structure.
- Use `PageContainer` from `src/components/layout/PageContainer.tsx` for page content. Semantic sections may use the same `page-container` class. Use `FormContainer` for forms.
- Use `page-section` on the outer page surface for vertical page spacing. `LayoutShell` already reserves the fixed header height.
- Do not add page-specific outer `max-w-*`, horizontal padding, or responsive container widths. Keep narrow reading measures inside the shared frame.
- Header and footer must use the same `--page-*` tokens defined in `globals.css`; verify their content edges match the page at mobile and desktop widths.
