### Task 8: E2E smoke, DESIGN.md, verify

**Files:**
- Create: `e2e/console-smoke.spec.ts`
- Modify: `DESIGN.md` — Console application subsection pointing at spec
- Modify: `README.md` — `/console` → redirects to case overview; reference gallery path

- [ ] **Step 1: E2E smoke**

```ts
import { expect, test } from '@playwright/test';

test('console redirects to case overview', async ({ page }) => {
  await page.goto('/console');
  await expect(page).toHaveURL(/\/console\/cases\/northridge\/overview/);
  await expect(page.getByRole('heading', { name: /Northridge/i })).toBeVisible();
});
```

Add to Playwright smoke project or rely on `test:e2e` include — if smoke project only runs `e2e/smoke.spec.ts`, either extend that file with a second test or register `console-smoke` in config. Prefer adding test to `e2e/smoke.spec.ts` if config is narrow.

- [ ] **Step 2: Docs update** — DESIGN.md + README paths

- [ ] **Step 3: Full verify**

Run: `pnpm verify`  
Expected: All verification steps passed.

- [ ] **Step 4: Commit (if requested)**

```bash
git add e2e DESIGN.md README.md src
git commit -m "feat(console): Phase A real case workspace application"
```

---

## Phase C (out of scope for this plan — next plan)

Separate plan after Phase A ships: agency shell, remaining screens rebuilt from Paper → composed pages, deprecate product use of dumps, keep `/console/reference` until parity sign-off.

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Nested case routes + redirect | 4 |
| CaseShell chrome | 3 |
| Mock getters | 2 |
| Overview / Timeline / Evidence / Leads / People | 5–6 |
| shadcn + Phosphor | 1 |
| Reference gallery | 7 |
| DESIGN.md / verify / e2e | 8 |
| Phase C full rewrite | Deferred (explicit) |
