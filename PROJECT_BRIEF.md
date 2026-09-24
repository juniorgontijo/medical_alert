# MedAlert — Project Brief

## Resumo do sistema
MedAlert é um sistema de gerenciamento de alertas hospitalares (Node.js/Express + SQLite), com três perfis de usuário: **paciente**, **enfermeiro(a)** e **médico(a)**. O sistema cobre: cadastro/login de usuários, registro de sinais vitais pela enfermagem, geração automática de alertas com base em limiares clínicos configuráveis, reconhecimento/escalonamento de alertas, e ações médicas (definição de limiares, prescrição, alta de paciente).

## Personas testadas
- **Paciente** — visualiza os próprios sinais vitais e histórico; solicita atendimento de enfermagem.
- **Enfermeiro(a)** — registra sinais vitais dos pacientes sob sua responsabilidade; reconhece e escalona alertas.
- **Médico(a)** — define limiares de alerta por paciente; registra prescrições; dá alta em pacientes.

## Escopo testado
- Fluxo completo de cadastro e login, para os 3 perfis.
- Registro de sinais vitais e geração de alertas (regras de negócio e valores-limite).
- Gestão de alertas: reconhecimento, escalonamento manual, escalonamento automático por tempo.
- Ações médicas: limiares, prescrição, alta de paciente.
- Controle de acesso entre pacientes e entre perfis (IDOR — leitura e escrita).
- Teste de carga (k6) na rota de leitura de pacientes.

## Premissas assumidas
- Ambiente de teste local (`localhost:3000`), sem HTTPS, sem múltiplos hospitais/tenants — testado como instância única.
- Os dados semeados (seed) representam o estado inicial válido do sistema a cada reset (`POST /api/admin/reset`), usado como ponto de partida conhecido antes de cada cenário.
- Revisão de código-fonte foi assumida como técnica válida neste contexto (não só teste de caixa-preta), já que o objetivo é validação pré-produção completa, não apenas teste de aceitação — essa decisão está documentada e justificada no Test Plan (metodologia caixa-preta/cinza/branca).
- Um achado só foi classificado como **bug** quando havia uma regra objetiva sendo violada (comportamento explícito no código, ou expectativa de negócio inequívoca). Quando essa base não existia — por exemplo, ausência total de uma regra de negócio, não a quebra de uma regra existente — o achado foi registrado como **sugestão de melhoria** (ver FEATURES.md), não como bug. Essa distinção foi validada caso a caso durante o trabalho (ex.: BUG-003 originalmente cogitado, depois reclassificado como FEATURE-004 por falta de regra escrita; mesma coisa aconteceu com a pressão diastólica, reclassificada como FEATURE-005 depois de confirmar, na especificação oficial, que não existe regra de alerta para esse campo).

## Fora de escopo (e por quê)
- **Acessibilidade (a11y)** — não fazia parte do escopo definido para esta rodada; fica como recomendação para uma iteração futura.
- **Compatibilidade entre navegadores** — testado apenas em Chromium/Electron (via Cypress); Firefox e Safari não foram validados, por restrição de tempo.
- **Performance de renderização no front-end** (Core Web Vitals, etc.) — k6 cobriu carga na API, não performance de renderização da interface.
- **Autenticação multifator / recuperação de senha** — funcionalidades que não existem no sistema atual, portanto não há o que testar.
- **Perfil "administrador"** — não existe no sistema hoje; mencionado apenas como sugestão futura em FEATURES.md (FEATURE-001).

## Riscos de negócio identificados
1. **Dados sensíveis expostos sem controle de acesso** (BUG-008, BUG-018 — IDOR crítico): qualquer usuário autenticado consegue ler e alterar o prontuário de qualquer paciente, incluindo notas médicas privadas.
2. **Senha em texto plano** (BUG-001) combinada com **login sem validação real de senha** (BUG-005): isoladamente já críticos, juntos comprometem a autenticação de todo o sistema.
3. **Ações irreversíveis sem confirmação**: alta de paciente (BUG-020) e reconhecimento de alerta (BUG-017) não pedem confirmação, e não existe função de "desfazer" no sistema (ver FEATURES.md, FEATURE-002).
4. **Regra clínica crítica que nunca executa**: o escalonamento automático de alertas críticos (BUG-013) é código morto — um alerta crítico pode permanecer pendente indefinidamente sem intervenção humana, o que é um risco direto à segurança do paciente.
5. **Inconsistência de unidade de medida** (BUG-009, °F vs. °C): gera falsos alertas de febre em toda leitura normal — risco clínico direto e, potencialmente, fadiga de alertas (a equipe passar a ignorar alertas por excesso de falsos positivos).
