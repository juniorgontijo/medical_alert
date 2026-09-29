# MedAlert — Project Brief

> This is the English version of [PROJECT_BRIEF.md](../PROJECT_BRIEF.md), prepared as a final deliverable. The Portuguese version remains the working copy; this one is a faithful translation, kept in sync manually.

## System summary
MedAlert is a hospital alert management system (Node.js/Express + SQLite), with three user roles: **patient**, **nurse**, and **doctor**. The system covers: user sign-up/login, recording of vital signs by nursing staff, automatic alert generation based on configurable clinical thresholds, alert acknowledgment/escalation, and medical actions (setting thresholds, prescribing medication, discharging patients).

## Personas tested
- **Patient** — views their own vital signs and history; requests nursing assistance.
- **Nurse** — records vital signs for the patients under their responsibility; acknowledges and escalates alerts.
- **Doctor** — sets alert thresholds per patient; records prescriptions; discharges patients.

## Scope tested
- Full sign-up and login flow, for all 3 roles.
- Recording of vital signs and alert generation (business rules and boundary values).
- Alert management: acknowledgment, manual escalation, automatic time-based escalation.
- Medical actions: thresholds, prescriptions, patient discharge.
- Access control between patients and between roles (IDOR — read and write).
- Load testing (k6) on the patient-listing route.

## Assumptions made
- Local test environment (`localhost:3000`), no HTTPS, no multi-hospital/tenant support — tested as a single instance.
- Seeded data represents the system's valid initial state after every reset (`POST /api/admin/reset`), used as a known starting point before each scenario.
- Source-code review was treated as a valid technique in this context (not black-box testing alone), since the goal is full pre-production validation, not just acceptance testing — this decision is documented and justified in the Test Plan (black-box/gray-box/white-box methodology).
- A finding was only classified as a **bug** when an objective rule was being violated (explicit behavior in the code, or an unambiguous business expectation). When that basis didn't exist — for example, the total absence of a business rule, rather than the breaking of an existing one — the finding was logged as an **improvement suggestion** (see FEATURES.md) instead of a bug. This distinction was validated case by case during the work (e.g., BUG-003 was originally considered, then reclassified as FEATURE-004 for lack of a written rule; the same happened with diastolic pressure, reclassified as FEATURE-005 after confirming, in the official specification, that no alert rule exists for that field).

## Out of scope (and why)
- **Accessibility (a11y)** — not part of the defined scope for this round; noted as a recommendation for a future iteration.
- **Cross-browser compatibility** — tested only in Chromium/Electron (via Cypress); Firefox and Safari were not validated, due to time constraints.
- **Front-end rendering performance** (Core Web Vitals, etc.) — k6 covered API load, not UI rendering performance.
- **Multi-factor authentication / password recovery** — features that don't exist in the current system, so there's nothing to test.
- **"Administrator" role** — doesn't exist in the system today; mentioned only as a future suggestion in FEATURES.md (FEATURE-001).

## Business risks identified
1. **Sensitive data exposed with no access control** (BUG-008, BUG-018 — critical IDOR): any authenticated user can read and alter any patient's chart, including private medical notes.
2. **Plain-text password** (BUG-001) combined with **login with no real password validation** (BUG-005): critical on their own, together they compromise authentication for the entire system.
3. **Irreversible actions with no confirmation**: patient discharge (BUG-020) and alert acknowledgment (BUG-017) require no confirmation, and there's no "undo" feature anywhere in the system (see FEATURES.md, FEATURE-002).
4. **Critical clinical rule that never runs**: automatic escalation of critical alerts (BUG-013) is dead code — a critical alert can remain pending indefinitely with no human intervention, which is a direct risk to patient safety.
5. **Unit-of-measure inconsistency** (BUG-009, °F vs. °C): generates false fever alerts on every normal reading — a direct clinical risk, and potentially alert fatigue (the team starting to ignore alerts due to excessive false positives).
