const { SENHA_SEED, SELECTORS } = require('../../support/testData');
const { loginComoMedica } = require('../../support/helpers');
const { nomeAleatorio, emailAleatorio } = require('../../support/randomData');

describe('Médico — Limiares, prescrição e alta', () => {
  const nomeMedico = nomeAleatorio();
  const MEDICO_SEM_PACIENTES = {
    name: nomeMedico,
    email: emailAleatorio(nomeMedico),
    role: 'doctor',
  };

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-019 · falha = confirmado] aba de Prescrição NAO deveria ficar acessível sem nenhum paciente selecionado', () => {
    // Um médico recém-autocadastrado começa sem nenhum paciente (autocadastro sem validação
    // de credencial — ver FEATURES.md, FEATURE-004 — permite criar essa conta).
    cy.request('POST', '/api/auth/register', {
      ...MEDICO_SEM_PACIENTES,
      password: SENHA_SEED,
      confirmPassword: SENHA_SEED,
    });
    loginComoMedica(MEDICO_SEM_PACIENTES.email);

    cy.contains('Selecione um paciente').should('exist'); // aba "Visão geral" corretamente bloqueada sem paciente
    cy.contains(SELECTORS.tab, 'Prescrição').click();
    // Esperado: sem paciente selecionado, a aba de Prescrição também deveria ficar bloqueada.
    // Real (bug): o formulário aparece normalmente, mesmo sem ninguém selecionado -> falha, documenta o BUG-019.
    cy.get(SELECTORS.rxForm).should('not.exist');
  });
});
