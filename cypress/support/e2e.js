// "Câmera lenta" global pros testes — só pra ficar visível em vídeo/apresentação
// ao vivo. Não mexe em nenhuma asserção, só insere uma pausa antes de cada
// interação de UI (clique, digitação, seleção etc).
//
// Pra ajustar a velocidade sem editar este arquivo, rode com --env, ex.:
//   npx cypress run --env SLOWDOWN_MS=1200
//   npx cypress run --env SLOWDOWN_MS=0      (desliga o slow motion)

const SLOWDOWN_MS = Number(Cypress.env('SLOWDOWN_MS')) || 400;
const TYPE_DELAY_MS = Number(Cypress.env('TYPE_DELAY_MS')) || 30;
// Textos curtos (nome, e-mail, senha) digitam no ritmo normal (TYPE_DELAY_MS/caractere).
// Payloads gigantes (ex.: HTML/CSS injetado nos testes de XSS) são bem mais longos que
// um campo real — sem isso, um payload de 400+ caracteres levaria 12+ segundos só digitando.
const TYPE_LONG_TEXT_THRESHOLD = 60;
const TYPE_LONG_TEXT_MAX_MS = 1500;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function typeDelayFor(text) {
  const len = typeof text === 'string' ? text.length : 0;
  if (len <= TYPE_LONG_TEXT_THRESHOLD) return TYPE_DELAY_MS;
  return Math.max(1, Math.min(TYPE_DELAY_MS, Math.floor(TYPE_LONG_TEXT_MAX_MS / len)));
}

if (SLOWDOWN_MS > 0) {
  for (const cmd of ['click', 'select', 'clear', 'check', 'uncheck', 'visit']) {
    Cypress.Commands.overwrite(cmd, (originalFn, ...args) => {
      return delay(SLOWDOWN_MS).then(() => originalFn(...args));
    });
  }

  Cypress.Commands.overwrite('type', (originalFn, subject, text, options = {}) => {
    return delay(SLOWDOWN_MS).then(() => originalFn(subject, text, { delay: typeDelayFor(text), ...options }));
  });
}
