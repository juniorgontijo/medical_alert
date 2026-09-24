const { SELECTORS, SINAIS_NORMAIS } = require('../../support/testData');
const { loginComoEnfermeira, registrarSinais } = require('../../support/helpers');

describe('Gestão de alertas', () => {
  const FC_ALTA = 110;

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-016 · falha = confirmado] contador de "alertas pendentes" DEVERIA atualizar ao criar um alerta novo, sem trocar de paciente', () => {
    loginComoEnfermeira();
    cy.contains(SELECTORS.badge, 'Alertas pendentes: 0').should('exist');
    registrarSinais({ ...SINAIS_NORMAIS, hr: FC_ALTA });
    // Esperado: o novo alerta pendente deveria refletir no contador do cabeçalho.
    // Real (bug): countPendingForMyPatients só recalcula em login/troca de paciente -> continua "0" -> falha, documenta o BUG-016.
    cy.contains(SELECTORS.badge, 'Alertas pendentes: 1').should('exist');
  });
});
