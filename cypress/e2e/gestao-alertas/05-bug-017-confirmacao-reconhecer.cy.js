const { SELECTORS, SINAIS_NORMAIS } = require('../../support/testData');
const { loginComoEnfermeira, registrarSinais } = require('../../support/helpers');

describe('Gestão de alertas', () => {
  const FC_ALTA = 110;

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-017 · falha = confirmado] reconhecer um alerta DEVERIA pedir confirmação antes', () => {
    loginComoEnfermeira();
    registrarSinais({ ...SINAIS_NORMAIS, hr: FC_ALTA });
    cy.get(SELECTORS.alertsTab).click();
    cy.window().then((win) => cy.stub(win, 'confirm').as('confirmStub').returns(true));
    cy.get(SELECTORS.ackBtn).first().click();
    // Esperado: reconhecer um alerta deveria confirmar antes (mesmo padrão do "Reiniciar dados do sistema").
    // Real (bug): confirm() nunca é chamado -> falha, documenta o BUG-017.
    cy.get('@confirmStub').should('have.been.calledOnce');
  });
});
