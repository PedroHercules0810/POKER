const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { jogo } = require('./controllers/jogoController');
const { barraDeCarregamento, limparArquivo, salvarNoArquivo } = require('./views/consoleView');
const { gerarGraficoEvolucao } = require('./services/graficoService'); 
const aiService = require('./services/iaService'); 

const rl = readline.createInterface({ input, output });

rl.question("Deseja limpar o arquivo de saída antes de começar? (s/n): ", (respostaLimpar) => {
    if (respostaLimpar.toLowerCase() === "s") limparArquivo();
    
    rl.question("Quantas Mãos (Episódios) você quer simular para treino? ", async (qntdJogosStr) => {
        let qntdJogos = parseInt(qntdJogosStr, 10) || 10;
        
        // --- A PERGUNTA VOLTOU AQUI ---
        rl.question("Quantas épocas de treinamento a cada mão? (Padrão 1): ", async (epocasStr) => {
            let epocas = parseInt(epocasStr, 10) || 1;
            rl.close();

            console.log(`Iniciando simulação de ${qntdJogos} mãos com ${epocas} épocas de treino cada...`);
            
            let historicoRecompensas = []; 
            let historicoEpsilon = []; // <-- NOVO ARRAY

            const tempoDeInicio = Date.now(); 

            for (let i = 0; i < qntdJogos; i++) {
                salvarNoArquivo(`\n================= JOGO ${i + 1} =================`);
                
                let jogadoresDaMao = await jogo(Math.random(), 4, epocas); 

                let agentePrincipal = jogadoresDaMao[0];
                let lucroPrejuizo = agentePrincipal.fichas - agentePrincipal.fichasNoInicioDaMao;
                historicoRecompensas.push(lucroPrejuizo);
                
                // --- CAPTURA O EPSILON ATUAL DA IA ---
                historicoEpsilon.push(aiService.epsilon); 
                
                barraDeCarregamento(i + 1, qntdJogos, tempoDeInicio);
            }
            
            console.log("\nTreinamento Finalizado. Gerando gráficos...");
            // --- PASSA O HISTÓRICO DE EPSILON PARA O GRÁFICO ---
            await gerarGraficoEvolucao(historicoRecompensas, historicoEpsilon); 
            console.log("Verifique o arquivo saida_jogo.txt e grafico_resultados.png");
        });
    });
});