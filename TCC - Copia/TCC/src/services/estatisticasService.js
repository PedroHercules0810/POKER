function analisePar(mao, comunitarias, baralho) {
    // Se já tem par na mão, retorna 100%
    if (mao.carta_1.valor === mao.carta_2.valor) return 1;

    const todasCartas = [...comunitarias, mao.carta_1, mao.carta_2];
    const valores = todasCartas.map(carta => carta.valor);

    // Se já existe um par entre todas as cartas
    if (new Set(valores).size < valores.length) return 1;

    // Cartas que podem formar par (6 cartas - 3 para cada valor único)
    const cartasUteis = 6;

    // Probabilidade baseada no número de cartas restantes
    return Math.min(cartasUteis / baralho.length, 1);
}

module.exports = { analisePar };
