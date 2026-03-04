const fs = require('fs');
const path = require('path');

const ARQUIVO_SAIDA = path.join(__dirname, '..', '..', 'saida_jogo.txt');

function barraDeCarregamento(atual, total, largura = 50) {
    const progresso = Math.round((atual / total) * largura);
    const barra = '█'.repeat(progresso) + '-'.repeat(largura - progresso);
    process.stdout.write(`\r[${barra}] ${((atual / total) * 100).toFixed(2).replace('.', ',')}%`);
    if (atual === total) {
        console.log('\nConcluído!');
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
