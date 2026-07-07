const tf = require('@tensorflow/tfjs');

class PokerAI {
    constructor() {
        this.model = this.createModel();
        this.memory = []; // Buffer de replay
        this.historicoLoss = [];
        this.epsilon = 1.0; // Taxa de exploração (começa em 100% aleatório)
        this.epsilonMin = 0.01; // Vai cair até explorar só 1% das vezes
        this.epsilonDecay = 0.995;
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({ units: 16, inputShape: [4], activation: 'relu' }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        // ALTERAÇÃO: Agora temos 5 saídas em vez de 3
        model.add(tf.layers.dense({ units: 5, activation: 'linear' }));
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
            // ALTERAÇÃO: Sorteia entre 0 e 4
            acao = Math.floor(Math.random() * 5);
            logPredicao = `(Ação Aleatória - Explorando) - Ação escolhida: ${acao}`;
        } else {
            tf.tidy(() => {
                const estadoTensor = tf.tensor2d([estadoArray]);
                const predições = this.model.predict(estadoTensor).dataSync();
                acao = predições.indexOf(Math.max(...predições));

                // ALTERAÇÃO: Log detalhado com os 5 Q-Values
                logPredicao = `Predições -> Fold: ${predições[0].toFixed(1)}, Call: ${predições[1].toFixed(1)}, R.Leve: ${predições[2].toFixed(1)}, R.Forte: ${predições[3].toFixed(1)}, All-in: ${predições[4].toFixed(1)} | Escolha: ${acao}`;
            });
        }
        return { acao, logPredicao };
    }

    lembrar(estado, acao, recompensa, proximoEstado, finalizou) {
        this.memory.push({ estado, acao, recompensa, proximoEstado, finalizou });
        if (this.memory.length > 50000) this.memory.shift(); // Limita o tamanho da memória
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
        // await this.model.fit(estados, alvosTensor, { epochs: epocasTreino, verbose: 0 });
        const historico = await this.model.fit(estados, alvosTensor, { epochs: epocasTreino, verbose: 0 });

         // NOVO: guarda a perda (MSE) da última época deste treino
         const lossAtual = historico.history.loss[historico.history.loss.length - 1];
        this.historicoLoss.push(lossAtual);

        estados.dispose();
        proximosEstados.dispose();
        alvosTensor.dispose();

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