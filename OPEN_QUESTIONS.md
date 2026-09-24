# MedAlert — Perguntas em aberto / ambiguidades de escopo

> Este documento existe porque a especificação oficial do desafio pede explicitamente que ambiguidades e perguntas em aberto sejam documentadas, em vez de resolvidas silenciosamente com uma suposição. Nenhum item aqui é um bug nem uma sugestão de feature fechada — são pontos que dependeriam de uma resposta do time de produto/negócio antes de virar uma decisão de implementação.

---

## 1. Pressão diastólica ficou fora da tabela de regras de alerta — foi intencional?

A especificação oficial ("Vital sign alert rules") define regra de alerta para FC, SpO2, temperatura e pressão **sistólica**. Pressão **diastólica** é coletada em todo registro de sinais vitais, mas não aparece em nenhum lugar da tabela de regras.

Duas leituras possíveis:
- **Foi deliberado** — o MVP focou nos sinais mais críticos pra decisão clínica rápida, e diastólica ficaria pra uma fase futura.
- **Foi um gap** — diastólica isolada é clinicamente relevante (hipertensão/hipotensão diastólica isolada existe como condição), e a ausência da regra é só uma lacuna que passou batido.

Sem essa resposta, o achado foi registrado como sugestão de melhoria, não como bug (ver [FEATURES.md](FEATURES.md), FEATURE-005) — porque não há regra escrita sendo violada, só uma regra que talvez devesse existir e não existe.

## 2. Autocadastro de médico/enfermeiro sem nenhuma aprovação — aceitável para este sistema?

A especificação descreve "Sign up" como criação de conta de paciente, enfermeiro **ou médico**, sem mencionar aprovação, convite ou verificação de credencial. O sistema implementa exatamente isso. Num hospital real, isso seria um risco de segurança sério (ver [FEATURES.md](FEATURES.md), FEATURE-004) — mas como não há regra escrita pedindo aprovação, não dá pra tratar como bug. Vale confirmar com o time de produto se essa é realmente a intenção do MVP ou só um ponto que não foi pensado ainda.

## 3. BUG-006/BUG-007 (diretório de usuários e reset do banco públicos, sem login) — são "ferramentas de desenvolvimento" ou falhas de produção?

O código tem indícios (nomes de rota, comentários) de que essas duas rotas foram pensadas como atalho de desenvolvimento/demonstração (ex.: reset rápido do banco pra facilitar teste manual). Do ponto de vista de QA, ambas continuam sendo bugs de controle de acesso — nenhuma especificação diz que rotas de "conveniência de desenvolvimento" deveriam ficar acessíveis sem autenticação em uma build que se comporta como produção. Mas vale confirmar: essas rotas deveriam existir de alguma forma (protegida, ou só habilitada fora de produção), ou deveriam ser removidas completamente antes de qualquer deploy real?

## 4. Não existe perfil "administrador" — algumas ações deveriam exigir um?

Hoje, ações sensíveis (aprovar cadastro de médico/enfermeiro — ver item 2 acima, reatribuir pacientes entre profissionais — ver [FEATURES.md](FEATURES.md) FEATURE-001) não têm dono nenhum no sistema, porque não existe um perfil acima de médico/enfermeiro/paciente. Isso é escopo de produto, não bug, mas fica registrado porque aparece como pré-requisito de mais de uma sugestão de feature deste documento.
