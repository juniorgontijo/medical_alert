# MedAlert — Test Automation (Cypress)

> This is the English version of [README.md](README.md), prepared as a final deliverable. The Portuguese version remains the working copy; this one is a faithful translation, kept in sync manually.

This README explains how to run the automated suite and where to find the evidence (videos/screenshots) for each test. See also [BUGS_EN.md](BUGS_EN.md) (full bug log), [FEATURES_EN.md](FEATURES_EN.md) (feature suggestions), [PROJECT_BRIEF.md](PROJECT_BRIEF.md), [TEST_PLAN.md](TEST_PLAN.md), and [TEST_CASES.md](TEST_CASES.md).

## Prerequisites
- Node.js installed.
- Project dependencies installed: `npm install` (in the project root).

## 1. Start the system (MedAlert)
In one terminal, at the project root:
```bash
node server/index.js
```
The system is available at `http://localhost:3000`.

## 2. Run the Cypress suite
In **another** terminal (leave step 1's server running):
```bash
npx cypress run
```

This runs the **29 automated tests**, one per file, recording a video of each one.

> **Note (Windows/environments with `ELECTRON_RUN_AS_NODE`):** if the terminal has this environment variable set (common in some AI/CLI tool shells), Cypress won't open correctly. Run `unset ELECTRON_RUN_AS_NODE` before the command above in that case.

### Running a single test
```bash
npx cypress run --spec "cypress/e2e/<folder>/<file>.cy.js"
```
⚠️ **Warning:** Cypress wipes the entire `cypress/videos` folder before any run (the tool's default `trashAssetsBeforeRuns` behavior) — even when running a single test. If you already have all 29 videos generated and just want to check 1 test, run the full suite again afterward (`npx cypress run`, no `--spec`) to regenerate every video.

### Interactive mode (watch the tests run on screen)
```bash
npx cypress open
```

## What to expect from the result

The suite has **29 tests**: **6 pass** (proving correct flows actually work) and **23 fail on purpose** (each failure is the automated proof of a real bug, documented in [BUGS_EN.md](BUGS_EN.md)). This is the expected, correct result — the suite is not "broken". See the full philosophy in [TEST_PLAN.md](TEST_PLAN.md), "Entry and exit criteria" section.

## Adjusting the recording speed (optional)

Tests run with a configurable "slow motion" mode, to stay legible on video/in a presentation:
```bash
npx cypress run --env SLOWDOWN_MS=1200   # slower
npx cypress run --env SLOWDOWN_MS=0      # turn off slow motion
```
Configured in [cypress/support/e2e.js](cypress/support/e2e.js).

## Where the evidence lives
- **Videos:** `cypress/videos/<category>/<test>.cy.js.mp4` — one per test, across the 6 folders below.
- **Failure screenshots:** `cypress/screenshots/` (generated automatically by Cypress when a test fails).

## Suite structure

| Folder | Test count | Main role | Covers |
|---|---|---|---|
| `cypress/e2e/cadastro/` | 7 | Patient | User sign-up (valid and invalid) |
| `cypress/e2e/login/` | 4 | Patient/anonymous | Login and unauthenticated access |
| `cypress/e2e/pos-login-pacientes/` | 5 | Patient | Reading/writing patient data (IDOR) |
| `cypress/e2e/enfermagem-sinais-vitais/` | 5 | Nurse | Recording vitals and generating alerts |
| `cypress/e2e/gestao-alertas/` | 5 | Nurse | Acknowledging/escalating alerts |
| `cypress/e2e/medico/` | 3 | Doctor | Thresholds, prescription, patient discharge |

Full breakdown of each case in [TEST_CASES.md](TEST_CASES.md).

## Last execution report

```
Suite:      29 tests
Passing:    6
Failing:    23 (expected — each one proves a bug, see BUGS_EN.md)
Duration:   ~4min17s
Videos:     29/29 generated successfully in cypress/videos/
```

| Spec | Result |
|---|---|
| `cadastro/01-cadastro-valido.cy.js` | ✅ Passed |
| `cadastro/02-senha-diferente.cy.js` | ✅ Passed |
| `cadastro/03-email-duplicado.cy.js` | ✅ Passed |
| `cadastro/04-bug-003-email-tld-invalido.cy.js` | ❌ Failed (BUG-003) |
| `cadastro/05-bug-004-emoji.cy.js` | ❌ Failed (BUG-004) |
| `cadastro/06-bug-002-xss.cy.js` | ❌ Failed (BUG-002) |
| `cadastro/07-bug-001-senha-texto-plano.cy.js` | ❌ Failed (BUG-001) |
| `login/01-login-valido.cy.js` | ✅ Passed |
| `login/02-bug-005-senha-incorreta.cy.js` | ❌ Failed (BUG-005) |
| `login/03-bug-006-diretorio-publico.cy.js` | ❌ Failed (BUG-006) |
| `login/04-bug-007-reset-sem-auth.cy.js` | ❌ Failed (BUG-007) |
| `pos-login-pacientes/01-lista-normal.cy.js` | ✅ Passed |
| `pos-login-pacientes/02-bug-008-idor-leitura.cy.js` | ❌ Failed (BUG-008) |
| `pos-login-pacientes/03-bug-018-idor-thresholds.cy.js` | ❌ Failed (BUG-018) |
| `pos-login-pacientes/04-bug-018-idor-vitals.cy.js` | ❌ Failed (BUG-018) |
| `pos-login-pacientes/05-bug-018-idor-discharge.cy.js` | ❌ Failed (BUG-018) |
| `enfermagem-sinais-vitais/01-sinais-normais.cy.js` | ✅ Passed |
| `enfermagem-sinais-vitais/02-bug-011-limite-fc.cy.js` | ❌ Failed (BUG-011) |
| `enfermagem-sinais-vitais/03-bug-009-temperatura.cy.js` | ❌ Failed (BUG-009) |
| `enfermagem-sinais-vitais/04-bug-010-fc-negativa.cy.js` | ❌ Failed (BUG-010) |
| `enfermagem-sinais-vitais/05-bug-012-duplicados.cy.js` | ❌ Failed (BUG-012) |
| `gestao-alertas/01-bug-013-escalonamento.cy.js` | ❌ Failed (BUG-013) |
| `gestao-alertas/02-bug-014-reconhecer-2x.cy.js` | ❌ Failed (BUG-014) |
| `gestao-alertas/03-bug-015-fluxo-inconsistente.cy.js` | ❌ Failed (BUG-015) |
| `gestao-alertas/04-bug-016-contador.cy.js` | ❌ Failed (BUG-016) |
| `gestao-alertas/05-bug-017-confirmacao-reconhecer.cy.js` | ❌ Failed (BUG-017) |
| `medico/01-bug-019-prescricao-sem-paciente.cy.js` | ❌ Failed (BUG-019) |
| `medico/02-bug-020-alta-sem-confirmacao.cy.js` | ❌ Failed (BUG-020) |
| `medico/03-bug-021-botao-sem-feedback.cy.js` | ❌ Failed (BUG-021) |

## CI/CD (GitHub Actions)

The [.github/workflows/cypress.yml](.github/workflows/cypress.yml) workflow runs the suite automatically on every push/PR to `main`, split into 2 jobs:
- **`happy-path`** — runs only the 6 tests that should pass. This is the only job that gates the pipeline (a red check here means something actually broke).
- **`bug-suite`** — runs the other 23 bug-proving tests. Configured with `continue-on-error`, so it can fail freely without bringing the pipeline down — every failure here is the expected result, not an infrastructure error. Videos/screenshots are uploaded as an artifact of that run, under Actions.

## Other tools in the project
- **Postman:** [MedAlert_EN.postman_collection.json](MedAlert_EN.postman_collection.json) (or [MedAlert.postman_collection.json](MedAlert.postman_collection.json) in Portuguese) — import into Postman to test the routes manually.
- **k6 (load test):**
  ```bash
  k6 run k6/load-test.js
  ```
- **Excel:** `BUGS.xlsx` — the same content as BUGS.md, in spreadsheet form.
- **Interactive site:** published bug log with filtering, search, and evidence upload (link shared separately).
