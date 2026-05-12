const { Carta } = require('../models/carta');

// Cria o baralho com 52 cartas
function criaBaralho() {
    const baralho = [];
    for (let l = 0; l < 52; l++) {
        const valor = 1 + (l % 13);
        const naipe = 1 + (l % 4);
        baralho[l] = new Carta(naipe, valor);
    }
    return baralho;
}

// Retorna um índice aleatório baseado no tamanho e no valor rng
function cartaAleatoria(size, rng) {
    return Math.floor(rng * size);
}

// Remove uma carta específica do baralho
function cartaParaRemover(baralho, cartaRemover) {
    if (!cartaRemover) {
        console.error("Erro: cartaRemover está indefinida!", baralho);
        return baralho;
    }
    return baralho.filter(carta => carta.valor !== cartaRemover.valor || carta.naipe !== cartaRemover.naipe);
}

module.exports = { criaBaralho, cartaAleatoria, cartaParaRemover };
