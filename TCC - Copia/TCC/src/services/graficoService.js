const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

async function gerarGraficoEvolucao(dadosRecompensa) {
    const width = 800; // Largura da imagem
    const height = 600; // Altura da imagem
    // Fundo branco para ficar perfeito no PDF do TCC
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

    const labelsEpisodios = dadosRecompensa.map((_, index) => `Jogo ${index + 1}`);

    const configuration = {
        type: 'line',
        data: {
            labels: labelsEpisodios,
            datasets: [{
                label: 'Lucro/Prejuízo da IA (Fichas)',
                data: dadosRecompensa,
                borderColor: 'rgb(54, 162, 235)', // Azul padrão
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 2,
                tension: 0.1, // Suavidade da linha
                fill: true
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Evolução do Agente DQN no Texas Hold\'em',
                    font: { size: 18 }
                }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Fichas Ganhas/Perdidas' }
                },
                x: {
                    title: { display: true, text: 'Episódios (Mãos Jogadas)' }
                }
            }
        }
    };

    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const caminhoArquivo = path.join(__dirname, '..', '..', 'grafico_resultados.png');
    
    fs.writeFileSync(caminhoArquivo, imageBuffer);
    console.log(`\n[+] Gráfico de resultados gerado com sucesso: ${caminhoArquivo}`);
}

module.exports = { gerarGraficoEvolucao };