const { USERS, SELECTORS } = require('../../support/testData');
const { loginComoMedica } = require('../../support/helpers');

describe('Médico — Limiares, prescrição e alta', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-020 · falha = confirmado] dar alta no paciente DEVERIA pedir confirmação antes', () => {
    loginComoMedica(USERS.helena.email);
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();

    cy.window().then((win) => cy.stub(win, 'confirm').as('confirmStub').returns(true));
    cy.get(SELECTORS.dischargeBtn).click();
    // Esperado: dar alta é irreversível e deveria confirmar antes (mesmo padrão do "Reiniciar dados do sistema").
    // Real (bug): confirm() nunca é chamado -> falha, documenta o BUG-020.
    cy.get('@confirmStub').should('have.been.calledOnce');
  });
});
