const { TOAST, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');
const { nomeAleatorio, emailAleatorio } = require('../../support/randomData');

describe('Cadastro de usuário', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('cadastra um paciente com dados válidos e volta para a tela de login', () => {
    const nome = nomeAleatorio();
    preencherCadastro({ name: nome, email: emailAleatorio(nome) });

    cy.get(SELECTORS.toast).should('contain', TOAST.CADASTRO_SUCESSO);
    cy.get(SELECTORS.loginUser).should('exist');
  });
});
