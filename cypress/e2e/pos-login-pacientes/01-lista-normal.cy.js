const { USERS, SENHA_BYPASS } = require('../../support/testData');

describe('Pós-login — Pacientes (IDOR)', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.request('POST', '/api/auth/login', { email: USERS.marina.email, password: SENHA_BYPASS });
  });

  it('lista normal (GET /api/patients) mostra só a própria Marina', () => {
    cy.request('GET', '/api/patients').then((res) => {
      expect(res.body.patients).to.have.length(1);
      expect(res.body.patients[0].id).to.eq(USERS.marina.id);
    });
  });
});
