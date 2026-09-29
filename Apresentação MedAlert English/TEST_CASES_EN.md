# MedAlert — Test Cases

> This is the English version of [TEST_CASES.md](../TEST_CASES.md), prepared as a final deliverable. The Portuguese version remains the working copy; this one is a faithful translation, kept in sync manually.

Test case matrix organized by **scenario** and by **user role**, covering all three roles in the system (Patient, Nurse, Doctor). Each case corresponds to one automated test in the Cypress suite (see [README_EN.md](README_EN.md) for how to run it).

- **TC-XXX** = test case ID.
- **Status** reflects the result of the latest run (see the full report in [README_EN.md](README_EN.md)).
- When a case proves a bug, the **Bug** column references the corresponding ID in [BUGS_EN.md](BUGS_EN.md).

---

## Role: Patient

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

## Role: Anonymous (not authenticated)

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-015 | User directory with no login | `GET /api/auth/directory` with no session | Should return `401` | ❌ Failed (bug confirmed) | BUG-006 |
| TC-016 | Data reset with no login | `POST /api/admin/reset` with no session | Should return `401` | ❌ Failed (bug confirmed) | BUG-007 |

## Role: Nurse

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

## Role: Doctor

| TC | Scenario | Steps (summary) | Expected result | Status | Bug |
|---|---|---|---|---|---|
| TC-027 | Prescription with no patient selected | Open the Prescription tab with no patient selected | Tab should be locked (like "Overview") | ❌ Failed (bug confirmed) | BUG-019 |
| TC-028 | Confirmation before discharging | Click "Discharge patient" | Should ask for confirmation first | ❌ Failed (bug confirmed) | BUG-020 |
| TC-029 | Button visual feedback after discharge | Compare the button's color before/after discharge | Button should change appearance | ❌ Failed (bug confirmed) | BUG-021 |

---

## Summary by role

| Role | Cases | Passing | Failing (bugs confirmed) |
|---|---|---|---|
| Patient | 14 | 4 | 10 |
| Anonymous | 2 | 0 | 2 |
| Nurse | 10 | 1 | 9 |
| Doctor | 3 | 0 | 3 |
| **Total** | **29** | **6** (~21%) | **23** (~79%) |

> Note: the "failing" cases are the **expected and correct** result — each one automatedly and reproducibly documents a real bug in the system (see [BUGS_EN.md](BUGS_EN.md) for full details on each one). See the "red = confirmed bug" philosophy in [TEST_PLAN_EN.md](TEST_PLAN_EN.md).
