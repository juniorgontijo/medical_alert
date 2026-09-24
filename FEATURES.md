# MedAlert — Sugestões de Feature (não são bugs)

> Diferente do [BUGS.md](BUGS.md): aqui não tem defeito — é comportamento faltando, ou uma decisão de modelagem que dá pra questionar. Não conta como achado de QA na apresentação, mas é bom deixar registrado como observação de produto/escopo. Ver [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) para o contexto completo por trás de cada uma.

---

## FEATURE-001 — Reatribuição de pacientes entre enfermeiros/médicos
- **Como é:** cada paciente fica preso pra sempre ao mesmo enfermeiro/médico (definido no seed, ou no primeiro disponível do banco em caso de autocadastro). Não existe tela nem rota pra trocar depois.
- **Como poderia melhorar:** uma tela (perfil médico ou um "administrador" que hoje não existe) pra reatribuir `nurse_id`/`doctor_id`, ou distribuir automaticamente por menor carga em vez de sempre cair no primeiro do banco.

## FEATURE-002 — Cancelar alta do paciente
- **Como é:** `POST /discharge` só muda o status pra "alta"; não existe rota, botão ou tela pra reverter.
- **Como poderia melhorar:** botão "Reinternar paciente" que volta o status, e um histórico de mudanças (quem deu alta, quando, se foi revertido).

## FEATURE-003 — Paciente escolher a urgência ao chamar a enfermagem
- **Como é:** botão único "Solicitar atendimento" sempre gera alerta com severidade fixa "baixa" no código, sem opção de escolha.
- **Como poderia melhorar:** 2-3 opções de urgência antes de confirmar (ex.: "preciso de ajuda" vs. "emergência"), com aviso visual pra enfermagem de que a severidade foi autodeclarada pelo paciente, não medida.

## FEATURE-004 — Aprovação para autocadastro como médico(a)/enfermeiro(a)
- **Como é:** qualquer pessoa se cadastra como médico ou enfermeiro pelo formulário público, sem aprovação nem verificação de credencial nenhuma.
- **Como poderia melhorar:** exigir aprovação de administrador, convite prévio ou verificação de registro profissional antes da conta virar utilizável; autocadastro livre continuaria fazendo sentido só pro perfil paciente.
- *(Cogitado como bug antes — reclassificado por não haver regra escrita pedindo aprovação.)*

## FEATURE-005 — Regra de alerta para pressão diastólica
- **Como é:** o sistema coleta pressão diastólica em todo registro, mas nunca usa em nenhum cálculo de alerta — sem limiar na tabela `patients`, sem campo na tela do médico, sem comparação em `checkThresholds()`.
- **Como poderia melhorar:** adicionar `dia_high`/`dia_low`, um campo de limiar na tela do médico, e a comparação correspondente — igual já existe pra FC, SpO2, temperatura e sistólica.
- *(Cogitado como bug antes — reclassificado por a especificação oficial não definir regra nenhuma pra esse campo.)*
