const { USERS, SENHA_BYPASS, HTTP_STATUS, PATIENT_STATUS } = require('../../support/testData');

describe('Pós-login — Pacientes (IDOR)', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.request('POST', '/api/auth/login', { email: USERS.marina.email, password: SENHA_BYPASS });
  });

  it('[BUG-018 · falha = confirmado] Marina (paciente comum) NAO deveria conseguir dar alta no Roberto', () => {
    cy.request({
      method: 'POST',
      url: `/api/patients/${USERS.roberto.id}/discharge`,
      failOnStatusCode: false,
    }).then((res) => {
      // Esperado: 403, dar alta é ação médica, não de paciente.
      // Real (bug): 200, alta é efetivada de verdade -> falha, documenta o BUG-018.
      expect(res.status).to.eq(HTTP_STATUS.FORBIDDEN);
    });

    // Confirma o efeito colateral real, logando como a médica responsável pelo Roberto.
    cy.request('POST', '/api/auth/logout');
    cy.request('POST', '/api/auth/login', { email: USERS.helena.email, password: SENHA_BYPASS });
    cy.request('GET', `/api/patients/${USERS.roberto.id}`).its('body.patient.status').then((status) => {
      expect(status).to.eq(PATIENT_STATUS.INTERNADO);
    });
  });
});
