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

            for (let i = 0; i < qntdJogos; i++) {
                salvarNoArquivo(`\n================= JOGO ${i + 1} =================`);
                
                let tamanhoMemoriaAntes = aiService.memory.length;

                // Passamos as épocas para dentro do jogo
                let jogadoresDaMao = await jogo(Math.random(), 4, epocas); 

                if (aiService.memory.length > tamanhoMemoriaAntes) {
                    let agentePrincipal = jogadoresDaMao[0];
                    let lucroPrejuizo = agentePrincipal.fichas - agentePrincipal.fichasNoInicioDaMao;
                    historicoRecompensas.push(lucroPrejuizo);
                } else {
                    historicoRecompensas.push(0);
                }
                
                barraDeCarregamento(i + 1, qntdJogos);
            }
            
            console.log("\nTreinamento Finalizado. Gerando gráficos...");
            await gerarGraficoEvolucao(historicoRecompensas);
            console.log("Verifique o arquivo saida_jogo.txt e grafico_resultados.png");
        });
    });
});