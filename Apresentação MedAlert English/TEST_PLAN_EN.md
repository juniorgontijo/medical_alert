# MedAlert — Test Plan

> This is the English version of [TEST_PLAN.md](../TEST_PLAN.md), prepared as a final deliverable. The Portuguese version remains the working copy; this one is a faithful translation, kept in sync manually.

## 1. Strategy and scope

The work combined three fronts: **manual exploratory testing** (guided by risk hypotheses — authentication, access control, time-based business rules), **source-code review** (to confirm root cause and find bugs that don't surface just by clicking through the screen, such as dead code), and **automation** (Cypress, to make findings reproducible and provide video evidence). See "Scope tested" in the Project Brief for the full in/out-of-scope breakdown.

## 2. Risk-based prioritization

The severity of each finding (Critical / High / Medium / Low) reflects **business impact and clinical risk**, not how often a screen is used:

| Severity | Criterion | Examples |
|---|---|---|
| **Critical** | Sensitive data exposed/alterable by anyone; authentication failure | BUG-001, BUG-002, BUG-005, BUG-008, BUG-018 |
| **High** | Business rule broken with direct clinical risk or data loss | BUG-009, BUG-013, BUG-019 |
| **Medium** | Incorrect business rule, with no immediate direct risk | BUG-003, BUG-004, BUG-011, BUG-012, BUG-014, BUG-015 |
| **Low** | UX/visual, no functional impact | BUG-016, BUG-017, BUG-020, BUG-021 |

**Recommended fix order:** Critical → High → Medium → Low, with one caveat: **BUG-013** (High) should be fixed before some Critical sign-up items, because it's a *silent* failure in a patient-safety-critical clinical rule (a critical alert that never escalates on its own) — the risk of real harm is more direct than, for example, an XSS that depends on someone self-registering with a malicious payload.

## 3. Test types covered

| Type | Examples |
|---|---|
| **Functional** | Main flows for all 3 roles, sign-up/vital-sign form validation |
| **Negative / boundary** | BUG-011 (HR exactly at the threshold, `>` vs. `>=`) |
| **Access control** | BUG-008/BUG-018 (read/write IDOR), BUG-005 (login bypass) |
| **Time-based business rule** | BUG-013 (automatic escalation of critical alerts after 15 min) |
| **Load** | k6 — latency percentiles (p95/p99) on the patient-listing route |
| **Security** | BUG-002 (stored XSS), BUG-001/BUG-006 (sensitive data exposure) |

Each finding is also classified by **discovery methodology** (black-box / gray-box / white-box) and by **category** (Security, Functional, Data Integrity, Usability, Visual) — see the full breakdown in BUGS.md.

## 4. Entry and exit criteria

**Entry (precondition to start testing a scenario):**
- Local environment running (`node server/index.js`, `http://localhost:3000`).
- Database reset to a known state via `POST /api/admin/reset` (or the "Reset system data" link on the login screen).

**Exit (definition of "done" for this round):**
- Main flows for all 3 roles walked through manually at least once, end to end.
- Automated suite running with no infrastructure errors (the 23 expected failures in the automated tests **are the expected result** — each one proves a real bug, not an execution failure).
- Every finding documented with: title, severity, layer, test type, category, reproduction steps, expected vs. actual result, and evidence (screenshot/video).

## 5. Environment and tools (with rationale)

| Tool | Use | Why this choice |
|---|---|---|
| **Cypress** | E2E automation (29 automated tests) | Chosen over Playwright/Selenium because: (1) it runs on plain Node.js, the same stack as the system under test, with no extra language setup required; (2) it records video natively per test file, giving automatic evidence with no extra effort; (3) Cypress's retry/assertion model (`should('not.exist')` with a timeout) fits well with the pattern used here — tests that **assert the correct behavior** and fail (turn red) when the real bug occurs, instead of writing assertions that "expect the bug"; (4) its synchronous API (`cy.request`) makes pure API testing (IDOR, login bypass) much easier without needing another tool. |
| **Postman** | Manual API testing / isolated reproduction | Complements Cypress for ad-hoc endpoint exploration and quickly demonstrating a specific bug, without running the whole suite. |
| **k6** | Load testing | Latency percentile metrics (p95/p99) on the patient-listing route, with 3 selectable scenarios: smoke (sanity check), load (standard, gradual ramp), and spike (abrupt burst). Stress/breakpoint/soak were deliberately left out — see [k6/load-test.js](../k6/load-test.js). |
| **VS Code + SQLite extension** | Direct database inspection | Needed for gray-box/white-box findings (e.g., BUG-001, plain-text password — only visible by querying the `users` table directly). |
| **Excel (Node script + `exceljs`)** | Bug log export | Additional format for sharing findings with stakeholders who prefer a spreadsheet over Markdown/HTML. |

## 6. Execution environment
- **Back-end:** Node.js + Express + better-sqlite3, single-file database (`data/medalert.db`), resettable at any time.
- **Test browser:** Electron/Chromium (via Cypress) — headless for batch runs, headed for evidence video recording.
- **Test data:** fixed seed (5 users: 2 patients, 2 nurses, 1 doctor) + accounts generated dynamically by the automated tests (random names, see `cypress/support/randomData.js`), always starting from a known reset.

## 7. Risks of the test plan itself
- **Dependency on resets between tests:** since several write bugs (BUG-018) alter real data (e.g., discharging a patient), the database must be reset after certain manual tests to avoid contaminating the next demonstration — this is documented in each relevant step-by-step.
- **Single-environment execution (local dev):** there is no separate staging/production environment to validate behavior before reporting it — every finding was confirmed directly in the development environment provided.
