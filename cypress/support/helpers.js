const { SELECTORS, USERS, SENHA_BYPASS, SENHA_SEED, TOAST } = require('./testData');

/** Preenche e envia o formulário de cadastro (tela "Cadastre-se"). */
function preencherCadastro({ name, email, role = 'patient', password = SENHA_SEED, confirmPassword = password }) {
  cy.get(SELECTORS.regName).type(name);
  cy.get(SELECTORS.regEmail).type(email);
  cy.get(SELECTORS.regRole).select(role);
  cy.get(SELECTORS.regPass).type(password);
  cy.get(SELECTORS.regPass2).type(confirmPassword);
  cy.get(SELECTORS.registerBtn).click();
}

/** Loga como enfermeira (Camila, por padrão) e seleciona a Marina na barra lateral. */
function loginComoEnfermeira(email = USERS.camila.email) {
  cy.visit('/');
  cy.get(SELECTORS.loginUser).select(email);
  cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
  cy.get(SELECTORS.loginBtn).click();
  cy.contains(SELECTORS.patientItem, USERS.marina.name).click();
}

/** Loga como médica (não seleciona paciente — cada teste decide se precisa). */
function loginComoMedica(email) {
  cy.visit('/');
  cy.get(SELECTORS.loginUser).select(email);
  cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
  cy.get(SELECTORS.loginBtn).click();
}

/** Preenche e envia o formulário de sinais vitais (paciente já deve estar selecionado). */
function registrarSinais(sinais) {
  cy.get(SELECTORS.vitalHr).clear().type(sinais.hr);
  cy.get(SELECTORS.vitalSpo2).clear().type(sinais.spo2);
  cy.get(SELECTORS.vitalTemp).clear().type(sinais.temp);
  cy.get(SELECTORS.vitalSys).clear().type(sinais.sys);
  cy.get(SELECTORS.vitalDia).clear().type(sinais.dia);
  cy.contains('button', 'Registrar sinais').click();
  cy.get(SELECTORS.toast).should('contain', TOAST.SINAIS_REGISTRADOS);
}

module.exports = { preencherCadastro, loginComoEnfermeira, loginComoMedica, registrarSinais };
