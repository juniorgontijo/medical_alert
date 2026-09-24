const { USERS, SENHA_BYPASS } = require('../../support/testData');

describe('Gestão de alertas', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-013 · falha = confirmado] alerta crítico pendente há mais de 15 min DEVERIA escalonar sozinho', () => {
    // O seed cria o alerta crítico do Roberto (SpO2 91%) já com 35 minutos de "idade".
    cy.request('POST', '/api/auth/login', { email: USERS.paulo.email, password: SENHA_BYPASS }); // enf2, responsável pelo Roberto
    cy.request('GET', `/api/patients/${USERS.roberto.id}`).then((res) => {
      const alertaCritico = res.body.alerts.find((a) => a.severity === 'critica');
      expect(alertaCritico, 'alerta crítico semeado deve existir').to.exist;
      // Esperado: pendente há mais de 15 min, deveria já estar 'escalated' sozinho.
      // Real (bug): checkAutoEscalation() nunca é chamada por nenhuma rota -> continua 'pending' -> falha, documenta o BUG-013.
      expect(alertaCritico.status).to.eq('escalated');
    });
  });
});
