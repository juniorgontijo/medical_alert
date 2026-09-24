const { TOAST, SENHA_BYPASS, SELECTORS } = require('../../support/testData');
const { preencherCadastro } = require('../../support/helpers');

describe('Cadastro de usuário', () => {
  // Injeta um <div> com position:fixed — vira uma "modal" real no meio da tela,
  // por cima de tudo. É só CSS/HTML (não depende de window.alert(), que o próprio
  // Cypress intercepta e não chega a mostrar nada na tela/vídeo).
  const PAYLOAD_XSS = 'TesteXSSCypress<div id="xss-proof-cypress" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border:4px solid #c0392b;border-radius:12px;padding:28px 40px;box-shadow:0 20px 60px rgba(0,0,0,.5);z-index:9999;font-size:20px;font-weight:700;color:#c0392b;text-align:center;">⚠ XSS EXECUTADO ⚠<br><span style="font-size:13px;font-weight:400;color:#333">Isso deveria ser só um nome de usuário.</span></div>';

  beforeEach(() => {
    cy.request('POST', '/api/admin/reset');
    cy.visit('/');
    cy.contains('Cadastre-se').click();
  });

  it('[BUG-002 · falha = confirmado] nome com HTML nao deveria virar elemento real no cabeçalho após login (XSS armazenado)', () => {
    // Nota: o seletor de login (<select><option>) NÃO é um bom lugar pra provar isso —
    // navegadores descartam tags não-texto dentro de <option>, então esse contexto
    // específico não executa o payload, mesmo com o HTML injetado sem escapar.
    // O cabeçalho (topbar), por outro lado, é um <span> normal (public/app.js:97,
    // `${currentUser.name}` interpolado direto no innerHTML) e executa.
    const emailXss = 'xss.cypress@medalert.test';
    preencherCadastro({ name: PAYLOAD_XSS, email: emailXss });
    cy.get(SELECTORS.toast).should('contain', TOAST.CADASTRO_SUCESSO);

    // Explora o BUG-006 (login aceita 1 caractere) pra logar como a própria conta maliciosa
    // e ver o nome renderizado no cabeçalho (topbar), fora de qualquer <select>.
    cy.get(SELECTORS.loginUser).select(emailXss);
    cy.get(SELECTORS.loginPass).type(SENHA_BYPASS);
    cy.get(SELECTORS.loginBtn).click();

    // Esperado: o nome deveria aparecer só como texto no cabeçalho, nunca virar uma tag <div> real.
    // Real (bug): o navegador cria o elemento de verdade — uma modal vermelha aparece
    // no meio da tela -> este 'not.exist' falha, documentando o BUG-002 de forma clara em vídeo.
    cy.get(SELECTORS.topbar).find('div#xss-proof-cypress').should('not.exist');
  });
});
