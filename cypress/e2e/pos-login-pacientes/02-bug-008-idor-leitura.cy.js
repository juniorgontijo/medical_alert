const { USERS, SENHA_BYPASS, HTTP_STATUS } = require('../../support/testData');

describe('Pós-login — Pacientes (IDOR)', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.request('POST', '/api/auth/login', { email: USERS.marina.email, password: SENHA_BYPASS });
  });

  it('[BUG-008 · falha = confirmado] Marina NAO deveria conseguir ler o prontuário do Roberto (outro paciente)', () => {
    cy.request({ url: `/api/patients/${USERS.roberto.id}`, failOnStatusCode: false }).then((res) => {
      // Esperado: 403/404, já que Marina não tem vínculo nenhum com o Roberto.
      // Real (bug): 200 com o prontuário completo (inclusive notas médicas privadas) -> falha, documenta o BUG-008.
      expect(res.status).to.eq(HTTP_STATUS.FORBIDDEN);
    });
  });
});
