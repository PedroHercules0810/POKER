const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { barraDeCarregamento,fullHouse, Pares, StraightFlush, cartaAleatoria, cartaParaRemover, criaBaralho, limparArquivo, salvarNoArquivo, escreveCarta } = require("./baralho/baralho.js");
const { Jogador, Carta } = require("./Classes/classes.js")
const {analisePar} = require("./estatisticas.js")


function jogo(seed, numero_jogadores) {
  const seedrandom = require("../node_modules/seedrandom")
  let rng = seedrandom(seed)

  salvarNoArquivo(`Usando a seed: ${seed}`);

  let jogadores = [];
  let comunitarias = [];


  //criando o baralho
  let baralho = criaBaralho();



  //dando as cartas dos jogadores
  for (let j = 0; j < numero_jogadores; j++) {
    //pegando duas cartas aleatorias
    jogadores[j] = new Jogador;

    let random_1 = cartaAleatoria(baralho.length, rng())
    jogadores[j].carta_1 = baralho[random_1]
    baralho = cartaParaRemover(baralho, baralho[random_1])
    

    //criando o jogador e dando suas cartas
    let random_2 = cartaAleatoria(baralho.length, rng())
    jogadores[j].carta_2 = baralho[random_2]
    baralho = cartaParaRemover(baralho, baralho[random_2])
  }
  // Etapa 1: Sem comunitárias
  salvarNoArquivo("\n=== Etapa 1: Sem comunitárias ===\n");
  verificarEstado(jogadores, comunitarias);
  for (let j = 0; j < jogadores.length; j++) {
    salvarNoArquivo( `Jogador[${j}]: tem ${(analisePar(jogadores[j], comunitarias, baralho) * 100).toFixed(2)}% de chance de ter par`);
   }

  

  // Etapa 2: Com 3 comunitárias
  salvarNoArquivo("\n=== Etapa 2: Com 3 comunitárias ===\n");
  for (let i = 0; i < 3; i++) {
    let carta = cartaAleatoria(baralho.length, rng())
    comunitarias[i] = baralho[carta];
    baralho = cartaParaRemover(baralho, baralho[carta])
  }
  verificarEstado(jogadores, comunitarias);
  for (let j = 0; j < jogadores.length; j++) {
   salvarNoArquivo( `Jogador[${j}]: tem ${(analisePar(jogadores[j], comunitarias, baralho) * 100).toFixed(2)}% de chance de ter par`);
  }

  // Etapa 3: Com 4 comunitárias
  salvarNoArquivo("\n=== Etapa 3: Com 4 comunitárias ===\n");
  let carta = cartaAleatoria(baralho.length, rng());
  comunitarias.push(baralho[carta]);
  baralho = cartaParaRemover(baralho, baralho[carta]);
  verificarEstado(jogadores, comunitarias);
  for (let j = 0; j < jogadores.length; j++) {
    salvarNoArquivo( `Jogador[${j}]: tem ${(analisePar(jogadores[j], comunitarias, baralho) * 100).toFixed(2)}% de chance de ter par`);
   }

  //etapa 4: Com 5 comunitárias
  salvarNoArquivo("\n=== Etapa 4: Com 5 comunitárias ===\n");
  carta = cartaAleatoria(baralho.length, rng());
  comunitarias.push(baralho[carta]);
  baralho = cartaParaRemover(baralho, baralho[carta]);
  verificarEstado(jogadores, comunitarias);
  for (let j = 0; j < jogadores.length; j++) {
    salvarNoArquivo( `Jogador[${j}]: tem ${(analisePar(jogadores[j], comunitarias, baralho) * 100).toFixed(2)}% de chance de ter par`);
   }
}

function verificarEstado(jogadores, comunitarias) {
  // Salva o estado atual no arquivo
  salvarNoArquivo("Cartas comunitárias:");
  comunitarias.forEach((carta, index) => {
    salvarNoArquivo(`Carta[${index}]: ${escreveCarta(carta.valor - 1, carta.naipe - 1)}`);
  });

  jogadores.forEach((jogador, index) => {
    salvarNoArquivo(`Jogador[${index}]: \nCarta 1: ${escreveCarta(jogador.carta_1.valor - 1, jogador.carta_1.naipe - 1)} \nCarta 2: ${escreveCarta(jogador.carta_2.valor - 1, jogador.carta_2.naipe - 1)}`);
    jogadores[index].acao = choose("raise", "fold", "call");
  salvarNoArquivo(`Ação do jogador ${index}: ${jogadores[index].acao}`);
  salvarNoArquivo("=====================================================================================");
  });

  // Executa as verificações
  salvarNoArquivo("Verificando combinações...");
  salvarNoArquivo("=====================================================================================");
  Pares(jogadores, comunitarias);
  fullHouse(jogadores, comunitarias);
  StraightFlush(jogadores, comunitarias);
  salvarNoArquivo("=====================================================================================");
}

function choose(...options) {
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

const rl = readline.createInterface({ input, output });





rl.question("Deseja limpar o arquivo de saída antes de começar? (s/n): ", (resposta) => {
  if (resposta.toLowerCase() === "s") {
    limparArquivo();
  }
  rl.question("Quantos jogos você quer rodar? ", (qntdJogosStr) => {
    let qntdJogos = parseInt(qntdJogosStr, 10);
    if (isNaN(qntdJogos) || qntdJogos <= 0) {
      console.log("Número inválido. Usando 10 jogos por padrão.");
      qntdJogos = 10;
    }
  rl.close();

  // Executa os jogos após a resposta do usuário
  for (let i = 0; i < qntdJogos; i++) {
    salvarNoArquivo(`Jogo ${i} \n`);
    jogo(Math.random(), 9);
    salvarNoArquivo(`=====================================================================================`);

    barraDeCarregamento(i + 1, qntdJogos); // Atualiza a barra de carregamento
  }
});
});



