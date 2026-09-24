import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

/**
 * Teste de carga (k6) do MedAlert — mede tempo de resposta das rotas
 * principais sob carga simultânea, com metas em PERCENTIS (p95/p99),
 * não em média. Média esconde os piores casos; percentil mostra o que
 * a maioria (ou quase todo mundo) realmente sentiu.
 *
 * Cenários disponíveis (escolha com --env SCENARIO=<nome>; padrão "load"):
 *   smoke — 1 usuário, 30s. Só confirma que o sistema funciona antes de
 *           rodar qualquer coisa maior; não mede performance de verdade.
 *   load  — carga gradual (0 -> 10 -> pico de 30 -> 0). Simula uso normal
 *           do dia a dia, com gente entrando aos poucos. Cenário padrão.
 *   spike — pico abrupto e repentino (5 -> 100 usuários em 5s), simulando
 *           uma emergência real (todo mundo acessando ao mesmo tempo).
 *
 * Cenários que existem no k6 mas ficaram de fora de propósito:
 *   stress     — sobe a carga até o sistema degradar. Rodar isso contra o
 *                servidor local da apresentação arrisca derrubá-lo bem na
 *                hora de mostrar outra coisa depois.
 *   breakpoint — mesma ideia do stress, só que até quebrar de vez. Mesmo risco.
 *   soak       — precisa rodar por HORAS pra fazer sentido (o objetivo é
 *                achar vazamento de memória/conexão ao longo do tempo);
 *                alguns minutos não provam nada e não cabem numa demonstração.
 *
 * Como rodar (com o servidor já em `npm start`):
 *   k6 run k6/load-test.js                        # load (padrão)
 *   k6 run --env SCENARIO=smoke k6/load-test.js
 *   k6 run --env SCENARIO=spike k6/load-test.js
 *   k6 run --env BASE_URL=http://localhost:3000 k6/load-test.js
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const SCENARIO = __ENV.SCENARIO || 'load';

// Métricas por rota, pra ver o percentil de cada endpoint separado
// (o threshold global de http_req_duration mistura todas as rotas juntas).
const duracaoDirectory = new Trend('duracao_directory', true);
const duracaoLogin = new Trend('duracao_login', true);
const duracaoListaPacientes = new Trend('duracao_lista_pacientes', true);
const duracaoDetalhePaciente = new Trend('duracao_detalhe_paciente', true);

const SCENARIOS = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 10 }, // sobe até 10 usuários simultâneos
      { duration: '30s', target: 10 }, // mantém 10 usuários por 30s
      { duration: '10s', target: 30 }, // pico de 30 usuários simultâneos
      { duration: '20s', target: 30 },
      { duration: '10s', target: 0 }, // desce até zero
    ],
  },
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '5s', target: 5 },    // baseline
      { duration: '5s', target: 100 },  // pico abrupto e repentino
      { duration: '15s', target: 100 }, // segura no pico
      { duration: '5s', target: 5 },    // volta ao baseline
      { duration: '10s', target: 0 },
    ],
  },
};

// Metas em percentil: "p(95)<500" = 95% das requisições devem responder em
// menos de 500ms; só 5% (o pior caso) pode passar disso. O spike é mais
// tolerante (degradar um pouco no auge do pico é esperado); o smoke só
// quer confirmar que nada quebra.
const THRESHOLDS = {
  smoke: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  load: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'], // menos de 1% de requisições com erro
    duracao_directory: ['p(95)<300', 'p(99)<600'],
    duracao_login: ['p(95)<400', 'p(99)<800'],
    duracao_lista_pacientes: ['p(95)<400', 'p(99)<800'],
    duracao_detalhe_paciente: ['p(95)<400', 'p(99)<800'],
  },
  spike: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'], // tolera mais erro no auge do pico
  },
};

export const options = {
  scenarios: {
    [SCENARIO]: { ...SCENARIOS[SCENARIO], exec: 'default' },
  },
  thresholds: THRESHOLDS[SCENARIO],

  // Mostra p(99) também no resumo impresso no terminal (por padrão o k6 só mostra até p(95)).
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

const HEADERS_JSON = { headers: { 'Content-Type': 'application/json' } };
const MARINA = { email: 'marina@medalert.test', password: 'x', id: 'pac1' }; // BUG-005: qualquer senha de 1 caractere loga

export function setup() {
  // Reset único, uma vez, ANTES da carga começar — nunca durante o teste,
  // pra não apagar dados no meio de outras VUs em andamento.
  http.post(`${BASE_URL}/api/admin/reset`);
}

export default function () {
  // 1. Tela de login (pública) — /api/auth/directory
  const dirRes = http.get(`${BASE_URL}/api/auth/directory`);
  duracaoDirectory.add(dirRes.timings.duration);
  check(dirRes, { 'directory: status 200': (r) => r.status === 200 });

  // 2. Login (k6 guarda o cookie de sessão automaticamente por VU)
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: MARINA.email, password: MARINA.password }),
    HEADERS_JSON
  );
  duracaoLogin.add(loginRes.timings.duration);
  check(loginRes, { 'login: status 200': (r) => r.status === 200 });

  // 3. Lista de pacientes (autenticado)
  const listaRes = http.get(`${BASE_URL}/api/patients`);
  duracaoListaPacientes.add(listaRes.timings.duration);
  check(listaRes, { 'lista pacientes: status 200': (r) => r.status === 200 });

  // 4. Detalhe do próprio paciente
  const detalheRes = http.get(`${BASE_URL}/api/patients/${MARINA.id}`);
  duracaoDetalhePaciente.add(detalheRes.timings.duration);
  check(detalheRes, { 'detalhe paciente: status 200': (r) => r.status === 200 });

  sleep(1);
}

export function teardown() {
  // Deixa o banco limpo de novo depois da carga, pronto pra apresentação.
  http.post(`${BASE_URL}/api/admin/reset`);
}
