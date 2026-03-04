// Classe para representar um jogador
class Jogador {
    melhorJogo = null;
    valorEsperadoPar = null;

    constructor(c1, c2, acao) {
        this.carta_1 = c1;
        this.carta_2 = c2;
        this.acao = acao;
    }
}

module.exports = { Jogador };