const { USERS, SENHA_BYPASS, SINAIS_NORMAIS, SELECTORS } = require('../../support/testData');
const { registrarSinais } = require('../../support/helpers');

describe('Enfermagem — Registro de sinais vitais', () => {
  const FC_NEGATIVA = -50; // fisiologicamente impossível -> BUG-010

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.get(SELECTORS.loginUser).select(USERS.camila.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
  });

  it('[BUG-010 · falha = confirmado] FC negativa NAO deveria ser aceita', () => {
    registrarSinais({ ...SINAIS_NORMAIS, hr: FC_NEGATIVA });
    // Esperado: o sistema deveria rejeitar um valor fisiologicamente impossível.
    // Real (bug): aceita e mostra normalmente no histórico -> falha, documenta o BUG-010.
    cy.get('table').should('not.contain', String(FC_NEGATIVA));
  });
});
