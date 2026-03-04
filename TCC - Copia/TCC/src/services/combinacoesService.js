const { salvarNoArquivo } = require('../views/consoleView');

function fullHouse(jogadores, comunitarias) {
    for (let j = 0; j < jogadores.length; j++) {
        let mao = [];
        mao.push(jogadores[j].carta_1);
        mao.push(jogadores[j].carta_2);
        mao = mao.concat(comunitarias);
        mao.sort((a, b) => a.valor - b.valor);

        const contagem = {};
        mao.forEach(carta => {
            contagem[carta.valor] = (contagem[carta.valor] || 0) + 1;
        });

        let trinca = [];
        let par = [];

        const valores = Object.keys(contagem).map(Number).sort((a, b) => b - a);

        valores.forEach(valor => {
            const quantidade = contagem[valor];
            if (quantidade >= 3 && trinca.length === 0) {
                trinca = mao.filter(carta => carta.valor === valor).slice(0, 3);
                jogadores[j].melhorJogo = trinca;
            } else if (quantidade >= 2 && par.length === 0) {
                par = mao.filter(carta => carta.valor === valor).slice(0, 2);
                jogadores[j].melhorJogo = par;
            }
        });

        if (trinca.length === 3 && par.length === 2) {
            salvarNoArquivo(`Jogador[${j}] tem um Full House!`);
            jogadores[j].melhorJogo = trinca.concat(par);
        }
    }
}

function Pares(jogadores, comunitarias) {
    for (let j = 0; j < jogadores.length; j++) {
        let pares = [];
        let par = [];
        let trinca = [];
        let quadra = [];
        let doisPares = 0;

        pares.push(jogadores[j].carta_1);
        pares.push(jogadores[j].carta_2);
        pares = pares.concat(comunitarias);
        pares.sort((a, b) => a.valor - b.valor);

        const contagem = {};
        pares.forEach(carta => {
            contagem[carta.valor] = (contagem[carta.valor] || 0) + 1;
        });

        const valores = Object.keys(contagem).map(Number).sort((a, b) => b - a);

        valores.forEach(valor => {
            const quantidade = contagem[valor];
            if (quantidade >= 4 && quadra.length === 0) {
                quadra = pares.filter(carta => carta.valor === valor).slice(0, 4);
                jogadores[j].melhorJogo = quadra;
            } else if (quantidade >= 3 && trinca.length === 0) {
                trinca = pares.filter(carta => carta.valor === valor).slice(0, 3);
                jogadores[j].melhorJogo = trinca;
            } else if (quantidade >= 2) {
                if (par.length === 0) {
                    par = pares.filter(carta => carta.valor === valor).slice(0, 2);
                    jogadores[j].melhorJogo = par;
                } else {
                    doisPares++;
                    par = pares.filter(carta => carta.valor === valor).slice(0, 2);
                }
            }
        });

        if (quadra.length === 4) {
            salvarNoArquivo(`Jogador[${j}] tem uma Quadra!`);
        } else if (trinca.length === 3) {
            salvarNoArquivo(`Jogador[${j}] tem uma Trinca!`);
        } else if (doisPares >= 1) {
            salvarNoArquivo(`Jogador[${j}] tem dois Pares!`);
        } else if (par.length === 2) {
            salvarNoArquivo(`Jogador[${j}] tem um Par!`);
        }
    }
}

function StraightFlush(jogadores, comunitarias) {
    for (let j = 0; j < jogadores.length; j++) {
        let flush = [];

        const filtrarRepetidos = arr => {
            const contagem = arr.reduce((acc, carta) => {
                acc[carta.naipe] = (acc[carta.naipe] || 0) + 1;
                return acc;
            }, {});
            return arr.filter(carta => contagem[carta.naipe] > 3);
        };

        flush = comunitarias.map(carta => carta);
        flush.push(jogadores[j].carta_1, jogadores[j].carta_2);
        flush = filtrarRepetidos(flush);

        let temFlush = false;
        if (flush.length >= 5) {
            const naipeBase = flush[0].naipe;
            temFlush = flush.every(carta => carta.naipe === naipeBase);

            if (temFlush) {
                salvarNoArquivo(`Jogador [${j}] tem flush!`);
                flush = flush.filter(carta => carta.naipe === naipeBase);
            }
        }

        let sequencia = [];
        sequencia.push(jogadores[j].carta_1);
        sequencia.push(jogadores[j].carta_2);
        sequencia = sequencia.concat(comunitarias);
        sequencia.sort((a, b) => a.valor - b.valor).slice(2);
        flush.sort((a, b) => a.valor - b.valor).slice(2);

        if (flush.length >= 5) {
            if (flush[0].valor == 9 && flush[1].valor == 10 && flush[2].valor == 11 && flush[3].valor == 12 && flush[4].valor == 13) {
                salvarNoArquivo(`Jogador [${j}] Tem umm Royal Straight Flush!!!!!`);
                jogadores[j].melhorJogo = flush;
                break;
            }
        }

        let contadorSF = 1;
        for (let i = 1; i < flush.length; i++) {
            if (flush[i].valor === flush[i - 1].valor + 1) {
                contadorSF++;
                if (contadorSF >= 5) {
                    salvarNoArquivo(`Jogador [${j}] tem sequência do mesmo Naipe!`);
                    jogadores[j].melhorJogo = flush;
                    break;
                }
            } else {
                contadorSF = 1;
            }
        }

        let contador = 1;
        for (let i = 1; i < sequencia.length; i++) {
            if (sequencia[i].valor === sequencia[i - 1].valor + 1) {
                contador++;
                if (contador >= 5) {
                    salvarNoArquivo(`Jogador [${j}] tem sequência!`);
                    jogadores[j].melhorJogo = sequencia;
                    break;
                }
            } else {
                contador = 1;
            }
        }
    }
}

module.exports = { fullHouse, Pares, StraightFlush };
