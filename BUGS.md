# MedAlert — Log de Bugs (QA)

> Log de bugs encontrados durante teste manual + revisão de código completa, para apresentação.
> Organizado por **ordem cronológica de uso do sistema** (regra de negócio): primeiro cadastro, depois login, depois o uso autenticado (visualizar pacientes → enfermagem registra sinais vitais → gestão de alertas → ações do médico). Cada item ainda indica **severidade** e **camada** (Back-end, Front-end, ou os dois).
>
> Todo bug tem uma seção **"Como testar (passo a passo)"** — dá pra reproduzir qualquer um deles só clicando na tela, sem saber programar. Alguns exigem abrir o **Console do navegador** (F12) porque a ação (POST/PUT) não dá pra disparar só digitando um endereço na barra — o passo a passo explica exatamente o que colar ali.

## Glossário rápido (termos técnicos usados abaixo)

- **Console do navegador (DevTools):** um painel escondido do navegador, pra quem desenvolve o site. Abre com a tecla **F12** (ou botão direito → "Inspecionar" → aba "Console"). Dá pra colar um comandinho ali e ele executa na hora, como se fosse o próprio site fazendo aquilo.
- **`fetch(...)`:** o comando que se cola no Console pra fazer o navegador chamar uma rota da API diretamente (ex.: "dar alta num paciente"), sem precisar clicar em nenhum botão da tela. É só copiar e colar exatamente como está escrito no passo a passo.
- **JSON:** o formato de texto que a API devolve como resposta, tipo `{"ok":true}`. É só um jeito de organizar informação em pares `"nome": valor`, dá pra ler direto.
- **Timestamp (ex.: `1790081356243`):** a forma que o sistema guarda "quando algo aconteceu" — é a quantidade de milissegundos (1/1000 de segundo) contados desde 1º de janeiro de 1970. Não precisa entender o número em si, só saber que **quanto menor**, mais **antigo** é o registro.
- **Hash (de senha):** uma senha "embaralhada" de um jeito que não dá pra desembaralhar de volta. Um sistema correto nunca guarda a senha exata, só esse embaralhado — e compara embaralhando de novo na hora do login.
- **IDOR:** sigla em inglês pra "referência direta insegura a objeto" — na prática, significa que o sistema deixa você acessar o dado de **outra pessoa** só trocando um número/ID na URL ou na requisição, sem checar se você tem permissão pra aquilo.
- **Cookie de sessão:** um "crachá" que o navegador guarda depois do login, provando quem você é nas próximas requisições. Reaproveitado automaticamente se você abrir uma nova aba no mesmo navegador (por isso alguns testes pedem pra abrir "uma nova aba", sem precisar logar de novo).

### Tipo de teste (Caixa-preta / Caixa-cinza / Caixa-branca)

Cada bug abaixo indica como ele foi encontrado, porque isso muda o quão fácil é reproduzir/explicar pra alguém que não tem acesso ao código:

- **Caixa-preta:** achado só testando pela tela/API, sem olhar nem precisar de nenhum acesso "por dentro" do sistema — é o teste mais tradicional (digitei X, esperava Y, veio Z).
- **Caixa-cinza:** precisou de um acesso parcial "por dentro" — consultar o banco de dados direto, olhar a resposta crua da API no Console/DevTools, ou chamar uma rota que a tela não usa — mas **sem** precisar ler a lógica do código-fonte.
- **Caixa-branca:** só foi possível encontrar (ou confirmar a causa) **lendo o código-fonte** — nenhum teste de tela, por mais criativo que fosse, revelaria isso sozinho.

## Resumo

| Etapa do fluxo | ID | Bug | Severidade | Camada | Tipo de teste | Categoria |
|---|----|-----|------------|--------|--------|-----------|
| 1. Cadastro de usuário | BUG-001 | Senhas armazenadas em texto plano (sem hash) | Crítica | Back-end | Cinza | Segurança |
| 1. Cadastro de usuário | BUG-002 | XSS armazenado: nome do cadastro renderizado sem escapar em 9 telas | Crítica | Front-end + Back-end | Preta | Segurança |
| 1. Cadastro de usuário | BUG-003 | Validação de e-mail no cadastro aceita domínio/TLD inválido | Média | Back-end | Preta | Funcional |
| 1. Cadastro de usuário | BUG-004 | Cadastro aceita emoji no nome, e-mail e senha, sem sanitização | Média | Back-end | Preta | Funcional |
| 2. Login | BUG-005 | Login exige só 1 caractere de senha e não confere se é a senha correta | Crítica | Back-end | Preta | Segurança |
| 2. Login | BUG-006 | Cadastro de e-mails exposto publicamente sem login | Alta | Back-end | Cinza | Segurança |
| 2. Login | BUG-007 | Reset de dados de produção sem autenticação | Alta | Back-end | Preta | Segurança |
| 3. Pós-login (visualizar pacientes) | BUG-008 | IDOR — qualquer usuário lê dados de qualquer paciente | Crítica | Back-end | Cinza | Segurança |
| 4. Enfermagem — sinais vitais | BUG-009 | Unidade de temperatura inconsistente (°F na tela, °C na regra) | Alta | Front-end + Back-end | Preta | Funcional |
| 4. Enfermagem — sinais vitais | BUG-010 | Sem validação de faixa nos sinais vitais (aceita valores negativos/absurdos) | Alta | Front-end + Back-end | Preta | Funcional |
| 4. Enfermagem — sinais vitais | BUG-011 | Limite de FC alta usa `>` em vez de `>=` (erro de borda) | Média | Back-end | Preta | Funcional |
| 4. Enfermagem — sinais vitais | BUG-012 | Alertas duplicados ao registrar o mesmo sinal vital repetidas vezes | Média | Back-end | Preta | Funcional |
| 5. Gestão de alertas | BUG-013 | Escalonamento automático de alertas críticos nunca acontece | Alta | Back-end | Branca | Funcional |
| 5. Gestão de alertas | BUG-014 | Alerta pode ser "reconhecido" mais de uma vez, sobrescrevendo o registro | Média | Back-end | Cinza | Integridade de dados |
| 5. Gestão de alertas | BUG-015 | Sem controle de fluxo entre Reconhecer/Escalonar (status e auditoria inconsistentes) | Média | Back-end | Cinza | Integridade de dados |
| 5. Gestão de alertas | BUG-016 | Contador de "alertas pendentes" no topo fica desatualizado | Baixa | Front-end | Preta | Usabilidade (UX) |
| 5. Gestão de alertas | BUG-017 | Botão "Reconhecer" alerta não pede confirmação | Baixa | Front-end | Preta | Usabilidade (UX) |
| 6. Médico — limiares/prescrição/alta | BUG-018 | IDOR — qualquer usuário altera/descarrega/prescreve para qualquer paciente | Crítica | Back-end | Cinza | Segurança |
| 6. Médico — limiares/prescrição/alta | BUG-019 | Prescrição "salva com sucesso" sem paciente selecionado (falha silenciosa) | Alta | Front-end + Back-end | Preta | Funcional |
| 6. Médico — limiares/prescrição/alta | BUG-020 | Alta do paciente sem tela de confirmação | Baixa | Front-end | Preta | Usabilidade (UX) |
| 6. Médico — limiares/prescrição/alta | BUG-021 | Botão "Dar alta" continua com aparência de ativo mesmo desabilitado | Baixa | Front-end | Preta | Visual |

---

# 1. Cadastro de usuário

## BUG-001 — Senhas armazenadas em texto plano (sem hash)

- **Severidade:** Crítica (Segurança)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (foi preciso consultar o banco de dados direto — não dá pra ver a senha crua só pela tela)
- **Categoria:** Segurança
- **Evidência no código:** [server/routes/auth.js:60-61](server/routes/auth.js#L60-L61) — no cadastro, a senha recebida do formulário é gravada **exatamente como veio**, sem passar por nenhuma função de hash (`bcrypt`, `argon2`, `scrypt`, etc. — nenhuma dessas bibliotecas sequer é importada no projeto):
  ```js
  db.prepare('INSERT INTO users (id, role, name, email, password) VALUES (?,?,?,?,?)')
    .run(id, role, name.trim(), email.trim(), password);
  ```

### Como testar (passo a passo)
1. Abra o MedAlert e clique em **"Cadastre-se"**.
2. Cadastre uma conta qualquer (ex.: nome "Teste Senha", e-mail `teste.senha@medalert.test`, senha `123456`).
3. Abra o arquivo `data/medalert.db` no VS Code (com a extensão de SQLite já instalada) — ou peça pra alguém rodar uma consulta na tabela `users` pra você.
4. Procure a linha da conta que você acabou de criar e olhe a coluna `password`.

**Esperado:** deveria aparecer algo ilegível, tipo `$2b$10$K3jH8x...` (um *hash* — ver glossário no topo do documento).
**Real (bug):** aparece exatamente `123456`, idêntico ao que foi digitado.

### Confirmado em teste manual (consulta direta ao banco)
Consultei a tabela `users` diretamente e a senha de todo mundo aparece **legível**, igual foi digitada no cadastro/seed:

| Usuário | Senha gravada no banco |
|---|---|
| Marina Souza, Roberto Lima, Camila Duarte, Paulo Ferreira, Dra. Helena Prado (seed) | `senha123` |
| Conta de teste registrada com `123456` | `123456` |
| Conta de teste registrada com emoji `🫶🫶🫶🫶🫶🫶` | `🫶🫶🫶🫶🫶🫶` |

### Resultado esperado
Senha nunca deveria ser gravada em texto plano. O padrão de mercado é gerar um hash (ex.: `bcrypt.hash(password, 10)`) no cadastro e comparar com `bcrypt.compare()` no login — assim, mesmo que o banco vaze, ninguém recupera a senha original.

### Impacto
Esse é o tipo de falha que, isolada, já seria crítica em qualquer sistema real — e se um dia o BUG-005 for corrigido (login passar a comparar senha de verdade), o problema não desaparece: continuaria expondo a senha real de cada pessoa para quem tiver qualquer acesso de leitura ao banco (backup, dump, vazamento, ou até um dev com acesso ao arquivo `data/medalert.db`). Combinado ao BUG-005, hoje o dado nem é *necessário* pra invadir uma conta — mas ele é uma bomba-relógio que só não estourou porque outro bug (falta de checagem de senha) está "escondendo" o problema.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-001](evidencias/BUG-001.png)

---

## BUG-002 — XSS armazenado: campo "Nome completo" do cadastro é inserido sem escapar em 9 telas diferentes

- **Severidade:** Crítica (Segurança)
- **Camada:** Front-end + Back-end
- **Tipo de teste:** Caixa-preta (colar HTML no campo Nome completo e ver se ele vira elemento real na tela é um teste de comportamento, sem precisar ler nenhum código)
- **Categoria:** Segurança
- **Evidência (Back-end):** [server/routes/auth.js:50](server/routes/auth.js#L50) não filtra nem sanitiza o conteúdo do nome — aceita `<`, `>`, `"` e qualquer HTML.
- **Evidência (Front-end):** o nome do usuário é interpolado **cru**, dentro de template string, direto em `innerHTML`, em pelo menos 9 pontos de [public/app.js](public/app.js), sem nenhum escape:
  - linha 97 — nome do usuário logado no topo (`topbar`)
  - linha 110 — `<option>` do seletor de login (ver ressalva abaixo)
  - linhas 272 e 409 — nome do paciente na barra lateral da enfermagem/médico
  - linhas 317, 343, 451, 475, 494 — nome do paciente em títulos de várias abas (sinais vitais, alertas, limiares)

- **⚠️ Correção importante (achada ao automatizar o teste no Cypress, com navegador de verdade):** o `<option>` do seletor de login (linha 110) **não é um bom PoC** — navegadores, pela própria especificação de parsing de HTML, **descartam** tags que não sejam texto (como `<img>`) quando aparecem dentro de um `<select>`/`<option>`. Ou seja, esse ponto específico não executa o payload, mesmo recebendo o HTML sem escapar. Isso **não invalida o bug**: os outros 8 pontos listados (`topbar`, barra lateral, títulos de aba) são `<div>`/`<span>`/`<h3>` normais, sem essa restrição, e executam o payload normalmente — só o exemplo inicial de reprodução (via tela de login) estava errado.

### Passos para reproduzir (corrigido)
1. Ir em "Cadastre-se".
2. No campo **Nome completo**, colocar: `Teste<img src=x onerror=alert(document.cookie)>`
3. Completar e-mail/senha e enviar o cadastro normalmente.
4. Faça login com essa mesma conta: volte pra tela inicial, no campo **"Usuário"** selecione a conta que você acabou de criar (vai aparecer na lista com o nome que você digitou), no campo **"Senha"** digite qualquer coisa (ex.: `x` — funciona por causa do BUG-005), e clique em **"Entrar"**. O payload dispara ao renderizar o **cabeçalho** no topo da tela, que mostra o nome do usuário logado.

### Confirmado em teste automatizado (Cypress, navegador Electron/Chromium de verdade)
Teste em [cypress/e2e/cadastro.cy.js](cypress/e2e/cadastro.cy.js) — cadastra a conta com o payload, loga com ela, e verifica se a tag maliciosa existe dentro do `.topbar`. Resultado real da execução:
```
AssertionError: Timed out retrying after 4000ms: Expected <img#xss-proof-cypress> not to exist in the DOM, but it was continuously found.
```
Ou seja, a tag `<img>` **foi criada de verdade** no DOM do cabeçalho, confirmando execução real do HTML injetado — não é só um dado "sujo" no banco, é HTML/JS de fato interpretado pelo navegador. (O teste equivalente usando o seletor de login, por outro lado, passa — reforçando a ressalva acima.)

Também confirmei por API que o dado fica gravado **cru** no banco (`"Teste<img src=x onerror=alert(document.cookie)>"`) e que `/api/auth/directory` devolve esse valor sem qualquer escaping — a causa raiz (front-end nunca escapa nada) é a mesma para todos os 8 pontos válidos de exploração.

### Por que é mais grave do que "só" um XSS comum
- Como o cadastro de paciente vincula automaticamente ao primeiro enfermeiro e ao primeiro médico do sistema (regra de atribuição ingênua, ver "Observações adicionais" no fim deste documento e [FEATURES.md](FEATURES.md) FEATURE-001), esse nome malicioso também aparece na **barra lateral autenticada** da enfermagem e da médica responsável (linhas 272/409) — ou seja, o ataque não depende só do próprio atacante logar; ele também executa dentro da sessão logada de um profissional de saúde de verdade, sem esse profissional fazer nada além de olhar a lista de pacientes.
- O cookie de sessão é `httpOnly` (não dá pra ler direto pelo `document.cookie`), mas isso não neutraliza o ataque: um script rodando na sessão da enfermagem/médico pode simplesmente **fazer chamadas à própria API como se fosse aquele usuário** (`fetch('/api/patients/...')` etc.) — e, combinado com o BUG-008/BUG-018 (IDOR), um script assim poderia varrer e vazar o prontuário de **todos os pacientes do sistema** para um servidor externo, tudo isso só porque alguém se autocadastrou com um nome malicioso.

### Resultado esperado
Nunca inserir dado vindo do usuário direto em `innerHTML`. Ou escapar o texto antes de interpolar (converter `<`, `>`, `"`, `&` para as entidades HTML correspondentes), ou construir os elementos via DOM (`textContent`) em vez de strings de HTML.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-002](evidencias/BUG-002.png)

---

## BUG-003 — Validação de e-mail no cadastro aceita domínio/TLD claramente inválido

- **Severidade:** Média (Qualidade de dados)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-preta (só testar valores de e-mail estranhos e ver se o cadastro aceita)
- **Categoria:** Funcional
- **Evidência no código:** [server/routes/auth.js:7](server/routes/auth.js#L7) — `const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;`. Essa regra só exige "algo, arroba, algo, ponto, algo", sem checar se o trecho depois do ponto é um TLD real, sem limite de tamanho e aceitando até TLD numérico.

### Passos para reproduzir
1. Na tela inicial do MedAlert, clique em **"Cadastre-se"**.
2. Preencha **Nome completo** com qualquer coisa (ex.: "Teste TLD").
3. Preencha **E-mail** como `a@a.123456` (um TLD só de números, claramente inválido).
4. Preencha **Senha** e **Confirmar senha** com qualquer coisa de 6 caracteres ou mais (ex.: `123456`).
5. Deixe o campo **Perfil** como "Paciente" e clique em **"Cadastrar"**.
6. (Prova extra, opcional) Volte pra tela inicial: no campo **"Usuário"** selecione a conta que você acabou de criar, no campo **"Senha"** digite qualquer coisa (ex.: `x`), clique em **"Entrar"** — o login funciona normalmente, provando que não é só um dado sujo salvo, é uma conta de verdade e usável.

### Resultado atual (confirmado em teste manual + via API)
Cadastro aceito normalmente (`{"ok":true}`) para `a@a.commmmmmmmmmmmmm`, `a@a.a` e `a@a.123456` — nenhum desses é um e-mail real, mas todos passam pela validação.

### Resultado esperado
E-mail deveria ser validado contra um padrão mais rígido (TLD alfabético com tamanho plausível — 2 a ~24 caracteres — ou idealmente confirmação por link enviado ao e-mail, que é a validação mais confiável de que o endereço existe de verdade).

### Confirmado em teste automatizado (Cypress, navegador Electron/Chromium de verdade)
O teste cadastra a conta com o e-mail de TLD inválido, confirma o toast de sucesso, e então **loga com essa mesma conta** (explorando o BUG-005 — qualquer senha de 1 caractere serve) pra mostrar, ao vivo, que não é só um dado sujo salvo no banco: é uma conta de verdade, autenticável e usável. A asserção final espera que o cabeçalho (`.topbar`) **não** apareça (já que uma conta dessas nem deveria existir) — só que ele aparece, então o Cypress fica tentando por 4 segundos (o timeout padrão de retry) até desistir e falhar. Resultado real da execução:
```
AssertionError: Timed out retrying after 4000ms: Expected <header.topbar> not to exist in the DOM, but it was continuously found.
```
Ou seja, o cabeçalho **foi renderizado de verdade**, confirmando que o login funcionou normalmente com essa conta. Essa demora de ~4s antes de falhar é esperada — não é travamento nem erro de script, é o Cypress esperando o tempo padrão antes de assumir que o elemento nunca vai sumir.

### O que testado e **não** é bug (validações que funcionam corretamente)
- **Nome completo repetido:** aceito — não deveria ser bloqueado mesmo, nome de pessoa não é identificador único.
- **E-mail já cadastrado:** corretamente rejeitado (`409 Já existe uma conta com este e-mail`) — [server/routes/auth.js:56-57](server/routes/auth.js#L56-L57).
- **Senha ≠ Confirmar senha:** corretamente rejeitado (`400`) — [server/routes/auth.js:54](server/routes/auth.js#L54).

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-003](evidencias/BUG-003.png)

---

## BUG-004 — Cadastro aceita emoji no nome, no e-mail e na senha, sem nenhuma sanitização de caracteres

- **Severidade:** Média (Qualidade de dados / potencial de exibição quebrada em outras telas)
- **Camada:** Back-end (Front-end também não valida o formato antes de enviar)
- **Tipo de teste:** Caixa-preta (só testar nome/e-mail/senha com emoji e ver se o cadastro aceita)
- **Categoria:** Funcional
- **Evidência no código:**
  - Nome: [server/routes/auth.js:50](server/routes/auth.js#L50) só checa `!name || !name.trim()` — aceita qualquer caractere, incluindo emoji.
  - E-mail: [server/routes/auth.js:7](server/routes/auth.js#L7) — o mesmo `EMAIL_RE` do BUG-003 (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) não exclui emoji, só bloqueia espaço e `@`; qualquer outro caractere Unicode (incluindo emoji) passa.
  - Senha: [server/routes/auth.js:53](server/routes/auth.js#L53) só checa `password.length < 6` — não valida tipo de caractere, só quantidade. Como emoji fora do plano básico do Unicode (ex.: 🫶) ocupam 2 posições no `length` do JavaScript, bastam poucos emoji pra "encher" o mínimo de 6. Pelo mesmo motivo, uma senha de **6 espaços em branco** (`"      "`) também é aceita — `length` é 6, não importa que seja tudo invisível.

### Passos para reproduzir
1. Na tela inicial do MedAlert, clique em **"Cadastre-se"**.
2. Preencha **Nome completo** com emoji (ex.: `🫶🫶🫶🫶🫶`).
3. Preencha **E-mail** com emoji também (ex.: `🫶@🫶.com`).
4. Preencha **Senha** e **Confirmar senha** com 6 emoji iguais (ex.: `🫶🫶🫶🫶🫶🫶`) — ou, alternativamente, com 6 espaços em branco.
5. Clique em **"Cadastrar"**.
6. (Prova extra, opcional) Volte pra tela inicial: no campo **"Usuário"** selecione essa conta de emoji que acabou de aparecer na lista, no campo **"Senha"** digite qualquer coisa (ex.: `x`), clique em **"Entrar"** — vai logar normalmente e mostrar os emojis de verdade no cabeçalho.

### Resultado atual (confirmado em teste manual, nos 3 campos)
Cadastro aceito normalmente com emoji no nome, no e-mail **e na senha**; os dados ficam gravados assim no banco (confirmado direto na tabela `users`) e o nome/e-mail aparecem depois no seletor de login, na lista de pacientes da enfermagem/médico, etc. Testei também senha só com espaços (`"      "`) — aceita da mesma forma.

### Resultado esperado
- Nome: deveria aceitar só letras, espaços e pontuação básica de nomes (acentos, hífen, apóstrofo).
- E-mail: um endereço com emoji não é um e-mail válido em nenhum provedor real — a validação (ver também BUG-003) deveria rejeitar caracteres fora do padrão usado em e-mails de verdade.
- Senha: não é errado permitir emoji tecnicamente, mas a regra de "mínimo 6" deveria ser pensada em termos de força real da senha (exigir pelo menos algum caractere não-espaço, por exemplo), não só contagem bruta de `length` — hoje até 3 emoji "raros" (fora do plano básico) ou 6 espaços em branco já passam o mínimo.

### Confirmado em teste automatizado (Cypress, navegador Electron/Chromium de verdade)
O teste cadastra a conta com nome e senha só de emoji, confirma o toast de sucesso, e então **loga com essa mesma conta** (explorando o BUG-005 — qualquer senha de 1 caractere serve) pra mostrar, ao vivo, que a conta funciona normalmente — os emojis aparecem de verdade no cabeçalho (`.topbar`). A asserção final espera que o cabeçalho **não** exista (já que uma conta com nome/senha só de emoji nem deveria existir), mas ele existe, então o Cypress tenta por 4 segundos (timeout padrão de retry) até falhar:
```
AssertionError: Timed out retrying after 4000ms: Expected <header.topbar> not to exist in the DOM, but it was continuously found.
```
Essa demora de ~4s antes de falhar é esperada (o Cypress esperando o tempo padrão até desistir), não é travamento nem erro de script — é a prova visual de que a conta está totalmente funcional.

### Impacto
Além de não fazer sentido cadastralmente (não existe provedor de e-mail que aceite `🫶@🫶.com`), esse tipo de entrada sem sanitização é um sinal de alerta maior — e não é só teórico neste projeto: o campo nome **é** reaproveitado sem escapar em várias telas (ver **BUG-002**, XSS armazenado usando exatamente esse mesmo campo de cadastro).

### Outros testes feitos na tela de cadastro que **não** encontraram bug (validações que funcionam)
- **Perfil ("role") inválido direto na API** — enviar `"role":"admin"` (fora das opções do `<select>`) é corretamente rejeitado com `400 { "error": "Perfil inválido." }` — [server/routes/auth.js:52](server/routes/auth.js#L52).
- **Injeção de SQL no nome** — testado com `Teste'; DROP TABLE users; --` no campo Nome completo. A tabela `users` não foi afetada; o texto foi gravado de forma segura, como string literal (não como comando SQL). Isso acontece porque o projeto usa *prepared statements* do `better-sqlite3` (`db.prepare(...).run(...)` com `?` como placeholder) em vez de concatenar string SQL manualmente — essa é a forma correta de evitar SQL Injection, e está sendo feita certo em todo o projeto.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-004](evidencias/BUG-004.png)

---

# 2. Tela de Login

## BUG-005 — Login exige apenas 1 caractere de senha e não confere se é a senha correta (bypass de login)

- **Severidade:** Crítica (Segurança)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-preta (só testar login com senha errada e ver se aceita)
- **Categoria:** Segurança
- **Módulo:** Login (`POST /api/auth/login`)
- **Evidência no código:** [server/routes/auth.js:31](server/routes/auth.js#L31) — a única validação que existe é `if (!password || password.length === 0)`, ou seja, o backend só rejeita senha **vazia**. Fora isso, **não existe nenhuma comparação** com `user.password` (a senha real cadastrada no banco) em nenhum outro ponto do arquivo.
- **Importante:** não é "sem validação nenhuma" — tecnicamente há uma validação (exige mínimo de 1 caractere, rejeita string vazia). O bug é que essa é a **única** checagem: a senha nunca é de fato comparada com a correta.

### Passos para reproduzir
1. Abrir a tela de login.
2. Selecionar qualquer usuário no dropdown (lista vem de `/api/auth/directory`).
3. Digitar qualquer coisa no campo Senha — 1 caractere já basta (letra, número, ou até um espaço em branco).
4. Clicar em "Entrar".

### Resultado atual
Login é aceito com qualquer senha, correta ou não, desde que tenha pelo menos 1 caractere (inclusive um espaço " ").

### Resultado esperado
O sistema deveria comparar a senha informada com a senha cadastrada do usuário e rejeitar senhas incorretas.

### Impacto
Qualquer pessoa que saiba (ou adivinhe) o e-mail de um usuário — e a lista de e-mails é **pública** via `/api/auth/directory` — consegue logar como esse usuário sem saber a senha real. Compromete login de médicos, enfermeiros e pacientes.

### Confirmado em teste manual
Testado com **todos os 5 usuários** cadastrados no sistema — em todos, um login com senha de 1 único caractere (letra ou número qualquer) foi aceito normalmente:

| Nome | Perfil | E-mail |
|------|--------|--------|
| Dra. Helena Prado | Médico(a) | helena@medalert.test |
| Camila Duarte | Enfermeiro(a) | camila@medalert.test |
| Paulo Ferreira | Enfermeiro(a) | paulo@medalert.test |
| Marina Souza | Paciente | marina@medalert.test |
| Roberto Lima | Paciente | roberto@medalert.test |

Confirma que o bug não é específico de um usuário ou perfil — afeta login de médico, enfermeiro e paciente igualmente.

Testado também com uma conta **nova, autocadastrada** (perfil Paciente), com senha real definida no cadastro como `123456` — mesmo assim, o login foi aceito digitando apenas 1 caractere na senha, ignorando a senha de 6 dígitos que havia sido cadastrada. Isso confirma que o problema não é ligado às senhas simples ("senha123") usadas nos usuários semeados: **nenhuma conta do sistema tem a senha validada no login**, independente de como ou quando foi criada.

### Confirmado em teste automatizado (Cypress, navegador Electron/Chromium de verdade)
O teste seleciona a Marina (usuária real do seed) e digita uma senha de 1 caractere, claramente errada. A asserção final espera que o cabeçalho (`.topbar`) **não** apareça (login deveria ter sido rejeitado), mas ele aparece — o Cypress tenta por 4 segundos (timeout padrão de retry) até desistir e falhar:
```
AssertionError: Timed out retrying after 4000ms: Expected <header.topbar> not to exist in the DOM, but it was continuously found.
```
Essa demora de ~4s antes de falhar é esperada, não é travamento nem erro de script — é o cabeçalho sendo renderizado de verdade, confirmando que o login foi aceito com a senha errada. Esse mesmo mecanismo (login via BUG-005 + asserção de que o cabeçalho não deveria existir) é reaproveitado nos testes automatizados do BUG-003 e do BUG-004, pra provar que aquelas contas "inválidas" também conseguem logar normalmente.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-005](evidencias/BUG-005.png)

---

## BUG-006 — `/api/auth/directory` expõe e-mail de todos os usuários sem login

- **Severidade:** Alta (Segurança / exposição de dados)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (a rota não aparece em nenhum botão da tela — só é visível abrindo o Console/DevTools e olhando as chamadas de rede, ou digitando o endereço direto)
- **Categoria:** Segurança
- **Evidência no código:** [server/routes/auth.js:9-15](server/routes/auth.js#L9-L15) — rota pública, sem `requireAuth`, retorna nome, papel e e-mail de todos os usuários (médicos, enfermeiros **e pacientes**).
- **Diferente dos outros bugs desta lista: aqui é decisão de design proposital, não erro de implementação.** O próprio comentário no código diz que a rota existe "para popular um seletor de login rápido no front-end" e que "não é um problema de segurança por si só" — é uma regra de negócio da versão de treinamento (poder escolher o usuário num dropdown em vez de digitar e-mail), não um bug de codificação como o BUG-005, BUG-008 ou BUG-018.

### Como testar (passo a passo)
1. Abra uma aba anônima do navegador (ou saia da conta, se estiver logado) — o importante é **não estar logado**.
2. Na barra de endereço, digite: `http://localhost:3000/api/auth/directory`
3. Aperte Enter.

**Esperado:** deveria aparecer um erro (`401 Não autorizado`).
**Real (bug):** aparece um texto (JSON — ver glossário) com nome, e-mail e perfil de **todos** os usuários cadastrados, inclusive pacientes.

### Por que ainda vale registrar como achado de QA
Mesmo sendo proposital, a decisão tem uma consequência de segurança real que vale levantar na apresentação: qualquer pessoa, sem estar logada, descobre publicamente quem é paciente daquele hospital (dado sensível por natureza) só de abrir a tela de login. E é essa mesma lista que torna o BUG-005 explorável sem nenhum esforço de adivinhação — não precisa nem tentar e-mails, a própria tela já entrega.

### Recomendação
Numa versão de produção, o seletor de login não deveria expor e-mail nem indicar quem é paciente; um campo de e-mail digitado manualmente resolveria a mesma UX sem esse vazamento. Como achado de QA, cabe reportar como "decisão de design com efeito colateral de segurança", não como "erro de código" — a redação para o time de desenvolvimento deveria diferenciar isso do BUG-005/BUG-008/BUG-018.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-006](evidencias/BUG-006.png)

---

## BUG-007 — Reset completo do banco sem autenticação

- **Severidade:** Alta (Segurança / ação destrutiva)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-preta (o link "Reiniciar dados do sistema" está visível na própria tela de login)
- **Categoria:** Segurança
- **Evidência no código:** [server/index.js:35-38](server/index.js#L35-L38) — `POST /api/admin/reset` chama `seedDatabase()` (que **apaga tudo**: usuários, pacientes, vitais, alertas, prescrições) e não passa por `requireAuth`. O próprio comentário no código diz que é proposital "para a turma", mas do ponto de vista de QA é uma falha real: qualquer pessoa, logada ou não, pode apagar a base de produção com uma única requisição.

### Como testar (passo a passo)
1. Abra o MedAlert **sem fazer login** (fique na tela inicial).
2. Clique no link **"Reiniciar dados do sistema"** (embaixo do botão "Entrar").
3. Confirme na modal que aparece ("Isso apaga todos os cadastros... Continuar?") clicando em **OK**.

**Esperado:** deveria pedir login de administrador antes de deixar continuar.
**Real (bug):** a ação acontece na hora — o banco inteiro é apagado e recriado do zero, mesmo sem nenhum login. A própria modal de confirmação que aparece já mostra que o botão está acessível pra qualquer visitante da tela de login, sem nenhuma credencial.

### Resultado esperado
Endpoints destrutivos não deveriam existir sem autenticação/autorização de administrador, mesmo em ambiente de treinamento — vale registrar como achado, com a ressalva de que é intencional no propósito didático do projeto.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-007](evidencias/BUG-007.png)

---

# 3. Pós-login — Visualização de pacientes

## BUG-008 — IDOR: leitura de dados de qualquer paciente por ID

- **Severidade:** Crítica (Segurança)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (a tela normal não deixa ver prontuário de outro paciente — só descobre trocando o ID direto na URL/Console)
- **Categoria:** Segurança
- **Evidência no código:** [server/routes/patients.js:32-47](server/routes/patients.js#L32-L47) — `GET /api/patients/:id` só exige `requireAuth`, nunca confere se o usuário logado (médico, enfermeiro ou até o próprio paciente) tem vínculo com o `:id` pedido.

### Passos para reproduzir
1. Na tela inicial, no campo **"Usuário"** selecione `Marina Souza — Paciente`, no campo **"Senha"** digite qualquer coisa (ex.: `x`), clique em **"Entrar"**.
2. Sem fechar essa aba, abra uma **nova aba** no mesmo navegador (o login fica valendo automaticamente nessa aba nova também, ver "Cookie de sessão" no glossário).
3. Na barra de endereço dessa nova aba, digite `http://localhost:3000/api/patients/pac2` (esse é o ID do Roberto Lima, outro paciente que a Marina não conhece) e aperte Enter.

### Resultado atual
Retorna o prontuário completo do paciente — notas médicas privadas, sinais vitais, alertas e prescrições — mesmo que quem pediu não seja o médico/enfermeiro responsável nem o próprio paciente.

### Resultado esperado
Um paciente só deveria ver os próprios dados; um enfermeiro/médico só os pacientes da própria carteira (mesma regra já aplicada em `GET /api/patients`, mas não replicada aqui).

### Confirmado em teste manual (requisição direta à API, sem passar pela tela)
Logada como **Marina Souza** (pac1, perfil Paciente), a tela normal (`GET /api/patients`) mostra corretamente só ela mesma. Mas chamando `GET /api/patients/pac2` diretamente (ex.: via `curl`, ou interceptando a requisição no DevTools), a API devolveu o prontuário **completo** de Roberto Lima (pac2), incluindo a nota médica privada *"DPOC em acompanhamento... Alergia a penicilina"* e o alerta crítico dele pendente — dado que Marina nunca deveria conseguir ver.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-008](evidencias/BUG-008.png)

---

# 4. Enfermagem — Registro de sinais vitais

## BUG-009 — Unidade de temperatura inconsistente (°F na tela vs. °C na regra de negócio)

- **Severidade:** Alta (Funcional — compromete a funcionalidade principal do sistema)
- **Camada:** Front-end + Back-end
- **Tipo de teste:** Caixa-preta (só registrar uma temperatura normal em Fahrenheit e ver se dispara alerta indevido)
- **Categoria:** Funcional
- **Evidência (Front-end):**
  - Rotula o campo de temperatura como **°F** tanto no cadastro de sinais vitais da enfermagem ([public/app.js:322](public/app.js#L322)) quanto na visão do paciente ([public/app.js:219](public/app.js#L219)) e no histórico do médico.
  - Mas a tela de limiares do médico rotula o mesmo campo como **°C** ([public/app.js:500](public/app.js#L500)) — inconsistência entre as próprias telas do front.
- **Evidência (Back-end):**
  - Os dados semeados/limiar padrão (`temp_high: 37.8`, leituras como `36.6`, `37.1`) só fazem sentido como **Celsius** — [server/lib/seed.js:44](server/lib/seed.js#L44).
  - A regra de alerta ([server/lib/rules.js:19](server/lib/rules.js#L19)) compara o valor bruto digitado com esse limiar, sem qualquer conversão de unidade.

### Como testar (passo a passo)
1. Faça login como enfermeira: usuário `Camila Duarte — Enfermeiro(a)`, qualquer senha (ex.: `x`).
2. Selecione a paciente **Marina Souza**.
3. Na aba de sinais vitais, registre: FC = 75, SpO2 = 97, **Temp. = 98** (o campo diz "°F"), Sistólica = 118, Diastólica = 76 — todos normais, exceto a temperatura que é 98 (temperatura corporal normal em Fahrenheit).
4. Clique em "Registrar sinais".
5. Vá na aba **Alertas**.

**Esperado:** 98°F é temperatura normal — não deveria gerar nenhum alerta.
**Real (bug):** aparece um alerta de **"Febre — temperatura elevada"**, porque o sistema compara 98 direto com o limiar 37,8 (que é em Celsius), sem converter a unidade.

### Resultado atual
Se a enfermagem digitar uma temperatura corporal real em Fahrenheit (ex.: 98,6 °F, temperatura normal), o sistema compara 98.6 contra o limiar 37.8 e dispara alerta de febre **sempre**, em toda leitura normal. A própria tela do paciente exibe "36,6 °F", um valor absurdo para essa unidade.

### Resultado esperado
O padrão do sistema deveria ser **°C**, não °F. O rótulo "°F" provavelmente é resquício de o sistema ter sido originalmente pensado num padrão americano/inglês (onde Fahrenheit é o padrão clínico) — mas o sistema é usado no Brasil, todos os outros textos da interface estão em português, e os próprios limiares/dados semeados já foram definidos em Celsius. Ou seja, a unidade correta para todo o sistema é °C; o campo de entrada da enfermagem que está rotulado como °F precisa ser corrigido para °C (assim como qualquer outro lugar da tela que ainda exiba "°F").

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-009](evidencias/BUG-009.png)

---

## BUG-010 — Sem validação de faixa nos sinais vitais (aceita valores absurdos)

- **Severidade:** Alta (Integridade de dados)
- **Camada:** Front-end + Back-end
- **Tipo de teste:** Caixa-preta (só testar um valor impossível, tipo FC negativa)
- **Categoria:** Funcional
- **Evidência (Front-end):** [public/app.js:377](public/app.js#L377) — formulário de sinais vitais da enfermagem não valida faixa nenhuma antes de enviar (comentário no próprio código já aponta isso).
- **Evidência (Back-end):** [server/routes/patients.js:51-64](server/routes/patients.js#L51-L64) só faz `Number(...)` nos valores recebidos, sem checar limites físicos plausíveis — mesmo que o front um dia valide, a API aceitaria qualquer valor vindo direto de fora.

### Como testar (passo a passo)
1. Faça login como `Camila Duarte — Enfermeiro(a)`, qualquer senha.
2. Selecione a paciente **Marina Souza**.
3. Registre sinais vitais com **FC = -50** (o resto pode ficar normal).
4. Clique em "Registrar sinais" e olhe o **Histórico**.

**Esperado:** o sistema deveria bloquear ou pelo menos avisar que -50 bpm é um valor impossível.
**Real (bug):** aceita numa boa e mostra "-50" normalmente na lista, como se fosse um valor válido.

### Resultado atual
Valor é aceito e gravado normalmente, entrando no histórico e sendo usado no cálculo de alertas.

### Resultado esperado
Validação de faixa fisiologicamente plausível tanto no front (feedback imediato ao usuário) quanto no back (defesa em profundidade, já que a API pode ser chamada diretamente).

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-010](evidencias/BUG-010.png)

---

## BUG-011 — Limite de FC alta usa `>` em vez de `>=` (erro de borda)

- **Severidade:** Média (Regra de negócio incorreta)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-preta (teste de valor limite — registrar exatamente o número do limiar é uma técnica clássica de QA, não precisa ler código; só a causa exata, ">" em vez de ">=", veio de olhar o código depois)
- **Categoria:** Funcional
- **Evidência no código:** [server/lib/rules.js:16](server/lib/rules.js#L16) — especificação diz "FC ≥ 100 gera alerta ALTA", mas a implementação usa `v.hr > patient.hr_high`.

### Como testar (passo a passo)
1. Faça login como `Camila Duarte — Enfermeiro(a)`, qualquer senha.
2. Selecione a paciente **Marina Souza** (o limiar de FC dela é 100, igual pro Roberto).
3. Registre sinais vitais com **FC = 100** (exatamente o limite, nem mais nem menos) e o resto normal.
4. Vá na aba **Alertas**.

**Esperado:** a regra diz "FC ≥ 100 gera alerta" — 100 deveria disparar.
**Real (bug):** nenhum alerta aparece com FC=100. Só dispara a partir de 101 pra cima (repita o teste com FC=101 pra confirmar que aí sim aparece o alerta).

### Resultado atual
Uma leitura de FC exatamente igual ao limiar (ex.: 100 quando `hr_high = 100`) **não** dispara alerta, contrariando a regra especificada.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-011](evidencias/BUG-011.png)

---

## BUG-012 — Alertas duplicados ao repetir o mesmo sinal vital

- **Severidade:** Média (Ruído operacional)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-preta (só registrar o mesmo sinal duas vezes e ver se duplica na lista)
- **Categoria:** Funcional
- **Evidência no código:** [server/lib/rules.js:22-24](server/lib/rules.js#L22-L24) — nenhuma checagem de duplicidade/"cooldown"; toda vez que os sinais registrados ultrapassam o limiar, um novo alerta é criado, mesmo que já exista um idêntico pendente para a mesma condição.

### Passos para reproduzir
1. Faça login como `Camila Duarte — Enfermeiro(a)` (`camila@medalert.test`, qualquer senha), selecione a paciente Marina Souza e registre sinais vitais fora da faixa (ex.: FC = 110, acima do limiar de 100).
2. **Registrar exatamente o mesmo sinal vital de novo** (mesmos valores, segunda vez seguida) — é preciso enviar duas vezes; uma única vez só gera 1 alerta normalmente, o que não é bug.
3. Abrir a aba "Alertas" do paciente (ou consultar `GET /api/patients/:id`).

### Resultado atual
Aparecem **dois** alertas idênticos ("Frequência cardíaca elevada (110 bpm)"), ambos pendentes, poluindo a visão da enfermagem/médico. Confirmado ao vivo via API: dois `POST /vitals` com o mesmo payload retornam `newAlerts:1` cada um, resultando em 2 linhas no array `alerts` do paciente.

### Resultado esperado
Antes de criar um alerta novo, o sistema deveria checar se já existe um alerta pendente idêntico (mesmo paciente, mesma mensagem) e não duplicar.

### Sugestão de melhoria (opcional, não obrigatória pra corrigir o bug)
A correção mínima é só o back-end não inserir o alerta repetido. Como "plus" de UX, ao detectar que a condição já tinha um alerta pendente igual, o sistema poderia mostrar um toast/aviso pra enfermagem (ex.: "Esse alerta já está pendente para este paciente") em vez de simplesmente ignorar o novo registro em silêncio — assim quem está registrando sabe que a duplicidade foi identificada e não fica na dúvida se o registro realmente funcionou.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-012](evidencias/BUG-012.png)

---

# 5. Gestão de alertas

## BUG-013 — Escalonamento automático de alertas críticos nunca acontece

- **Severidade:** Alta (Funcionalidade ausente / risco clínico)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-branca (o sintoma — alerta que não escalona sozinho — só é 100% confirmável lendo o código e vendo que a função existe mas nunca é chamada; pela tela sozinha, dava pra achar estranho mas não pra provar que é um bug intencional e não só "ainda não deu tempo")
- **Categoria:** Funcional
- **Evidência no código:** [server/lib/rules.js:32-41](server/lib/rules.js#L32-L41) — `checkAutoEscalation()` implementa a regra ("alerta crítico pendente há mais de 15 min deve escalonar sozinho"), mas a função **não é chamada em nenhuma rota nem em nenhum agendador** (`setInterval`, etc.) — código morto.
- O dado semeado em [server/lib/seed.js:65](server/lib/seed.js#L65) cria de propósito um alerta crítico pendente há 35 minutos (> 15 min) para comprovar que ele **nunca** muda de status sozinho.

### Como testar (passo a passo)
1. Clique em **"Reiniciar dados do sistema"** (isso recria o alerta crítico do Roberto já "fingindo" ter 35 minutos de idade — não precisa esperar tempo nenhum de verdade).
2. Faça login como `Paulo Ferreira — Enfermeiro(a)` (é ele o responsável pelo Roberto), qualquer senha.
3. Selecione o paciente **Roberto Lima**.
4. Vá na aba **Alertas**.

**Esperado:** o alerta crítico ("Saturação de oxigênio abaixo do limite") já tem mais de 15 minutos — deveria aparecer como **"Escalonado"** sozinho.
**Real (bug):** aparece como **"Pendente"** — e vai continuar assim pra sempre, não importa quanto tempo real você espere ou quantas vezes recarregue a página, porque a função que faria esse escalonamento existe no código mas nunca é chamada em lugar nenhum. Só muda de status se alguém clicar manualmente em "Escalonar p/ médico".

**Como confirmar por trás dos panos, sem terminal:** logado como Paulo, abra uma nova aba e cole `http://localhost:3000/api/patients/pac2`. No texto que aparece, procure `"createdAt"` do alerta crítico — é um *timestamp* (ver glossário no topo do documento): um número bem grande que representa "quando foi criado". Comparado com o timestamp de agora (que dá pra pegar colando `Date.now()` no Console do navegador), a diferença já passa de 15 minutos, mesmo logo depois do reset — e o `"status"` continua `"pending"` em vez de `"escalated"`.

### Resultado esperado
Alertas críticos ("critica") pendentes há mais de 15 minutos deveriam mudar automaticamente para `escalated`, mesmo sem ação manual da enfermagem — hoje só escalona se alguém clicar manualmente em "Escalonar p/ médico".

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-013](evidencias/BUG-013.png)

---

## BUG-014 — Alerta pode ser "reconhecido" mais de uma vez

- **Severidade:** Média (Integridade / trilha de auditoria)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (a tela não mostra quem reconheceu primeiro — só descobre a sobrescrita olhando a resposta da API no Console/DevTools antes e depois do 2º clique)
- **Categoria:** Integridade de dados
- **Evidência no código:** [server/routes/alerts.js:9-18](server/routes/alerts.js#L9-L18) — `POST /:id/acknowledge` não verifica `status` atual antes de sobrescrever `acknowledged_at`/`acknowledged_by`.

### Passos para reproduzir
1. Faça login como **enfermeira**: `Camila Duarte — Enfermeiro(a)` (`camila@medalert.test`, qualquer senha). O botão "Reconhecer" só existe na tela do enfermeiro/enfermeira, não aparece pro médico nem pro paciente.
2. Selecione a paciente **Marina Souza** e gere um alerta novo (registre um sinal fora da faixa, ex.: FC = 110).
3. Vá na aba **Alertas** e clique em "Reconhecer" nesse alerta uma primeira vez.
4. Clique em "Reconhecer" **de novo, no mesmo alerta já reconhecido** — é preciso reconhecer duas vezes; a primeira sozinha funciona normalmente e não é bug.

### Resultado atual
O segundo "Reconhecer" sobrescreve `acknowledged_at`/`acknowledged_by`, perdendo o registro de quem/quando reconheceu de fato primeiro — como se o primeiro reconhecimento nunca tivesse acontecido.

### Resultado esperado
Ao tentar reconhecer um alerta que já está `acknowledged`, o sistema deveria bloquear a ação ou pelo menos avisar que já foi reconhecido por outra pessoa, preservando o registro original.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-014](evidencias/BUG-014.png)

---

## BUG-015 — Não existe controle de fluxo entre "Reconhecer" e "Escalonar": status fica indo e voltando, com dados de auditoria inconsistentes

- **Severidade:** Média (Integridade de dados / trilha de auditoria)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (precisou comparar a resposta da API a cada passo da sequência pra ver os campos `acknowledgedBy`/`acknowledgedAt` se comportando errado)
- **Categoria:** Integridade de dados
- **Evidência no código:**
  - `POST /:id/acknowledge` ([server/routes/alerts.js:9-18](server/routes/alerts.js#L9-L18)) seta `status='acknowledged'` sem checar se o status atual é `escalated`.
  - `POST /:id/escalate` ([server/routes/alerts.js:20-26](server/routes/alerts.js#L20-L26)) seta `status='escalated'` sem checar o status atual, e **nunca limpa** `acknowledged_at`/`acknowledged_by`.
  - As duas rotas não têm nenhuma noção uma da outra — não existe uma máquina de estados (`pending → acknowledged → escalated`, com transições permitidas/proibidas), qualquer botão pode ser clicado a qualquer momento, em qualquer ordem.

### Como testar (passo a passo)
1. Faça login como `Camila Duarte — Enfermeiro(a)`, qualquer senha, e selecione a Marina.
2. Registre um sinal fora da faixa (ex.: FC = 110) pra gerar um alerta novo.
3. Na aba Alertas, clique em **"Reconhecer"**.
4. Sem sair da tela, clique em **"Escalonar p/ médico"** no mesmo alerta (que já está "Reconhecido").
5. Clique em **"Reconhecer"** de novo, nesse mesmo alerta (que agora está "Escalonado").
6. Repare no status do alerta depois de cada clique.

**Esperado:** depois de escalonado, um alerta não deveria conseguir "voltar" pra reconhecido — deveria existir uma ordem fixa de status.
**Real (bug):** o status fica pulando entre "Reconhecido" e "Escalonado" a cada clique, em qualquer ordem, e ainda mistura informação (um alerta "Escalonado" pode continuar mostrando "reconhecido por Camila Duarte" ao mesmo tempo).

### Confirmado em teste manual (sequência real, mesmo alerta)
Gerei um alerta novo (FC 110 em Marina) e apliquei as ações em sequência, no mesmo alerta:

| Passo | Ação | Resultado |
|---|---|---|
| 1 | Reconhecer | `status: "acknowledged"`, `acknowledgedBy: "Camila Duarte"` |
| 2 | **Escalonar** (alerta já reconhecido) | `status: "escalated"` — mas `acknowledgedBy`/`acknowledgedAt` **continuam preenchidos**, como se tivesse sido reconhecido e escalonado ao mesmo tempo |
| 3 | Reconhecer de novo (alerta já escalonado) | `status` volta pra `"acknowledged"` — como se o escalonamento nunca tivesse existido |

### Resultado atual
Dá pra alternar o status de um alerta entre "Reconhecido" e "Escalonado" indefinidamente, clicando os botões em qualquer ordem. Um alerta "Escalonado" pode ficar exibindo, ao mesmo tempo, que foi "reconhecido por Fulano" — uma combinação que não faz sentido pra quem está olhando a tela (foi tratado pela enfermagem ou foi pro médico? as duas coisas, segundo os dados).

### Resultado esperado
Definir uma máquina de estados clara para o alerta (ex.: `pending → acknowledged → escalated`, sem caminho de volta, ou com uma ação explícita de "reabrir" caso necessário) e impedir transições sem sentido — pelo menos limpar `acknowledged_at`/`acknowledged_by` ao escalonar, se escalonar depois de reconhecido for uma transição válida.

### Diferença para o BUG-014
O BUG-014 é sobre reconhecer o **mesmo status** duas vezes (perde quem reconheceu primeiro). Este bug é sobre a falta de controle **entre status diferentes** — o problema não é só duplicar uma ação, é a ausência total de regra sobre quais transições de status fazem sentido.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-015](evidencias/BUG-015.png)

---

## BUG-016 — Contador de "alertas pendentes" no topo fica desatualizado

- **Severidade:** Baixa (UX / dado desatualizado em tela)
- **Camada:** Front-end
- **Tipo de teste:** Caixa-preta (só observar o número no topo da tela antes/depois de um alerta novo)
- **Categoria:** Usabilidade (UX)
- **Evidência no código:** [public/app.js:285-298](public/app.js#L285-L298) — `countPendingForMyPatients()` só é recalculado quando a página inteira é renderizada (login, troca de paciente), não depois de reconhecer/escalonar um alerta ou registrar novos sinais vitais dentro da mesma tela.

### Como testar (passo a passo)
1. Faça login como `Camila Duarte — Enfermeiro(a)`, qualquer senha.
2. Repare no número ao lado de **"Alertas pendentes"**, no canto superior direito da tela (deve mostrar "0" logo após o reset).
3. Sem sair dessa tela nem trocar de paciente, selecione a Marina e registre um sinal fora da faixa (ex.: FC = 110).
4. Olhe de novo o número de "Alertas pendentes" no topo — **sem recarregar a página**.

**Esperado:** o número deveria virar "1" na hora, já que um alerta novo acabou de ser criado.
**Real (bug):** continua mostrando "0" até você trocar de paciente ou sair e logar de novo — o contador não percebe sozinho que mudou algo.

### Resultado atual
Enfermeiro reconhece o único alerta pendente de um paciente, mas o badge "Alertas pendentes: N" no topo continua mostrando o número antigo até trocar de paciente ou relogar.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-016](evidencias/BUG-016.png)

---

## BUG-017 — Botão "Reconhecer" alerta não pede confirmação

- **Severidade:** Baixa (UX — ação sem proteção, mesmo padrão do BUG-020)
- **Camada:** Front-end
- **Tipo de teste:** Caixa-preta (só clicar em "Reconhecer" e ver que não pergunta nada)
- **Categoria:** Usabilidade (UX)
- **Evidência no código:** [public/app.js:383-389](public/app.js#L383-L389) — o `onclick` do botão "Reconhecer" chama `api.acknowledge(...)` direto, sem `confirm()` nem modal. O botão "Escalonar p/ médico" ao lado (linhas 390-396) tem exatamente o mesmo problema.

### Como testar (passo a passo)
1. Faça login como `Camila Duarte — Enfermeiro(a)`, qualquer senha.
2. Selecione a Marina e registre um sinal fora da faixa (ex.: FC = 110) pra gerar um alerta.
3. Vá na aba **Alertas** e clique no botão **"Reconhecer"**.

**Esperado:** deveria aparecer uma pergunta antes, tipo "Confirma que quer reconhecer este alerta?" — igual acontece no link "Reiniciar dados do sistema".
**Real (bug):** a ação já acontece assim que você clica, sem perguntar nada — não tem como desfazer um clique acidental.

### Resultado atual
Um clique único (inclusive sem querer, ou um duplo-clique acidental) já marca o alerta como reconhecido, sem chance de cancelar ou confirmar antes.

### Resultado esperado
Antes de reconhecer (ou escalonar), o sistema deveria confirmar a ação — mesmo padrão que já falta no BUG-020 (alta do paciente).

### Por que isso importa mais do que parece
Combinado com o **BUG-014** (reconhecer um alerta já reconhecido sobrescreve quem/quando reconheceu de verdade primeiro): um clique acidental no "Reconhecer" não é só "sem querer marquei como visto" — se outro enfermeiro já tinha reconhecido antes, o clique acidental **apaga silenciosamente esse registro anterior**, sem nenhuma confirmação nas duas pontas (nem antes de agir, nem avisando que já existia um reconhecimento). Numa situação real, isso poderia esconder que um alerta crítico já passou por alguém ou, pior, dar a falsa impressão de que foi tratado quando ninguém olhou de fato.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-017](evidencias/BUG-017.png)

---

# 6. Médico — Limiares, prescrição e alta

## BUG-018 — IDOR: escrita/alteração em qualquer paciente por ID

- **Severidade:** Crítica (Segurança)
- **Camada:** Back-end
- **Tipo de teste:** Caixa-cinza (essas ações não têm botão pra um paciente comum na tela — só dá pra disparar chamando a API direto pelo Console/DevTools)
- **Categoria:** Segurança
- **Evidência no código:** mesma falta de checagem de vínculo em [server/routes/patients.js](server/routes/patients.js) nas rotas:
  - `POST /:id/vitals` (linha 51)
  - `PUT /:id/thresholds` (linha 66)
  - `POST /:id/prescriptions` (linha 82)
  - `POST /:id/discharge` (linha 95)
  - `POST /:id/call-nurse` (linha 103)

### Como testar (passo a passo, usando o Console do navegador)
Essas ações são do tipo "alterar dado" (POST/PUT) — não dá pra disparar só digitando um endereço na barra, como nos bugs de leitura. Por isso usa-se o **Console do navegador** (ver glossário no topo do documento).

1. Faça login como **Marina Souza** (paciente comum) — `marina@medalert.test`, qualquer senha.
2. Abra o DevTools: aperte **F12** (ou botão direito → "Inspecionar") e clique na aba **Console**.
3. Cole exatamente isto e aperte Enter:
   ```js
   fetch('/api/patients/pac2/discharge', { method: 'POST' }).then(r => r.json()).then(console.log)
   ```
4. Vai aparecer a resposta ali mesmo no Console.

**Esperado:** deveria voltar um erro `403` — Marina não tem nenhum vínculo com o Roberto (`pac2`).
**Real (bug):** volta `{ok: true}` — e o Roberto **realmente recebe alta**, dado de verdade uma paciente comum, sem nenhuma permissão de médico ou enfermagem.

⚠️ **Depois de testar, clique em "Reiniciar dados do sistema"** pra desfazer a alta e voltar tudo ao normal antes de continuar testando outros bugs.

Outras variações pra testar o mesmo problema (troque só a URL no comando acima):
- `fetch('/api/patients/pac2/vitals', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({hr:-999, spo2:200, temp:40, sys:300, dia:200}) }).then(r=>r.json()).then(console.log)` — lança sinais vitais falsos no Roberto.
- `fetch('/api/patients/pac2/thresholds', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({hrHigh:999, hrLow:1, spo2Low:1, tempHigh:999, sysHigh:999}) }).then(r=>r.json()).then(console.log)` — muda os limiares de alerta do Roberto.

### Resultado atual
Qualquer usuário autenticado — incluindo um **paciente** — pode, batendo direto na API: registrar sinais vitais em nome de outro paciente, mudar os limiares de alerta de qualquer paciente, lançar prescrições, dar alta em qualquer paciente (inclusive ele mesmo) ou disparar chamadas de enfermagem por outro paciente.

### Resultado esperado
Cada ação deveria validar o papel do usuário e o vínculo com o paciente (paciente só chama enfermagem para si mesmo; enfermeiro só registra vitais/reconhece alertas da própria carteira; médico só altera limiares/prescreve/dá alta para seus próprios pacientes).

### Confirmado em teste manual (requisição direta à API, logada como Marina/pac1 — perfil Paciente)
Todas as chamadas abaixo foram feitas com a sessão de **Marina Souza (paciente)**, mirando o paciente **Roberto Lima (pac2)** — alguém que ela não é e com quem não tem nenhum vínculo:

| Ação testada | Requisição | Resultado |
|---|---|---|
| Mudar limiares de alerta de Roberto | `PUT /api/patients/pac2/thresholds` `{hrHigh:999, hrLow:1, spo2Low:1, tempHigh:999, sysHigh:999}` | `{"ok":true}` — limiares realmente alterados no banco |
| Lançar sinais vitais falsos em Roberto | `POST /api/patients/pac2/vitals` `{hr:-999, spo2:200, temp:40, sys:300, dia:200}` | `{"ok":true,"newAlerts":1}` — aceito e gerou alerta |
| **Dar alta em Roberto** | `POST /api/patients/pac2/discharge` | `{"ok":true}` — status de Roberto virou `"alta"` |

Ou seja, uma paciente comum — sem nenhuma permissão de enfermagem ou médica — conseguiu, de fato, **dar alta em outro paciente** e sujar o histórico clínico dele com dados fabricados. (Banco restaurado ao estado inicial via reset depois do teste, para não deixar dado de teste contaminando a demonstração.)

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-018](evidencias/BUG-018.png)

---

## BUG-019 — Prescrição sem paciente selecionado: front deixa enviar, back responde "sucesso" sem gravar

- **Severidade:** Alta (Falha silenciosa / perda de dados)
- **Camada:** Front-end + Back-end
- **Tipo de teste:** Caixa-preta (só logar como médico sem paciente e tentar usar a aba Prescrição)
- **Categoria:** Funcional
- **Evidência (Front-end):** a aba "Prescrição" do médico fica acessível mesmo com `d === null` (nenhum paciente selecionado) — [public/app.js:439-440](public/app.js#L439-L440) — e o submit chama a API mesmo assim, com `selectedPatientId || 'undefined'` — [public/app.js:568](public/app.js#L568).
- **Evidência (Back-end):** `POST /:id/prescriptions` só grava se o paciente existir, mas responde `201 { ok: true, message: 'Prescrição salva com sucesso.' }` mesmo quando não existe `:id` válido, sem `else` retornando erro — [server/routes/patients.js:82-93](server/routes/patients.js#L82-L93).

### Como testar (passo a passo)
1. Cadastre uma conta nova de médico(a) (tela "Cadastre-se", perfil "Médico(a)", qualquer nome/e-mail) — como é um médico recém-criado, ele não tem nenhum paciente vinculado ainda.
2. Faça login com essa conta nova.
3. Repare que a aba "Visão geral" mostra corretamente "Selecione um paciente na lista ao lado" (isso já funciona certo).
4. Clique na aba **"Prescrição"** mesmo sem selecionar nenhum paciente.
5. Preencha o formulário (medicamento, dose, frequência) e envie.

**Esperado:** a aba de Prescrição nem deveria estar acessível sem paciente selecionado (mesmo bloqueio que a "Visão geral" já tem).
**Real (bug):** o formulário aparece normalmente, deixa preencher e enviar, e mostra o toast **"Prescrição salva com sucesso"** — mas nada é gravado no banco, a prescrição simplesmente some.

### Resultado atual
Médico pode preencher e "salvar" uma prescrição sem nenhum paciente selecionado; o sistema mostra toast de sucesso, mas nada é persistido no banco — a prescrição simplesmente some.

### Resultado esperado
Front não deveria permitir abrir/enviar o formulário sem paciente selecionado **e** back deveria validar e retornar erro (400/404) quando o `:id` não existir, em vez de responder sucesso.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-019](evidencias/BUG-019.png)

---

## BUG-020 — Alta do paciente sem confirmação

- **Severidade:** Baixa (UX — ação irreversível sem proteção)
- **Camada:** Front-end
- **Tipo de teste:** Caixa-preta (só clicar em "Dar alta" e ver que não pergunta nada)
- **Categoria:** Usabilidade (UX)
- **Evidência no código:** [public/app.js:532-540](public/app.js#L532-L540) — botão "Dar alta ao paciente" chama a API direto no `onclick`, sem `confirm()` ou modal (diferente do link "Reiniciar dados do sistema", que tem confirmação — [public/app.js:150-157](public/app.js#L150-L157)).

### Como testar (passo a passo)
1. Faça login como `Dra. Helena Prado — Médico(a)`, qualquer senha.
2. Selecione qualquer paciente (ex.: Marina Souza).
3. Clique no botão **"Dar alta ao paciente"**.

**Esperado:** deveria aparecer uma confirmação antes ("Tem certeza que quer dar alta?"), já que é uma ação irreversível — igual o link "Reiniciar dados do sistema" já faz.
**Real (bug):** a alta é efetivada na hora do clique, sem perguntar nada. Se quiser desfazer pra continuar testando outros bugs, use "Reiniciar dados do sistema".

### Resultado atual
Um clique único e sem querer já efetiva a alta do paciente, sem chance de cancelar.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-020](evidencias/BUG-020.png)

---

## BUG-021 — Botão "Dar alta ao paciente" continua com aparência de ativo depois da alta

- **Severidade:** Baixa (UX — falta de feedback visual)
- **Camada:** Front-end
- **Tipo de teste:** Caixa-preta (só comparar a cor do botão antes/depois de dar alta)
- **Categoria:** Visual
- **Evidência no código:**
  - [public/app.js:459](public/app.js#L459) — o botão recebe o atributo `disabled` corretamente quando `d.patient.status === 'alta'` (`${d.patient.status === 'alta' ? 'disabled' : ''}`), então ele **funcionalmente** para de responder a clique depois da alta — isso já funciona certo.
  - O problema é visual: em [public/styles.css](public/styles.css) não existe **nenhuma regra `:disabled`** — `.btn-danger` (linha 26) sempre aplica o mesmo vermelho sólido, e a regra global `button{cursor:pointer}` (linha 22) também não é sobrescrita para o estado desabilitado.

### Como testar (passo a passo)
1. Faça login como `Dra. Helena Prado — Médico(a)`, qualquer senha, e selecione um paciente.
2. Repare na cor do botão **"Dar alta ao paciente"** (vermelho vivo) antes de clicar.
3. Clique nele pra dar alta.
4. Compare a cor do botão **depois** da alta com a de antes.

**Esperado:** depois da alta, o botão deveria mudar — ficar acinzentado/opaco, mudar o texto, ou simplesmente sumir da tela — avisando visualmente que não funciona mais.
**Real (bug):** o botão continua **exatamente com a mesma cor vermelha** e o mesmo aspecto de "clicável" — clicar nele de novo não faz nada (o clique é bloqueado por baixo dos panos), mas nada na tela avisa isso.

### Resultado atual
Depois de dar alta, o botão continua com a mesma cor vermelha viva e o mesmo cursor de "clicável" (`pointer`) de antes — visualmente idêntico ao estado ativo. Ele realmente não aceita mais clique (o `disabled` do HTML impede o evento de disparar), mas nada na tela avisa isso: não muda de cor, não muda de texto, não some, não vira cinza. Quem está usando o sistema não tem nenhuma pista visual de que a ação já foi feita e o botão está inerte, o que é exatamente a confusão de "o botão não some".

### Resultado esperado
Depois da alta, o botão deveria dar algum sinal visual claro: ficar acinzentado/opaco (`opacity` + `cursor: not-allowed` no `:disabled`), trocar o texto para algo como "Paciente já recebeu alta", ou simplesmente ser removido da tela — qualquer uma dessas opções já resolveria a falta de feedback.

### Evidência (print)
<!-- Cole aqui o(s) print(s) de tela deste bug -->
![BUG-021](evidencias/BUG-021.png)

---

## Observações adicionais (não classificadas como bug isolado)
- Todo novo paciente autocadastrado é sempre vinculado ao **primeiro** enfermeiro e ao **primeiro** médico cadastrados no banco (`LIMIT 1`, sem nenhum critério de distribuição) — ver [server/routes/auth.js:63-65](server/routes/auth.js#L63-L65) (Back-end). Não é um erro de execução, mas uma regra de atribuição ingênua que vale mencionar na apresentação. (Ver também [FEATURES.md](FEATURES.md) — sugestão de feature de reatribuição de pacientes.)
- Cadastro de paciente não coleta idade nem leito — ficam `null`/`—` até alguém editar diretamente no banco (Front-end, não há tela para isso).
