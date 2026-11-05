## What and why

<!-- One or two sentences: the change and the reason for it. Link the issue or spec if there is one. -->

## How to check it

<!-- Steps or the view to open (`?part=a&fixture=…`, `?part=b`). Screenshots at desktop and 375px for UI changes. -->

## Checklist

- [ ] Branch is small (≤ ~20 files) and does one stage of work
- [ ] Failing test written first for anything with logic
- [ ] `pnpm verify` passes (format, lint, typecheck, test, knip, isolated build)
- [ ] `pnpm test:e2e` passes; new views or fixtures are in `e2e/views.ts`
- [ ] Copy lives in `src/content` (or `src/part-b/copy.ts`); colors come from tokens; new color pairs are in `tokenContrast.test.ts`
- [ ] `AGENTS.md` updated if a rule, command or folder changed
