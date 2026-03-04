const { Jogador } = require('../models/jogador');
const { criaBaralho, cartaAleatoria, cartaParaRemover } = require('../services/baralhoService');
const { Pares, fullHouse, StraightFlush } = require('../services/combinacoesService');
const { analisePar } = require('../services/estatisticasService');
const { salvarNoArquivo, escreveCarta } = require('../views/consoleView');

function choose(...options) {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}

function verificarEstado(jogadores, comunitarias) {
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

    salvarNoArquivo("Verificando combinações...");
    salvarNoArquivo("=====================================================================================");
    Pares(jogadores, comunitarias);
    fullHouse(jogadores, comunitarias);
    StraightFlush(jogadores, comunitarias);
    salvarNoArquivo("=====================================================================================");
}

function logEstatisticas(jogadores, comunitarias, baralho) {
    for (let j = 0; j < jogadores.length; j++) {
        salvarNoArquivo(`Jogador[${j}]: tem ${(analisePar(jogadores[j], comunitarias, baralho) * 100).toFixed(2)}% de chance de ter par`);
    }
}

function jogo(seed, numero_jogadores) {
    const seedrandom = require('seedrandom');
    const rng = seedrandom(seed);

    salvarNoArquivo(`Usando a seed: ${seed}`);

    const jogadores = [];
    let comunitarias = [];
    let baralho = criaBaralho();

    // Distribui cartas aos jogadores
    for (let j = 0; j < numero_jogadores; j++) {
        jogadores[j] = new Jogador();

        const random_1 = cartaAleatoria(baralho.length, rng());
        jogadores[j].carta_1 = baralho[random_1];
        baralho = cartaParaRemover(baralho, baralho[random_1]);

        const random_2 = cartaAleatoria(baralho.length, rng());
        jogadores[j].carta_2 = baralho[random_2];
        baralho = cartaParaRemover(baralho, baralho[random_2]);
    }

    // Etapa 1: Sem comunitárias
    salvarNoArquivo("\n=== Etapa 1: Sem comunitárias ===\n");
    verificarEstado(jogadores, comunitarias);
    logEstatisticas(jogadores, comunitarias, baralho);

    // Etapa 2: Com 3 comunitárias (Flop)
    salvarNoArquivo("\n=== Etapa 2: Com 3 comunitárias ===\n");
    for (let i = 0; i < 3; i++) {
        const carta = cartaAleatoria(baralho.length, rng());
        comunitarias[i] = baralho[carta];
        baralho = cartaParaRemover(baralho, baralho[carta]);
    }
    verificarEstado(jogadores, comunitarias);
    logEstatisticas(jogadores, comunitarias, baralho);

    // Etapa 3: Com 4 comunitárias (Turn)
    salvarNoArquivo("\n=== Etapa 3: Com 4 comunitárias ===\n");
    let carta = cartaAleatoria(baralho.length, rng());
    comunitarias.push(baralho[carta]);
    baralho = cartaParaRemover(baralho, baralho[carta]);
    verificarEstado(jogadores, comunitarias);
    logEstatisticas(jogadores, comunitarias, baralho);

    // Etapa 4: Com 5 comunitárias (River)
    salvarNoArquivo("\n=== Etapa 4: Com 5 comunitárias ===\n");
    carta = cartaAleatoria(baralho.length, rng());
    comunitarias.push(baralho[carta]);
    baralho = cartaParaRemover(baralho, baralho[carta]);
    verificarEstado(jogadores, comunitarias);
    logEstatisticas(jogadores, comunitarias, baralho);
}

module.exports = { jogo };
