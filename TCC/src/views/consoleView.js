const fs = require('fs');
const path = require('path');

const ARQUIVO_SAIDA = path.join(__dirname, '..', '..', 'saida_jogo.txt');

function barraDeCarregamento(atual, total, startTime, largura = 50) { 
    const progresso = Math.round((atual / total) * largura);
    const barra = '█'.repeat(progresso) + '-'.repeat(largura - progresso);
    const percentual = ((atual / total) * 100).toFixed(2).replace('.', ',');

    let tempoTexto = "";
    
    // Calcula o ETA se o tempo inicial for fornecido e já tivermos passado da primeira rodada
    if (startTime && atual > 0) {
        const agora = Date.now();
        const tempoDecorridoMs = agora - startTime;
        const tempoPorMao = tempoDecorridoMs / atual;
        const tempoRestanteMs = tempoPorMao * (total - atual);

        const restMinutos = Math.floor(tempoRestanteMs / 60000);
        const restSegundos = Math.floor((tempoRestanteMs % 60000) / 1000).toString().padStart(2, '0');
        
        tempoTexto = ` | ETA: ${restMinutos}m ${restSegundos}s`;
    }

    // Escreve a barra sobrescrevendo a linha atual do terminal
    process.stdout.write(`\r[${barra}] ${percentual}%${tempoTexto}`);
    
    if (atual === total) {
        console.log('\nSimulação Concluída!');
    }
}

function salvarNoArquivo(texto) {
    fs.appendFileSync(ARQUIVO_SAIDA, texto + '\n', 'utf8');
}

function limparArquivo() {
    fs.writeFileSync(ARQUIVO_SAIDA, '', 'utf8');
}

function escreveCarta(valor, naipe) {
    const valores = [2, 3, 4, 5, 6, 7, 8, 9, 10, "valete", "Dama", "Rei", "Ás"];
    const naipes = ["Paus", "Copas", "Espadas", "Ouros"];
    return `${valores[valor]} de ${naipes[naipe]}`;
}

module.exports = { barraDeCarregamento, salvarNoArquivo, limparArquivo, escreveCarta };
