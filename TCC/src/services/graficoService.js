const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

async function gerarGraficoEvolucao(recompensas, historicoEpsilon) {
    const width = 1200;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

    const labels = recompensas.map((_, index) => `Jogo ${index + 1}`);
    const labelsEpsilon = historicoEpsilon.map((_, index) => `Jogo ${index + 1}`);

    // --- GRÁFICO 1: DESEMPENHO E MÉDIA MÓVEL ---
    const janelaMedia = Math.min(100, recompensas.length);
    const mediaMovel = recompensas.map((_, i, arr) => {
        if (i < janelaMedia - 1) return null;
        const soma = arr.slice(i - janelaMedia + 1, i + 1).reduce((a, b) => a + b, 0);
        return soma / janelaMedia;
    });

    const configDesempenho = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Média Móvel (${janelaMedia} jogos)`,
                    data: mediaMovel,
                    borderColor: 'rgba(255, 99, 71, 1)', // vermelho/laranja, contraste com o azul
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: false,
                    tension: 0.2 // deixa a linha um pouco mais suave
                },
                {
                    label: 'Lucro/Prejuízo Real (Fichas)',
                    data: recompensas,
                    borderColor: 'rgba(0, 153, 255, 0.8)',
                    borderWidth: 1,
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Desempenho do Agente (Lucro)", font: { size: 24 } }
            },
            scales: {
                x: { title: { display: true, text: 'Episódios (Mãos Jogadas)' } },
                y: { title: { display: true, text: 'Fichas Ganhas/Perdidas' } }
            }
        }
    };

    const bufferDesempenho = await chartJSNodeCanvas.renderToBuffer(configDesempenho);
    fs.writeFileSync('grafico_desempenho.png', bufferDesempenho);


    // --- GRÁFICO 2: DECAIMENTO DO EPSILON ---
    const configEpsilon = {
        type: 'line',
        data: {
            labels: labelsEpsilon,
            datasets: [
                {
                    label: 'Taxa de Exploração (Epsilon)',
                    data: historicoEpsilon,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 3,
                    pointRadius: 0,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: "Decaimento da Taxa de Exploração", font: { size: 24 } }
            },
            scales: {
                x: { title: { display: true, text: 'Episódios (Mãos Jogadas)' } },
                y: {
                    title: { display: true, text: 'Epsilon' },
                    min: 0,
                    max: 1
                }
            }
        }
    };

    const bufferEpsilon = await chartJSNodeCanvas.renderToBuffer(configEpsilon);
    fs.writeFileSync('grafico_epsilon.png', bufferEpsilon);
}

module.exports = { gerarGraficoEvolucao };