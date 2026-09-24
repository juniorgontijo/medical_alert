const { TOAST, SENHA_BYPASS, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');

describe('Cadastro de usuário', () => {
  const EMOJI_REPETIDO = '🫶🫶🫶🫶🫶';
  const EMOJI_SENHA = '🫶🫶🫶🫶🫶🫶'; // 6 "caracteres" (na verdade 12 unidades UTF-16) -> passa o mínimo

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('[BUG-004 · falha = confirmado] NAO deveria aceitar emoji no nome e na senha', () => {
    const emailEmoji = 'emoji.cypress@medalert.test';
    preencherCadastro({ name: EMOJI_REPETIDO, email: emailEmoji, password: EMOJI_SENHA });
    cy.get(SELECTORS.toast).should('contain', TOAST.CADASTRO_SUCESSO);

    // Explora o BUG-005 (login aceita 1 caractere) pra logar com a própria conta de
    // emoji e mostrar, ao vivo, que ela funciona normalmente — não é só "sujeira no banco".
    cy.get(SELECTORS.loginUser).select(emailEmoji);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();

    // Esperado: uma conta com nome/senha só de emoji nem deveria existir, muito menos logar.
    // Real (bug): loga normalmente e mostra o nome de emoji no cabeçalho -> este 'not.exist'
    // falha, documentando o BUG-004 de forma explícita.
    cy.get(SELECTORS.topbar).should('not.exist');
  });
});
