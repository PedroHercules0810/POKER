const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { jogo } = require('./controllers/jogoController');
const { barraDeCarregamento, limparArquivo, salvarNoArquivo } = require('./views/consoleView');

const rl = readline.createInterface({ input, output });

rl.question("Deseja limpar o arquivo de saída antes de começar? (s/n): ", (respostaLimpar) => {
    if (respostaLimpar.toLowerCase() === "s") limparArquivo();
    
    rl.question("Quantas Mãos (Episódios) você quer simular para treino? ", (qntdJogosStr) => {
        let qntdJogos = parseInt(qntdJogosStr, 10) || 10;
        
        rl.question("Quantas épocas de avaliação a cada mão? (Padrão 1): ", async (epocasStr) => {
            let epocas = parseInt(epocasStr, 10) || 1;
            rl.close();

            console.log("Iniciando treinamento da IA...");
            for (let i = 0; i < qntdJogos; i++) {
                salvarNoArquivo(`\n================= JOGO ${i + 1} =================`);
                
                // Repete o jogo local de acordo com as épocas para fixação
                for(let e = 0; e < epocas; e++){
                    await jogo(Math.random(), 4); // 4 Jogadores para teste
                }
                
                barraDeCarregamento(i + 1, qntdJogos);
            }
            console.log("\nTreinamento Finalizado. Verifique saida_jogo.txt");
        });
    });
});