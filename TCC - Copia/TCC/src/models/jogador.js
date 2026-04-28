class Jogador {
    melhorJogo = null;

    constructor(c1, c2, acao) {
        this.carta_1 = c1;
        this.carta_2 = c2;
        this.acao = acao;
        this.fichas = 1000; // Stack inicial
        this.apostaAtual = 0;
        this.ativo = true; // Se foldar, vira false
    }
}

module.exports = { Jogador };