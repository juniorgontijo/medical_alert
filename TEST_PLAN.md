# MedAlert — Plano de Testes (Test Plan)

## 1. Estratégia e escopo

O trabalho combinou três frentes: **teste exploratório manual** (guiado por hipóteses de risco — autenticação, controle de acesso, regras de negócio baseadas em tempo), **revisão de código-fonte** (pra confirmar causa raiz e achar bugs que não aparecem só clicando na tela, como código morto) e **automação** (Cypress, pra deixar os achados reproduzíveis e prover evidência em vídeo). Ver "O que já foi testado" no Project Brief para o detalhamento de escopo dentro/fora.

## 2. Priorização baseada em risco

A severidade de cada achado (Crítica / Alta / Média / Baixa) reflete **impacto de negócio e risco clínico**, não frequência de uso da tela:

| Severidade | Critério | Exemplos |
|---|---|---|
| **Crítica** | Dado sensível exposto/alterável por qualquer um; falha de autenticação | BUG-001, BUG-002, BUG-005, BUG-008, BUG-018 |
| **Alta** | Regra de negócio quebrada com risco clínico direto ou perda de dado | BUG-009, BUG-013, BUG-019 |
| **Média** | Regra de negócio incorreta, sem risco direto imediato | BUG-003, BUG-004, BUG-011, BUG-012, BUG-014, BUG-015 |
| **Baixa** | UX/visual, sem impacto funcional | BUG-016, BUG-017, BUG-020, BUG-021 |

**Ordem de correção recomendada:** Crítica → Alta → Média → Baixa, com uma ressalva: **BUG-013** (Alta) deveria ser corrigido antes de alguns itens Críticos de cadastro, porque é uma falha *silenciosa* em uma regra clínica de segurança do paciente (alerta crítico que nunca escalona sozinho) — o risco de dano real é mais direto do que, por exemplo, um XSS que depende de alguém se autocadastrar com payload malicioso.

## 3. Tipos de teste cobertos

| Tipo | Exemplos |
|---|---|
| **Funcional** | Fluxos principais dos 3 perfis, validações de formulário de cadastro/sinais vitais |
| **Negativo / valor-limite (boundary)** | BUG-011 (FC exatamente no limiar, `>` vs. `>=`) |
| **Controle de acesso** | BUG-008/BUG-018 (IDOR leitura/escrita), BUG-005 (bypass de login) |
| **Regra de negócio baseada em tempo** | BUG-013 (escalonamento automático de alertas críticos após 15 min) |
| **Carga** | k6 — percentis de latência (p95/p99) na leitura de pacientes |
| **Segurança** | BUG-002 (XSS armazenado), BUG-001/BUG-006 (exposição de dados sensíveis) |

Cada achado também é classificado por **metodologia de descoberta** (caixa-preta / caixa-cinza / caixa-branca) e por **categoria** (Segurança, Funcional, Integridade de dados, Usabilidade, Visual) — ver detalhamento completo em BUGS.md.

## 4. Critérios de entrada e saída

**Entrada (pré-condição para começar a testar um cenário):**
- Ambiente local rodando (`node server/index.js`, `http://localhost:3000`).
- Banco de dados resetado para um estado conhecido via `POST /api/admin/reset` (ou pelo link "Reiniciar dados do sistema" na tela de login).

**Saída (definição de "pronto" para esta rodada):**
- Fluxos principais dos 3 perfis percorridos manualmente pelo menos uma vez, ponta a ponta.
- Suíte automatizada executando sem erros de infraestrutura (as 23 falhas esperadas nos testes automatizados **são o resultado esperado** — cada uma prova um bug real, não uma falha de execução).
- Todo achado documentado com: título, severidade, camada, tipo de teste, categoria, passos de reprodução, resultado esperado vs. atual, e evidência (print/vídeo).

## 5. Ambiente e ferramentas (com justificativa)

| Ferramenta | Uso | Por que essa escolha |
|---|---|---|
| **Cypress** | Automação E2E (29 testes automatizados) | Escolhido em vez de Playwright/Selenium por: (1) roda em Node.js puro, mesma stack do projeto sendo testado, sem exigir setup de linguagem adicional; (2) grava vídeo nativamente por arquivo de teste, dando evidência automática sem esforço extra; (3) o modelo de retry/assertion do Cypress (`should('not.exist')` com timeout) se encaixa bem no padrão usado aqui — testes que **afirmam o comportamento correto** e falham (ficam vermelhos) quando o bug real acontece, em vez de escrever asserções que "esperam o bug"; (4) API síncrona (`cy.request`) facilita muito testes de API pura (IDOR, bypass de login) sem precisar de outra ferramenta. |
| **Postman** | Testes manuais de API / reprodução isolada | Complementa o Cypress para exploração ad-hoc de endpoints e demonstração rápida de um bug específico, sem precisar rodar a suíte inteira. |
| **k6** | Teste de carga | Métricas de percentil (p95/p99) de latência na rota de leitura de pacientes, com 3 cenários selecionáveis: smoke (sanity check), load (padrão, carga gradual) e spike (pico abrupto). Stress/breakpoint/soak foram deixados de fora de propósito — ver [k6/load-test.js](k6/load-test.js). |
| **VS Code + extensão SQLite** | Inspeção direta do banco de dados | Necessário para achados de metodologia caixa-cinza/caixa-branca (ex.: BUG-001, senha em texto plano — só visível consultando a tabela `users` direto). |
| **Excel (script Node + `exceljs`)** | Exportação do log de bugs | Formato adicional pra compartilhar o achado com stakeholders que preferem planilha a Markdown/HTML. |

## 6. Ambiente de execução
- **Back-end:** Node.js + Express + better-sqlite3, banco em arquivo único (`data/medalert.db`), resetável a qualquer momento.
- **Navegador de teste:** Electron/Chromium (via Cypress) — headless para execução em lote, headed para gravação de vídeo de evidência.
- **Dados de teste:** seed fixo (5 usuários: 2 pacientes, 2 enfermeiros, 1 médico) + contas geradas dinamicamente pelos testes automatizados (nomes aleatórios, ver `cypress/support/randomData.js`), sempre partindo de um reset conhecido.

## 7. Riscos do próprio plano de testes
- **Dependência de reset entre testes:** como vários bugs de escrita (BUG-018) alteram dados reais (ex.: dar alta em um paciente), é necessário resetar o banco após certos testes manuais pra não contaminar a demonstração seguinte — isso está documentado em cada passo a passo relevante.
- **Execução em ambiente único (dev local):** não há ambiente de staging/produção separado para validar o comportamento antes de reportar — todos os achados foram confirmados diretamente no ambiente de desenvolvimento fornecido.
