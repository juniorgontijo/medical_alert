# MedAlert — QA Summary (English)

> One-page condensed version, combining [PROJECT_BRIEF_EN.md](PROJECT_BRIEF_EN.md), [TEST_PLAN_EN.md](TEST_PLAN_EN.md), and [TEST_CASES_EN.md](TEST_CASES_EN.md), for presentation purposes. This does **not** replace those three files — they remain the formal deliverables for sections 4.1/4.2/4.3 of the challenge. Full bug details: [BUGS_EN.md](BUGS_EN.md).

## System & scope

MedAlert is a hospital alert management system (Node.js/Express + SQLite) with three roles: **patient** (views own vitals/history, requests nursing), **nurse** (records vitals, acknowledges/escalates alerts), **doctor** (sets thresholds, prescribes, discharges). Tested: full sign-up/login for all 3 roles, vital-sign recording and alert generation, alert management (manual + automatic escalation), medical actions, access control (IDOR), and API load (k6).

**Out of scope:** accessibility, cross-browser (Chromium/Electron only), front-end rendering performance, MFA/password recovery (don't exist), "admin" role (doesn't exist).

## Strategy

Black-box exploratory testing + source-code review (for root-cause and dead-code findings, e.g. BUG-013) + Cypress automation for reproducible, video-backed evidence. Severity reflects **business/clinical impact**, not screen usage frequency:

| Severity | Meaning | Fix order |
|---|---|---|
| Critical | Sensitive data exposed/alterable by anyone; broken authentication | 1st |
| High | Business rule broken, direct clinical risk or data loss | 2nd |
| Medium | Incorrect rule, no immediate direct risk | 3rd |
| Low | UX/visual only | 4th |

## Results

| Role | Cases | Passed | Failed (= bugs confirmed) |
|---|---|---|---|
| Patient | 14 | 4 | 10 |
| Anonymous | 2 | 0 | 2 |
| Nurse | 10 | 1 | 9 |
| Doctor | 3 | 0 | 3 |
| **Total** | **29** | **6** | **23** |

**Top 5 business risks:**
1. **Critical IDOR** (BUG-008, BUG-018) — any logged-in user reads/edits any patient's chart, including private medical notes.
2. **Plain-text password + login bypass** (BUG-001, BUG-005) — authentication is effectively not enforced.
3. **No confirmation on irreversible actions** — discharge (BUG-020), alert acknowledgment (BUG-017); no undo anywhere.
4. **Dead automatic-escalation rule** (BUG-013) — a critical alert can sit unattended forever; direct patient-safety risk.
5. **°F/°C mismatch** (BUG-009) — false fever alerts on every normal reading; risk of alert fatigue.

## Automation

**Cypress**, chosen for native video evidence per test, a retry/assertion model that fits "tests assert correct behavior and turn red on a real bug," and a synchronous API well suited to pure API/IDOR testing. Required coverage confirmed:
- **Boundary case:** TC-018 — HR exactly at threshold (100), rule is `>=` but doesn't fire (BUG-011).
- **Access control:** TC-011 — patient reads another patient's chart via `GET /api/patients/pac2`, expects `403`, gets the data (BUG-008).

Full matrix: [TEST_CASES_EN.md](TEST_CASES_EN.md). How to run the suite: [README_EN.md](README_EN.md).

## Recommendation before production

**Do not ship** with the 2 Critical IDOR bugs and the plain-text-password/login-bypass pair open — these alone compromise every patient's clinical data and the entire authentication model. BUG-013 (dead escalation rule) should be treated as equally urgent despite its "High" label, since it's a silent patient-safety gap. Medium/Low findings can follow in a fast-follow release.

## Improvement suggestions

A handful of findings weren't bugs — no written rule was being broken, just missing behavior worth having (e.g., no "undo," no alert rule for diastolic pressure). These are tracked separately as **improvement cards** in the system, not as QA defects — see [FEATURES_EN.md](FEATURES_EN.md) for the full list.
