# MedAlert — Presentation Guide (run of show)

> Speaker notes for the final presentation (challenge section 4.5, 15–20 min). Not a graded deliverable on its own — content mirrors [SUMMARY_EN.md](SUMMARY_EN.md). There is also an interactive version with a live timer and auto-highlighted current segment, meant to run on a second monitor while presenting: [site/presenter-guide.html](<../site/presenter-guide.html>) (published: https://claude.ai/artifact/E1Ji7mYqyguiAVZf516eeK).

Scripted length: **17:00**, inside the 15–20 min target — leaves buffer for questions asked mid-talk, which the challenge doc says to expect.

## Run of show

**0:00–0:30 — Open: frame the four questions**
> "I'll cover what I found, how I prioritized it, what I automated and why, and what I'd recommend before production."

**0:30–2:00 — System & scope**
- Hospital alert system, 3 roles: patient / nurse / doctor.
- Tested: sign-up & login, vitals → alerts, alert lifecycle, medical actions, access control (IDOR), API load (k6).
- Out of scope, one line each: accessibility, cross-browser, MFA/password recovery (don't exist), admin role (doesn't exist).
- *Show: SUMMARY_EN.md on the primary screen.*

**2:00–4:00 — Strategy & prioritization**
- Three methods combined: exploratory testing + source-code review (catches dead code) + Cypress automation (repeatable, video evidence).
- Severity = business/clinical impact, not how often a screen is used.

| Severity | Criterion |
|---|---|
| Critical | Sensitive data exposed/alterable by anyone; broken auth |
| High | Business rule broken, direct clinical risk or data loss |
| Medium | Incorrect rule, no immediate direct risk |
| Low | UX/visual only |

- *Mention the BUG-013 exception: High severity, but fixed before some Critical sign-up bugs, because it's a silent patient-safety gap.*

**4:00–9:00 — What I found: top 5 risks**
1. **[Critical]** BUG-008 / BUG-018 — any logged-in user reads or edits any patient's chart, including private medical notes.
2. **[Critical]** BUG-001 / BUG-005 — plain-text password + login bypass; authentication is effectively not enforced.
3. **[High]** BUG-020 / BUG-017 — no confirmation on irreversible actions (discharge, alert acknowledgment); no undo anywhere.
4. **[High]** BUG-013 — dead automatic-escalation rule; a critical alert can sit unattended forever.
5. **[High]** BUG-009 — °F/°C mismatch; false fever alerts on every normal reading, risk of alert fatigue.
- *If time allows: live-demo BUG-008 — log in as Marina, open `/api/patients/pac2`, show it returns data instead of `403`.*

**9:00–13:00 — Automation: what & why**
- Cypress: native video per test, retry/assert model fits "assert correct behavior, go red on the real bug," synchronous API great for pure API/IDOR tests.
- 29 tests total — 6 pass (proves good flows work), 23 fail on purpose (each failure IS the proof of a bug).
- Required coverage named explicitly: boundary case (TC-018, HR exactly at threshold 100) and access control (TC-011, IDOR read).
- *Run the suite live, or play the recorded execution video if a live run is too risky on the day.*

**13:00–14:30 — Improvement suggestions (not bugs)**
- No written rule was broken — just behavior worth adding. Kept separate from the bug log.
  - FEATURE-001 — reassigning patients between nurses/doctors; no screen exists today.
  - FEATURE-002 — cancel a patient discharge; there's no undo or status history.
  - FEATURE-003 — let the patient pick urgency when calling a nurse, instead of a hardcoded "low" severity.
  - FEATURE-004 — require approval before a self-registered doctor/nurse account becomes usable.
  - FEATURE-005 — add a real alert rule for diastolic blood pressure, collected today but never evaluated.
- *"These five are logged as improvement cards, not QA findings — backlog material for product, not defects."*

**14:30–16:30 — Recommendation before production**
- Do not ship with the 2 Critical IDOR bugs and the password/login-bypass pair still open — together they compromise every patient's data and the entire auth model.
- Treat BUG-013 as equally urgent despite its "High" label — it's a silent patient-safety gap.
- Medium/Low findings can follow in a fast-follow release.
- *Close with one sentence: "Not production-ready today — but close, with a short, specific fix list."*

**16:30–17:00 — Close & invite questions**
- Thank the panel, invite technical questions — they may already have interrupted earlier, that's expected.

## Likely technical questions

**"BUG-013 causes real patient-safety risk — why is it 'High', not 'Critical'?"**
Severity is set by the rule violated (data exposure / auth = Critical by definition). Fix order overrides severity: BUG-013 jumps ahead of some Critical sign-up bugs because it's a silent failure, not because its severity label changed.

**"Why Cypress, not Playwright or Selenium?"**
Same Node.js stack as the app, native per-test video (evidence for free), retry/assertion model fits "assert correct behavior, go red on the real bug," synchronous `cy.request` for pure API/IDOR checks.

**"How did you decide bug vs. feature suggestion?"**
Bug = an explicit rule is violated. No written rule = feature suggestion, logged separately. Example: BUG-003 candidate → reclassified as FEATURE-004; diastolic pressure → FEATURE-005, once confirmed the spec defines no rule for it.

**"What would you test next with more time?"**
Accessibility, Firefox/Safari, k6 stress/soak scenarios, and the diastolic-pressure alert rule once product confirms it's in scope.

## Before you start
- [ ] This guide (or the [interactive version](<../site/presenter-guide.html>)) open on the second monitor.
- [ ] Primary screen: app at `localhost:3000`, data freshly reset (`npm run reset-db`).
- [ ] Browser tab ready for the BUG-008 IDOR demo (Marina session, patient `pac2` URL).
- [ ] SUMMARY_EN.md and BUGS_EN.md open in another tab as backup.
- [ ] Cypress run recording ready in case a live run is too risky on the day.
