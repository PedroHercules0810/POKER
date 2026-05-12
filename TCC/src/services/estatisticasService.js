const { criaBaralho, cartaParaRemover } = require('./baralhoService');
const { avaliarForcaReal } = require('./combinacoesService'); // IMPORTA A FUNÇÃO OFICIAL

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

        // AGORA USA A PONTUAÇÃO REAL PARA O JOGADOR
        let minhaForca = avaliarForcaReal([...comunitariasSim, jogador.carta_1, jogador.carta_2]);
        let ganhei = true;

        // Simula os oponentes e compara a força real
        for (let op = 0; op < numOponentesAtivos; op++) {
            let opCarta1 = baralhoSimulacao[idxBaralho++];
            let opCarta2 = baralhoSimulacao[idxBaralho++];
            let forcaOp = avaliarForcaReal([...comunitariasSim, opCarta1, opCarta2]);
            if (forcaOp > minhaForca) {
                ganhei = false;
                break;
            }
        }

        if (ganhei) vitorias++;
    }

    return vitorias / iteracoes; 
}

module.exports = { calcularEquityMonteCarlo };