const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');

async function gerarGraficoEvolucao(recompensas, historicoEpsilon) {
    const width = 1200;
    const height = 600;
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

    // Calcula a Média Móvel (Janela de 50 episódios) para suavizar a curva de lucro
    const janelaMedia = Math.min(50, recompensas.length);
    const mediaMovel = recompensas.map((_, i, arr) => {
        if (i < janelaMedia - 1) return null; // Não tem dados suficientes no começo
        const soma = arr.slice(i - janelaMedia + 1, i + 1).reduce((a, b) => a + b, 0);
        return soma / janelaMedia;
    });

    const labels = recompensas.map((_, index) => `Jogo ${index + 1}`);

    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Lucro/Prejuízo Real (Fichas)',
                    data: recompensas,
                    borderColor: 'rgba(54, 162, 235, 0.3)', // Linha mais clara e transparente
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 1,
                    pointRadius: 0, // Remove os pontinhos para não poluir
                    yAxisID: 'y', // Usa o eixo principal
                    fill: false
                },
                {
                    label: `Média Móvel (${janelaMedia} jogos)`,
                    data: mediaMovel,
                    borderColor: 'rgba(255, 99, 132, 1)', // Linha vermelha forte para a tendência
                    borderWidth: 3,
                    pointRadius: 0,
                    yAxisID: 'y', // Usa o eixo principal
                    fill: false
                },
                {
                    label: 'Taxa de Exploração (Epsilon)',
                    data: historicoEpsilon,
                    borderColor: 'rgba(75, 192, 192, 1)', // Linha verde para o Epsilon
                    borderWidth: 2,
                    borderDash: [5, 5], // Linha tracejada
                    pointRadius: 0,
                    yAxisID: 'y1', // Usa o eixo secundário à direita
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Evolução do Treinamento DQN - Texas Hold'em",
                    font: { size: 24 }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Episódios (Mãos Jogadas)' },
                    ticks: { maxTicksLimit: 20 }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Fichas Ganhas/Perdidas' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right', // Eixo do Epsilon fica na direita
                    title: { display: true, text: 'Epsilon (0 a 1)' },
                    min: 0,
                    max: 1,
                    grid: { drawOnChartArea: false } // Não desenha linhas de grade para não confundir
                }
            }
        }
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    fs.writeFileSync('grafico_resultados.png', buffer);
}

module.exports = { gerarGraficoEvolucao };