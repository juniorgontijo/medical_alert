const { USERS, SENHA_BYPASS, SINAIS_NORMAIS } = require('../../support/testData');

describe('Gestão de alertas', () => {
  const FC_ALTA = 110;
  const ATRASO_ENTRE_RECONHECIMENTOS_MS = 20;

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
  });

  it('[BUG-014 · falha = confirmado] reconhecer um alerta já reconhecido NAO deveria sobrescrever o registro original', () => {
    cy.request('POST', '/api/auth/login', { email: USERS.camila.email, password: SENHA_BYPASS });
    cy.request('POST', `/api/patients/${USERS.marina.id}/vitals`, { ...SINAIS_NORMAIS, hr: FC_ALTA });
    cy.request('GET', `/api/patients/${USERS.marina.id}`).then((res) => {
      const alertId = res.body.alerts[res.body.alerts.length - 1].id;
      cy.request('POST', `/api/alerts/${alertId}/acknowledge`);
      cy.request('GET', `/api/patients/${USERS.marina.id}`).then((res2) => {
        const primeiroAckAt = res2.body.alerts.find((a) => a.id === alertId).acknowledgedAt;
        cy.wait(ATRASO_ENTRE_RECONHECIMENTOS_MS);
        cy.request('POST', `/api/alerts/${alertId}/acknowledge`);
        cy.request('GET', `/api/patients/${USERS.marina.id}`).then((res3) => {
          const segundoAckAt = res3.body.alerts.find((a) => a.id === alertId).acknowledgedAt;
          // Esperado: reconhecer de novo não deveria alterar o registro de quem/quando reconheceu primeiro.
          // Real (bug): sobrescreve com um novo timestamp -> falha, documenta o BUG-014.
          expect(segundoAckAt).to.eq(primeiroAckAt);
        });
      });
    });
  });
});
