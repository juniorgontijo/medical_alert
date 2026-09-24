const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { ensureFreshForToday, seedDatabase } = require('./lib/seed');
const { attachUser } = require('./lib/session');

const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const alertRoutes = require('./routes/alerts');

// Garante que o banco existe e está com os dados do dia atual antes
// de subir o servidor (equivalente ao reset diário automático).
ensureFreshForToday();

// Verificação periódica: se o processo do servidor ficar rodando
// atravessando a virada do dia, os dados também resetam sozinhos,
// sem precisar reiniciar o servidor.
setInterval(() => { ensureFreshForToday(); }, 5 * 60 * 1000);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/alerts', alertRoutes);

// Reset manual de dados — usado pelo link "Reiniciar dados do sistema"
// na tela de login. Não exige autenticação de propósito: é uma
// ferramenta de apoio à turma, não uma funcionalidade de produção.
app.post('/api/admin/reset', (req, res) => {
  seedDatabase();
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.listen(PORT, () => {
  console.log(`MedAlert rodando em http://localhost:${PORT}`);
});
