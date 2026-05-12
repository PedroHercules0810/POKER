
// Atribui um peso matemático exato para cada mão (resolve empates e kickers perfeitamente)
function avaliarForcaReal(cartas) {
    // Ordena do maior (Ás = 13) para o menor (2 = 1)
    const ordenadas = [...cartas].sort((a, b) => b.valor - a.valor);

    // 1. Mapeamento para Flush (Naipes)
    const contagemNaipes = {};
    ordenadas.forEach(c => contagemNaipes[c.naipe] = (contagemNaipes[c.naipe] || 0) + 1);
    let naipeFlush = null;
    for (let naipe in contagemNaipes) {
        if (contagemNaipes[naipe] >= 5) naipeFlush = parseInt(naipe);
    }
    const cartasFlush = naipeFlush ? ordenadas.filter(c => c.naipe === naipeFlush) : [];

    // 2. Mapeamento para Sequência (Straight)
    const acharSequencia = (listaCartas) => {
        let valoresUnicos = [];
        let valoresVistos = new Set();
        for (let c of listaCartas) {
            if (!valoresVistos.has(c.valor)) {
                valoresVistos.add(c.valor);
                valoresUnicos.push(c.valor);
            }
        }

        // Checa sequência normal (ex: 10-J-Q-K-A)
        for (let i = 0; i <= valoresUnicos.length - 5; i++) {
            if (valoresUnicos[i] - valoresUnicos[i + 4] === 4) {
                return valoresUnicos[i]; // Retorna a carta mais alta da sequência
            }
        }

        // Checa sequência baixa com Ás (A-2-3-4-5) -> Valores: 13, 4, 3, 2, 1
        if (valoresVistos.has(13) && valoresVistos.has(4) && valoresVistos.has(3) && valoresVistos.has(2) && valoresVistos.has(1)) {
            return 4; // A carta mais alta real dessa sequência é o 5 (valor 4)
        }
        return null;
    };

    const straightFlushHigh = cartasFlush.length >= 5 ? acharSequencia(cartasFlush) : null;
    const straightHigh = acharSequencia(ordenadas);

    // 3. Mapeamento para Pares, Trincas e Quadras
    const contagemValores = {};
    ordenadas.forEach(c => contagemValores[c.valor] = (contagemValores[c.valor] || 0) + 1);

    let quadra = null;
    let trincas = [];
    let pares = [];

    // Lemos do 13 ao 1 para garantir que pegamos os maiores pares/trincas primeiro em caso de sobra
    for (let v = 13; v >= 1; v--) { 
        if (contagemValores[v] === 4) quadra = v;
        else if (contagemValores[v] === 3) trincas.push(v);
        else if (contagemValores[v] === 2) pares.push(v);
    }

    // 4. Calculador de Score (Base 15)
    // Fórmula: Categoria * 15^5 + c1*15^4 + c2*15^3 + c3*15^2 + c4*15^1 + c5
    const calcularScore = (categoria, v1 = 0, v2 = 0, v3 = 0, v4 = 0, v5 = 0) => {
        return categoria * 759375 + v1 * 50625 + v2 * 3375 + v3 * 225 + v4 * 15 + v5;
    };

    // Pega as cartas restantes (Kickers) excluindo as que já formam o jogo
    const kickers = (excluir) => {
        return ordenadas.filter(c => !excluir.includes(c.valor)).map(c => c.valor);
    };

    // === AVALIAÇÃO FINAL (Da mais forte para a mais fraca) ===

    // 9. Straight Flush (O Royal Flush é automaticamente o maior Straight Flush possível)
    if (straightFlushHigh) return calcularScore(9, straightFlushHigh);

    // 8. Quadra
    if (quadra) {
        let k = kickers([quadra]);
        return calcularScore(8, quadra, quadra, quadra, quadra, k[0]);
    }

    // 7. Full House
    if (trincas.length >= 2) {
        return calcularScore(7, trincas[0], trincas[0], trincas[0], trincas[1], trincas[1]);
    } else if (trincas.length === 1 && pares.length >= 1) {
        return calcularScore(7, trincas[0], trincas[0], trincas[0], pares[0], pares[0]);
    }

    // 6. Flush
    if (cartasFlush.length >= 5) {
        return calcularScore(6, cartasFlush[0].valor, cartasFlush[1].valor, cartasFlush[2].valor, cartasFlush[3].valor, cartasFlush[4].valor);
    }

    // 5. Straight (Sequência)
    if (straightHigh) return calcularScore(5, straightHigh);

    // 4. Trinca
    if (trincas.length === 1) {
        let k = kickers([trincas[0]]);
        return calcularScore(4, trincas[0], trincas[0], trincas[0], k[0], k[1]);
    }

    // 3. Dois Pares
    if (pares.length >= 2) {
        let k = kickers([pares[0], pares[1]]);
        return calcularScore(3, pares[0], pares[0], pares[1], pares[1], k[0]);
    }

    // 2. Um Par
    if (pares.length === 1) {
        let k = kickers([pares[0]]);
        return calcularScore(2, pares[0], pares[0], k[0], k[1], k[2]);
    }

    // 1. Carta Alta
    return calcularScore(1, ordenadas[0].valor, ordenadas[1].valor, ordenadas[2].valor, ordenadas[3].valor, ordenadas[4].valor);
}

module.exports = {  avaliarForcaReal };