# MedAlert — Casos de Teste

Matriz de casos de teste organizados por **cenário** e por **perfil de usuário**, cobrindo os três perfis do sistema (Paciente, Enfermeiro(a), Médico(a)). Cada caso corresponde a um teste automatizado da suíte Cypress (ver [README.md](README.md) para como rodar).

- **TC-XXX** = ID do caso de teste.
- **Status** reflete o resultado da última execução (ver relatório completo em [README.md](README.md)).
- Quando o caso prova um bug, a coluna **Bug** referencia o ID correspondente em [BUGS.md](BUGS.md).

---

## Perfil: Paciente

| TC | Cenário | Passos (resumo) | Resultado esperado | Status | Bug |
|---|---|---|---|---|---|
| TC-001 | Cadastro com dados válidos | Preencher nome/e-mail/senha válidos e enviar | Conta criada, redireciona pra tela de login | ✅ Passou | — |
| TC-002 | Cadastro com senha e confirmação diferentes | Preencher senha ≠ confirmar senha | Cadastro bloqueado, mensagem de erro | ✅ Passou | — |
| TC-003 | Cadastro com e-mail já existente | Usar e-mail de usuário do seed | Cadastro bloqueado (`409`) | ✅ Passou | — |
| TC-004 | Cadastro com e-mail de TLD inválido | E-mail `a@a.123456` | Cadastro deveria ser bloqueado | ❌ Falhou (bug confirmado) | BUG-003 |
| TC-005 | Cadastro com emoji no nome/e-mail/senha | Preencher os 3 campos com emoji | Cadastro deveria ser bloqueado | ❌ Falhou (bug confirmado) | BUG-004 |
| TC-006 | Cadastro com payload XSS no nome | Nome = `<img src=x onerror=...>` | Payload não deveria virar elemento real na tela | ❌ Falhou (bug confirmado) | BUG-002 |
| TC-007 | Senha armazenada após cadastro | Cadastrar e consultar banco | Senha deveria estar em hash | ❌ Falhou (bug confirmado) | BUG-001 |
| TC-008 | Login com credenciais válidas | Selecionar usuário do seed + senha correta | Login aceito, painel do perfil correto exibido | ✅ Passou | — |
| TC-009 | Login com senha incorreta | Selecionar usuário + senha errada (1 caractere) | Login deveria ser rejeitado | ❌ Falhou (bug confirmado) | BUG-005 |
| TC-010 | Lista de pacientes (visão normal) | Login como paciente, `GET /api/patients` | Retorna só os próprios dados | ✅ Passou | — |
| TC-011 | Leitura de prontuário de outro paciente (IDOR) | Login como Marina, `GET /api/patients/pac2` | Deveria retornar `403` | ❌ Falhou (bug confirmado) | BUG-008 |
| TC-012 | Alteração de limiares de outro paciente (IDOR) | Login como Marina, `PUT /api/patients/pac2/thresholds` | Deveria retornar `403` | ❌ Falhou (bug confirmado) | BUG-018 |
| TC-013 | Registro de sinais vitais em nome de outro paciente (IDOR) | Login como Marina, `POST /api/patients/pac2/vitals` | Deveria retornar `403` | ❌ Falhou (bug confirmado) | BUG-018 |
| TC-014 | Alta de outro paciente (IDOR) | Login como Marina, `POST /api/patients/pac2/discharge` | Deveria retornar `403` | ❌ Falhou (bug confirmado) | BUG-018 |

## Perfil: Anônimo (não autenticado)

| TC | Cenário | Passos (resumo) | Resultado esperado | Status | Bug |
|---|---|---|---|---|---|
| TC-015 | Diretório de usuários sem login | `GET /api/auth/directory` sem sessão | Deveria retornar `401` | ❌ Falhou (bug confirmado) | BUG-006 |
| TC-016 | Reset de dados sem login | `POST /api/admin/reset` sem sessão | Deveria retornar `401` | ❌ Falhou (bug confirmado) | BUG-007 |

## Perfil: Enfermeiro(a)

| TC | Cenário | Passos (resumo) | Resultado esperado | Status | Bug |
|---|---|---|---|---|---|
| TC-017 | Registro de sinais vitais normais | Registrar FC/SpO2/Temp/Pressão dentro da faixa | Nenhum alerta gerado | ✅ Passou | — |
| TC-018 | FC exatamente no limiar (valor-limite) | Registrar FC = 100 (limiar = 100) | Deveria gerar alerta (regra é `>=`) | ❌ Falhou (bug confirmado) | BUG-011 |
| TC-019 | Temperatura normal em Fahrenheit | Registrar Temp. = 98 (°F) | Não deveria gerar alerta de febre | ❌ Falhou (bug confirmado) | BUG-009 |
| TC-020 | FC negativa | Registrar FC = -50 | Deveria ser bloqueado/rejeitado | ❌ Falhou (bug confirmado) | BUG-010 |
| TC-021 | Registro duplicado do mesmo sinal alterado | Registrar o mesmo sinal fora da faixa 2x seguidas | Deveria gerar só 1 alerta | ❌ Falhou (bug confirmado) | BUG-012 |
| TC-022 | Escalonamento automático de alerta crítico | Alerta crítico pendente há mais de 15 min | Deveria virar "Escalonado" sozinho | ❌ Falhou (bug confirmado) | BUG-013 |
| TC-023 | Reconhecer o mesmo alerta duas vezes | Clicar "Reconhecer" 2x no mesmo alerta | Deveria bloquear/avisar na 2ª vez | ❌ Falhou (bug confirmado) | BUG-014 |
| TC-024 | Sequência Reconhecer → Escalonar → Reconhecer | Aplicar as 3 ações em sequência no mesmo alerta | Não deveria permitir voltar de status | ❌ Falhou (bug confirmado) | BUG-015 |
| TC-025 | Contador de alertas pendentes atualiza em tempo real | Gerar alerta sem trocar de paciente/tela | Contador deveria atualizar na hora | ❌ Falhou (bug confirmado) | BUG-016 |
| TC-026 | Confirmação antes de reconhecer alerta | Clicar em "Reconhecer" | Deveria pedir confirmação antes | ❌ Falhou (bug confirmado) | BUG-017 |

> Nota: um caso de teste sobre pressão diastólica alta sem alerta (`diastólica = 200`) foi removido desta matriz. Inicialmente cogitado como bug, foi reclassificado como **sugestão de melhoria** depois de confirmar que a especificação oficial do desafio não define nenhuma regra de alerta para pressão diastólica (ver [FEATURES.md](FEATURES.md), FEATURE-005). O teste automatizado correspondente também foi removido da suíte Cypress pelo mesmo motivo.

## Perfil: Médico(a)

| TC | Cenário | Passos (resumo) | Resultado esperado | Status | Bug |
|---|---|---|---|---|---|
| TC-027 | Prescrição sem paciente selecionado | Abrir aba Prescrição sem selecionar paciente | Aba deveria estar bloqueada (como "Visão geral") | ❌ Falhou (bug confirmado) | BUG-019 |
| TC-028 | Confirmação antes de dar alta | Clicar em "Dar alta ao paciente" | Deveria pedir confirmação antes | ❌ Falhou (bug confirmado) | BUG-020 |
| TC-029 | Feedback visual do botão após alta | Comparar cor do botão antes/depois da alta | Botão deveria mudar de aparência | ❌ Falhou (bug confirmado) | BUG-021 |

---

## Resumo por perfil

| Perfil | Casos | Passando | Falhando (bugs confirmados) |
|---|---|---|---|
| Paciente | 14 | 4 | 10 |
| Anônimo | 2 | 0 | 2 |
| Enfermeiro(a) | 10 | 1 | 9 |
| Médico(a) | 3 | 0 | 3 |
| **Total** | **29** | **6** (~21%) | **23** (~79%) |

> Nota: os casos "falhando" são o resultado **esperado e correto** — cada um documenta, de forma automatizada e reproduzível, um bug real do sistema (ver [BUGS.md](BUGS.md) para detalhes completos de cada um). Ver filosofia de "vermelho = bug confirmado" em [TEST_PLAN.md](TEST_PLAN.md).
