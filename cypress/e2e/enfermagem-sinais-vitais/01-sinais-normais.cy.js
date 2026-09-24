const { USERS, SENHA_BYPASS, SINAIS_NORMAIS, SELECTORS } = require('../../support/testData');
const { registrarSinais } = require('../../support/helpers');

describe('Enfermagem — Registro de sinais vitais', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.get(SELECTORS.loginUser).select(USERS.camila.email);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();
    cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
  });

  it('registra sinais vitais dentro da faixa normal sem gerar alerta', () => {
    registrarSinais(SINAIS_NORMAIS);
    cy.get(SELECTORS.alertsTab).click();
    cy.contains('Nenhum alerta').should('exist');
  });
});
