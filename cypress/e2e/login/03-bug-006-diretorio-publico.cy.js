const { HTTP_STATUS } = require('../../support/testData');

describe('Login', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
  });

  it('[BUG-006 · falha = confirmado] a lista de usuários NAO deveria ficar pública sem estar logado', () => {
    cy.request({ url: '/api/auth/directory', failOnStatusCode: false }).then((res) => {
      // Esperado: 401 sem sessão.
      // Real (bug): 200 com todos os usuários -> falha, documenta o BUG-006.
      expect(res.status).to.eq(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
