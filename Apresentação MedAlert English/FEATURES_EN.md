# MedAlert — Feature Suggestions (not bugs)

> This is the English version of [FEATURES.md](../FEATURES.md), prepared as a final deliverable. The Portuguese version remains the working copy; this one is a faithful translation, kept in sync manually.
>
> Unlike [BUGS.md](../BUGS.md) / [BUGS_EN.md](BUGS_EN.md): there's no defect here — it's missing behavior, or a design decision worth questioning. It doesn't count as a QA finding in the presentation, but it's good to keep it on record as a product/scope observation. See [OPEN_QUESTIONS.md](../OPEN_QUESTIONS.md) / [OPEN_QUESTIONS_EN.md](../OPEN_QUESTIONS_EN.md) for the full context behind each one.

---

## FEATURE-001 — Reassigning patients between nurses/doctors
- **Current state:** every patient is permanently tied to the same nurse/doctor (set in the seed, or to the first one available in the database on self-registration). There's no screen or route to change it afterward.
- **Possible improvement:** a screen (doctor role, or an "administrator" role that doesn't exist yet) to reassign `nurse_id`/`doctor_id`, or auto-distribute by current lowest load instead of always falling back to the first one in the database.

## FEATURE-002 — Cancel patient discharge
- **Current state:** `POST /discharge` only sets the status to "discharged"; no route, button, or screen exists to reverse it.
- **Possible improvement:** a "Re-admit patient" button that reverts the status, plus a history of status changes (who discharged, when, whether reverted).

## FEATURE-003 — Letting the patient choose urgency when calling the nurse
- **Current state:** the single "Request assistance" button always generates an alert with a hardcoded "low" severity, with no option to choose.
- **Possible improvement:** 2-3 urgency options before confirming (e.g., "I need help" vs. "Emergency"), with a visual flag for nursing staff that the severity was self-declared by the patient, not measured.

## FEATURE-004 — Approval for self-registering as a doctor(a)/nurse
- **Current state:** anyone can register as a doctor or nurse through the public sign-up form, with no approval or credential verification at all.
- **Possible improvement:** require administrator approval, a prior invitation, or verification of a professional license before the account becomes usable; free immediate self-registration would still make sense for the patient role only.
- *(Initially considered a bug — reclassified since there's no written rule requiring approval.)*

## FEATURE-005 — Alert rule for diastolic blood pressure
- **Current state:** the system collects diastolic pressure on every record, but never uses it in any alert calculation — no threshold column in the `patients` table, no field on the doctor's screen, no comparison in `checkThresholds()`.
- **Possible improvement:** add `dia_high`/`dia_low`, a threshold field on the doctor's screen, and the matching comparison — the same way it already exists for HR, SpO2, temperature, and systolic pressure.
- *(Initially considered a bug — reclassified because the official specification defines no rule at all for this field.)*
