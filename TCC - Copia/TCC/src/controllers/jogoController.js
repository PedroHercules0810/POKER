const { Jogador } = require('../models/jogador');
const { criaBaralho, cartaAleatoria, cartaParaRemover } = require('../services/baralhoService');
const { calcularEquityMonteCarlo } = require('../services/estatisticasService');
const { avaliarForcaReal } = require('../services/combinacoesService'); // <-- ADICIONE ESTA LINHA
const aiService = require('../services/iaService');
const { salvarNoArquivo, escreveCarta } = require('../views/consoleView');

async function executarRodadaApostas(jogadores, comunitarias, pote) {
    let apostaMaisAlta = 0;
    
    for (let index = 0; index < jogadores.length; index++) {
        const jogador = jogadores[index];
        if (!jogador.ativo || jogador.fichas <= 0) continue;

        salvarNoArquivo(`\n--- Turno do Jogador[${index}] ---`);
        salvarNoArquivo(`Fichas: ${jogador.fichas} | Pote Atual: ${pote}`);

        // 1. Obter probabilidade via Monte Carlo
        const numOponentesAtivos = jogadores.filter(j => j !== jogador && j.ativo).length;
        const equity = calcularEquityMonteCarlo(jogador, comunitarias, numOponentesAtivos, 200);

        // 2. Montar Estado para a Rede Neural
        const apostaParaCobrir = apostaMaisAlta - jogador.apostaAtual;
        const estadoAtual = aiService.obterEstado(equity, pote, apostaParaCobrir, jogador.fichas);

        salvarNoArquivo(`[Parâmetros Ocultos da IA] -> Equity MC: ${(equity * 100).toFixed(2)}% | Aposta a cobrir: ${apostaParaCobrir}`);

        // 3. IA Decide a Ação
        const { acao, logPredicao } = aiService.decidirAcao(estadoAtual);
        salvarNoArquivo(logPredicao);

        // Guardar estado atual para aplicar reforço depois
        jogador.ultimoEstado = estadoAtual;
        jogador.ultimaAcao = acao;
        jogador.fichasIniciaisRodada = jogador.fichas; // Para calcular recompensa

        // Executar ação (0: Fold, 1: Call/Check, 2: Raise)
        if (acao === 0) { // Fold
            jogador.ativo = false;
            salvarNoArquivo(`Decisão: FOLD`);
        } else if (acao === 1) { // Call / Check
            const valorCall = Math.min(apostaParaCobrir, jogador.fichas);
            jogador.fichas -= valorCall;
            jogador.apostaAtual += valorCall;
            pote += valorCall;
            salvarNoArquivo(`Decisão: CALL/CHECK de ${valorCall}`);
        } else if (acao === 2) { // Raise
            const valorRaise = Math.min(apostaParaCobrir + 50, jogador.fichas); // Raise fixo de 50 para simplificar
            jogador.fichas -= valorRaise;
            jogador.apostaAtual += valorRaise;
            apostaMaisAlta = jogador.apostaAtual;
            pote += valorRaise;
            salvarNoArquivo(`Decisão: RAISE de ${valorRaise}`);
        }
    }
    return pote;
}

async function jogo(seed, numero_jogadores) {
    salvarNoArquivo(`\nUsando a seed: ${seed}`);
    const seedrandom = require('seedrandom');
    const rng = seedrandom(seed);

    let jogadores = Array.from({ length: numero_jogadores }, () => new Jogador());
    let comunitarias = [];
    let baralho = criaBaralho();
    let pote = 0;

    // Cobrar Blind (simplificado: todos pagam 10 de ante para evitar fold eterno sem punição)
    jogadores.forEach(j => {
        j.fichas -= 10;
        pote += 10;
    });

    // Distribui cartas
    for (let j = 0; j < numero_jogadores; j++) {
        let r1 = cartaAleatoria(baralho.length, rng());
        jogadores[j].carta_1 = baralho[r1];
        baralho = cartaParaRemover(baralho, baralho[r1]);

        let r2 = cartaAleatoria(baralho.length, rng());
        jogadores[j].carta_2 = baralho[r2];
        baralho = cartaParaRemover(baralho, baralho[r2]);
    }

    const fases = [
        { nome: "Pre-Flop", cartas: 0 },
        { nome: "Flop", cartas: 3 },
        { nome: "Turn", cartas: 1 },
        { nome: "River", cartas: 1 }
    ];

    for (let fase of fases) {
        salvarNoArquivo(`\n=== Fase: ${fase.nome} ===`);
        for (let i = 0; i < fase.cartas; i++) {
            let c = cartaAleatoria(baralho.length, rng());
            comunitarias.push(baralho[c]);
            baralho = cartaParaRemover(baralho, baralho[c]);
        }
        
        if (comunitarias.length > 0) {
            salvarNoArquivo("Comunitárias na mesa:");
            comunitarias.forEach(c => salvarNoArquivo(`${escreveCarta(c.valor - 1, c.naipe - 1)}`));
        }

        // Se sobrou só um jogador ativo, encerra a mão
        if (jogadores.filter(j => j.ativo).length <= 1) break;

        pote = await executarRodadaApostas(jogadores, comunitarias, pote);
    }

    // === NOVO BLOCO DE SHOWDOWN (ITEM 1) ===
    let jogadoresAtivos = jogadores.filter(j => j.ativo);
    
    if (jogadoresAtivos.length > 0) {
        // Calcula a força real de cada jogador usando as 7 cartas (mão + mesa)
        jogadoresAtivos.forEach(j => {
            const seteCartas = [j.carta_1, j.carta_2, ...comunitarias];
            j.forcaFinal = avaliarForcaReal(seteCartas);
        });

        // Ordena pela força real (decrescente)
        jogadoresAtivos.sort((a, b) => b.forcaFinal - a.forcaFinal);

        const ganhador = jogadoresAtivos[0];
        // O vencedor recebe as fichas acumuladas no pote
        ganhador.fichas += pote;
        
        salvarNoArquivo(`\n=> VENCEDOR DO SHOWDOWN: Jogador[${jogadores.indexOf(ganhador)}]`);
        salvarNoArquivo(`Força da Mão (Score): ${ganhador.forcaFinal} | Pote: ${pote} fichas`);
    }

    // Treinamento: Avaliar ganhos e gravar na memória
    for (let j of jogadores) {
        if (j.ultimoEstado !== undefined) {
            // Recompensa é a variação de fichas daquela rodada
            const recompensa = j.fichas - j.fichasIniciaisRodada; 
            const proximoEstado = aiService.obterEstado(0, 0, 0, j.fichas); // Estado terminal
            aiService.lembrar(j.ultimoEstado, j.ultimaAcao, recompensa, proximoEstado, true);
        }
        j.apostaAtual = 0; // Reseta apostas
    }

    // Executa uma época de treinamento na rede neural
    await aiService.treinar();
}

module.exports = { jogo };