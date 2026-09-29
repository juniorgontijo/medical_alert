# MedAlert — Presentation (Brief + Test Plan + Test Cases + Feature Suggestions)

> Single-file merge of [PROJECT_BRIEF_EN.md](PROJECT_BRIEF_EN.md) + [TEST_PLAN_EN.md](TEST_PLAN_EN.md) + [TEST_CASES_EN.md](TEST_CASES_EN.md) + [FEATURES_EN.md](FEATURES_EN.md), full content, in presentation order — so you don't have to switch screens while presenting. Each of those four files remains the master copy: edit there, not here, and re-merge if they change. For the condensed one-pager instead, see [SUMMARY_EN.md](SUMMARY_EN.md); for the timed speaking script, see [PRESENTATION_GUIDE_EN.md](PRESENTATION_GUIDE_EN.md).

---

## Part 1 — Project Brief

### System summary
MedAlert is a hospital alert management system (Node.js/Express + SQLite), with three user roles: **patient**, **nurse**, and **doctor**. The system covers: user sign-up/login, recording of vital signs by nursing staff, automatic alert generation based on configurable clinical thresholds, alert acknowledgment/escalation, and medical actions (setting thresholds, prescribing medication, discharging patients).

### Personas tested
- **Patient** — views their own vital signs and history; requests nursing assistance.
- **Nurse** — records vital signs for the patients under their responsibility; acknowledges and escalates alerts.
- **Doctor** — sets alert thresholds per patient; records prescriptions; discharges patients.

### Scope tested
- Full sign-up and login flow, for all 3 roles.
- Recording of vital signs and alert generation (business rules and boundary values).
- Alert management: acknowledgment, manual escalation, automatic time-based escalation.
- Medical actions: thresholds, prescriptions, patient discharge.
- Access control between patients and between roles (IDOR — read and write).
- Load testing (k6) on the patient-listing route.

### Assumptions made
- Local test environment (`localhost:3000`), no HTTPS, no multi-hospital/tenant support — tested as a single instance.
- Seeded data represents the system's valid initial state after every reset (`POST /api/admin/reset`), used as a known starting point before each scenario.
- Source-code review was treated as a valid technique in this context (not black-box testing alone), since the goal is full pre-production validation, not just acceptance testing — this decision is documented and justified in the Test Plan (black-box/gray-box/white-box methodology).
- A finding was only classified as a **bug** when an objective rule was being violated (explicit behavior in the code, or an unambiguous business expectation). When that basis didn't exist — for example, the total absence of a business rule, rather than the breaking of an existing one — the finding was logged as an **improvement suggestion** (see FEATURES.md) instead of a bug. This distinction was validated case by case during the work (e.g., BUG-003 was originally considered, then reclassified as FEATURE-004 for lack of a written rule; the same happened with diastolic pressure, reclassified as FEATURE-005 after confirming, in the official specification, that no alert rule exists for that field).

### Out of scope (and why)
- **Accessibility (a11y)** — not part of the defined scope for this round; noted as a recommendation for a future iteration.
- **Cross-browser compatibility** — tested only in Chromium/Electron (via Cypress); Firefox and Safari were not validated, due to time constraints.
- **Front-end rendering performance** (Core Web Vitals, etc.) — k6 covered API load, not UI rendering performance.
- **Multi-factor authentication / password recovery** — features that don't exist in the current system, so there's nothing to test.
- **"Administrator" role** — doesn't exist in the system today; mentioned only as a future suggestion in FEATURES.md (FEATURE-001).

### Business risks identified
1. **Sensitive data exposed with no access control** (BUG-008, BUG-018 — critical IDOR): any authenticated user can read and alter any patient's chart, including private medical notes.
2. **Plain-text password** (BUG-001) combined with **login with no real password validation** (BUG-005): critical on their own, together they compromise authentication for the entire system.
3. **Irreversible actions with no confirmation**: patient discharge (BUG-020) and alert acknowledgment (BUG-017) require no confirmation, and there's no "undo" feature anywhere in the system (see FEATURES.md, FEATURE-002).
4. **Critical clinical rule that never runs**: automatic escalation of critical alerts (BUG-013) is dead code — a critical alert can remain pending indefinitely with no human intervention, which is a direct risk to patient safety.
5. **Unit-of-measure inconsistency** (BUG-009, °F vs. °C): generates false fever alerts on every normal reading — a direct clinical risk, and potentially alert fatigue (the team starting to ignore alerts due to excessive false positives).

---

## Part 2 — Test Plan

### 1. Strategy and scope
The work combined three fronts: **manual exploratory testing** (guided by risk hypotheses — authentication, access control, time-based business rules), **source-code review** (to confirm root cause and find bugs that don't surface just by clicking through the screen, such as dead code), and **automation** (Cypress, to make findings reproducible and provide video evidence). See "Scope tested" in the Project Brief above for the full in/out-of-scope breakdown.

### 2. Risk-based prioritization
The severity of each finding (Critical / High / Medium / Low) reflects **business impact and clinical risk**, not how often a screen is used:

| Severity | Criterion | Examples |
|---|---|---|
| **Critical** | Sensitive data exposed/alterable by anyone; authentication failure | BUG-001, BUG-002, BUG-005, BUG-008, BUG-018 |
| **High** | Business rule broken with direct clinical risk or data loss | BUG-009, BUG-013, BUG-019 |
| **Medium** | Incorrect business rule, with no immediate direct risk | BUG-003, BUG-004, BUG-011, BUG-012, BUG-014, BUG-015 |
| **Low** | UX/visual, no functional impact | BUG-016, BUG-017, BUG-020, BUG-021 |

**Recommended fix order:** Critical → High → Medium → Low, with one caveat: **BUG-013** (High) should be fixed before some Critical sign-up items, because it's a *silent* failure in a patient-safety-critical clinical rule (a critical alert that never escalates on its own) — the risk of real harm is more direct than, for example, an XSS that depends on someone self-registering with a malicious payload.

### 3. Test types covered

| Type | Examples |
|---|---|
| **Functional** | Main flows for all 3 roles, sign-up/vital-sign form validation |
| **Negative / boundary** | BUG-011 (HR exactly at the threshold, `>` vs. `>=`) |
| **Access control** | BUG-008/BUG-018 (read/write IDOR), BUG-005 (login bypass) |
| **Time-based business rule** | BUG-013 (automatic escalation of critical alerts after 15 min) |
| **Load** | k6 — latency percentiles (p95/p99) on the patient-listing route |
| **Security** | BUG-002 (stored XSS), BUG-001/BUG-006 (sensitive data exposure) |

Each finding is also classified by **discovery methodology** (black-box / gray-box / white-box) and by **category** (Security, Functional, Data Integrity, Usability, Visual) — see the full breakdown in BUGS_EN.md.

### 4. Entry and exit criteria
**Entry (precondition to start testing a scenario):**
- Local environment running (`node server/index.js`, `http://localhost:3000`).
- Database reset to a known state via `POST /api/admin/reset` (or the "Reset system data" link on the login screen).

**Exit (definition of "done" for this round):**
- Main flows for all 3 roles walked through manually at least once, end to end.
- Automated suite running with no infrastructure errors (the 23 expected failures in the automated tests **are the expected result** — each one proves a real bug, not an execution failure).
- Every finding documented with: title, severity, layer, test type, category, reproduction steps, expected vs. actual result, and evidence (screenshot/video).

### 5. Environment and tools (with rationale)

| Tool | Use | Why this choice |
|---|---|---|
| **Cypress** | E2E automation (29 automated tests) | Chosen over Playwright/Selenium because: (1) it runs on plain Node.js, the same stack as the system under test, with no extra language setup required; (2) it records video natively per test file, giving automatic evidence with no extra effort; (3) Cypress's retry/assertion model (`should('not.exist')` with a timeout) fits well with the pattern used here — tests that **assert the correct behavior** and fail (turn red) when the real bug occurs, instead of writing assertions that "expect the bug"; (4) its synchronous API (`cy.request`) makes pure API testing (IDOR, login bypass) much easier without needing another tool. |
| **Postman** | Manual API testing / isolated reproduction | Complements Cypress for ad-hoc endpoint exploration and quickly demonstrating a specific bug, without running the whole suite. |
| **k6** | Load testing | Latency percentile metrics (p95/p99) on the patient-listing route, with 3 selectable scenarios: smoke (sanity check), load (standard, gradual ramp), and spike (abrupt burst). Stress/breakpoint/soak were deliberately left out — see [k6/load-test.js](../k6/load-test.js). |
| **VS Code + SQLite extension** | Direct database inspection | Needed for gray-box/white-box findings (e.g., BUG-001, plain-text password — only visible by querying the `users` table directly). |
| **Excel (Node script + `exceljs`)** | Bug log export | Additional format for sharing findings with stakeholders who prefer a spreadsheet over Markdown/HTML. |

### 6. Execution environment
- **Back-end:** Node.js + Express + better-sqlite3, single-file database (`data/medalert.db`), resettable at any time.
- **Test browser:** Electron/Chromium (via Cypress) — headless for batch runs, headed for evidence video recording.
- **Test data:** fixed seed (5 users: 2 patients, 2 nurses, 1 doctor) + accounts generated dynamically by the automated tests (random names, see `cypress/support/randomData.js`), always starting from a known reset.

### 7. Risks of the test plan itself
- **Dependency on resets between tests:** since several write bugs (BUG-018) alter real data (e.g., discharging a patient), the database must be reset after certain manual tests to avoid contaminating the next demonstration — this is documented in each relevant step-by-step.
- **Single-environment execution (local dev):** there is no separate staging/production environment to validate behavior before reporting it — every finding was confirmed directly in the development environment provided.

---

## Part 3 — Test Cases

Test case matrix organized by **scenario** and by **user role**, covering all three roles in the system (Patient, Nurse, Doctor). Each case corresponds to one automated test in the Cypress suite (see [README_EN.md](README_EN.md) for how to run it).

- **TC-XXX** = test case ID.
- **Status** reflects the result of the latest run (see the full report in [README_EN.md](README_EN.md)).
- When a case proves a bug, the **Bug** column references the corresponding ID in [BUGS_EN.md](BUGS_EN.md).

### Role: Patient

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-001 | Sign-up with valid data | Fill in valid name/email/password and submit | Account created, redirects to login screen | ✅ Passed | — |
| TC-002 | Sign-up with mismatched password and confirmation | Fill in password ≠ confirm password | Sign-up blocked, error message | ✅ Passed | — |
| TC-003 | Sign-up with an already-existing email | Use a seeded user's email | Sign-up blocked (`409`) | ✅ Passed | — |
| TC-004 | Sign-up with an invalid-TLD email | Email `a@a.123456` | Sign-up should be blocked | ❌ Failed (bug confirmed) | BUG-003 |
| TC-005 | Sign-up with emoji in name/email/password | Fill in all 3 fields with emoji | Sign-up should be blocked | ❌ Failed (bug confirmed) | BUG-004 |
| TC-006 | Sign-up with an XSS payload in the name | Name = `<img src=x onerror=...>` | The payload should not become a real element on screen | ❌ Failed (bug confirmed) | BUG-002 |
| TC-007 | Password storage after sign-up | Sign up and inspect the database | Password should be hashed | ❌ Failed (bug confirmed) | BUG-001 |
| TC-008 | Login with valid credentials | Select a seeded user + correct password | Login accepted, correct role dashboard shown | ✅ Passed | — |
| TC-009 | Login with an incorrect password | Select a user + wrong password (1 character) | Login should be rejected | ❌ Failed (bug confirmed) | BUG-005 |
| TC-010 | Patient list (normal view) | Log in as a patient, `GET /api/patients` | Returns only the patient's own data | ✅ Passed | — |
| TC-011 | Reading another patient's chart (IDOR) | Log in as Marina, `GET /api/patients/pac2` | Should return `403` | ❌ Failed (bug confirmed) | BUG-008 |
| TC-012 | Changing another patient's thresholds (IDOR) | Log in as Marina, `PUT /api/patients/pac2/thresholds` | Should return `403` | ❌ Failed (bug confirmed) | BUG-018 |
| TC-013 | Recording vital signs for another patient (IDOR) | Log in as Marina, `POST /api/patients/pac2/vitals` | Should return `403` | ❌ Failed (bug confirmed) | BUG-018 |
| TC-014 | Discharging another patient (IDOR) | Log in as Marina, `POST /api/patients/pac2/discharge` | Should return `403` | ❌ Failed (bug confirmed) | BUG-018 |

### Role: Anonymous (not authenticated)

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-015 | User directory with no login | `GET /api/auth/directory` with no session | Should return `401` | ❌ Failed (bug confirmed) | BUG-006 |
| TC-016 | Data reset with no login | `POST /api/admin/reset` with no session | Should return `401` | ❌ Failed (bug confirmed) | BUG-007 |

### Role: Nurse

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-017 | Recording normal vital signs | Record HR/SpO2/Temp/BP within normal range | No alert generated | ✅ Passed | — |
| TC-018 | HR exactly at the threshold (boundary value) | Record HR = 100 (threshold = 100) | Should generate an alert (rule is `>=`) | ❌ Failed (bug confirmed) | BUG-011 |
| TC-019 | Normal temperature in Fahrenheit | Record Temp. = 98 (°F) | Should not generate a fever alert | ❌ Failed (bug confirmed) | BUG-009 |
| TC-020 | Negative HR | Record HR = -50 | Should be blocked/rejected | ❌ Failed (bug confirmed) | BUG-010 |
| TC-021 | Duplicate record of the same out-of-range vital sign | Record the same out-of-range vital sign twice in a row | Should generate only 1 alert | ❌ Failed (bug confirmed) | BUG-012 |
| TC-022 | Automatic escalation of a critical alert | Critical alert pending for more than 15 min | Should turn into "Escalated" on its own | ❌ Failed (bug confirmed) | BUG-013 |
| TC-023 | Acknowledging the same alert twice | Click "Acknowledge" 2x on the same alert | Should block/warn on the 2nd click | ❌ Failed (bug confirmed) | BUG-014 |
| TC-024 | Acknowledge → Escalate → Acknowledge sequence | Apply the 3 actions in sequence on the same alert | Should not allow reverting status | ❌ Failed (bug confirmed) | BUG-015 |
| TC-025 | Pending-alert counter updates in real time | Generate an alert without switching patient/screen | Counter should update immediately | ❌ Failed (bug confirmed) | BUG-016 |
| TC-026 | Confirmation before acknowledging an alert | Click "Acknowledge" | Should ask for confirmation first | ❌ Failed (bug confirmed) | BUG-017 |

> Note: a test case about high diastolic pressure with no alert (`diastolic = 200`) was removed from this matrix. Initially considered a bug, it was reclassified as an **improvement suggestion** after confirming that the official challenge specification defines no alert rule for diastolic pressure (see [FEATURES_EN.md](FEATURES_EN.md), FEATURE-005). The corresponding automated test was also removed from the Cypress suite for the same reason.

### Role: Doctor

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-027 | Prescription with no patient selected | Open the Prescription tab with no patient selected | Tab should be locked (like "Overview") | ❌ Failed (bug confirmed) | BUG-019 |
| TC-028 | Confirmation before discharging | Click "Discharge patient" | Should ask for confirmation first | ❌ Failed (bug confirmed) | BUG-020 |
| TC-029 | Button visual feedback after discharge | Compare the button's color before/after discharge | Button should change appearance | ❌ Failed (bug confirmed) | BUG-021 |

### Summary by role

| Role | Cases | Passing | Failing (bugs confirmed) |
|---|---|---|---|
| Patient | 14 | 4 | 10 |
| Anonymous | 2 | 0 | 2 |
| Nurse | 10 | 1 | 9 |
| Doctor | 3 | 0 | 3 |
| **Total** | **29** | **6** (~21%) | **23** (~79%) |

> Note: the "failing" cases are the **expected and correct** result — each one automatedly and reproducibly documents a real bug in the system (see [BUGS_EN.md](BUGS_EN.md) for full details on each one). See the "red = confirmed bug" philosophy in Part 2 above.

---

## Part 4 — Feature Suggestions (not bugs)

> Unlike the bugs in Part 3: there's no defect here — it's missing behavior, or a design decision worth questioning. It doesn't count as a QA finding, but it's good to keep on record as a product/scope observation. See [OPEN_QUESTIONS.md](../OPEN_QUESTIONS.md) for the full context behind each one.

### FEATURE-001 — Reassigning patients between nurses/doctors
- **Current state:** every patient is permanently tied to the same nurse/doctor (set in the seed, or to the first one available in the database on self-registration). There's no screen or route to change it afterward.
- **Possible improvement:** a screen (doctor role, or an "administrator" role that doesn't exist yet) to reassign `nurse_id`/`doctor_id`, or auto-distribute by current lowest load instead of always falling back to the first one in the database.

### FEATURE-002 — Cancel patient discharge
- **Current state:** `POST /discharge` only sets the status to "discharged"; no route, button, or screen exists to reverse it.
- **Possible improvement:** a "Re-admit patient" button that reverts the status, plus a history of status changes (who discharged, when, whether reverted).

### FEATURE-003 — Letting the patient choose urgency when calling the nurse
- **Current state:** the single "Request assistance" button always generates an alert with a hardcoded "low" severity, with no option to choose.
- **Possible improvement:** 2-3 urgency options before confirming (e.g., "I need help" vs. "Emergency"), with a visual flag for nursing staff that the severity was self-declared by the patient, not measured.

### FEATURE-004 — Approval for self-registering as a doctor/nurse
- **Current state:** anyone can register as a doctor or nurse through the public sign-up form, with no approval or credential verification at all.
- **Possible improvement:** require administrator approval, a prior invitation, or verification of a professional license before the account becomes usable; free immediate self-registration would still make sense for the patient role only.
- *(Initially considered a bug — reclassified since there's no written rule requiring approval.)*

### FEATURE-005 — Alert rule for diastolic blood pressure
- **Current state:** the system collects diastolic pressure on every record, but never uses it in any alert calculation — no threshold column in the `patients` table, no field on the doctor's screen, no comparison in `checkThresholds()`.
- **Possible improvement:** add `dia_high`/`dia_low`, a threshold field on the doctor's screen, and the matching comparison — the same way it already exists for HR, SpO2, temperature, and systolic pressure.
- *(Initially considered a bug — reclassified because the official specification defines no rule at all for this field.)*
