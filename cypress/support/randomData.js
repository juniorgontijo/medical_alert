// Gera nomes brasileiros realistas (e o e-mail correspondente) pras contas
// criadas DURANTE os testes de cadastro — só pra ficar mais natural em vídeo.
// Sorteia um valor novo a cada execução da suíte.

const PRIMEIROS_NOMES = [
  'Ana', 'Bruno', 'Camila', 'Diego', 'Fernanda', 'Gustavo', 'Isabela', 'João',
  'Juliana', 'Lucas', 'Mariana', 'Nicolas', 'Otávio', 'Patrícia', 'Rafael',
  'Sabrina', 'Thiago', 'Valentina', 'Wagner', 'Yasmin',
];

const SOBRENOMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Esteves', 'Ferreira', 'Gonçalves',
  'Henrique', 'Junqueira', 'Lacerda', 'Machado', 'Nogueira', 'Oliveira',
  'Pereira', 'Queiroz', 'Ribeiro', 'Santana', 'Teixeira', 'Vasconcelos', 'Xavier',
];

function sorteia(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function nomeAleatorio() {
  return `${sorteia(PRIMEIROS_NOMES)} ${sorteia(SOBRENOMES)}`;
}

function slug(nome) {
  return nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, '.');
}

function emailAleatorio(nome, dominio = 'medalert.test') {
  const sufixo = Math.floor(Math.random() * 100000);
  return `${slug(nome)}.${sufixo}@${dominio}`;
}

module.exports = { nomeAleatorio, slug, emailAleatorio };
