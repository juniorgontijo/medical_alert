const { HTTP_STATUS } = require('../../support/testData');

describe('Login', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
  });

  it('[BUG-007 · falha = confirmado] resetar os dados NAO deveria ser permitido sem autenticação', () => {
    cy.request({ method: 'POST', url: '/api/admin/reset', failOnStatusCode: false }).then((res) => {
      // Esperado: 401 sem sessão de admin.
      // Real (bug): 200, qualquer um reseta a base inteira -> falha, documenta o BUG-007.
      expect(res.status).to.eq(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
