const { USERS, SENHA_BYPASS, HTTP_STATUS } = require('../../support/testData');

describe('Pós-login — Pacientes (IDOR)', () => {
  const SINAIS_ABSURDOS = { hr: -999, spo2: 200, temp: 40, sys: 300, dia: 200 };

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.request('POST', '/api/auth/login', { email: USERS.marina.email, password: SENHA_BYPASS });
  });

  it('[BUG-018 · falha = confirmado] Marina NAO deveria conseguir registrar sinais vitais em nome do Roberto', () => {
    cy.request({
      method: 'POST',
      url: `/api/patients/${USERS.roberto.id}/vitals`,
      failOnStatusCode: false,
      body: SINAIS_ABSURDOS,
    }).then((res) => {
      expect(res.status).to.eq(HTTP_STATUS.FORBIDDEN);
    });
  });
});
