const { USERS, SENHA_BYPASS, SINAIS_NORMAIS, SELECTORS } = require('../../support/testData');
const { registrarSinais } = require('../../support/helpers');

describe('Enfermagem — Registro de sinais vitais', () => {
  const TEMPERATURA_FAHRENHEIT_NORMAL = 98; // normal em °F, mas o campo compara como °C -> BUG-009

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.get(SELECTORS.loginUser).select(USERS.camila.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
  });

  it('[BUG-009 · falha = confirmado] temperatura normal em Fahrenheit (98) NAO deveria disparar alerta de febre', () => {
    registrarSinais({ ...SINAIS_NORMAIS, temp: TEMPERATURA_FAHRENHEIT_NORMAL });
    cy.get(SELECTORS.alertsTab).click();
    // Esperado: 98°F é temperatura corporal normal — não deveria gerar alerta.
    // Real (bug): o campo diz "°F" mas a regra compara como se fosse °C (98 >= 37.8) -> dispara febre -> falha, documenta o BUG-009.
    cy.contains('Febre').should('not.exist');
  });
});
