const { USERS, SENHA_BYPASS, SINAIS_NORMAIS } = require('../../support/testData');

describe('Gestão de alertas', () => {
  const FC_ALTA = 110;

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-015 · falha = confirmado] escalonar um alerta já reconhecido NAO deveria manter dados de reconhecimento antigos', () => {
    cy.request('POST', '/api/auth/login', { email: USERS.camila.email, password: SENHA_BYPASS });
    cy.request('POST', `/api/patients/${USERS.marina.id}/vitals`, { ...SINAIS_NORMAIS, hr: FC_ALTA });
    cy.request('GET', `/api/patients/${USERS.marina.id}`).then((res) => {
      const alertId = res.body.alerts[res.body.alerts.length - 1].id;
      cy.request('POST', `/api/alerts/${alertId}/acknowledge`);
      cy.request('POST', `/api/alerts/${alertId}/escalate`);
      cy.request('GET', `/api/patients/${USERS.marina.id}`).then((res2) => {
        const alerta = res2.body.alerts.find((a) => a.id === alertId);
        expect(alerta.status).to.eq('escalated');
        // Esperado: ao escalonar, não deveria mais constar como "reconhecido por" alguém.
        // Real (bug): acknowledgedBy continua com o nome de quem reconheceu antes -> falha, documenta o BUG-015.
        expect(alerta.acknowledgedBy).to.be.null;
      });
    });
  });
});
