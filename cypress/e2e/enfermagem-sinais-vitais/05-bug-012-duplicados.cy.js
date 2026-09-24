const { USERS, SENHA_BYPASS, SINAIS_NORMAIS, SELECTORS } = require('../../support/testData');
const { registrarSinais } = require('../../support/helpers');

describe('Enfermagem — Registro de sinais vitais', () => {
  const FC_ALTA = 110; // acima de hrHigh -> gera alerta normalmente

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.get(SELECTORS.loginUser).select(USERS.camila.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
  });

  it('[BUG-012 · falha = confirmado] registrar o mesmo sinal fora da faixa duas vezes NAO deveria duplicar o alerta', () => {
    const sinaisAlterados = { ...SINAIS_NORMAIS, hr: FC_ALTA };
    registrarSinais(sinaisAlterados);
    registrarSinais(sinaisAlterados);
    cy.get(SELECTORS.alertsTab).click();
    // Esperado: no máximo 1 alerta pendente pra essa mesma condição.
    // Real (bug): cria um alerta novo a cada registro -> 2 linhas idênticas -> falha, documenta o BUG-012.
    cy.get(`tr:contains("Frequência cardíaca elevada (${FC_ALTA} bpm)")`).should('have.length', 1);
  });
});
