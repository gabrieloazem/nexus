// =================================================
// VARIAVEIS
// =================================================
let paginas = {}
let pagina_atual = ''
let link_api_database = ''
let cores = {
    icone_mobile_padrao: '9f9f9f',
    icone_mobile_selecionado: '374151'
}

function exibir_no_log(mensagem){
    console.log(mensagem)
}

function inserir_html(config) {
    let {
        html,
        destino = 'conteudo'
    } = config

    let elemento;

    if (destino === 'body') {
        elemento = document.body
    } else {
        elemento = document.getElementById(destino)
    }

    if (elemento) {
        elemento.insertAdjacentHTML('beforeend', html)
    }
}

function limpar_conteudo(){
    document.getElementById('conteudo').innerHTML = ''
}

function obter_imagem(config){
    let {
        caminho = '',
        altura = 100,
        largura = 40
    } = config
    
    return `<div style = " background-image: url(${caminho}); " class = 'w-${largura} h-${altura} foto' > </div>`
}

function obter_icone_svg(config) {
    let {
        id = '',
        icone = '',
        altura = '60',
        largura = '100',
        cor_fundo = '#c9c8c8'
    } = config
    
    let lista_icones = {
        casa1: `
            <svg id = '${id}' fill="${cor_fundo}" width="${largura}%" height="${altura}%" viewBox="0 0 64 64"> 
                <path d="M62.79,29.172l-28-28C34.009,0.391,32.985,0,31.962,0s-2.047,0.391-2.828,1.172l-28,28 c-1.562,1.566-1.484,4.016,0.078,5.578c1.566,1.57,
                3.855,1.801,5.422,0.234L8,33.617V60c0,2.211,1.789,4,4,4h16V48h8v16h16 c2.211,0,4-1.789,4-4V33.695l1.195,1.195c1.562,1.562,3.949,1.422,5.516-0.141C64.274,33.188,
                64.356,30.734,62.79,29.172z"></path> 
            </svg>
        `,
        
        config1: `
            <svg id = '${id}' fill="${cor_fundo}" width="${largura}%" height="${altura}%" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
                <title>file_type_config</title> <path d="M23.265,24.381l.9-.894c4.164.136,4.228-.01,4.411-.438l1.144-2.785L29.805,20l-.093-.231c-.049-.122-.2-.486-2.8-2.965V15.5c3-2.89,
                2.936-3.038,2.765-3.461L28.538,9.225c-.171-.422-.236-.587-4.37-.474l-.9-.93a20.166,20.166,0,0,0-.141-4.106l-.116-.263-2.974-1.3c-.438-.2-.592-.272-3.4,
                2.786l-1.262-.019c-2.891-3.086-3.028-3.03-3.461-2.855L9.149,3.182c-.433.175-.586.237-.418,4.437l-.893.89c-4.162-.136-4.226.012-4.407.438L2.285,11.733,2.195,
                12l.094.232c.049.12.194.48,2.8,2.962l0,1.3c-3,2.89-2.935,3.038-2.763,3.462l1.138,2.817c.174.431.236.584,4.369.476l.9.935a20.243,20.243,0,0,0,.137,4.1l.116.265,2.993,
                1.308c.435.182.586.247,3.386-2.8l1.262.016c2.895,3.09,3.043,3.03,3.466,2.859l2.759-1.115C23.288,28.644,23.44,28.583,23.265,24.381ZM11.407,17.857a4.957,4.957,0,1,1,6.488,
                2.824A5.014,5.014,0,0,1,11.407,17.857Z" style="fill:374151"></path></g> 
            </svg>
        `,
        
        checklist1: `
            <svg id = '${id}' fill="${cor_fundo}" width="${largura}%" height="${altura}%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" 
                stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" 
                d="M8.04832 2.48826C8.33094 2.79108 8.31458 3.26567 8.01176 3.54829L3.72605 7.54829C3.57393 7.69027 3.36967 7.76267 3.1621 7.74818C2.95453 7.7337 2.7623 7.63363 2.63138 7.4719L1.41709 
                5.9719C1.15647 5.64996 1.20618 5.17769 1.52813 4.91707C1.85007 4.65645 2.32234 4.70616 2.58296 5.0281L3.29089 5.90261L6.98829 2.45171C7.2911 2.16909 7.76569 2.18545 8.04832 
                2.48826ZM11.25 5C11.25 4.58579 11.5858 4.25 12 4.25H22C22.4142 4.25 22.75 4.58579 22.75 5C22.75 5.41422 22.4142 5.75 22 5.75H12C11.5858 5.75 11.25 5.41422 11.25 5ZM8.04832 
                9.48826C8.33094 9.79108 8.31458 10.2657 8.01176 10.5483L3.72605 14.5483C3.57393 14.6903 3.36967 14.7627 3.1621 14.7482C2.95453 14.7337 2.7623 14.6336 2.63138 14.4719L1.41709 
                12.9719C1.15647 12.65 1.20618 12.1777 1.52813 11.9171C1.85007 11.6564 2.32234 11.7062 2.58296 12.0281L3.29089 12.9026L6.98829 9.45171C7.2911 9.16909 7.76569 9.18545 8.04832 
                9.48826ZM11.25 12C11.25 11.5858 11.5858 11.25 12 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H12C11.5858 12.75 11.25 12.4142 11.25 
                12ZM8.04832 16.4883C8.33094 16.7911 8.31458 17.2657 8.01176 17.5483L3.72605 21.5483C3.57393 21.6903 3.36967 21.7627 3.1621 21.7482C2.95453 21.7337 2.7623 21.6336 2.63138 
                21.4719L1.41709 19.9719C1.15647 19.65 1.20618 19.1777 1.52813 18.9171C1.85007 18.6564 2.32234 18.7062 2.58296 19.0281L3.29089 19.9026L6.98829 16.4517C7.2911 16.1691 7.76569 
                16.1855 8.04832 16.4883ZM11.25 19C11.25 18.5858 11.5858 18.25 12 18.25H22C22.4142 18.25 22.75 18.5858 22.75 19C22.75 19.4142 22.4142 19.75 22 19.75H12C11.5858 19.75 11.25 
                19.4142 11.25 19Z"></path> </g>
            </svg>
        `,
        
        musica1: `
            <svg id = '${id}' fill="${cor_fundo}" width="${largura}%" height="${altura}%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" 
                stroke-width="0"></g><g stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M10.0909 11.9629L19.3636 8.63087V14.1707C18.8126 13.8538 
                18.1574 13.67 17.4545 13.67C15.4964 13.67 13.9091 15.096 13.9091 16.855C13.9091 18.614 15.4964 20.04 17.4545 20.04C19.4126 20.04 21 18.614 21 16.855C21 16.855 21 16.8551 
                21 16.855L21 7.49236C21 6.37238 21 5.4331 20.9123 4.68472C20.8999 4.57895 20.8852 4.4738 20.869 4.37569C20.7845 3.86441 20.6352 3.38745 20.347 2.98917C20.2028 2.79002 20.024 
                2.61055 19.8012 2.45628C19.7594 2.42736 19.716 2.39932 19.6711 2.3722L19.6621 2.36679C18.8906 1.90553 18.0233 1.93852 17.1298 2.14305C16.2657 2.34086 15.1944 2.74368 13.8808 
                3.23763L11.5963 4.09656C10.9806 4.32806 10.4589 4.52419 10.0494 4.72734C9.61376 4.94348 9.23849 5.1984 8.95707 5.57828C8.67564 5.95817 8.55876 6.36756 8.50501 6.81203C8.4545 
                7.22978 8.45452 7.7378 8.45455 8.33743V16.1307C7.90347 15.8138 7.24835 15.63 6.54545 15.63C4.58735 15.63 3 17.056 3 18.815C3 20.574 4.58735 22 6.54545 22C8.50355 22 10.0909 
                20.574 10.0909 18.815C10.0909 18.815 10.0909 18.8151 10.0909 18.815L10.0909 11.9629Z" ></path> </g>
            </svg>
        `,
        
        dinheiro1: `
            <svg id = '${id}' fill="${cor_fundo}" width="${largura}%" height="${altura}%" xmlns="http://www.w3.org/2000/svg" fill="#9e9e9e" viewBox="0 0 24 24" 
                stroke="#9e9e9e"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g 
                id="SVGRepo_iconCarrier"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 
                2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 
                3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"></path></g>
            </svg>
        `
    };
    
    return lista_icones[icone] || '';
}

function criar_pagina(config){
    let {
        layout = 'atual',
        marca = { tipo: 'texto', texto: 'Título' },
        atalhos_mobile = [],
    } = config
    
    if(layout == 'basico'){
        inserir_html({ destino: 'body', html:`
            <div id = 'janela' class = 'f w-100 h-100 font-arial'>
                <div class = 'f w-100 h-10 df-c-c cor-white bg-black'> Título </div>
                <div class = 'f w-100 h-90 scroll-y'> <div>
            </div>
        `})
    }
    
    if(layout == 'atual'){
        let html_marca = ''
        if(marca.tipo == 'texto'){
            html_marca = `<div id = 'marca' class='f w-100 h-100 df-c-c'> ${marca.texto} </div>`
        }
        if(marca.tipo == 'imagem'){
            html_marca = obter_imagem({ caminho: marca.imagem });
        }
        
        let html_atalhos = atalhos_mobile.map((atalho, c1) => {
            let i1 = c1 + 1
            let id_icone = `atalho_mobile${i1}_icone`;
            let icone_svg = obter_icone_svg({ id: id_icone, icone: atalho.icone });
            
            return `
                <div id='atalho_mobile${i1}' class='f w-20 h-100 d-flex2 ai-center pointer'>
                    <div class='f w-100 h-10'></div>
                    <div class='f w-50 h-60 df-c-c'>${icone_svg}</div>
                    <div id='atalho_mobile${i1}_nome' class='f w-100 h-30 font-06 texto-centralizado'>
                        ${atalho.nome}
                    </div>
                </div>`;
        }).join('');

        inserir_html({ destino: 'body', html: `
            <div id='janela' class='f w-100 h-100 font-arial'>
                <div id='menu_mobile' class='mobile_only ocultar_na_impressao f w-100 h-10 bg-f9fafb'> 
                    ${html_marca}
                </div>
                <div class = 'desktop_only f w-20 h-100 bg-black'> </div>
                <div class = 'desktop_only f w-80 h-10 bg-gray'> </div>
                <div id='conteudo' class='f w-100 h-80 scroll-y'></div>
                <div id='submenu' class='mobile_only ocultar_na_impressao f w-100 h-10 bg-f9fafb df-c-c'>
                    ${html_atalhos}
                </div>
            </div>
        `});

        for (let c1 = 0; c1 < atalhos_mobile.length; c1++) {
            let i1 = c1 + 1
            document.getElementById(`atalho_mobile${i1}`).onclick = () => atalho_mobile_selecionado(c1)
        }
        
        for (let c1 = 0; c1 < atalhos_mobile.length; c1++) {
            let i1 = c1 + 1
            let botao = document.getElementById(`atalho_mobile${i1}`);
    
            if (botao) {
                botao.onclick = async () => {
                    atalho_mobile_selecionado(i1);
    
                    if (atalhos_mobile[c1].onClick) {
                        await atalhos_mobile[c1].onClick();
                    }
                };
            }
        }
        
        atalho_mobile_selecionado(1);
    }
}

function atalho_mobile_selecionado(indice_selecionado){
    for(let c1 = 1; c1 <= 5; c1++){
        let indice = c1
        document.getElementById(`atalho_mobile${indice}_icone`).style.fill = `#${cores.icone_mobile_padrao}`
        document.getElementById(`atalho_mobile${indice}_nome`).style.color = `#${cores.icone_mobile_padrao}`
        document.getElementById(`atalho_mobile${indice}_nome`).style.fontSize = '0.6rem'
        document.getElementById(`atalho_mobile${indice}_nome`).style.fontWeight = '500'
    }
    document.getElementById(`atalho_mobile${indice_selecionado}_icone`).style.fill = `#${cores.icone_mobile_selecionado}`
    document.getElementById(`atalho_mobile${indice_selecionado}_nome`).style.color = `#${cores.icone_mobile_selecionado}`
    document.getElementById(`atalho_mobile${indice_selecionado}_nome`).style.fontSize = '0.7rem'
    document.getElementById(`atalho_mobile${indice_selecionado}_nome`).style.fontWeight = '700'
}

function atualizar_valor(config) {
    let {
        id,
        valor
    } = config
    
    const el = document.getElementById(id);
    if (!el) return false;

    if (el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement) {

        el.value = valor;
        return true;
    }

    el.innerHTML = valor;
    return true;
}

function remover_elementos(nome){
    while(document.body.contains ( document.getElementsByClassName(nome)[0]) == true  ) {
        document.getElementsByClassName(nome)[0].remove()
    }
}

function obter_classes(id){
    return document.getElementById(id).className
}

function remover_classe(id, classe) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove(classe);
    }
}

function adicionar_classe(id, classe) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add(classe);
    }
}

async function delay(tempo){
    await new Promise(resolve => setTimeout(resolve, tempo))
}

async function loading_comeco() {
    const html_loading = `
        <div id="loading" class="absolute bg-black cor-white df-c-c w-100 h-100 font-2 texto-centralizado opacity-50 camada3">
            <div class="spinner"></div>
            <div>Carregando</div>
        </div>
    `;

    inserir_html({
        destino: 'janela',
        html: html_loading
    });

    await delay(200);
}

function loading_final() {
    document.getElementById('loading')?.remove();
}

async function carregar_pagina(config) {
    let {
        nome, 
        registrar_historico = false
    } = config
    
    limpar_conteudo()

    let cfg = paginas[nome]
    if (!cfg) return
    
    let executar = async() => {
        pagina_atual = nome
        
        let destino_html = cfg.destino || 'conteudo'

        atualizar_valor({
            id: "pagina_selecionada", 
            valor: cfg.titulo 
        })
        
        // Esqueci o que isso faz
        if(cfg.pagina){
            await cfg.pagina()
        }
        
        // Obsoleto => Constroi cada elemento da pagina
        if(cfg.ui){
            if (typeof cfg.ui === "function") {
                lista = cfg.ui();  
            } else {
                lista = cfg.ui;
            }
            
            renderizarUI(lista, destino_html)
        }
        
        if(cfg.html){
            inserir_html({ destino: destino_html, html: cfg.html })
        }
        
        if(cfg.atualizar_filtros){
            await cfg.atualizarFiltros()
        }
        
        if(cfg.eventos){
            await cfg.eventos()
        }
        
        if(cfg.atualizar_estatisticas){
            await cfg.atualizarEstatisticas()
        }
        
        if(cfg.carregar_registros){
            await cfg.carregar_registros()
        }
    }
    
    if(registrar_historico){
        historico_adicionar_pagina(executar)
        historico_pagina_atual()
    } else {
        await executar()
    }
}

function renderizarUI(lista, destino = 'conteudo' ) {
    const html = lista.map(item => gerarHTML(item)).join('');
    inserir_html({ destino: destino, html: html });
}

function gerarHTML(item) {
    if (!item || !item.tipo) return '';

    // Se o item tiver restri��o e for falso, n�o renderiza ele nem os filhos
    if ('restricao' in item && !item.restricao) return '';

    // Se for cardFim, retorna diretamente
    if (item.tipo === 'cardFim') return UI.cardFim({});

    // Se o item n�o existir no UI, retorna vazio
    if (!UI[item.tipo]) return '';

    // Renderiza o HTML do item atual
    let html = UI[item.tipo](item);

    // Se houver filhos, renderiza recursivamente
    if (Array.isArray(item.filhos) && item.filhos.length > 0) {
        html += item.filhos.map(filho => gerarHTML(filho)).join('');
        // Fecha o card automaticamente se for um card com filhos
        if (item.tipo === 'card' || item.tipo === 'menuSuperior' || item.tipo === 'menuInferior' || item.tipo === 'conteudo' ) {
            html += UI.cardFim({});
        }
    } else {
        // Se o item for card mas n�o tiver filhos, fecha logo ap�s
        if (item.tipo === 'card' || item.tipo === 'menuSuperior' || item.tipo === 'menuInferior' || item.tipo === 'conteudo' ) {
            html += UI.cardFim({});
        }
    }

    return html;
}

UI = {
    
    divFinal: ({}) => `
       </div>
    `,
    
    select: ({ id, lista = [], valorPadrao = '', altura = 2, largura = 15, margemLeft = 0, margemTop = 0 , margemRight = 0, alinhamento = 'centralizado'}) => {
        // Gera as options mapeando a lista recebida
        const options = lista.map(item => {
            const valor = typeof item === 'object' ? item.valor : item;
            const texto = typeof item === 'object' ? item.texto : item;
            const selecionado = valor == valorPadrao ? 'selected' : '';
            
            return `<option value="${valor}" ${selecionado}>${texto}</option>`;
        }).join('');
    
        return `
            <select id="${id}" class="f w-${largura} ml-${margemLeft} mt-${margemTop} mr-${margemRight} hr-${altura} texto-${alinhamento} border-radius-5 border-e5e7eb font-09 pl-0 cor-1a1a1a pointer borda-radius outline-none">
                ${options}
            </select>
        `;
    },
    
    subtitulo: ({ id, texto, largura, margemLeft, margemTop, margemBottom, fonte, alinhamento, corTexto = '1a1a1a' }) => `
        <div id = '${id}' class="f w-98 ml-${margemLeft} font-102 mt-${margemTop} mb-${margemBottom} texto-${alinhamento} cor-${corTexto} font-weight-600 font-${fonte}"> ${texto} </div>
    `,
    
    card: ({ id, orientacao, largura, altura, borda, margemLeft, padding, displayFlex, margemBottom, margemTop = 1, corFundo, bordaRadius = '12px' , wrap, scroll }) => `
        <div id="card${id}" class="f bg-${corFundo} w-${largura} ml-${margemLeft} h-${altura} mt-${margemTop} mb-${margemBottom} df-c-${orientacao} ${displayFlex} padding-${padding} borda-${borda} borda-radius-${bordaRadius} ${wrap} ${scroll}">
    `,

    cardFim: ({}) => `
        </div>
    `,
    
    cardEstatistica: ({ id, texto, icone }) => `
        <div id="grafico${id}" class="f w-20 hr-5 borda-e5e7eb borda-radius-12px padding-105 pointer" style="">
            <div class="f w-90 hr-2 font-inter cor-6b7280"> ${texto} </div>
            <div class="f w-10 hr-2 font-102 df-c-c bg-f3f4f6 borda-radius"> ${icone} </div>
            <div id="quantidade${id}" class="f w-90 hr-2 mt-1 font-105 font-inter font-weight-700"> ? </div>
        </div>
    `,
    
    input: ({ id, largura, placeholder, margemLeft, alinhamento, corFundo, corTexto, corPlaceholder  }) => `
        <input id="${id}" type="text" placeholder="${placeholder}" class="f placeholder-${corPlaceholder} w-${largura} texto-${alinhamento} pl-1 hr-2 borda-radius borda-e5e7eb outline-none bg-${corFundo} cor-${corTexto}"> 
    `,
    
    conteudo: ({ id, altura, corFundo, corTexto }) => `
        <div id="${id}" class="f w-100 h-${altura} bg-${corFundo} cor-${corTexto} scroll-y"> </div>
    `,
    
    filtroInput: ({ id, label, placeholder = '', margemLeft, margemTop = 0, largura = 15, alinhamentoTexto = 'centralizado', paddingEsquerda = 0, corTexto }) => `
        <div class="f w-${largura} ml-${margemLeft} mt-${margemTop}">
            <div class="f w-100 hr-2 cor-${corTexto}">${label}</div>
            <input id="filtro${id}" type="text" placeholder="${placeholder}" class="f w-99 pl-1 hr-2 borda-radius borda-e5e7eb texto-${alinhamentoTexto} outline-none"> 
        </div>
    `,
    
    filtroData: ({ id, label, margemLeft }) => `
        <div class="f w-15 ml-${margemLeft} ">
            <div class="f w-100 hr-2">${label}</div>
            <input id="filtro${id}" type="date"  class="f w-100 hr-2 borda-radius borda-e5e7eb texto-centralizado outline-none">
        </div>
    `,
    
    filtroMultiplo: ({ id, label, margemLeft }) => `
        <div class="f w-15 ml-${margemLeft}">
            <div class="f w-100 hr-2">${label}</div>
            <div id="filtroMultiplo${id}Card" class="f w-100 hr-2 borda-radius borda-e5e7eb texto-centralizado"></div>
        </div>
    `,
    
    botao: ({ id, texto, corFundo, corTexto, altura, largura = 15 , margemRight, borda = 'e5e7eb', tamanhoTexto = 1, margemBottom, alinhamento }) => `
        <div id = '${id}' class="fr w-${largura} mr-${margemRight} mb-${margemBottom} hr-2 borda-radius texto-centralizado df-c-c bg-${corFundo} texto-${alinhamento} pointer cor-${corTexto} borda-${borda} font-${tamanhoTexto}">
            ${texto}
        </div>
    `,
    
    tabela: ({ colunas, corFundo = 'f9fafb' }) => `
        ${criarColunasTabela(colunas, corFundo)}
        ${criarCartaoRegistros({ altura: 30 })}
    `,
    
    legendaValor: ({ id, legenda, valor = '', corFundoLegenda = 'gray', corFundoValor = 'f3f3f3' }) => `
        <div class="f hr-2 w-100 mt-02"> 
            <div class="f df-c-c w-19 ml-1 h-100 bg-${corFundoLegenda} cor-white">
                ${legenda}
            </div>
            <input 
                id="${id}" 
                class="f df-c-e w-78 pl-1 h-100 bg-${corFundoValor} borda-none" 
                value="${valor}"> </div>
    `,
        
    menuSuperior: ({ displayFlex, corFundo, corTexto, altura = 10 }) => `
        <div id = 'menuSuperior' class = 'f w-100  ${displayFlex} bg-${corFundo} cor-${corTexto} h-${altura}'>
    `,
    
    menuInferior: ({ corFundo, corTexto, altura = 10 }) => `
        <div id = 'menuInferior' class = 'f w-100 h-${altura} df-c-c 1 bg-${corFundo} cor-${corTexto}'>
    `,
    
    icone: ({ id, icone, nome, corTexto, negrito, largura = 25 }) => `
        <div id = 'icone${id}' class = 'f w-${largura} h-80 pointer cor-${corTexto} font-arial df2-c-c'> 
            <div id = 'icon${id}' class = 'f w-100 h-60 df-c-c font-102'> ${icone} </div>
            <div class = 'f w-100 h-40 df-c-c font-09'> ${nome} </div>
        </div>
    `,
    
    linha: ({ corFundo, altura = '03' }) => `
        <div class = 'f w-100 h-${altura} bg-${corFundo}'>  </div>
    `,
    
    textarea: ({ id, altura = 20, largura = 90, borda, margemLeft, margemTop }) => `
        <textarea id='${id}' class='f w-${largura} h-${altura} borda-${borda} mt-${margemTop} ml-${margemLeft} borda-radius'></textarea>
    `,
    
    filtroTextArea: ({ id, label, placeholder = '', margemLeft, margemTop = 0, largura = 15, altura = 10, corTexto }) => `
        <div class="f w-${largura} ml-${margemLeft} mt-${margemTop}">
            <div class="f w-100 hr-2 cor-${corTexto}">${label}</div>
            <textarea id="filtro${id}" placeholder="${placeholder}" class="f w-99 pl-1 hr-${altura} borda-radius borda-e5e7eb outline-none font-09"></textarea> 
        </div>
    `,

    filtroSelect: ({ id, label, lista = [], valorPadrao = '', margemLeft, margemTop = 0, largura = 15, corTexto }) => {
        const options = lista.map(item => {
            const valor = typeof item === 'object' ? item.valor : item;
            const texto = typeof item === 'object' ? item.texto : item;
            const selecionado = valor == valorPadrao ? 'selected' : '';
            return `<option value="${valor}" ${selecionado}>${texto}</option>`;
        }).join('');

        return `
            <div class="f w-${largura} ml-${margemLeft} mt-${margemTop}">
                <div class="f w-100 hr-2 cor-${corTexto}">${label}</div>
                <select id="filtro${id}" class="f w-99 hr-2 borda-radius borda-e5e7eb outline-none bg-white font-09">
                    ${options}
                </select>
            </div>
        `;
    },
    
    checkbox: ({ id, texto, margemLeft, margemTop }) => `
        <div class='f w-98 ml-1 df-c-e mt-05'>
            <input type='checkbox' id='${id}' class='cursor-pointer'>
            <label for='${id}' class='cursor-pointer ml-1 pointer'>
                ${texto}
            </label>
        </div>
    `,
    
    checkboxDigitavel: ({ id, texto, margemLeft, margemTop, placeholder = '' }) => `
        <div class='f w-98 ml-1 df-c-e mt-05'>
            <input type='checkbox' id='${id}' class='cursor-pointer'>
            <label for='${id}' class='cursor-pointer ml-1 pointer'>
                ${texto}
            </label>
            <input class = 'f w-20 hr-2 borda-radius borda-gray' placeholder = '${placeholder}' id = '${id}Digitado' > </input>
        </div>
    `,
    
    inputDigitavel: ({ id, texto, margemLeft, margemTop, placeholder = '' }) => `
        <div class='f w-98 ml-1 df-c-e mt-05'>
            <label for='${id}' class='cursor-pointer pointer'>
                ${texto}
            </label>
            <input class = 'f w-20 hr-2 borda-radius borda-gray' placeholder = '${placeholder}' id = '${id}'> </input>
        </div>
    `,
    
    texto: ({ texto, margemLeft = 0, margemTop = 0 }) => `
        <div class='f w-98 ml-1 df-c-e mt-05'> ${texto} </div>
    `,
}

async function api_database(parametros = {}, tentativa = 1) {
    // Garante que a URL global seja absoluta
    if (!/^https?:\/\//i.test(link_api_database)) {
        link_api_database = new URL(link_api_database, window.location.origin).href;
    }

    try {
        const resposta = await fetch(link_api_database, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify(parametros)
        });

        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const dados = await resposta.json();
        if (dados?.debug) console.log(dados.debug);
        
        return dados;

    } catch (erro) {
        if (tentativa === 1) {
            return await api_database(parametros, 2);
        }

        // Se falhar a segunda tentativa
        console.error("Erro Crítico na API:", erro.message, link_api_database);
        
        if (window.loading_final) loading_final();
        
        alert("Erro na conexão. Se persistir, contate: coordenadoriadeaquisicoes2025@gmail.com");
        throw erro;
    }
}