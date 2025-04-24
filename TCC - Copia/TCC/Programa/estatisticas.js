const { fullHouse, Pares, StraightFlush, cartaAleatoria, cartaParaRemover, criaBaralho, limparArquivo, salvarNoArquivo, escreveCarta } = require("./baralho/baralho.js");
const { Jogador, Carta } = require("./Classes/classes.js")

function analisePar(mao, comunitarias, baralho) {
    let vEsperado;
    if (mao.carta_1.valor == mao.carta_2.valor) {
        vEsperado = 1;
    } else {
        // salvarNoArquivo(baralho.length);
        // salvarNoArquivo(comunitarias.length);
        vEsperado = (3 / baralho.length) + (3 / baralho.length - 1) + (30 / baralho.length - 2) - (9 / baralho.length - 3);
    }
    return vEsperado;
}

module.exports = { analisePar };