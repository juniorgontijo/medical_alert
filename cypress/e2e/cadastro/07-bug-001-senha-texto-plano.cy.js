const { TOAST, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');
const { nomeAleatorio, emailAleatorio } = require('../../support/randomData');

describe('Cadastro de usuário', () => {
  const SENHA_PARA_HASH = 'senhaSecreta123';

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('[BUG-001 · falha = confirmado] senha NAO deveria ficar salva em texto plano no banco', () => {
    const nome = nomeAleatorio();
    const emailHash = emailAleatorio(nome);
    preencherCadastro({ name: nome, email: emailHash, password: SENHA_PARA_HASH });
    cy.get(SELECTORS.toast).should('contain', TOAST.CADASTRO_SUCESSO);

    cy.task('getUserPassword', emailHash).then((senhaSalva) => {
      // Esperado: a senha salva deveria ser um hash (bcrypt/argon2), nunca igual ao texto digitado.
      // Real (bug): fica gravada exatamente como foi digitada -> falha, documentando o BUG-001.
      expect(senhaSalva).not.to.eq(SENHA_PARA_HASH);
    });
  });
});
