# MedAlert — Automação de Testes (Cypress)

> Versão em inglês: [README_EN.md](README_EN.md).

Este README explica como rodar a suíte automatizada e onde encontrar as evidências (vídeos/prints) de cada teste. Ver também [BUGS.md](BUGS.md) (log completo de bugs), [FEATURES.md](FEATURES.md) (sugestões de feature), [PROJECT_BRIEF.md](PROJECT_BRIEF.md), [TEST_PLAN.md](TEST_PLAN.md) e [TEST_CASES.md](TEST_CASES.md).

## Pré-requisitos
- Node.js instalado.
- Dependências do projeto instaladas: `npm install` (na raiz do projeto).

## 1. Subir o sistema (MedAlert)
Em um terminal, na raiz do projeto:
```bash
node server/index.js
```
O sistema fica disponível em `http://localhost:3000`.

## 2. Rodar a suíte Cypress
Em **outro** terminal (deixe o servidor do passo 1 rodando):
```bash
npx cypress run
```

Isso executa os **29 testes automatizados**, um por arquivo, e grava um vídeo de cada um.

> **Nota (Windows/ambiente com `ELECTRON_RUN_AS_NODE`):** se o terminal tiver essa variável de ambiente setada (comum em alguns shells de ferramentas de IA/CLI), o Cypress não abre corretamente. Rode `unset ELECTRON_RUN_AS_NODE` antes do comando acima nesses casos.

### Rodar só um teste específico
```bash
npx cypress run --spec "cypress/e2e/<pasta>/<arquivo>.cy.js"
```
⚠️ **Atenção:** o Cypress apaga a pasta `cypress/videos` inteira antes de qualquer execução (padrão da ferramenta, `trashAssetsBeforeRuns`) — mesmo rodando um teste só. Se você já tem os 29 vídeos gerados e só quer conferir 1 teste, rode a suíte completa de novo depois (`npx cypress run`, sem `--spec`) pra repor todos os vídeos.

### Modo interativo (ver os testes rodando na tela)
```bash
npx cypress open
```

## O que esperar do resultado

A suíte tem **29 testes**: **6 passam** (comprovam que fluxos corretos funcionam) e **23 falham de propósito** (cada falha é a prova automatizada de um bug real, documentado em [BUGS.md](BUGS.md)). Isso é o resultado esperado e correto — não é a suíte "quebrada". Ver a filosofia completa no [TEST_PLAN.md](TEST_PLAN.md), seção "Critérios de entrada e saída".

## Ajustando a velocidade da gravação (opcional)

Os testes rodam com uma "câmera lenta" configurável, pra ficar visível em vídeo/apresentação:
```bash
npx cypress run --env SLOWDOWN_MS=1200   # mais devagar
npx cypress run --env SLOWDOWN_MS=0      # desliga a câmera lenta
```
Configuração em [cypress/support/e2e.js](cypress/support/e2e.js).

## Onde ficam as evidências
- **Vídeos:** `cypress/videos/<categoria>/<teste>.cy.js.mp4` — um por teste, nas 6 pastas abaixo.
- **Prints de falha:** `cypress/screenshots/` (gerados automaticamente pelo Cypress quando um teste falha).

## Estrutura da suíte

| Pasta | Qtd. testes | Perfil principal | Cobre |
|---|---|---|---|
| `cypress/e2e/cadastro/` | 7 | Paciente | Cadastro de usuário (válido e inválido) |
| `cypress/e2e/login/` | 4 | Paciente/anônimo | Login e acesso não autenticado |
| `cypress/e2e/pos-login-pacientes/` | 5 | Paciente | Leitura/escrita de dados de pacientes (IDOR) |
| `cypress/e2e/enfermagem-sinais-vitais/` | 5 | Enfermeiro(a) | Registro de sinais vitais e geração de alertas |
| `cypress/e2e/gestao-alertas/` | 5 | Enfermeiro(a) | Reconhecer/escalonar alertas |
| `cypress/e2e/medico/` | 3 | Médico(a) | Limiares, prescrição, alta de paciente |

Detalhamento de cada caso em [TEST_CASES.md](TEST_CASES.md).

## Relatório da última execução

```
Suíte:      29 testes
Passando:   6
Falhando:   23 (esperado — cada um prova um bug, ver BUGS.md)
Duração:    ~4min17s
Vídeos:     29/29 gerados com sucesso em cypress/videos/
```

| Spec | Resultado |
|---|---|
| `cadastro/01-cadastro-valido.cy.js` | ✅ Passou |
| `cadastro/02-senha-diferente.cy.js` | ✅ Passou |
| `cadastro/03-email-duplicado.cy.js` | ✅ Passou |
| `cadastro/04-bug-003-email-tld-invalido.cy.js` | ❌ Falhou (BUG-003) |
| `cadastro/05-bug-004-emoji.cy.js` | ❌ Falhou (BUG-004) |
| `cadastro/06-bug-002-xss.cy.js` | ❌ Falhou (BUG-002) |
| `cadastro/07-bug-001-senha-texto-plano.cy.js` | ❌ Falhou (BUG-001) |
| `login/01-login-valido.cy.js` | ✅ Passou |
| `login/02-bug-005-senha-incorreta.cy.js` | ❌ Falhou (BUG-005) |
| `login/03-bug-006-diretorio-publico.cy.js` | ❌ Falhou (BUG-006) |
| `login/04-bug-007-reset-sem-auth.cy.js` | ❌ Falhou (BUG-007) |
| `pos-login-pacientes/01-lista-normal.cy.js` | ✅ Passou |
| `pos-login-pacientes/02-bug-008-idor-leitura.cy.js` | ❌ Falhou (BUG-008) |
| `pos-login-pacientes/03-bug-018-idor-thresholds.cy.js` | ❌ Falhou (BUG-018) |
| `pos-login-pacientes/04-bug-018-idor-vitals.cy.js` | ❌ Falhou (BUG-018) |
| `pos-login-pacientes/05-bug-018-idor-discharge.cy.js` | ❌ Falhou (BUG-018) |
| `enfermagem-sinais-vitais/01-sinais-normais.cy.js` | ✅ Passou |
| `enfermagem-sinais-vitais/02-bug-011-limite-fc.cy.js` | ❌ Falhou (BUG-011) |
| `enfermagem-sinais-vitais/03-bug-009-temperatura.cy.js` | ❌ Falhou (BUG-009) |
| `enfermagem-sinais-vitais/04-bug-010-fc-negativa.cy.js` | ❌ Falhou (BUG-010) |
| `enfermagem-sinais-vitais/05-bug-012-duplicados.cy.js` | ❌ Falhou (BUG-012) |
| `gestao-alertas/01-bug-013-escalonamento.cy.js` | ❌ Falhou (BUG-013) |
| `gestao-alertas/02-bug-014-reconhecer-2x.cy.js` | ❌ Falhou (BUG-014) |
| `gestao-alertas/03-bug-015-fluxo-inconsistente.cy.js` | ❌ Falhou (BUG-015) |
| `gestao-alertas/04-bug-016-contador.cy.js` | ❌ Falhou (BUG-016) |
| `gestao-alertas/05-bug-017-confirmacao-reconhecer.cy.js` | ❌ Falhou (BUG-017) |
| `medico/01-bug-019-prescricao-sem-paciente.cy.js` | ❌ Falhou (BUG-019) |
| `medico/02-bug-020-alta-sem-confirmacao.cy.js` | ❌ Falhou (BUG-020) |
| `medico/03-bug-021-botao-sem-feedback.cy.js` | ❌ Falhou (BUG-021) |

## CI/CD (GitHub Actions)

O workflow [.github/workflows/cypress.yml](.github/workflows/cypress.yml) roda a suíte automaticamente a cada push/PR na branch `main`, dividida em 2 jobs:
- **`happy-path`** — roda só os 6 testes que devem passar. É o único que trava o pipeline (vermelho aqui = algo realmente quebrou).
- **`bug-suite`** — roda os outros 23 testes que provam bug. Configurado com `continue-on-error`, então pode falhar à vontade sem derrubar o pipeline — cada falha aqui é o resultado esperado, não um erro de infraestrutura. Os vídeos/prints ficam disponíveis como artifact do próprio run, em Actions.

## Outras ferramentas do projeto
- **Postman:** [MedAlert.postman_collection.json](MedAlert.postman_collection.json) (ou [MedAlert_EN.postman_collection.json](MedAlert_EN.postman_collection.json) em inglês) — importar no Postman pra testar as rotas manualmente.
- **k6 (teste de carga):**
  ```bash
  k6 run k6/load-test.js                        # load (padrão) — carga gradual, uso normal
  k6 run --env SCENARIO=smoke k6/load-test.js   # smoke — 1 usuário, 30s, só confirma que funciona
  k6 run --env SCENARIO=spike k6/load-test.js   # spike — pico abrupto de 100 usuários
  ```
  Cenários stress/breakpoint/soak existem no k6 mas foram deixados de fora de propósito (risco de derrubar o servidor local da apresentação, ou exigem horas de execução) — ver comentário no topo de [k6/load-test.js](k6/load-test.js).

  #### O que é p95/p99 (e por que não usar só a média)

  Cada requisição feita ao servidor tem um tempo de resposta diferente — a maioria rápida, algumas mais lentas. **Percentil 95 (p95)** responde à pergunta "das minhas requisições, 95% delas responderam em até quanto tempo?" — ou seja, só as **5% mais lentas** (o pior caso) ficam de fora dessa conta. **p99** é a mesma ideia, só que mais rigorosa: só o **1% mais lento** fica de fora.

  Por que não usar a média? Porque a média **esconde** os casos ruins. Exemplo: se 99 usuários são atendidos em 50ms e só 1 demora 10 segundos, a média ainda dá um número baixinho e "bonito" — mas aquele usuário teve uma experiência péssima, e a média nunca conta essa história. O percentil mostra exatamente o que a maioria (ou quase todo mundo) sentiu de verdade, incluindo o pior caso relevante.

  #### Última execução — os 3 cenários

  | Cenário | Usuários simultâneos | Duração | Requisições | Erros | p95 (meta) | p99 (meta) | Resultado |
  |---|---|---|---|---|---|---|---|
  | **smoke** | 1 (fixo) | 30s | 122 | 0,00% | 0,66ms (<500ms) | — | ✅ Thresholds passaram |
  | **load** | 0 → 10 → pico de 30 → 0 | 1m20s | 5.230 | 0,00% | 1,03ms (<500ms) | 1,17ms (<1000ms) | ✅ Thresholds passaram |
  | **spike** | 5 → pico abrupto de 100 → 5 → 0 | 40s | 8.442 | 0,00% | 1,03ms (<800ms) | 1,19ms (<2000ms) | ✅ Thresholds passaram |

  **Leitura do resultado:** os 3 cenários fecharam com **0% de erro** e latência bem abaixo da meta em todos os casos — inclusive no `spike`, onde o sistema levou um salto abrupto de 5 pra 100 usuários simultâneos e continuou respondendo em ~1ms, sem timeout nem falha. Pra esse sistema, o gargalo de performance não parece ser um risco real — os problemas sérios encontrados no projeto são de segurança e regra de negócio (ver [BUGS.md](BUGS.md)), não de capacidade sob carga.
- **Excel:** `BUGS.xlsx` — mesmo conteúdo do BUGS.md, em formato planilha.
- **Site interativo:** log de bugs publicado com filtro, busca e upload de evidência (link compartilhado separadamente).
