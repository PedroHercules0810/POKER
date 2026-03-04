const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');
const { jogo } = require('./controllers/jogoController');
const { barraDeCarregamento, limparArquivo, salvarNoArquivo } = require('./views/consoleView');

const rl = readline.createInterface({ input, output });

rl.question("Deseja limpar o arquivo de saída antes de começar? (s/n): ", (resposta) => {
    if (resposta.toLowerCase() === "s") {
        limparArquivo();
    }
    rl.question("Quantos jogos você quer rodar? ", (qntdJogosStr) => {
        let qntdJogos = parseInt(qntdJogosStr, 10);
        if (isNaN(qntdJogos) || qntdJogos <= 0) {
            console.log("Número inválido. Usando 10 jogos por padrão.");
            qntdJogos = 10;
        }
        rl.close();

        for (let i = 0; i < qntdJogos; i++) {
            salvarNoArquivo(`Jogo ${i} \n`);
            jogo(Math.random(), 9);
            salvarNoArquivo(`=====================================================================================`);
            barraDeCarregamento(i + 1, qntdJogos);
        }
    });
});
