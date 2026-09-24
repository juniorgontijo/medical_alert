/* =========================================================
   MedAlert — front-end (consome a API REST do backend)
   ========================================================= */

const api = {
  async _req(method, url, body) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.error) || ('Erro ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  },
  directory() { return this._req('GET', '/api/auth/directory'); },
  me() { return this._req('GET', '/api/auth/me'); },
  login(email, password) { return this._req('POST', '/api/auth/login', { email, password }); },
  register(payload) { return this._req('POST', '/api/auth/register', payload); },
  logout() { return this._req('POST', '/api/auth/logout'); },
  resetData() { return this._req('POST', '/api/admin/reset'); },
  listPatients() { return this._req('GET', '/api/patients'); },
  getPatient(id) { return this._req('GET', '/api/patients/' + encodeURIComponent(id)); },
  postVitals(id, v) { return this._req('POST', '/api/patients/' + encodeURIComponent(id) + '/vitals', v); },
  putThresholds(id, th) { return this._req('PUT', '/api/patients/' + encodeURIComponent(id) + '/thresholds', th); },
  postPrescription(id, rx) { return this._req('POST', '/api/patients/' + encodeURIComponent(id) + '/prescriptions', rx); },
  discharge(id) { return this._req('POST', '/api/patients/' + encodeURIComponent(id) + '/discharge'); },
  callNurse(id) { return this._req('POST', '/api/patients/' + encodeURIComponent(id) + '/call-nurse'); },
  acknowledge(alertId) { return this._req('POST', '/api/alerts/' + encodeURIComponent(alertId) + '/acknowledge'); },
  escalate(alertId) { return this._req('POST', '/api/alerts/' + encodeURIComponent(alertId) + '/escalate'); },
};

let currentUser = null;
let authView = 'login'; // 'login' | 'register'
let directory = [];
let myPatients = [];
let selectedPatientId = null;
let selectedPatientDetail = null;
let activeTab = 'overview';

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.style.display = 'none'; }, 2600);
}
function roleLabel(r) { return r === 'patient' ? 'Paciente' : r === 'nurse' ? 'Enfermeiro(a)' : 'Médico(a)'; }
function statusLabel(s) { return { pending: 'Pendente', acknowledged: 'Reconhecido', escalated: 'Escalonado' }[s] || s; }
function fmtTs(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

async function boot() {
  try {
    const { user } = await api.me();
    currentUser = user;
  } catch (e) {
    currentUser = null;
  }
  await render();
}

async function render() {
  const app = document.getElementById('app');
  if (!currentUser) {
    try { directory = (await api.directory()).users; } catch (e) { directory = []; }
    app.innerHTML = authView === 'register' ? registerScreen() : loginScreen();
    if (authView === 'register') attachRegisterHandlers(); else attachLoginHandlers();
    return;
  }
  try {
    myPatients = (await api.listPatients()).patients;
  } catch (e) {
    myPatients = [];
  }
  if (!selectedPatientId || !myPatients.find(p => p.id === selectedPatientId)) {
    selectedPatientId = myPatients[0] ? myPatients[0].id : null;
  }
  if (currentUser.role === 'patient') { app.innerHTML = topbar() + await patientContent(); attachLogout(); attachPatientHandlers(); }
  if (currentUser.role === 'nurse') { await renderNurse(app); }
  if (currentUser.role === 'doctor') { await renderDoctor(app); }
}

function topbar(extraRight) {
  return `
    <header class="topbar">
      <h1>MedAlert</h1>
      <div class="userinfo">
        <span>${currentUser.name} · ${roleLabel(currentUser.role)}</span>
        ${extraRight || ''}
        <button class="btn-outline btn-small" id="logoutBtn" style="background:transparent;color:#fff;border-color:#fff;">Trocar usuário</button>
      </div>
    </header>`;
}
function attachLogout() {
  const b = document.getElementById('logoutBtn');
  if (b) b.onclick = async () => { await api.logout(); currentUser = null; selectedPatientId = null; await render(); };
}

/* ---------------- LOGIN / REGISTER ---------------- */
function loginScreen() {
  const opts = directory.map(u => `<option value="${u.email}">${u.name} — ${roleLabel(u.role)}</option>`).join('');
  return `
    <div class="login-wrap">
      <h2>MedAlert</h2>
      <p class="muted">Sistema de Gerenciamento de Alertas Hospitalares</p>
      <div class="field">
        <label>Usuário</label>
        <select id="loginUser">${opts}</select>
      </div>
      <div class="field">
        <label>Senha</label>
        <input type="password" id="loginPass" placeholder="Digite a senha">
      </div>
      <button class="btn-primary" id="loginBtn" style="width:100%;">Entrar</button>
      <p class="muted" id="loginError" style="color:#c0392b;margin-top:10px;"></p>
      <p class="muted" style="margin-top:16px;text-align:center;">
        Não tem conta? <a href="#" id="goRegister" style="color:var(--primary);font-weight:600;">Cadastre-se</a>
      </p>
      <p style="margin-top:8px;text-align:center;font-size:12px;">
        <a href="#" id="resetDataLink" style="color:var(--muted);">Reiniciar dados do sistema</a>
      </p>
    </div>`;
}

function attachLoginHandlers() {
  document.getElementById('loginBtn').onclick = async () => {
    const email = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');
    try {
      const { user } = await api.login(email, pass);
      currentUser = user;
      selectedPatientId = null;
      activeTab = 'overview';
      await render();
    } catch (e) {
      errEl.textContent = e.message;
    }
  };
  document.getElementById('goRegister').onclick = (e) => { e.preventDefault(); authView = 'register'; render(); };
  document.getElementById('resetDataLink').onclick = async (e) => {
    e.preventDefault();
    if (confirm('Isso apaga todos os cadastros e alterações feitas hoje, voltando o sistema ao estado inicial. Continuar?')) {
      await api.resetData();
      showToast('Dados reiniciados para o estado inicial.');
      await render();
    }
  };
}

function registerScreen() {
  return `
    <div class="login-wrap">
      <h2>Criar conta</h2>
      <p class="muted">Cadastro de novo usuário no MedAlert</p>
      <div class="field"><label>Nome completo</label><input type="text" id="regName"></div>
      <div class="field"><label>E-mail</label><input type="email" id="regEmail"></div>
      <div class="field">
        <label>Perfil</label>
        <select id="regRole">
          <option value="patient">Paciente</option>
          <option value="nurse">Enfermeiro(a)</option>
          <option value="doctor">Médico(a)</option>
        </select>
      </div>
      <div class="field"><label>Senha</label><input type="password" id="regPass"></div>
      <div class="field"><label>Confirmar senha</label><input type="password" id="regPass2"></div>
      <button class="btn-primary" id="registerBtn" style="width:100%;">Criar conta</button>
      <p class="muted" id="registerError" style="color:#c0392b;margin-top:10px;"></p>
      <p class="muted" style="margin-top:16px;text-align:center;">
        Já tem conta? <a href="#" id="goLogin" style="color:var(--primary);font-weight:600;">Entrar</a>
      </p>
    </div>`;
}

function attachRegisterHandlers() {
  document.getElementById('goLogin').onclick = (e) => { e.preventDefault(); authView = 'login'; render(); };
  document.getElementById('registerBtn').onclick = async () => {
    const payload = {
      name: document.getElementById('regName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      role: document.getElementById('regRole').value,
      password: document.getElementById('regPass').value,
      confirmPassword: document.getElementById('regPass2').value,
    };
    const errEl = document.getElementById('registerError');
    try {
      await api.register(payload);
      showToast('Conta criada com sucesso. Faça login.');
      authView = 'login';
      await render();
    } catch (e) {
      errEl.textContent = e.message;
    }
  };
}

/* ---------------- PATIENT ---------------- */
async function patientContent() {
  const detail = await api.getPatient(currentUser.id);
  const last = detail.vitals[detail.vitals.length - 1];
  return `
    <div class="page-wrap">
      <div class="card">
        <h3>Meus sinais vitais (última leitura)</h3>
        ${last ? `
        <div class="grid2">
          <div>FC: <b>${last.hr} bpm</b></div>
          <div>SpO2: <b>${last.spo2}%</b></div>
          <div>Temperatura: <b>${last.temp} °F</b></div>
          <div>Pressão: <b>${last.sys}/${last.dia} mmHg</b></div>
        </div>` : '<p class="muted">Sem registros ainda.</p>'}
        <p class="muted" style="margin-top:10px;">Registrado em: ${last ? fmtTs(last.ts) : '-'}</p>
      </div>

      <div class="card">
        <h3>Meus alertas</h3>
        ${detail.alerts.length === 0 ? '<p class="empty">Nenhum alerta registrado.</p>' : `
        <table>
          <tr><th>Data</th><th>Severidade</th><th>Mensagem</th><th>Status</th></tr>
          ${detail.alerts.slice().reverse().map(a => `
            <tr>
              <td>${fmtTs(a.createdAt)}</td>
              <td><span class="sev sev-${a.severity}">${a.severity}</span></td>
              <td>${a.message}</td>
              <td><span class="status-pill status-${a.status}">${statusLabel(a.status)}</span></td>
            </tr>`).join('')}
        </table>`}
      </div>

      <div class="card">
        <h3>Minhas prescrições</h3>
        ${detail.prescriptions.length === 0 ? '<p class="empty">Nenhuma prescrição ativa.</p>' : `
        <table><tr><th>Medicamento</th><th>Dose</th><th>Frequência</th></tr>
        ${detail.prescriptions.map(x => `<tr><td>${x.drug}</td><td>${x.dose}</td><td>${x.freq}</td></tr>`).join('')}
        </table>`}
      </div>

      <button class="btn-primary" id="callNurseBtn">Solicitar atendimento da enfermagem</button>
    </div>`;
}
function attachPatientHandlers() {
  document.getElementById('callNurseBtn').onclick = async () => {
    await api.callNurse(currentUser.id);
    showToast('Solicitação enviada à enfermagem.');
    document.getElementById('app').innerHTML = topbar() + await patientContent();
    attachLogout();
    attachPatientHandlers();
  };
}

/* ---------------- NURSE ---------------- */
async function renderNurse(app) {
  const pendingCount = await countPendingForMyPatients();
  const badge = `<span class="badge">Alertas pendentes: ${pendingCount}</span>`;
  app.innerHTML = `
    ${topbar(badge)}
    <div class="layout">
      <div class="sidebar">
        <h3>Meus pacientes</h3>
        ${myPatients.map(p => `
          <div class="patient-item ${p.id === selectedPatientId ? 'active' : ''}" data-pid="${p.id}">
            <div><b>${p.name}</b></div>
            <div style="font-size:12px;opacity:.8;">Leito ${p.bed}</div>
          </div>`).join('')}
      </div>
      <div class="content" id="nurseContent"></div>
    </div>`;
  attachLogout();
  document.querySelectorAll('.patient-item').forEach(el => {
    el.onclick = async () => { selectedPatientId = el.getAttribute('data-pid'); activeTab = 'overview'; await renderNurse(document.getElementById('app')); };
  });
  await refreshNurseContent();
}

// O contador de "alertas pendentes" no cabeçalho só é recalculado
// quando o dashboard inteiro é renderizado (login / troca de
// paciente) — não quando o conteúdo interno é atualizado sozinho
// (ex.: depois de reconhecer um alerta). Bug intencional.
async function countPendingForMyPatients() {
  let count = 0;
  for (const p of myPatients) {
    try {
      const d = await api.getPatient(p.id);
      count += d.alerts.filter(a => a.status === 'pending').length;
    } catch (e) { /* ignore */ }
  }
  return count;
}

async function refreshNurseContent() {
  const container = document.getElementById('nurseContent');
  if (!selectedPatientId) { container.innerHTML = `<div class="card empty">Selecione um paciente.</div>`; return; }
  selectedPatientDetail = await api.getPatient(selectedPatientId);
  container.innerHTML = `
    <div class="tabs">
      <div class="tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Sinais vitais</div>
      <div class="tab ${activeTab === 'alerts' ? 'active' : ''}" data-tab="alerts">Alertas</div>
    </div>
    ${activeTab === 'overview' ? nurseVitalsTab(selectedPatientDetail) : nurseAlertsTab(selectedPatientDetail)}
  `;
  bindNurseContentEvents();
}

function nurseVitalsTab(d) {
  return `
    <div class="card">
      <h3>Registrar sinais vitais — ${d.patient.name}</h3>
      <form id="vitalsForm" class="vitals-form">
        <div class="grid2">
          <div><label>Frequência cardíaca (bpm)</label><input type="number" id="v_hr" required></div>
          <div><label>SpO2 (%)</label><input type="number" id="v_spo2" required></div>
          <div><label>Temperatura (°F)</label><input type="number" step="0.1" id="v_temp" required></div>
          <div><label>Pressão sistólica (mmHg)</label><input type="number" id="v_sys" required></div>
          <div><label>Pressão diastólica (mmHg)</label><input type="number" id="v_dia" required></div>
        </div>
        <button class="btn-primary" style="margin-top:14px;" type="submit">Registrar sinais</button>
      </form>
    </div>
    <div class="card">
      <h3>Histórico</h3>
      <table>
        <tr><th>Data</th><th>FC</th><th>SpO2</th><th>Temp.</th><th>Pressão</th></tr>
        ${d.vitals.slice().reverse().map(v => `
          <tr><td>${fmtTs(v.ts)}</td><td>${v.hr}</td><td>${v.spo2}%</td><td>${v.temp} °F</td><td>${v.sys}/${v.dia}</td></tr>
        `).join('')}
      </table>
    </div>`;
}

function nurseAlertsTab(d) {
  return `
    <div class="card">
      <h3>Alertas — ${d.patient.name}</h3>
      ${d.alerts.length === 0 ? '<p class="empty">Nenhum alerta.</p>' : `
      <table>
        <tr><th>Data</th><th>Severidade</th><th>Mensagem</th><th>Status</th><th></th></tr>
        ${d.alerts.slice().reverse().map(a => `
          <tr>
            <td>${fmtTs(a.createdAt)}</td>
            <td><span class="sev sev-${a.severity}">${a.severity}</span></td>
            <td>${a.message}</td>
            <td><span class="status-pill status-${a.status}">${statusLabel(a.status)}</span></td>
            <td>
              <button class="btn-outline btn-small ackBtn" data-aid="${a.id}">Reconhecer</button>
              <button class="btn-outline btn-small escBtn" data-aid="${a.id}">Escalonar p/ médico</button>
            </td>
          </tr>`).join('')}
      </table>`}
    </div>`;
}

function bindNurseContentEvents() {
  document.querySelectorAll('.tab').forEach(el => {
    el.onclick = async () => { activeTab = el.getAttribute('data-tab'); await refreshNurseContent(); };
  });
  const form = document.getElementById('vitalsForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const v = {
        hr: Number(document.getElementById('v_hr').value),
        spo2: Number(document.getElementById('v_spo2').value),
        temp: Number(document.getElementById('v_temp').value),
        sys: Number(document.getElementById('v_sys').value),
        dia: Number(document.getElementById('v_dia').value),
      };
      // BUG: nenhuma validação de faixa no front (ex.: FC negativa é aceita).
      await api.postVitals(selectedPatientId, v);
      showToast('Sinais vitais registrados.');
      await refreshNurseContent(); // o contador do cabeçalho não é atualizado aqui
    };
  }
  document.querySelectorAll('.ackBtn').forEach(btn => {
    btn.onclick = async () => {
      await api.acknowledge(btn.getAttribute('data-aid'));
      showToast('Alerta reconhecido.');
      await refreshNurseContent(); // idem — contador do cabeçalho fica desatualizado
    };
  });
  document.querySelectorAll('.escBtn').forEach(btn => {
    btn.onclick = async () => {
      await api.escalate(btn.getAttribute('data-aid'));
      showToast('Alerta escalonado para o médico responsável.');
      await refreshNurseContent();
    };
  });
}
function attachNurseHandlers() { /* handlers ligados dentro de renderNurse/refreshNurseContent */ }

/* ---------------- DOCTOR ---------------- */
async function renderDoctor(app) {
  app.innerHTML = `
    ${topbar()}
    <div class="layout">
      <div class="sidebar">
        <h3>Pacientes</h3>
        ${myPatients.map(p => `
          <div class="patient-item ${p.id === selectedPatientId ? 'active' : ''}" data-pid="${p.id}">
            <div><b>${p.name}</b></div>
            <div style="font-size:12px;opacity:.8;">Leito ${p.bed} · ${p.status === 'alta' ? 'Alta' : 'Internado'}</div>
          </div>`).join('')}
      </div>
      <div class="content" id="doctorContent"></div>
    </div>`;
  attachLogout();
  document.querySelectorAll('.patient-item').forEach(el => {
    el.onclick = async () => { selectedPatientId = el.getAttribute('data-pid'); activeTab = 'overview'; await renderDoctor(document.getElementById('app')); };
  });
  await refreshDoctorContent();
}

async function refreshDoctorContent() {
  const container = document.getElementById('doctorContent');
  const d = selectedPatientId ? await api.getPatient(selectedPatientId) : null;
  container.innerHTML = `
    <div class="tabs">
      <div class="tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Visão geral</div>
      <div class="tab ${activeTab === 'alerts' ? 'active' : ''}" data-tab="alerts">Alertas</div>
      <div class="tab ${activeTab === 'thresholds' ? 'active' : ''}" data-tab="thresholds">Limiares</div>
      <div class="tab ${activeTab === 'rx' ? 'active' : ''}" data-tab="rx">Prescrição</div>
    </div>
    ${doctorTabBody(d)}
  `;
  bindDoctorContentEvents();
}

function doctorTabBody(d) {
  // A aba "Prescrição" fica acessível mesmo sem paciente selecionado
  // (d === null) — bug intencional (ver rota /prescriptions no back-end).
  if (activeTab === 'rx') return doctorRxTab(d);
  if (!d) return `<div class="card empty">Selecione um paciente na lista ao lado.</div>`;
  if (activeTab === 'overview') return doctorOverviewTab(d);
  if (activeTab === 'alerts') return doctorAlertsTab(d);
  if (activeTab === 'thresholds') return doctorThresholdsTab(d);
}

function doctorOverviewTab(d) {
  const last = d.vitals[d.vitals.length - 1];
  return `
    <div class="card">
      <h3>${d.patient.name} — Leito ${d.patient.bed}</h3>
      <p class="muted">${d.patient.age != null ? d.patient.age + ' anos · ' : ''}Status: ${d.patient.status === 'alta' ? 'Alta' : 'Internado'}</p>
      ${last ? `<div class="grid2">
        <div>FC: <b>${last.hr} bpm</b></div>
        <div>SpO2: <b>${last.spo2}%</b></div>
        <div>Temperatura: <b>${last.temp} °F</b></div>
        <div>Pressão: <b>${last.sys}/${last.dia} mmHg</b></div>
      </div>` : '<p class="muted">Sem registros.</p>'}
      <button class="btn-danger" id="dischargeBtn" style="margin-top:16px;" ${d.patient.status === 'alta' ? 'disabled' : ''}>Dar alta ao paciente</button>
    </div>
    <div class="card">
      <h3>Histórico de sinais vitais</h3>
      <table>
        <tr><th>Data</th><th>FC</th><th>SpO2</th><th>Temp.</th><th>Pressão</th></tr>
        ${d.vitals.slice().reverse().map(v => `
          <tr><td>${fmtTs(v.ts)}</td><td>${v.hr}</td><td>${v.spo2}%</td><td>${v.temp} °F</td><td>${v.sys}/${v.dia}</td></tr>
        `).join('')}
      </table>
    </div>`;
}

function doctorAlertsTab(d) {
  return `
    <div class="card">
      <h3>Alertas — ${d.patient.name}</h3>
      ${d.alerts.length === 0 ? '<p class="empty">Nenhum alerta.</p>' : `
      <table>
        <tr><th>Data</th><th>Severidade</th><th>Mensagem</th><th>Status</th></tr>
        ${d.alerts.slice().reverse().map(a => `
          <tr>
            <td>${fmtTs(a.createdAt)}</td>
            <td><span class="sev sev-${a.severity}">${a.severity}</span></td>
            <td>${a.message}</td>
            <td><span class="status-pill status-${a.status}">${statusLabel(a.status)}</span></td>
          </tr>`).join('')}
      </table>`}
    </div>`;
}

function doctorThresholdsTab(d) {
  const th = d.patient.thresholds;
  return `
    <div class="card">
      <h3>Limiares de alerta — ${d.patient.name}</h3>
      <form id="thForm" class="vitals-form">
        <div class="grid2">
          <div><label>FC alta a partir de (bpm)</label><input type="number" id="th_hrHigh" value="${th.hrHigh}"></div>
          <div><label>FC baixa abaixo de (bpm)</label><input type="number" id="th_hrLow" value="${th.hrLow}"></div>
          <div><label>SpO2 crítica abaixo de (%)</label><input type="number" id="th_spo2Low" value="${th.spo2Low}"></div>
          <div><label>Temperatura alta a partir de (°C)</label><input type="number" step="0.1" id="th_tempHigh" value="${th.tempHigh}"></div>
          <div><label>Pressão sistólica alta a partir de (mmHg)</label><input type="number" id="th_sysHigh" value="${th.sysHigh}"></div>
        </div>
        <button class="btn-primary" type="submit" style="margin-top:14px;">Salvar limiares</button>
      </form>
    </div>`;
}

function doctorRxTab(d) {
  return `
    <div class="card">
      <h3>Nova prescrição ${d ? '— ' + d.patient.name : ''}</h3>
      <form id="rxForm" class="vitals-form">
        <div class="grid2">
          <div><label>Medicamento</label><input type="text" id="rx_drug" required></div>
          <div><label>Dose</label><input type="text" id="rx_dose" required></div>
          <div><label>Frequência</label><input type="text" id="rx_freq" placeholder="ex.: 8/8h" required></div>
        </div>
        <button class="btn-primary" type="submit" style="margin-top:14px;">Prescrever</button>
      </form>
      ${d ? `
      <h4 style="margin-top:20px;">Prescrições atuais</h4>
      <table><tr><th>Medicamento</th><th>Dose</th><th>Frequência</th></tr>
      ${d.prescriptions.map(x => `<tr><td>${x.drug}</td><td>${x.dose}</td><td>${x.freq}</td></tr>`).join('')}
      </table>` : ''}
    </div>`;
}

function bindDoctorContentEvents() {
  document.querySelectorAll('.tab').forEach(el => {
    el.onclick = async () => { activeTab = el.getAttribute('data-tab'); await refreshDoctorContent(); };
  });
  const dischargeBtn = document.getElementById('dischargeBtn');
  if (dischargeBtn) {
    dischargeBtn.onclick = async () => {
      // BUG (melhoria visível): nenhuma confirmação antes de uma ação irreversível.
      await api.discharge(selectedPatientId);
      showToast('Paciente recebeu alta.');
      await renderDoctor(document.getElementById('app'));
    };
  }
  const thForm = document.getElementById('thForm');
  if (thForm) {
    thForm.onsubmit = async (e) => {
      e.preventDefault();
      const th = {
        hrHigh: Number(document.getElementById('th_hrHigh').value),
        hrLow: Number(document.getElementById('th_hrLow').value),
        spo2Low: Number(document.getElementById('th_spo2Low').value),
        tempHigh: Number(document.getElementById('th_tempHigh').value),
        sysHigh: Number(document.getElementById('th_sysHigh').value),
      };
      await api.putThresholds(selectedPatientId, th);
      showToast('Limiares atualizados.');
    };
  }
  const rxForm = document.getElementById('rxForm');
  if (rxForm) {
    rxForm.onsubmit = async (e) => {
      e.preventDefault();
      const rx = {
        drug: document.getElementById('rx_drug').value,
        dose: document.getElementById('rx_dose').value,
        freq: document.getElementById('rx_freq').value,
      };
      // BUG: se nenhum paciente estiver selecionado, o front-end ainda
      // assim chama a API (com id vazio/indefinido); o servidor responde
      // sucesso mesmo sem gravar nada — falha silenciosa.
      await api.postPrescription(selectedPatientId || 'undefined', rx);
      showToast('Prescrição salva com sucesso.');
      await refreshDoctorContent();
    };
  }
}

boot();
