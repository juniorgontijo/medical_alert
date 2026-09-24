const { USERS, SELECTORS } = require('../../support/testData');
const { loginComoMedica } = require('../../support/helpers');

describe('Médico — Limiares, prescrição e alta', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-021 · falha = confirmado] após dar alta, o botão DEVERIA mudar de aparência (não só ficar desabilitado por baixo dos panos)', () => {
    loginComoMedica(USERS.helena.email);
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();

    cy.get(SELECTORS.dischargeBtn).then(($btn) => {
      const corAntes = $btn.css('background-color');
      cy.wrap($btn).click();
      cy.get(SELECTORS.dischargeBtn).should('be.disabled'); // isso já funciona certo — não é o que está sendo testado aqui
      // Esperado: a aparência (cor/opacidade) deveria mudar pra indicar visualmente que ficou inativo.
      // Real (bug): continua com exatamente a mesma cor de antes -> falha, documenta o BUG-021.
      cy.get(SELECTORS.dischargeBtn).should(($btn2) => {
        expect($btn2.css('background-color'), 'cor do botão depois de desabilitado').not.to.eq(corAntes);
      });
    });
  });
});
