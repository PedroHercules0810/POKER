const { fullHouse, Pares, StraightFlush, cartaAleatoria, cartaParaRemover, criaBaralho, limparArquivo, salvarNoArquivo, escreveCarta } = require("./baralho/baralho.js");
const { Jogador, Carta } = require("./Classes/classes.js")

function analisePar(mao, comunitarias, baralho){
    let vEsperado;
    if (mao.carta_1.valor == mao.carta_2.valor) {
        vEsperado = 1;
    }else{
        vEsperado = ((2*3)*(comunitarias.length/baralho.length)*(((baralho.length)-3)/baralho.length-1)*((baralho.length-4)/baralho.length-2));
    }
    return vEsperado;
}

module.exports = { analisePar };