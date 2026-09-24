const { USERS, SENHA_BYPASS, SINAIS_NORMAIS, SELECTORS } = require('../../support/testData');
const { registrarSinais } = require('../../support/helpers');

describe('Enfermagem — Registro de sinais vitais', () => {
  const FC_NO_LIMITE = 100; // igual a hrHigh -> testa o erro de borda do BUG-011

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.get(SELECTORS.loginUser).select(USERS.camila.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
  });

  it('[BUG-011 · falha = confirmado] FC exatamente igual ao limite (100) DEVERIA gerar alerta de FC alta', () => {
    registrarSinais({ ...SINAIS_NORMAIS, hr: FC_NO_LIMITE });
    cy.get(SELECTORS.alertsTab).click();
    // Esperado: especificação diz "FC >= 100 gera alerta ALTA".
    // Real (bug): código usa '>' em vez de '>=', FC=100 não dispara nada -> falha, documenta o BUG-011.
    cy.contains('Frequência cardíaca elevada').should('exist');
  });
});
