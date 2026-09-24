const { USERS, TOAST, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');
const { nomeAleatorio } = require('../../support/randomData');

describe('Cadastro de usuário', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('não permite cadastrar um e-mail que já existe (usuário do seed)', () => {
    // O nome é aleatório, mas o e-mail precisa ser o do seed de propósito — é isso que o teste verifica.
    preencherCadastro({ name: nomeAleatorio(), email: USERS.marina.email });

    cy.get(SELECTORS.registerError).should('contain', 'Já existe uma conta');
    cy.get(SELECTORS.toast).should('not.contain', TOAST.CADASTRO_SUCESSO);
  });
});
