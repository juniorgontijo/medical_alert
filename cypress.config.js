const { defineConfig } = require('cypress');
const path = require('path');

module.exports = defineConfig({
  video: true,
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on) {
      on('task', {
        // Usado só pelo BUG-001: consulta a senha gravada direto no banco,
        // já que nenhuma rota da API expõe esse valor (nem deveria).
        getUserPassword(email) {
          delete require.cache[require.resolve(path.join(__dirname, 'server', 'lib', 'db'))];
          const { db } = require(path.join(__dirname, 'server', 'lib', 'db'));
          const row = db.prepare('SELECT password FROM users WHERE lower(email) = lower(?)').get(email);
          return row ? row.password : null;
        },
      });
    },
  },
});
