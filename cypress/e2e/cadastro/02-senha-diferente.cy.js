const { TOAST, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');
const { nomeAleatorio, emailAleatorio } = require('../../support/randomData');

describe('Cadastro de usuário', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('não permite senha e confirmar senha diferentes', () => {
    const nome = nomeAleatorio();
    preencherCadastro({ name: nome, email: emailAleatorio(nome), confirmPassword: 'outraSenha' });

    cy.get(SELECTORS.registerError).should('contain', 'não coincidem');
    cy.get(SELECTORS.toast).should('not.contain', TOAST.CADASTRO_SUCESSO);
  });
});
