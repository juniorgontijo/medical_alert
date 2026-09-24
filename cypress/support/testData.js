/**
 * Dados de teste compartilhados entre os specs do Cypress — usuários do seed,
 * a "senha de bypass" do BUG-005 e textos de toast usados nas asserções.
 * Centralizar aqui evita repetir os mesmos literais em vários arquivos.
 */

const USERS = {
  marina: { id: 'pac1', name: 'Marina Souza', email: 'marina@medalert.test', role: 'patient' },
  roberto: { id: 'pac2', name: 'Roberto Lima', email: 'roberto@medalert.test', role: 'patient' },
  camila: { name: 'Camila Duarte', email: 'camila@medalert.test', role: 'nurse' },
  paulo: { name: 'Paulo Ferreira', email: 'paulo@medalert.test', role: 'nurse' },
  helena: { name: 'Dra. Helena Prado', email: 'helena@medalert.test', role: 'doctor' },
};

// BUG-005: o login não confere a senha real, só exige >= 1 caractere.
const SENHA_BYPASS = 'x';

// Senha de verdade usada nos usuários semeados (server/lib/seed.js).
const SENHA_SEED = 'senha123';

const TOAST = {
  CADASTRO_SUCESSO: 'Conta criada com sucesso',
  SINAIS_REGISTRADOS: 'Sinais vitais registrados',
};

const SINAIS_NORMAIS = { hr: 75, spo2: 97, temp: 36.6, sys: 118, dia: 76 };

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

const PATIENT_STATUS = {
  INTERNADO: 'internado',
  ALTA: 'alta',
};

// Seletores do DOM usados pelos specs — centralizados aqui pra não repetir
// (e pra atualizar num lugar só se o front-end mudar algum id/classe).
const SELECTORS = {
  // Login
  loginUser: '#loginUser',
  loginPass: '#loginPass',
  loginBtn: '#loginBtn',
  loginError: '#loginError',
  topbar: '.topbar',

  // Cadastro
  regName: '#regName',
  regEmail: '#regEmail',
  regRole: '#regRole',
  regPass: '#regPass',
  regPass2: '#regPass2',
  registerBtn: '#registerBtn',
  registerError: '#registerError',

  // Comum a várias telas
  toast: '#toast',
  patientItem: '.patient-item',
  tab: '.tab',

  // Enfermagem — sinais vitais / alertas
  vitalHr: '#v_hr',
  vitalSpo2: '#v_spo2',
  vitalTemp: '#v_temp',
  vitalSys: '#v_sys',
  vitalDia: '#v_dia',
  alertsTab: '[data-tab="alerts"]',
  badge: '.badge',
  ackBtn: '.ackBtn',

  // Médico
  rxForm: '#rxForm',
  dischargeBtn: '#dischargeBtn',
};

module.exports = { USERS, SENHA_BYPASS, SENHA_SEED, TOAST, SINAIS_NORMAIS, HTTP_STATUS, PATIENT_STATUS, SELECTORS };
