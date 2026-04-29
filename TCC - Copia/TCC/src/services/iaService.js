const tf = require('@tensorflow/tfjs');

class PokerAI {
    constructor() {
        this.model = this.createModel();
        this.epsilon = 1.0; // Taxa de exploração (começa em 100% aleatório)
        this.epsilonMin = 0.05; // Vai cair até explorar só 5% das vezes
        this.epsilonDecay = 0.995; 
        this.gamma = 0.95; // Fator de desconto para recompensas futuras
        this.memory = []; // Buffer de replay
    }

    createModel() {
        const model = tf.sequential();
        // Input: [Equity(MC), Pote, ApostaParaCobrir, MinhasFichas]
        model.add(tf.layers.dense({ units: 16, inputShape: [4], activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        // Output: Q-Values para 3 ações: 0=Fold, 1=Call/Check, 2=Raise
        model.add(tf.layers.dense({ units: 3, activation: 'linear' }));
        model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
        return model;
    }

    obterEstado(equityMC, pote, apostaParaCobrir, minhasFichas) {
        // Normalização básica para ajudar a rede
        return [equityMC, pote / 1000, apostaParaCobrir / 1000, minhasFichas / 1000];
    }

    // Retorna a ação escolhida e o log dos parâmetros
    decidirAcao(estadoArray) {
        let logPredicao = "";
        let acao;

        if (Math.random() <= this.epsilon) {
            // Exploração: evita o fold eterno no início do treino
            acao = Math.floor(Math.random() * 3);
            logPredicao = `(Ação Aleatória - Explorando) - Ação escolhida: ${acao}`;
        } else {
            // Explotação: usa a rede neural
            tf.tidy(() => {
                const estadoTensor = tf.tensor2d([estadoArray]);
                const predições = this.model.predict(estadoTensor).dataSync();
                acao = predições.indexOf(Math.max(...predições));
                logPredicao = `Predições da Rede (Q-Values) -> Fold: ${predições[0].toFixed(2)}, Call: ${predições[1].toFixed(2)}, Raise: ${predições[2].toFixed(2)} | Escolha: ${acao}`;
            });
        }
        return { acao, logPredicao };
    }

    lembrar(estado, acao, recompensa, proximoEstado, finalizou) {
        this.memory.push({ estado, acao, recompensa, proximoEstado, finalizou });
        if (this.memory.length > 2000) this.memory.shift(); // Limita o tamanho da memória
    }

    async treinar(tamanhoLote = 32, epocasTreino = 1) { 
        if (this.memory.length < tamanhoLote) return;

        const lote = [];
        for (let i = 0; i < tamanhoLote; i++) {
            const indexAleatorio = Math.floor(Math.random() * this.memory.length);
            lote.push(this.memory[indexAleatorio]);
        }

        const estados = tf.tensor2d(lote.map(exp => exp.estado));
        const proximosEstados = tf.tensor2d(lote.map(exp => exp.proximoEstado));
        
        const qValoresAtuais = this.model.predict(estados).arraySync();
        const qValoresProximos = this.model.predict(proximosEstados).arraySync();

        for (let i = 0; i < tamanhoLote; i++) {
            let alvo = lote[i].recompensa;
            if (!lote[i].finalizou) {
                alvo += this.gamma * Math.max(...qValoresProximos[i]);
            }
            qValoresAtuais[i][lote[i].acao] = alvo; // Atualiza apenas o Q-value da ação tomada
        }

        const alvosTensor = tf.tensor2d(qValoresAtuais);
        await this.model.fit(estados, alvosTensor, { epochs: epocasTreino, verbose: 0 });

        estados.dispose();
        proximosEstados.dispose();
        alvosTensor.dispose();

        // Decaimento do epsilon para a rede começar a usar o que aprendeu
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }
}

module.exports = new PokerAI();