// Variaveis
let dataAtual = obterDataAtual()
let dataInicio = '2026-01-06'
let mesSelecionado = 'Junho / 2026'
let dataFim = dataAtual
let categoriaAtual = ''
let valorFinal = ''
listaMeses = [
    'Junho / 2026',
    'Julho / 2026',
    'Agosto / 2026',
    'Setembro / 2026',
    'Outubro / 2026'
]

paginas['financas'] = {
    html: `
        <div id="graficos" class="f w-98 ml-1 hr-20 mt-1 df-c-c">
        </div>

        <div id="quantidadeRegistros" class="f w-98 ml-1 hr-2 mt-1 df-c-c">31 Registros</div>

        <div id="acoes" class="f w-98 ml-1 hr-2 mt-1 df-c-c">
            <select id="mes" class="f w-15 h-100 df-c-c borda-radius texto-centralizado">
                <option value="Junho / 2026" class="bg-white cor-black">Junho / 2026</option>
                <option value="Julho / 2026" class="bg-white cor-black">Julho / 2026</option>
                <option value="Agosto / 2026" class="bg-white cor-black">Agosto / 2026</option>
                <option value="Setembro / 2026" class="bg-white cor-black">Setembro / 2026</option>
                <option value="Outubro / 2026" class="bg-white cor-black">Outubro / 2026</option>
            </select>
            
            <select id = 'categoria' class="f w-15 h-100 df-c-c borda-radius texto-centralizado">
                <option value="Todas as Categorias" class="bg-white cor-black">Todas as Categorias</option>
                <option value="" class="bg-white cor-black"></option>
                <option value="Dízimo" class="bg-white cor-black">Dízimo</option>
                <option value="Disponivel" class="bg-white cor-black">Disponivel</option>
                <option value="Crédito" class="bg-white cor-black">Crédito</option>
                <option value="Fixo" class="bg-white cor-black">Fixo</option>
                <option value="Mercado" class="bg-white cor-black">Mercado</option>
                <option value="Transporte" class="bg-white cor-black">Transporte</option>
                <option value="Recursos" class="bg-white cor-black">Recursos</option>
            </select>
            
            <div id = 'novo' class="f w-15 h-100 df-c-c borda-radius borda-gray pointer">Novo</div> 
        </div>

        <div id = 'registros' class = 'f w-98 ml-1 hr-30 scroll-y' > </div>
    `,

    eventos: async() => {
        await carregarRecursos()

        document.getElementById('mes').addEventListener('change', async(event) => {
            valor = event.target.value
            mesSelecionado = valor
            await carregarRecursos()
        })

        document.getElementById('categoria').addEventListener('change', async(event) => {
            valor = event.target.value
            valor = valor.replace('Todas as Categorias','')
            categoriaAtual = valor
            await carregarRecursos()
        })

        document.getElementById('novo').addEventListener('click', async() => {
            await db
                .from('recursos')
                .insert([
                    { 
                        data_compra: dataAtual,
                        mes: mesSelecionado 
                    }
                ]);
            
            await carregarRecursos()
        })
    }
}

async function carregarRecursos(){
    remover_elementos('register')
    
    let valores = {
        'Recursos': 3650,
        'Gastos': 0,
        '': 0,
        'Transporte': 0,
        'Relacionamento': 0,
        'Recorrente': 0,
        'Parcelado': 0,
        'Comida': 0,
        'Mercado': 0,
        'Casa': 0,
        'Saúde': 0
    }
    
    // 1. Iniciamos a query básica
    let query = db
        .from('recursos')
        .select('*')
        .eq('mes', mesSelecionado)

    if (categoriaAtual && categoriaAtual !== '') {
        query = query.eq('pagamento', categoriaAtual)
    }

    let registros = await query
    
    let quantidade = registros.data.length
    valorFinal = 0
    
    let total_recursos = 0
    let valorDisponivel = 0
    let valorCredito = 0
    let valorFixo = 0
    let valorAlimentacao = 0
    let valorTransporte = 0
    
    let creditoGabriel = 0
    let creditoPrincess = 0
    let creditoMaria = 0
    let creditoVictor = 0
    let prejuizo = 0
    
    valorRestante = 3850
    for(let c1 = 0; c1 < registros.data.length; c1++){
        let idRegistro = `Registro${c1}`
        let r = registros.data[c1]
        let id = r.id
        let dataCompra = r.data_compra
        let data = r.dataPagamento
        let tipo = r.tipo
        let descricao = r.descricao
        let categoria = r.categoria
        let valor = Number ( r.valor )
        let parcela = r.parcela
        let status = r.status
        let mes = r.mes
        let destinatario = r.destinatario
        let pagamento = r.pagamento
        
        if(pagamento == 'Crédito'){
            if(tipo == 'Saida' ){
                valorCredito += valor
                //                 if(destinatario == 'Gabriel' || destinatario == 'Princess' ){
                if(destinatario == 'Gabriel' ){
                    valorDisponivel = valorDisponivel - valor
                }
            }
            if(tipo == 'Entrada'){
                valorCredito = valorCredito - valor
                valorDisponivel = valorDisponivel + valor   
            }
        }
        if(pagamento == 'Fixo'){
            valorFixo += valor
            valorDisponivel = valorDisponivel - valor
        }      
        if(pagamento == 'Mercado'){
            valorAlimentacao += valor
            valorDisponivel = valorDisponivel - valor
        }   
        if(pagamento == 'Transporte'){
            valorTransporte += valor
            valorDisponivel = valorDisponivel - valor
        }  
        if(pagamento == 'Reserva'){
            valorDisponivel = valorDisponivel - valor
        }  

        if(pagamento == 'Recursos'){
            total_recursos += valor
            valorDisponivel += valor
        }  
        
        if(pagamento == 'Crédito'){
            if(tipo == 'Saida'){
                if(destinatario == 'Gabriel'){
                    creditoGabriel += valor
                }
                if(destinatario == 'Princess'){
                    creditoPrincess += valor
                }
                if(destinatario == 'Maria'){
                    creditoMaria += valor
                }
                if(destinatario == 'Victor'){
                    creditoVictor += valor   
                }
            }
            if(tipo == 'Entrada'){
                if(destinatario == 'Gabriel'){
                    creditoGabriel = creditoGabriel -  valor
                }
                if(destinatario == 'Princess'){
                    creditoPrincess = creditoPrincess - valor
                }
                if(destinatario == 'Maria'){
                    creditoMaria = creditoMaria - valor
                }
                if(destinatario == 'Victor'){
                    creditoVictor = creditoVictor - valor   
                }
            }
        }
        
        if(tipo == 'Saida' && status != 'Devolvido'){
            valores[categoria] += valor
            valores['Gastos'] += valor
        }
        if(tipo == 'Entrada'){
            valores[categoria] = valores[categoria] - valor
            valores['Gastos'] = valores['Gastos'] - valor
        }
        
        let corFundo = 'e6f2ff'
        if(['Pendente'].includes(status) ) {
            corFundo = 'e6f2ff'
        }
        if(['Emprestado'].includes(status) ) {
            corFundo = 'FB9E3A'
        }
        if(['Pago','Devolvido'].includes(status) ) {
            corFundo = '48A6A7'
        }
        
        const htmlOpcoesMeses = listaMeses.map(m => `<option value="${m}" ${m === mes ? 'selected' : ''}>${m}</option>`).join('');
        const opcoesTipo = ['Saida', 'Entrada'].map(o => `<option value="${o}" ${o === tipo ? 'selected' : ''}>${o}</option>`).join('');
        const opcoesPagamento = ['Crédito', 'Fixo', 'Mercado', 'Transporte', 'Reserva', 'Recursos'].map(o => `<option value="${o}" ${o === pagamento ? 'selected' : ''}>${o}</option>`).join('');
        const opcoesStatus = ['Pendente', 'Emprestado', 'Pago', 'Devolvido'].map(o => `<option value="${o}" ${o === status ? 'selected' : ''}>${o}</option>`).join('');
        const opcoesDestinatario = ['Gabriel', 'Princess', 'Queti', 'Maria', 'Victor'].map(o => `<option value="${o}" ${o === destinatario ? 'selected' : ''}>${o}</option>`).join('');

        inserir_html({
            destino: 'registros',
            html: `
                <div id="${idRegistro}" class="f register w-100 hr-2 pt-05 mt-02 border-bottom-gray df-c-c texto-centralizado font-07 bg-${corFundo}">
                    
                    <select id="sel_tipo_${id}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">${opcoesTipo}</select>
                    
                    <select id="sel_pag_${id}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">${opcoesPagamento}</select>
                    
                    <select id="sel_dest_${id}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">${opcoesDestinatario}</select>
                    
                    <select id="sel_mes_${id}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">${htmlOpcoesMeses}</select>
                    
                    <input type="date" id="inp_data_${id}" value="${dataCompra}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">
                    
                    <input type="text" id="inp_desc_${id}" value="${descricao}" class="f w-15 h-100 borda-none bg-transparent outline-none">
                    
                    <input type="number" id="inp_val_${id}" value="${valor}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">
                    
                    <input type="text" id="inp_parc_${id}" value="${parcela}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">
                    
                    <select id="sel_stat_${id}" class="f w-15 h-100 texto-centralizado borda-none bg-transparent outline-none">${opcoesStatus}</select>
                    
                </div>
            `
        });

        const salvarDB = async (campo, valor) => {
            await db.from('recursos').update({ [campo]: valor }).eq('id', id);
        };

        document.getElementById(`sel_tipo_${id}`).onchange = (e) => salvarDB('tipo', e.target.value);
        document.getElementById(`sel_pag_${id}`).onchange = (e) => salvarDB('pagamento', e.target.value);
        document.getElementById(`sel_dest_${id}`).onchange = (e) => salvarDB('destinatario', e.target.value);
        document.getElementById(`sel_mes_${id}`).onchange = (e) => salvarDB('mes', e.target.value);
        document.getElementById(`inp_data_${id}`).onchange = (e) => salvarDB('data_compra', e.target.value);
        document.getElementById(`inp_desc_${id}`).onkeyup = (e) => salvarDB('descricao', e.target.value);
        document.getElementById( `inp_val_${id}`).onkeyup = (e) => salvarDB('valor', e.target.value);
        document.getElementById(`inp_parc_${id}`).onkeyup = (e) => salvarDB('parcela', e.target.value);
        document.getElementById(`sel_stat_${id}`).onchange = (e) => salvarDB('status', e.target.value);

    }
    
    valorFinal = String(valorFinal).replace('.', ',')
    valorFinal = parseInt(valorFinal)
    
    document.getElementById('quantidadeRegistros').innerHTML = `${quantidade} Registros`
    
    let restante = (valores['Recursos'] - valores['Gastos']).toFixed(2)
    if(restante < 0){
        restante = 0
    }
        
    let saldo_atual_legenda = 'Disponivel'
    let saldo_atual_cor = '#006A71'
    let saldo_atual_valor = valorDisponivel
        
    if(valorDisponivel < 0){
        prejuizo = prejuizo - ( valorDisponivel ).toFixed(2)
        valorDisponivel = 0
        
        saldo_atual_legenda = 'Prejuízo'
        saldo_atual_valor = prejuizo
        saldo_atual_cor = '#c93964'
    }
    
    valorDisponivel = ( valorDisponivel ).toFixed(2)
    valorCredito = ( valorCredito ).toFixed(2)
    valorFixo = ( valorFixo ).toFixed(2)
    saldo_atual_valor = ( saldo_atual_valor ) . toFixed(2)
        
    remover_elemento('container_grafico_recursos');

    inserir_html({
        destino: 'graficos',
        html: `
            <div id="container_grafico_recursos" class="f w-50 h-100 graphics">
                <canvas id = 'grafico_recursos' class="f w-100 h-100"></canvas>
            </div>
        `
    });
    
    grafico_barras({
        id: 'grafico_recursos',
        titulo: `Balanço Geral`,
        legendas: ['Recursos', saldo_atual_legenda],
        valores: [total_recursos, saldo_atual_valor],
        orientacao: 'x',
        tamanho_minimo: 40,
        cores: [ '#0a1c3fd6',saldo_atual_cor ]
    })
        
    remover_elemento('container_grafico_distribuicao')

    inserir_html({
        destino: 'graficos',
        html: `
            <div id="container_grafico_distribuicao" class="f w-50 h-100 graphics">
                <canvas id = 'grafico_distribuicao' class="f w-100 h-100"></canvas>
            </div>
        `
    });
    
    grafico_barras({
        id: 'grafico_distribuicao',
        titulo: `Distribuição de Despesas`,
        legendas: [ 'Crédito','Fixo', 'Transporte' ],
        valores: [ valorCredito, valorFixo, valorTransporte ],
        tamanho_minimo: 40,
        cores: [ '#0a1c3fd6','#27548A', '#3484ac' ]
    })
}