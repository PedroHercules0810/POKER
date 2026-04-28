// function analisePar(mao, comunitarias, baralho) {
//     // Se já tem par na mão, retorna 100%
//     if (mao.carta_1.valor === mao.carta_2.valor) return 1;

//     const todasCartas = [...comunitarias, mao.carta_1, mao.carta_2];
//     const valores = todasCartas.map(carta => carta.valor);

//     // Se já existe um par entre todas as cartas
//     if (new Set(valores).size < valores.length) return 1;

//     // Cartas que podem formar par (6 cartas - 3 para cada valor único)
//     const cartasUteis = 6;

//     // Probabilidade baseada no número de cartas restantes
//     return Math.min(cartasUteis / baralho.length, 1);
// }

// module.exports = { analisePar };

const { criaBaralho, cartaParaRemover } = require('./baralhoService');

// Uma avaliação simplificada para a simulação (quanto maior, melhor).
// Você pode expandir isso conectando com o seu combinacoesService.js futuramente.
function pontuacaoSimplesMao(cartas) {
    const valores = cartas.map(c => c.valor).sort((a, b) => b - a);
    const contagem = {};
    valores.forEach(v => contagem[v] = (contagem[v] || 0) + 1);
    
    let maxRepeticoes = Math.max(...Object.values(contagem));
    // Retorna um "score": quadra > trinca > par > carta alta
    return (maxRepeticoes * 100) + valores[0]; 
}

function calcularEquityMonteCarlo(jogador, comunitariasAtuais, numOponentesAtivos, iteracoes = 100) {
    if (!jogador.carta_1 || !jogador.carta_2) return 0;
    
    let vitorias = 0;

    for (let i = 0; i < iteracoes; i++) {
        let baralhoSimulacao = criaBaralho();
        baralhoSimulacao = cartaParaRemover(baralhoSimulacao, jogador.carta_1);
        baralhoSimulacao = cartaParaRemover(baralhoSimulacao, jogador.carta_2);
        comunitariasAtuais.forEach(c => baralhoSimulacao = cartaParaRemover(baralhoSimulacao, c));

        // Embaralha (Fisher-Yates)
        for (let j = baralhoSimulacao.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [baralhoSimulacao[j], baralhoSimulacao[k]] = [baralhoSimulacao[k], baralhoSimulacao[j]];
        }

        // Completa as comunitárias até 5
        let comunitariasSim = [...comunitariasAtuais];
        let idxBaralho = 0;
        while (comunitariasSim.length < 5) {
            comunitariasSim.push(baralhoSimulacao[idxBaralho++]);
        }

        let minhaForca = pontuacaoSimplesMao([...comunitariasSim, jogador.carta_1, jogador.carta_2]);
        let ganhei = true;

        // Simula os oponentes
        for (let op = 0; op < numOponentesAtivos; op++) {
            let opCarta1 = baralhoSimulacao[idxBaralho++];
            let opCarta2 = baralhoSimulacao[idxBaralho++];
            let forcaOp = pontuacaoSimplesMao([...comunitariasSim, opCarta1, opCarta2]);
            if (forcaOp > minhaForca) {
                ganhei = false;
                break;
            }
        }

        if (ganhei) vitorias++;
    }

    return vitorias / iteracoes; // Retorna a probabilidade (0.0 a 1.0)
}

module.exports = { calcularEquityMonteCarlo };