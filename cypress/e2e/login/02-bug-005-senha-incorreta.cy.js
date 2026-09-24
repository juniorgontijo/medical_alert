const { USERS, SENHA_BYPASS, SELECTORS } = require('../../support/testData');

describe('Login', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
  });

  it('[BUG-005 · falha = confirmado] NAO deveria logar com senha incorreta', () => {
    cy.get(SELECTORS.loginUser).select(USERS.marina.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS); // senha errada, só 1 caractere
    cy.get(SELECTORS.loginBtn).click();

    // Esperado: mostrar erro e permanecer na tela de login.
    // Real (bug): loga normalmente -> esta asserção falha, documentando o BUG-005.
    cy.get(SELECTORS.topbar).should('not.exist');
  });
});
