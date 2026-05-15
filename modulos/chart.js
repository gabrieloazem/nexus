
function grafico_donutss(config) {
  const {
    id,
    titulo,
    legendas,
    valores,
    cores,
    onClick,
    financeiro = false 
  } = config;

  const canvas = document.getElementById(id);

  let total = valores.reduce((acc, val) => acc + val, 0);
  let percentuais = valores.map(v => parseFloat(((v / total) * 100).toFixed(1)));

  const dadosFiltrados = percentuais
    .map((percentual, i) => ({
      percentual,
      legenda: legendas[i],
      valor: valores[i],
      cor: cores[i],
      indexOriginal: i
    }))
    .filter(item => item.percentual > 0);

  // ðŸ‘‡ aqui muda a exibiÃ§Ã£o da legenda, sem mexer no valor real
  const legendasFormatadas = dadosFiltrados.map(item => {
    if (financeiro) {
      const valorFormatado = item.valor
        .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      return `${item.legenda} (${valorFormatado})`;
    } else {
      return `${item.legenda} (${item.valor})`;
    }
  });

  const percentuaisFiltrados = dadosFiltrados.map(item => item.percentual);
  const coresFiltradas = dadosFiltrados.map(item => item.cor);

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: legendasFormatadas,
      datasets: [{
        data: percentuaisFiltrados,
        borderWidth: 1,
        backgroundColor: coresFiltradas
      }]
    },
    options: {
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const chartElement = elements[0];
          const index = chartElement.index;
          const item = dadosFiltrados[index];

          if (typeof onClick === 'function') {
            onClick(item.indexOriginal, item.legenda, item.valor);
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 15 },
          color: '#333'
        },
        datalabels: {
          color: '#fff',
          font: { weight: 'bold', size: 16 },
          formatter: value => `${value}%`,
          anchor: 'center',
          align: 'center'
        }
      },
      scales: { y: { beginAtZero: true } }
    },
    plugins: [ChartDataLabels]
  });

  return chart;
}


function grafico_barras(config) {
  const {
    id,
    titulo,
    orientacao = 'x',
    legendas,
    valores,      // dataY â†’ valores reais (numÃ©ricos)
    valoresTexto, // dataY2 â†’ valores formatados (ex: R$ ...)
    cores,
    onClick,
    tamanho_minimo,
    valores_externos = false
  } = config;

  const canvas = document.getElementById(id);
  canvas.width = '100%';
  canvas.height = '100%';

  const dataset = {
    data: valores,
    backgroundColor: cores
  };

  if (tamanho_minimo !== undefined && tamanho_minimo !== null) {
    dataset.minBarLength = tamanho_minimo;
  }

  return new Chart(canvas, {
    type: 'bar',
    data: {
      labels: legendas,
      datasets: [dataset]
    },
    options: {
      indexAxis: orientacao,
      onClick: (event, barElement) => {
        if (barElement.length > 0 && typeof onClick === 'function') {
          const indice = barElement[0].index;
          onClick(indice, legendas[indice], valores[indice]);
        }
      },
      scales: {
        x: { ticks: { autoSkip: false } },
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo,
          font: { size: 15 },
          color: '#333'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Mostra o valor formatado se disponÃ­vel
              const indice = context.dataIndex;
              const valorFormatado = valoresTexto && valoresTexto[indice]
                ? valoresTexto[indice]
                : context.raw;
              return `${context.label}: ${valorFormatado}`;
            }
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'start',
          color: '#fff',
          font: { weight: 'bold', size: 14 },
          formatter: (value, context) => {
            const indice = context.dataIndex;
            // Usa valor formatado de valoresTexto (dataY2), se existir
            if (valoresTexto && valoresTexto[indice]) {
              return valoresTexto[indice];
            }
            return value;
          }
        }
      },
      interaction: {
        mode: 'nearest',
        intersect: false
      }
    },
    plugins: [ChartDataLabels]
  });
}





function grafico_grupo_barras(config) {
    const { id, titulo, grupos, series, onClick, tamanho_minimo } = config;

    const canvas = document.getElementById(id);
    canvas.width = '100%';
    canvas.height = '100%';

    return new Chart(canvas, {
        type: 'bar',
        data: {
            labels: grupos,
            datasets: series.map(s => ({
                label: s.nome,
                data: s.valores,
                // Se o valor for 0, a cor fica transparente (ocultação total)
                backgroundColor: s.valores.map(v => v > 0 ? s.cor : 'transparent'),
                // Se o valor for 0, a borda também some
                borderColor: s.valores.map(v => v > 0 ? s.cor : 'transparent'),
                minBarLength: tamanho_minimo || 0 
            }))
        },
        options: {
            responsive: true,
            onClick: (event, elements) => {
                if (elements.length > 0 && typeof onClick === 'function') {
                    const datasetIndex = elements[0].datasetIndex;
                    const dataIndex = elements[0].index;

                    const grupo = grupos[dataIndex];
                    const serie = series[datasetIndex];
                    const valor = serie.valores[dataIndex];

                    // Impede o clique em barras "invisíveis" (valor 0)
                    if (valor > 0) {
                        onClick(grupo, serie.nome, valor);
                    }
                }
            },
            scales: {
                x: { stacked: false },
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: true },
                title: {
                    display: true,
                    text: titulo,
                    font: { size: 15 },
                    color: '#333'
                },
                datalabels: {
                    anchor: 'end',
                    align: 'start',
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    // Esconde o número 0
                    display: (context) => context.dataset.data[context.dataIndex] !== 0,
                    formatter: value => value
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function atualizarGrafico(tipo,grafico,dataX,dataY,cores){

 if(tipo == 'donuts'){
    var somatorio = 0
    for(var c1 = 0; c1 < dataY.length; c1++){
        somatorio += dataY[c1]
    }
    for(var c1 = 0; c1 < dataY.length; c1++){
        dataY[c1] = dataY[c1] / somatorio * 100
        dataY[c1] = parseFloat(dataY[c1].toFixed(1))
    }
 }

 if(dataX != ''){
   grafico.data.labels = dataX
 }

 if(dataY != ''){
   if(dataY.length == 2){
   }
   grafico.data.datasets[0].data = dataY
 }

 if(cores != ''){
   grafico.data.datasets[0].backgroundColor = cores
 }

 grafico.update()
}

function graficoDonuts(destino, titulo, dataX, dataY, cores,funcao){

 var grafico = document.getElementById(destino);
 
 var total = 0
 for(var c1 = 0; c1 < dataY.length; c1++){
     total += dataY[c1]
 }
 for(var c1 = 0; c1 < dataY.length; c1++){
     dataY[c1] = dataY[c1] / total * 100
     dataY[c1] = parseFloat(dataY[c1].toFixed(1))
 }


 grafico = new Chart(grafico, {
     type: 'doughnut',
     data: {
       labels: dataX,
       datasets: [{
         data: dataY,
         borderWidth: 1,
         backgroundColor: cores
       }]
     },
     options: {

      onClick: (event, barElement) => {
         var indice = barElement[0].index
         var elemento = dataX[indice]

         if(funcao == 'gerencias'){
             pagina_licitatorios_filtrar_andamento(dataX[indice])
         }

         if(funcao == 'gerenciasConcluidas'){
             pagina_licitatorios_filtrar_cargas(dataX[indice])
         }

      },

    plugins: {
      title: {
        display: true,
        text: titulo,
        font: {
          size: 18
        },
        color: '#333'
      },
        datalabels: {
          color: '#fff',           // Cor dos rÃ³tulos
          font: {
            weight: 'bold',        // Peso da fonte
            size: 16               // Tamanho da fonte
          },
          formatter: (value, context) => {
            return `${value}%`;    // Exibe o valor como percentual
          },
          anchor: 'center',        // Centraliza o rÃ³tulo na fatia
          align: 'center',         // Alinha o rÃ³tulo na posiÃ§Ã£o central
        }

    },

       scales: {
         y: {
           beginAtZero: true
         }
       }
     },plugins: [ChartDataLabels]
 });
 return grafico
}

function grafico_linhas(config) {
  const {
    id,
    titulo,
    legendas,  // <- substituÃ­do "labels" por "legendas"
    valores,
    cores,
    onClick
  } = config;

  const canvas = document.getElementById(id);

  // Garantir que o canvas ocupe 100% do container
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const dadosFiltrados = valores
    .map((valor, i) => ({
      valor,
      label: legendas[i], // <- aqui tambÃ©m usa "legendas"
      cor: cores[i] || 'rgba(0,0,0,0.5)',
      indexOriginal: i
    }))
    .filter(item => item.valor > 0);

  const valoresFiltrados = dadosFiltrados.map(item => item.valor);
  const legendasFiltradas = dadosFiltrados.map(item => item.label);
  const corLinha = dadosFiltrados[0]?.cor || 'rgba(0, 123, 255, 0.8)';

  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: legendasFiltradas, // <- aqui tambÃ©m
      datasets: [{
        label: '', // removido o label do dataset
        data: valoresFiltrados,
        borderColor: corLinha,
        backgroundColor: corLinha,
        fill: false,
        tension: 0.3,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0 && typeof onClick === 'function') {
          const index = elements[0].index;
          const item = dadosFiltrados[index];
          onClick(item.indexOriginal, item.label, item.valor)
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 18 },
          color: '#333'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  return chart;
}

function grafico_polar(config) {
  const {
    id,
    titulo,
    legendas,
    valores,
    cores,
    onClick
  } = config;

  const canvas = document.getElementById(id);

  // Ocupa 100% do container
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const dadosFiltrados = valores
    .map((valor, i) => ({
      valor,
      label: legendas[i],
      cor: cores[i] || 'rgba(0,0,0,0.5)',
      indexOriginal: i
    }))
    .filter(item => item.valor > 0);

  const valoresFiltrados = dadosFiltrados.map(item => item.valor);
  const legendasFiltradas = dadosFiltrados.map(item => item.label);
  const coresFiltradas = dadosFiltrados.map(item => item.cor);

  const chart = new Chart(canvas, {
    type: 'polarArea',
    data: {
      labels: legendasFiltradas,
      datasets: [{
        data: valoresFiltrados,
        backgroundColor: coresFiltradas,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event, elements) => {
        if (elements.length > 0 && typeof onClick === 'function') {
          const index = elements[0].index;
          const item = dadosFiltrados[index];
          onClick(item.indexOriginal, item.label, item.valor); // retorna os trÃªs
        }
      },
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: { size: 18 },
          color: '#333'
        },
        legend: {
          display: true
        }
      }
    }
  });

  return chart;
}