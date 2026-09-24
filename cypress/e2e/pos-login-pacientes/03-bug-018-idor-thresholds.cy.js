const { USERS, SENHA_BYPASS, HTTP_STATUS } = require('../../support/testData');

describe('Pós-login — Pacientes (IDOR)', () => {
  const LIMIARES_ABSURDOS = { hrHigh: 999, hrLow: 1, spo2Low: 1, tempHigh: 999, sysHigh: 999 };

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.request('POST', '/api/auth/login', { email: USERS.marina.email, password: SENHA_BYPASS });
  });

  it('[BUG-018 · falha = confirmado] Marina NAO deveria conseguir alterar limiares de alerta do Roberto', () => {
    cy.request({
      method: 'PUT',
      url: `/api/patients/${USERS.roberto.id}/thresholds`,
      failOnStatusCode: false,
      body: LIMIARES_ABSURDOS,
    }).then((res) => {
      expect(res.status).to.eq(HTTP_STATUS.FORBIDDEN);
    });
  });
});
