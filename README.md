<div align="center">
  <h1>🃏 Agente de Poker Inteligente</h1>
  <p><em>Treinamento de Redes Neurais e Algoritmos de Monte Carlo aplicados ao Texas Hold'em</em></p>
  
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
  ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)
</div>

---

##  Sobre o Projeto

Este repositório contém o código-fonte do Trabalho de Conclusão de Curso (TCC) focado no desenvolvimento de um agente autônomo para o jogo de Poker (Texas Hold'em). O núcleo da inteligência artificial é construído através da combinação de **Simulações de Monte Carlo** (para cálculo de *Equity*) e **Deep Q-Learning** (Redes Neurais com aprendizado por reforço).

O projeto não possui interface gráfica de jogo; toda a simulação, tomada de decisão e avaliação de desempenho ocorrem no backend, gerando logs detalhados e gráficos analíticos ao final das sessões de treinamento.

##  Funcionalidades

- **Simulação Completa de Texas Hold'em:** Motor de regras completo, abrangendo Pre-Flop, Flop, Turn e River, além de cálculo perfeito de força de mãos e kickers.
- **Cálculo de Equity em Tempo Real:** Utiliza o método de Monte Carlo para estimar a probabilidade de vitória da IA baseada nas cartas da mão e da mesa.
- **Agente de Deep Q-Learning (DQN):** Uma rede neural construída com TensorFlow.js que toma decisões com base no estado do jogo (Equity, Pote, Fichas e Aposta a Cobrir).
- **Sistema de Recompensas e Punições:** A IA aprende maximizando lucros e é penalizada por comportamentos passivos com mãos muito fortes.
- **Geração Automática de Gráficos:** Exporta imagens do desempenho financeiro do agente e da curva de decaimento do Epsilon (taxa de exploração) após os treinos.

##  Tecnologias Utilizadas

- **JavaScript (Node.js):** Linguagem base do projeto.
- **@tensorflow/tfjs:** Criação, treinamento e inferência da Rede Neural Artificial.
- **chart.js & chartjs-node-canvas:** Renderização e exportação de gráficos de desempenho em formato PNG direto do backend.
- **seedrandom:** Geração de números pseudoaleatórios com sementes para garantir a reprodutibilidade dos cenários.

##  Como a Inteligência Artificial Funciona

A IA toma decisões baseada em 4 variáveis principais de estado:
1. `Equity` (Probabilidade de vitória calculada via Monte Carlo)
2. `Pote Atual`
3. `Valor da Aposta para Cobrir`
4. `Stack de Fichas Atual`

Com base nesse estado, a rede neural avalia 5 possíveis ações (Q-Values) e escolhe a de maior valor esperado (ou escolhe aleatoriamente durante a fase de exploração ditada pelo `Epsilon`):
- `0` - **Fold:** Desistir da mão.
- `1` - **Call / Check:** Pagar a aposta ou passar a vez.
- `2` - **Raise Leve:** Aumentar a aposta em 150 fichas.
- `3` - **Raise Forte:** Aumentar a aposta em 300 fichas.
- `4` - **All-in:** Apostar todas as fichas.

##  Estrutura do Projeto

```text
├── src/
│   ├── app.js                     # Ponto de entrada e loop de episódios/treinamento
│   ├── controllers/
│   │   └── jogoController.js      # Lógica central do Texas Hold'em e integração da IA
│   ├── models/
│   │   ├── carta.js               # Representação de uma carta (valor e naipe)
│   │   └── jogador.js             # Classe do jogador (fichas, cartas, status)
│   ├── services/
│   │   ├── baralhoService.js      # Geração e manipulação do baralho
│   │   ├── combinacoesService.js  # Avaliador matemático da força das mãos (Showdown)
│   │   ├── estatisticasService.js # Motor de Monte Carlo para cálculo de Equity
│   │   ├── graficoService.js      # Geração dos gráficos de desempenho
│   │   └── iaService.js           # Construção e treinamento do modelo DQN com TensorFlow
│   └── views/
│       └── consoleView.js         # Interface de terminal (barra de progresso e logs)
├── package.json
└── README.md
