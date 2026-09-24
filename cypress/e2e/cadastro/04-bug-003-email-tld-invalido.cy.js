const { TOAST, SENHA_BYPASS, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');
const { nomeAleatorio, slug } = require('../../support/randomData');

describe('Cadastro de usuário', () => {
  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('[BUG-003 · falha = confirmado] NAO deveria aceitar e-mail com TLD inválido', () => {
    const nome = nomeAleatorio();
    const emailTldInvalido = `${slug(nome)}@a.123456`; // TLD numérico/absurdo é o ponto do teste
    preencherCadastro({ name: nome, email: emailTldInvalido });
    cy.get(SELECTORS.toast).should('contain', TOAST.CADASTRO_SUCESSO);

    // Explora o BUG-005 (login aceita 1 caractere) pra logar com a própria conta de
    // e-mail inválido e mostrar, ao vivo, que ela funciona normalmente — não é só
    // "sujeira no banco", é uma conta de verdade, usável.
    cy.get(SELECTORS.loginUser).select(emailTldInvalido);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();

    // Esperado: um e-mail com TLD absurdo nem deveria virar conta válida, muito menos logar.
    // Real (bug): loga normalmente -> este 'not.exist' falha, documentando o BUG-003.
    cy.get(SELECTORS.topbar).should('not.exist');
  });
});
