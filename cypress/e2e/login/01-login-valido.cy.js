const { USERS, SENHA_SEED, SELECTORS } = require('../../support/testData');

describe('Login', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
  });

  it('loga com e-mail e senha corretos de um usuário do seed', () => {
    cy.get(SELECTORS.loginUser).select(USERS.marina.email);
    cy.get(SELECTORS.loginPass).type(SENHA_SEED);
    cy.get(SELECTORS.loginBtn).click();

    cy.get(SELECTORS.topbar).should('contain', USERS.marina.name);
  });
});
