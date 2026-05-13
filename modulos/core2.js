let linksDesbloqueados = [];

function exibir_no_log(mensagem){
    console.log(mensagem)
}

function diferenca_entre_datas(dataInicial, dataFinal) {
  // Converte ambas para objetos Date
  const d1 = new Date(dataInicial);
  const d2 = new Date(dataFinal);

  // Calcula a diferença absoluta em milissegundos
  const diferencaMs = Math.abs(d2 - d1);

  // Converte milissegundos para dias
  // (1000ms * 60s * 60m * 24h)
  const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));

  return dias;
}

async function desbloquearLink(url) {
    // 1. Verifica se o link já está na lista de desbloqueados
    if (linksDesbloqueados.includes(url)) {
        return;
    }

    // 2. Verifica se estamos no domínio correto
    if (!window.location.href.includes("jeyoredfield.online")) return;

    await new Promise((resolve) => {
        // Cria o iframe invisível
        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, {
            display: "none",
            width: "0",
            height: "0",
            border: "none"
        });
        iframe.src = url;

        document.body.appendChild(iframe);

        // 3. Tempo de espera de 2,5 segundos (2500ms)
        setTimeout(() => {
            document.body.removeChild(iframe);
            
            // 4. Adiciona à lista para não repetir
            linksDesbloqueados.push(url);
            
            resolve();
        }, 2500); 
    });
}

async function desbloquearDatabase() {
    if (!window.location.href.includes("jeyoredfield.online")) return;

    const links = [
        "https://jeyoredfield.online/licitacoes/api/index.php",
        "https://jeyoredfield.online/licitacoes/modulos/sql.php",
        "https://jeyoredfield.online/licitacoes/modulos/database.php",
        "https://jeyoredfield.online/licitacoes/modulos/database2.php",
        "https://jeyoredfield.online/musicas/api/index.php",
        "https://jeyoredfield.online/recursos/api/index.php",
        'https://jeyoredfield.online/gipe/api/index.php',
    ];

    for (const url of links) {
        await new Promise((resolve) => {
            // Cria um elemento iframe invisível
            const iframe = document.createElement('iframe');
            iframe.style.display = "none";
            iframe.style.width = "0";
            iframe.style.height = "0";
            iframe.style.border = "none";
            iframe.src = url;

            // Adiciona ao corpo da página para iniciar o carregamento
            document.body.appendChild(iframe);

            // Aguarda 3 segundos para o Firewall processar e remove o iframe
            setTimeout(() => {
                document.body.removeChild(iframe);
                console.log(`✓ Link Desbloqueado: ${url}`);
                resolve();
            }, 3000); 
        });
    }
}

async function checarVersaoSistema() {
    if(linkVersaoSistema){
        try {
            // Número aleatório (t) para evitar que o navegador use o cache
            const response = await fetch(`${linkVersaoSistema}?t=${Date.now()}`);
            const dados = await response.json();

            if (versaoSistema !== '' && versaoSistema !== dados.versao) {
                alert('Nova atualização detectada, o sistema será recarregado !');
                window.location.reload();
            } else {
                versaoSistema = dados.versao;
            }
        } catch (e) {
            console.warn("Checagem de versão falhou: Servidor ocupado ou arquivo ausente.");
        }   
    }
}

function get_classes(id){
    return document.getElementById(id).className
}

function existeElemento(id) {
    return document.getElementById(id) !== null;
}

function definirValorFilterSelect(id, valores) {
    const container = document.getElementById(id);
    if (!container) {
        console.error(`❌ Elemento "${id}" não encontrado.`);
        return;
    }

    // Garante que valores seja um array
    const listaValores = Array.isArray(valores) ? valores : [valores];

    // 1. Tenta usar o método exposto pelo componente (Ideal para re-renderizar a UI)
    if (typeof container.setValor === 'function') {
        container.setValor(listaValores);
        return;
    }

    // 2. Fallback: Atualiza o dataset para que o obterValor consiga ler depois
    container.dataset.valor = JSON.stringify(listaValores);

    // 3. Disparar evento de mudança (Opcional, mas recomendado para sincronizar filtros)
    const evento = new CustomEvent('change', { 
        detail: { valores: listaValores },
        bubbles: true 
    });
    container.dispatchEvent(evento);

    console.warn(`⚠️ filter_select "${id}" atualizado apenas via dataset. A UI pode não ter refletido a mudança visual.`);
}

function ordenarCrescente(lista) {
    return lista.sort((a, b) => a - b);
}

function copiarTexto(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    // Tenta usar a API moderna se for contexto seguro
    return navigator.clipboard.writeText(texto);
  } else {
    // Fallback para HTTP (Intranet sem SSL)
    let textArea = document.createElement("textarea");
    textArea.value = texto;
    
    // Garante que o elemento não seja visível mas esteja no DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Copiado via execCommand');
    } catch (err) {
      console.error('Erro ao copiar', err);
    }
    
    document.body.removeChild(textArea);
  }
}

function campoSomenteNumeros(id){
    document.getElementById(id).addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '')
    })
}

function numerar(nome,comeco,final,finalizado){
    let resultado_final = ''
    let fim = final + 1
    for(let inicio = comeco; inicio < fim; inicio++){
        resultado_final += `${nome} ${inicio} ${finalizado}\n`
    }
    console.log(resultado_final) 
}

let historicoIA = [] ;

async function chamarIA(mensagem) {
    // 1. Adicionamos a fala do usuário ao array
    await loading_comeco()
    
    base = historicoIA.join(';')

    // 2. Enviamos o ARRAY para sua API
    let respostaIA = await apiDatabase({
        fluxo: 'ia',
        base: base,
        mensagem: mensagem // Enviando a lista completa
    });

    loading_final()
    // 3. Adicionamos a resposta que a IA deu ao histórico
    // Assim, na próxima pergunta, ela lembrará o que respondeu agora
    historicoIA.push( mensagem );
    historicoIA.push( respostaIA.resposta );

    return respostaIA ;
}

function arredondarParaCima(valor) {
    // Math.ceil faz exatamente o que você pediu:
    // 1 vira 1
    // 0.75 vira 1
    // 1.01 vira 2
    return Math.ceil(valor);
}

function arredondarCasasDecimais(valor, casas) {
    // Se o valor já for inteiro ou tiver menos casas que o limite, 
    // o Number() + toFixed() vai tratar de manter o formato original.
    return Number(Math.round(valor + "e" + casas) + "e-" + casas);
}

function criptografar(textoPuro, chave){
    try {
        // 1. Ajuste da chave para 16 bytes (AES-128 padrão PHP)
        let chaveCorrigida = chave;
        while (chaveCorrigida.length < 16) {
            chaveCorrigida += '\0'; 
        }
        if (chaveCorrigida.length > 16) {
            chaveCorrigida = chaveCorrigida.substring(0, 16);
        }

        key = CryptoJS.enc.Utf8.parse(chaveCorrigida);
        const msg = CryptoJS.enc.Utf8.parse(textoPuro);

        // 2. Executa a criptografia
        const criptografado = CryptoJS.AES.encrypt(msg, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        // 3. Retorna em Base64 (que é o que o banco e o PHP esperam)
        return criptografado.toString();
    } catch (e) {
        console.error("Erro ao criptografar:", e);
        return null;
    }
}

function descriptografar(textoCriptografado, chave){
    try {
        // O PHP preenche chaves curtas com caracteres nulos (\0) até chegar em 16, 24 ou 32 bytes
        // Vamos garantir que a chave tenha 16 bytes para o AES-128
        let chaveCorrigida = chave;
        while (chaveCorrigida.length < 16) {
            chaveCorrigida += '\0'; 
        }
        if (chaveCorrigida.length > 16) {
            chaveCorrigida = chaveCorrigida.substring(0, 16);
        }

        key = CryptoJS.enc.Utf8.parse(chaveCorrigida);

        const decifrado = CryptoJS.AES.decrypt(textoCriptografado, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });

        const resultado = decifrado.toString(CryptoJS.enc.Utf8);
        return resultado || null;
    } catch (e) {
        return null;
    }
}

function criarConteudo(){
    remover_elemento('conteudo')
    
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-100',
        destino: ['body']
    })
}


function debounce(fn, delay = 800) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

function pesquisaDebounce(id, fn, delay = 800, min = 2) {
    const el = document.getElementById(`${id}`)
    if (!el) return

    el.addEventListener(
        'keyup',
        debounce(e => {
            const valor = e.target.value.trim()
            if (valor && valor.length < min) return
            fn(valor, e)
        }, delay)
    )
}

let linkSistema = ''
let linkHospedagem = ''
let linkDatabase = ''
let linkPDF = ''
let linkGmail = ''
let linkGoogleSheets = ''
let linkVersaoSistema = ''

let versaoSistema = ''

function jsonParaString(json){
    return JSON.stringify(json)
}

async function planilha_google(funcao,id, aba,dados,linha) {
    console.log(funcao,id, aba,dados,linha)    
    console.log(linkGoogleSheets)
 var response = await fetch( linkGoogleSheets , {
   method: "POST",
   headers: { "Content-Type": "application/json" },
   body: JSON.stringify({funcao, id, aba, dados,linha})
 })
 if(response.status !== 200){
  throw new Error(erro(response.status))
 }
 if(response.status == 200){
  return response.json()
 }
}

async function database(tipo, sql) {
    const url = `${linkSistema}/modulos/database2.php`

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",  // Diz ao servidor que está enviando JSON
            "Accept": "application/json"
            // Remova "User-Agent" daqui, pois o navegador já adiciona automaticamente
        },
        body: JSON.stringify({ tipo, sql }) // Envia os dados no corpo da requisição
    });

    if (!response.ok) {
        alert('Ocorreu um erro no Banco de Dados !')
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const dados = await response.json();
    return dados;
}


function redirecionarSite(url){
    window.location.href = url
}

// Função Legado
function elem(tipo, identificador, texto, destino, css) {
    document.getElementsByTagName("body")[0].style.margin = 0;

    var elemento = document.createElement(`${tipo}`);

    // Adiciona atributo se identificador existir
    if (identificador.length >= 2) {
        elemento.setAttribute(`${identificador[0]}`, `${identificador[1]}`);
    }

    // Se for option, o texto deve ser adicionado como innerText
    if (tipo === 'option') {
        elemento.innerText = texto;
    } else {
        elemento.innerHTML = texto;
    }

    // Ajustes específicos para input
    if (tipo === 'input') {
        elemento.placeholder = texto;
        elemento.value = texto;

        const idLower = identificador[1].toLowerCase();

        if (idLower.includes('senha')) {
            elemento.setAttribute("type", "password");
        } else if (idLower.includes('file')) {
            elemento.setAttribute("type", "file");
        } else if (idLower.includes('data')) {
            elemento.setAttribute("type", "date");
            elemento.value = "";  // opcional: para não mostrar a data como texto
        } else {
            elemento.setAttribute("type", "text");
        }
    }

    // Ajuste para checkbox
    if (identificador[2] === 'checkbox') {
        elemento.setAttribute("type", "checkbox");
    }

    // Ajuste para input tipo file
    if (identificador[1] === 'file') {
        elemento.setAttribute("type", "file");
    }

    // Aplica classe se fornecido
    if (css) {
        elemento.className = css;
    }

    // Inserção no destino
    if (tipo === 'option') {
        // Para <option>, destino[0] é o ID do select
        document.getElementById(destino[0]).appendChild(elemento);
    } else if (destino[0] === 'body') {
        document.getElementsByTagName("body")[0].appendChild(elemento);
    } else {
        if (destino.length === 1) {
            document.getElementById(`${destino[0]}`).appendChild(elemento);
        } else if (destino.length === 2) {
            document.getElementsByClassName(`${destino[0]}`)[destino[1]].appendChild(elemento);
        }
    }
}

async function apiDatabase(parametros = {}, tentativa = 1) {
    // Garante que a URL seja absoluta
    if (!/^https?:\/\//i.test(linkDatabase)) {
        linkDatabase = new URL(linkDatabase, window.location.origin).href;
    }

    try {
        const response = await fetch(linkDatabase, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(parametros)
        });

        // Se a resposta não for bem-sucedida (400, 500, 409, etc)
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const dados = await response.json();
        if (dados?.debug) console.log(dados.debug);

        return dados;

    } catch (erro) {
        // ---- LÓGICA DE RETENTATIVA COM DESBLOQUEIO ----
        if (tentativa === 1) {
            console.warn(`⚠️ Erro na 1ª tentativa. Iniciando desbloqueio: ${linkDatabase}`);
            
            // Chama a função de desbloqueio (com o tempo de 2.5s que você pediu)
            await desbloquearLink(linkDatabase);
            
            // Tenta novamente incrementando o contador de tentativa
            return await apiDatabase(parametros, 2);
        }

        // ---- SE CHEGOU AQUI, É A 2ª TENTATIVA E FALHOU ----
        console.group("🚨 Erro Crítico na API (2ª Tentativa)");
        console.error("Mensagem:", erro.message);
        console.log("URL:", linkDatabase);
        console.groupEnd();

        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.remove();

        // ALERTA FINAL PARA O USUÁRIO
        alert("Houve um erro, caso persista, entre em contato com o suporte pelo email coordenadoriadeaquisicoes2025@gmail.com");

        if (typeof loading_final === "function") loading_final();

        throw erro;
    }
}

async function apiPDF(dados, link_novo = false) {
    let link = linkPDF
    if(link_novo){
        link = link_novo
    }
    
    try {
        const resposta = await fetch(link, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            console.error("Erro ao gerar PDF:", resposta.status);
            return;
        }

        const blob = await resposta.blob();
        const urlBlob = URL.createObjectURL(blob);

        // Abre em uma nova aba
        window.open(urlBlob, "_blank");

        // Opcional: revogar URL depois de alguns segundos
        setTimeout(() => URL.revokeObjectURL(urlBlob), 10000);

    } catch (e) {
        console.error("Erro ao chamar a API de PDF:", e);
    }
}

async function apiGmail(parametros = {}) {
    try {
        const resposta = await fetch(linkGmail, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(parametros)
        });

        if (!resposta.ok) {
            console.error("Erro ao enviar e-mail:", resposta.status);
            return null;
        }

        return await resposta.json(); // Espera que o PHP retorne JSON
    } 
    catch (erro) {
        console.error("Falha ao chamar apiGmail:", erro);
        return null;
    }
}

async function apiGoogleSheets({
  funcao,
  id,
  aba,
  dados = '',
  linha = ''
}) {
  const payload = { funcao, id, aba }

  // só inclui se existir
  if (dados !== null) payload.dados = dados
  if (linha !== null) payload.linha = linha

  const response = await fetch(linkGoogleSheets, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

// ========================================================================
// Interface (refatorado com UIComponents)
// ========================================================================

paginaAtual = ''
Paginas = {}

async function carregarPagina(nome, registrarHistorico = false) {
    
    largura = 85
    if (typeof window.conteudoLargura !== 'undefined') {
        largura = conteudoLargura;
    }

    const cfg = Paginas[nome]
    if (!cfg) return
    
    let executar = async() => {
        paginaAtual = nome
        
        let destinoHTML = cfg.destino || 'conteudo'

        if(destinoHTML == 'conteudo'){
            limparConteudo({ largura, altura: 90 })
        }
        if(destinoHTML == 'janela'){
            criar_janela()
        }
        
        atualizarValor({ id: "pagina_selecionada", valor: cfg.titulo })
        
        if(cfg.pagina){
            await cfg.pagina()
        }
        
        if(cfg.ui){
            if (typeof cfg.ui === "function") {
                lista = cfg.ui();  
            } else {
                lista = cfg.ui;
            }
            
            renderizarUI(lista, destinoHTML)
        }
        
        if(cfg.atualizarFiltros){
            await cfg.atualizarFiltros()
        }
        
        if(cfg.eventos){
            await cfg.eventos()
        }
        
        // Cada sistema implementa
        if(cfg.carregarRegistros){
            await cfg.carregarRegistros()
        }
        
        if(cfg.atualizarEstatisticas){
            await cfg.atualizarEstatisticas()
        }
    }
    
    if(registrarHistorico){
        historico_adicionar_pagina(executar)
        historico_pagina_atual()
    } else {
        await executar()
    }
}

function limparConteudo(config){
    let {
        altura = 100,
        largura = 100,
        destino = 'janela'
    } = config 
    
    // remover_elemento precisa existir no seu ambiente; mant�m comportamento anterior
    if (typeof remover_elemento === 'function') remover_elemento('conteudo')
    
    if (typeof criar_elemento === 'function') {
        criar_elemento({
            id: 'conteudo',
            tipo: 'div',
            classes: `f w-${largura} h-${altura} scroll-y`,
            destino: [`${destino}`]
        })
    } else {
        // fallback: cria diretamente no DOM
        const existing = document.getElementById('conteudo');
        if (existing) existing.remove();
        const cont = document.createElement('div');
        cont.id = 'conteudo';
        cont.className = `f w-${largura} h-${altura} scroll-y`;
        const parent = document.getElementById(destino) || document.body;
        parent.appendChild(cont);
    }
}

function adicionarHTML(html, destino = 'body' ) {
    if(destino == 'body'){
        document.body.innerHTML = html
    }
    if(destino != 'body'){
        document.getElementById(destino).insertAdjacentHTML('beforeend', html)
    }
}

function inserirHTML(html, destino = 'conteudo') {
    let el;

    // 1. Verifica se o destino é o body
    if (destino === 'body') {
        el = document.body;
    } else {
        // 2. Se não for body, busca pelo ID
        el = document.getElementById(destino);
    }

    // 3. Verifica se o elemento foi encontrado antes de tentar inserir
    if (el) {
        el.insertAdjacentHTML('beforeend', html);
    }
}

function renderizarUI(lista, destino = 'conteudo' ) {
    const html = lista.map(item => gerarHTML(item)).join('');
    inserirHTML(html, destino);
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

function criarCartaoRegistros(config) {
    const {
        id = 'registros',
        altura = 35,
    } = config;

    return `
        <div id="${id}" class="f w-100 hr-${altura} scroll-y">
        </div>
    `;
}

function criarLinhaTabela(config = {}) {
    let {
        destino = 'registros',
        corFundo = 'white',
        colunas = []
    } = config;

    const container = document.getElementById(destino);
    if (!container) return;

    const linha = document.createElement("div");
    linha.className = `f w-100 df-c-c bg-${corFundo} mt-02 pt-05 ai-center register border-bottom-e5e7eb font-inter`;

    colunas.forEach(col => {
        const coluna = document.createElement("div");
        coluna.className = "f w-20 texto-centralizado font-07 df-c-c gap-05";
        
        // --- LÓGICA PARA INPUT ---
        if (col.input) {
            const input = document.createElement("input");
            input.type = col.input.type || "text";
            input.value = col.input.valor ?? "";
            input.className = "input-tabela"; 
            
            input.style.width = "90%";
            input.style.height = "2rem";
            input.style.fontSize = "inherit";

            if (col.input.onChange) {
                input.onchange = (e) => col.input.onChange(e.target.value);
            }
            
            if (col.input.onKeyUp) {
                input.onkeyup = (e) => col.input.onKeyUp(e);
            }
            
            coluna.appendChild(input);
        } 
        // --- LÓGICA PARA DATALIST (INPUT + SELECT) ---
        else if (col.datalist) {
            const listId = `list-${Math.random().toString(36).substr(2, 9)}`;
            
            // Cria o input que receberá a lista
            const input = document.createElement("input");
            input.setAttribute("list", listId);
            input.value = col.datalist.valor ?? "";
            input.className = "input-tabela"; 
            input.style.width = "90%";
            input.style.height = "2rem";
            input.placeholder = col.datalist.placeholder || "Selecione...";

            // Cria o elemento datalist
            const dl = document.createElement("datalist");
            dl.id = listId;

            // Adiciona as opções
            if (Array.isArray(col.datalist.opcoes)) {
                col.datalist.opcoes.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    dl.appendChild(option);
                });
            }

            // Evento de mudança
            if (col.datalist.onChange) {
                input.onchange = (e) => col.datalist.onChange(e.target.value);
            }

            // Evento disparado ao digitar OU selecionar da lista
            input.oninput = (e) => {
                const valorAtual = e.target.value;
                
                // Atualiza o valor interno para persistência, se necessário
                col.datalist.valor = valorAtual; 

                // Chama o callback se ele existir
                if (col.datalist.onChange) {
                    col.datalist.onChange(valorAtual);
                }
                
                if (col.datalist.onKeyUp) {
                    col.datalist.onKeyUp(e); 
                }
            };

            // Opcional: manter o onblur (foco saindo) para garantir a captura final
            input.onblur = (e) => {
                if (col.datalist.onBlur) {
                    col.datalist.onBlur(e.target.value);
                }
            };

            input.onkeydown = (event) => {
                const tecla = event.key;
                if (tecla === 'Enter' || tecla === 'ArrowDown') {
                    // Evita o comportamento padrão do Enter se necessário
                    if(tecla === 'Enter') event.preventDefault(); 
                    proximo_input(event);
                } else if (tecla === 'ArrowUp') {
                    event.preventDefault(); // Evita que o cursor vá para o início do texto
                    input_anterior(event);
                }
            };

            coluna.appendChild(input);
            coluna.appendChild(dl);
        }
        
        // --- AGORA USANDO ELSE IF PARA NÃO SOBRESCREVER ---
        else if (Array.isArray(col.subitens)) {
            const wrap = document.createElement("div");
            wrap.className = "df gap-05";
            col.subitens.forEach(item => {
                const sub = document.createElement("div");
                sub.className = "col-sub inline-item w-30";
                sub.textContent = item.texto ?? "";
                if (item.onClick) { sub.style.cursor = "pointer"; sub.onclick = item.onClick; }
                wrap.appendChild(sub);
            });
            coluna.appendChild(wrap);
        } else if (Array.isArray(col.valores)) {
            const wrap = document.createElement("div");
            wrap.className = "df gap-05";
            col.valores.forEach(v => {
                const sub = document.createElement("div");
                sub.className = "col-sub inline-item w-30";
                sub.textContent = v ?? "";
                wrap.appendChild(sub);
            });
            coluna.appendChild(wrap);
        } else {
            coluna.textContent = col.valor ?? "";
        }

        if (col.onClick) {
            coluna.style.cursor = "pointer";
            coluna.onclick = col.onClick;
            coluna.classList.add("font-weight-600");
        }

        linha.appendChild(coluna);
    });

    container.appendChild(linha);
}

function criarColunasTabela(titulos, corFundo) {
    return `
        <div class="f w-100 hr-2 bg-${corFundo} mt-1 cor-6b7280 df-c-c font-weight-600 pt-05 texto-centralizado scroll-y">
            ${ titulos.map(t => `<div class="f w-20">${t}</div>`).join('') }
        </div>
    `;
}

function criarBotao(config) {
    let { 
        id, 
        texto, 
        corFundo, 
        corTexto = 'white',
        largura = 15,
        alinhamento = 'l'
    } = config;
    
    return `
        <div id="${id}" class="f${alinhamento} bg-${corFundo} cor-${corTexto} w-${largura} hr-2 df-c-c borda-radius pointer">
            ${texto}
        </div>
    `
}

function criarFiltro(config) {
    let {
        id,
        label,
        tipo = 'text',
        placeholder = ''
    } = config;

    if (tipo === 'div') {
        return `
            <div class="f w-100">
                <div class="f w-100 hr-2">${label}</div>
                <div id="${id}" class="f w-100 hr-2 borda-radius borda-e5e7eb texto-centralizado"></div>
            </div>
        `;
    }

    return `
        <div class="f w-100">
            <div class="f w-100 hr-2">${label}</div>
            <input id="${id}" type="${tipo}" placeholder="${placeholder}" class="f w-100 hr-2 borda-radius borda-e5e7eb texto-centralizado outline-none">
        </div>
    `
}

function criarCartaoEstatisticas(config) {
    let {
        id, 
        titulo, 
        icone    
    } = config
    
    return `
        <div id="${id}_card" class="f w-20 borda-e5e7eb borda-radius-12px padding-105 pointer font-102">
            <div class="f w-90 hr-2 cor-6b7280"> ${titulo} </div>
            <div class="f w-10 hr-2"> ${icone || ''} </div>
            <div id="${id}" class="f w-100 hr-2 mt-1 font-105 font-weight-700"> ? </div>
        </div>
    `
}

function criarLegendaValor(config) {
    let {
        id, 
        legenda, 
        valor,
        corFundoLegenda = 'gray',
        corFundoValor = 'f5f5f5'
    } = config
    
    return `
        <div class = 'f hr-2 w-100 mt-02'> 
            <div class = 'f df-c-d w-18 ml-1 pr-1 h-100 bg-${corFundoLegenda} cor-white'> ${legenda} </div>
            <div id = '${id}' class = 'f df-c-e w-78 pl-1 h-100 bg-${corFundoValor}'> ${valor} </div>
        </div>
    `
}

async function atualizarE_RecriarFiltro(config, novosValores) {
    // 1. Remove o elemento antigo do DOM para não duplicar IDs
    const antigo = document.getElementById(config.id);
    if (antigo) antigo.remove();

    // 2. Chama sua função de criação novamente com as novas opções
    // Note que passamos os novosValores como as 'opcoes'
    await criarFiltroMultiplo({
        ...config,
        opcoes: novosValores 
    });

    // 3. Define eles como selecionados
    const novoContainer = document.getElementById(config.id);
    if (novoContainer && typeof novoContainer.setValor === 'function') {
        novoContainer.setValor(novosValores);
    }
}

async function criarFiltroMultiplo(config){
    let { 
        id, 
        destino, 
        placeholder, 
        opcoes = null, 
        apiConfig = null, 
        campoId, 
        onFiltrar 
    } = config

    const destinoEl = document.getElementById(destino)
    if (!destinoEl) {
        return null
    }

    if(apiConfig){
        const registros = await apiDatabase(apiConfig.parametros)
        opcoes = extrairCampoJson(registros.dados, campoId)
    }

    criar_elemento({
        id,
        tipo: 'filter_select',
        classes: 'f df-c-c w-100 h-100',
        placeholder,
        opcoes,
        destino: [destino],
        onFiltrar
    })

    return opcoes
}

let UI = {
    
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
    
    conteudo: ({ altura, corFundo, corTexto }) => `
        <div id="conteudo" class="f w-100 h-${altura} bg-${corFundo} cor-${corTexto} scroll-y"> </div>
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


function textoDoCheckbox(valor){
    if(valor == true){
        return '(X)'
    }
    else{
        return '( )'
    }
}

function criarCartaoRegistros(config) {
    const {
        id = 'registros',
        altura = 35,
    } = config;

    return `
        <div id="${id}" class="f w-100 hr-${altura} scroll-y">
        </div>
    `;
}

// ======================================================
// Hist�rico
// ======================================================

historico = {
    paginas_anteriores: [],
    paginas_seguintes: []
}

function historico_adicionar_pagina(pagina){
    historico['paginas_anteriores'].push(pagina)
    historico['paginas_seguintes'] = []
}

function historico_pagina_atual(){
    let indice_pagina_atual = historico['paginas_anteriores'].length - 1
    let pagina_atual = historico['paginas_anteriores'][indice_pagina_atual]
    pagina_atual()
}

function historico_pagina_anterior(){
    if(historico['paginas_anteriores'].length > 1) {
        let indice_pagina_anterior = historico['paginas_anteriores'].length - 1
        let pagina_anterior = historico['paginas_anteriores'][indice_pagina_anterior]
        historico['paginas_anteriores'].pop()
        historico['paginas_seguintes'].push(pagina_anterior)
        historico_pagina_atual()
    }
}

function historico_pagina_seguinte(){
    if (historico['paginas_seguintes'].length > 0) {
        let indice_pagina_seguinte = historico['paginas_seguintes'].length - 1
        let pagina_seguinte = historico['paginas_seguintes'][indice_pagina_seguinte]
        historico['paginas_seguintes'].pop()
        historico['paginas_anteriores'].push(pagina_seguinte)
        historico_pagina_atual()
    }
}

// ======================================================
// Utilidades
// ======================================================

function hyperlink(link){
   window.open(link, "_blank");
}

function remover_elemento(id) {
    var elemento = document.getElementById(id);
    if(document.body.contains(elemento)) {
        elemento.remove()
    }
}

function criar_janela(fonte = ''){
    remover_elemento('janela')
    
    criar_elemento({
        id: 'janela',
        tipo: 'div',
        classes: `f w-100 h-100 ${fonte}`,
        destino: ['body']
    })
}

function criar_conteudo(){
    remover_elemento('conteudo')
    remover_elemento('impressao')
    
    criar_elemento({
        id: 'conteudo',
        tipo: 'div',
        classes: 'f w-100 h-90 scroll-y-invisivel',
        destino: ['janela']
    })
}

function atualizarValor(config) {
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

function extrairCampoJson(dados, campo) {
    return dados.map(d => d[campo]).filter(Boolean)
}

function definirEventoClickEsquerdo(id, callback) {
    const el = document.getElementById(id);
    if (!el) return false;

    el.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // esquerdo
            callback(event);
        }
    });

    return true;
}

function definirClickHistorico(config){
    let {
        id, 
        pagina, 
        atributo,
        filtro = ''
    } = config
    
    definirEventoClickEsquerdo(id, async () => {
        historico_adicionar_pagina(async () => {
            await pagina()
            await paginacao_filtro_unico(atributo, filtro)
        });
        historico_pagina_atual();
    });
}

function criar_elemento(config) {
    
    const {
        id,
        tipo,
        categoria, // Input ( Data )
        classes,
        texto,
        valor,
        placeholder,
        opcoes,
        opcao, // Ficando Obsoleto
        somente_leitura,
        imagem,
        destino,
        onClick,
        onClickEsquerdo,
        onClickDireito,
        onChange,
        onKeyUp,
        onKeyDown,
        onEnter,
        onFiltro,
        onScroll,
        onBlur,
        onMouseEnter,
        onMouseLeave,
        legenda,
        hover,
        hover_fundo,
        hover_cor,
        hover_borda,
        svg,
        autocomplete
    } = config;

    
    // Tipo
    var elemento = document.createElement(`${tipo}`);
    
    if (autocomplete) {
        // Se a config for true, "on" ou "off", aplica o valor.
        // Se a config for explicitamente 'off' ou 'false', desativa.
        if (autocomplete === 'off' || autocomplete === false) {
            elemento.setAttribute('autocomplete', 'off');
        } else {
            // Permite que o usuário defina valores como "name", "email", ou simplesmente "on"
            elemento.setAttribute('autocomplete', autocomplete);
        }
    }
    

    if (legenda) {
        if(legenda[0] != ''){
            elemento.setAttribute("data-tooltip", legenda[0]);
            elemento.setAttribute("data-pos", legenda[1]);   
        }
    }
    
    if (tipo === 'filter_select') {
        criar_filter_select(config);
        return;
    }
    
    if (tipo === 'filter_select_unico') {
        criar_filter_select_unico(config);
        return
    }
    
    if (tipo === 'input' && categoria) {
        elemento.setAttribute("type", categoria);
    }
    

    
    if(opcao != undefined){
        elemento.innerText = opcao
    }
    
    if (somente_leitura != undefined && somente_leitura === true) {
        elemento.readOnly = true; 
    }
    
    if (opcoes != undefined) {
        for (let c1 = 0; c1 < opcoes.length; c1++) {
            const o = document.createElement('option');
            o.value = opcoes[c1];
            o.innerText = opcoes[c1];
    
            // Classe para estilizar as opções individualmente
            o.classList.add('bg-white');
            o.classList.add('cor-black');
    
            elemento.appendChild(o);
        }
    }
    
    if (valor != undefined && valor !== '') {
        elemento.value = valor;
    }
    
    if (hover) {
        let corOriginal = elemento.style.backgroundColor;
        elemento.addEventListener("mouseenter", e => {
            corOriginal = e.target.style.backgroundColor; // salva a cor atual
            e.target.style.backgroundColor = hover;
        });
        elemento.addEventListener("mouseleave", e => {
            e.target.style.backgroundColor = corOriginal;
        });
    }
    
    if (hover_fundo) {
        let corOriginalFundo = elemento.style.backgroundColor;
    
        // Evento mouseenter: muda a cor de fundo
        elemento.addEventListener("mouseenter", e => {
            corOriginalFundo = e.target.style.backgroundColor; // salva a cor de fundo atual
            e.target.style.backgroundColor = hover_fundo; // aplica a nova cor de fundo
        });
    
        // Evento mouseleave: restaura a cor original de fundo
        elemento.addEventListener("mouseleave", e => {
            e.target.style.backgroundColor = corOriginalFundo;
        });
    }
    
    if (hover_borda) {
        elemento.addEventListener("mouseenter", e => {
            const target = e.target;
            target.style.border = `1px solid ${hover_borda}`;
            target.style.boxShadow = `0 4px 12px ${hover_borda}`;
        });
    
        elemento.addEventListener("mouseleave", e => {
            const target = e.target;
            target.style.border = '';
            target.style.boxShadow = '';
        });
    }

    
    if (hover_cor) {
        let corOriginalFonte = elemento.style.color;
    
        // Evento mouseenter: muda a cor da fonte
        elemento.addEventListener("mouseenter", e => {
            corOriginalFonte = e.target.style.color; // salva a cor da fonte atual
            e.target.style.color = hover_cor; // aplica a nova cor da fonte
        });
    
        // Evento mouseleave: restaura a cor original da fonte
        elemento.addEventListener("mouseleave", e => {
            e.target.style.color = corOriginalFonte;
        });
    }

    
    // ID
    if(id != undefined && id != ''){
        elemento.setAttribute("id", id);
    }
    
    // CSS
    if (classes != undefined && classes != '') {
        elemento.className = classes;
    }

    
    // Texto
    if(texto != undefined && texto != ''){
        if (tipo == 'option') {
            elemento.innerText = texto;
        } 
        if (tipo != 'option') {
            elemento.innerHTML = texto;
        }
    }
    
    if (Array.isArray(imagem) && imagem.length === 2) {
        elemento.style.background = `url("${imagem[0]}.${imagem[1]}?v=${Date.now()}")`;
        elemento.style.backgroundSize = '100% 100%';
        elemento.style.backgroundRepeat = 'no-repeat';
    }
    
// --- SVG inline (novo atributo) ---
if (config.svg) {
    const url = `${config.svg}?v=${Date.now()}`;
    
    fetch(url, { mode: 'cors' })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.text();
        })
        .then(svgText => {
            // Limpa width/height para CSS controlar
            svgText = svgText.replace(/(<svg\b[^>]*?)\s*(width|height)\s*=\s*"[^"]*"/gi, '$1');
            
            // Faz fill herdar cor do elemento pai
            svgText = svgText.replace(/\sfill\s*=\s*"(?!none)[^"]*"/gi, ' fill="currentColor"');
            svgText = svgText.replace(/\sfill\s*=\s*'(?!none)[^']*'/gi, " fill='currentColor'");

            elemento.innerHTML = svgText;

            // Ajusta estilos do container
            elemento.style.display = 'inline-block';
            elemento.style.lineHeight = 0;
            elemento.style.width = elemento.style.width || '24px';
            elemento.style.height = elemento.style.height || '24px';

            const svgEl = elemento.querySelector('svg');
            if (svgEl) {
                svgEl.removeAttribute('width');
                svgEl.removeAttribute('height');
                svgEl.style.width = '100%';
                svgEl.style.height = '100%';
                svgEl.style.display = 'block';
            }
        })
        .catch(err => {
            console.error('Erro ao carregar SVG:', err);
            elemento.innerText = '[Erro SVG]';
        });
}

    
    if (Array.isArray(imagem) && imagem.length === 2) {
        const url = `${imagem[0]}.${imagem[1]}?v=${Date.now()}`;
    
            elemento.style.background = `url("${url}")`;
            elemento.style.backgroundSize = '100% 100%';
            elemento.style.backgroundRepeat = 'no-repeat';
    
        /*
        // Se for SVG, insere inline
        if (imagem[1].toLowerCase() === 'svg') {
            fetch(url)
                .then(res => res.text())
                .then(svg => {
                    elemento.innerHTML = svg;
                })
                .catch(err => console.error('Erro ao carregar SVG:', err));
        } else {
            // Padrão para imagens normais
            elemento.style.background = `url("${url}")`;
            elemento.style.backgroundSize = '100% 100%';
            elemento.style.backgroundRepeat = 'no-repeat';
        }
        */
    }
    
    
    
    
    
    if (onClick && typeof onClick === 'function') {
        elemento.addEventListener('click', onClick);
    }
    
    // Clique esquerdo (button 0)
    if (onClickEsquerdo && typeof onClickEsquerdo === 'function') {
        elemento.addEventListener('mousedown', (event) => {
          if (event.button === 0) {
            onClickEsquerdo(event);
          }
        });
    }
    
    // Clique direito (button 2)
    if (onClickDireito && typeof onClickDireito === 'function') {
        // Previne o menu de contexto padrão
        elemento.addEventListener('contextmenu', (event) => event.preventDefault());
        
        elemento.addEventListener('mousedown', (event) => {
          if (event.button === 2) {
            onClickDireito(event);
          }
        });
    }
    
    if (onKeyUp && typeof onKeyUp === 'function') {
        elemento.addEventListener('keyup', onKeyUp);
    }
    
    if (onKeyDown && typeof onKeyDown === 'function') {
        elemento.addEventListener('keydown', onKeyDown);
    }
    
    
if (onBlur && typeof onBlur === 'function') {
    elemento.addEventListener('blur', onBlur);
}
    
    if (config.onEnter && typeof config.onEnter === 'function') {
        elemento.addEventListener('keydown', function (event) {
            // Verifica se a tecla é Enter e se Shift NÃO está pressionado
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // evita a quebra de linha padrão
                config.onEnter(event);
            }
        });
    }

    if (config.onFiltro && typeof config.onFiltro === 'function') {
    
        let ultimoValor = ''
        let ultimoTempo = 0
    
        const dispararFiltro = (event) => {
            const agora = Date.now()
            const valor = elemento.value.trim()
    
            // evita chamadas duplas em menos de 300ms
            if (agora - ultimoTempo < 300 && valor === ultimoValor) return
    
            ultimoTempo = agora
            ultimoValor = valor
    
            config.onFiltro(event)
        }
    
        // --- Desktop + iOS ---
        elemento.addEventListener('keydown', function (event) {
            const valor = elemento.value.trim()
            const tecla = event.key?.toLowerCase?.() || ''
    
            // Só age se for Enter ou V
            if (tecla === 'enter' || tecla === 'v' || valor === '') {
                if (tecla === 'enter') {
                    event.preventDefault()   // impede pular pro próximo input
                    event.stopPropagation()  // impede subir pro form
                }
    
                dispararFiltro(event)
            }
            // todas as outras teclas passam normal
        })
    
        // --- Android ---
        elemento.addEventListener('change', function (event) {
            // Android costuma disparar change ao clicar Enter
            dispararFiltro(event)
        })
    
        // --- Fallback adicional ---
        elemento.addEventListener('blur', function (event) {
            const valor = elemento.value.trim()
            if (valor === '') {
                dispararFiltro(event)
            }
        })
    }

    
    if (onChange && typeof onChange === 'function') {
        elemento.addEventListener('change', onChange);
    }
    
    if (onScroll && typeof onScroll === 'function') {
        elemento.addEventListener('scroll', onScroll);
    }
    
    if (onMouseEnter && typeof onMouseEnter === 'function') {
        elemento.addEventListener('mouseenter', onMouseEnter);
    }
    
    if (onMouseLeave && typeof onMouseLeave === 'function') {
        elemento.addEventListener('mouseleave', onMouseLeave);
    }
    
    if (placeholder != undefined && placeholder != '') {
        elemento.placeholder = placeholder;
    }
    
    if(categoria == 'data'){
        elemento.setAttribute('type', 'date');
    }
    
    if(categoria == 'password' || categoria == 'password_branco' ){
        elemento.setAttribute('type', 'password');

    elemento.setAttribute('type', 'password');
    const inputEl = elemento;

    // Cria container
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';

    wrapper.appendChild(inputEl);

    // SVGs minimalistas (olho / olho cortado)
    
    let iconeMostrar = ``
    let iconeOcultar = ``
    
    if(categoria == 'password' ){
      iconeMostrar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`
    
      iconeOcultar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="black" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.08-6.27M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88M1 1l22 22"/>
      </svg>`
    }
    
    if(categoria == 'password_branco' ){
      iconeMostrar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`
    
      iconeOcultar = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24" width="18" height="18">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.08-6.27M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88M1 1l22 22"/>
      </svg>`
    }


    // Cria botão do olho
    const olho = document.createElement('span');
    olho.innerHTML = iconeMostrar;
    olho.style.position = 'absolute';
    olho.style.right = '10px';
    olho.style.top = '50%';
    olho.style.transform = 'translateY(-50%)';
    olho.style.cursor = 'pointer';
    olho.style.userSelect = 'none';
    olho.style.opacity = '0.6';
    olho.style.transition = 'opacity 0.2s ease';
    olho.title = 'Mostrar senha';

    olho.addEventListener('mouseenter', () => olho.style.opacity = '1');
    olho.addEventListener('mouseleave', () => olho.style.opacity = '0.6');

    // Alternar visibilidade
    olho.addEventListener('click', () => {
        if (inputEl.type === 'password') {
            inputEl.type = 'text';
            olho.innerHTML = iconeOcultar;
            olho.title = 'Ocultar senha';
        } else {
            inputEl.type = 'password';
            olho.innerHTML = iconeMostrar;
            olho.title = 'Mostrar senha';
        }
    });

    wrapper.appendChild(olho);
    elemento = wrapper;
}

    if(categoria == 'file'){
        elemento.setAttribute('type', 'file');
    }
    
    if (categoria == 'numero' || categoria == 'number') {
    elemento.setAttribute('type', 'text'); // usamos texto para ter controle total
    elemento.setAttribute('inputmode', 'numeric'); // teclado numÃ©rico em mobile
    elemento.setAttribute('pattern', '[0-9]*');

    // Bloqueia qualquer tecla nÃ£o numÃ©rica (inclusive sinais e letras)
    elemento.addEventListener('keypress', (e) => {
        const char = String.fromCharCode(e.which);
        if (!/[0-9]/.test(char)) {
            e.preventDefault();
        }
    });

    // TambÃ©m bloqueia teclas especiais (e, +, -, etc)
    elemento.addEventListener('keydown', (e) => {
        const teclasPermitidas = [
            'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'
        ];
        if (
            !teclasPermitidas.includes(e.key) &&
            !/^[0-9]$/.test(e.key)
        ) {
            e.preventDefault();
        }
    });

    // Limpa qualquer coisa invÃ¡lida (inclusive texto colado)
    elemento.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    // Bloqueia colagem de texto nÃ£o numÃ©rico
    elemento.addEventListener('paste', (e) => {
        const pasted = (e.clipboardData || window.clipboardData).getData('text');
        if (!/^[0-9]+$/.test(pasted)) {
            e.preventDefault();
        }
    });
}
     
    if (categoria == 'checkbox') {
        // Cria o label que contém o checkbox + texto
        const label = document.createElement('label');
        label.className = classes ? classes : '';
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.justifyContent = 'flex-start';
        label.style.cursor = 'pointer';
    
        // ID base
        const idBase = id || '';
    
        // Cria o input checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.style.marginRight = '6px';
    
        // ✅ ID automático: adiciona "_valor" se tiver id base
        if (idBase) checkbox.id = `${idBase}_valor`;
    
        // ✅ Reatribui o evento onClick, se existir
        if (typeof config.onClick === 'function') {
            checkbox.addEventListener('click', config.onClick);
        }
    
        label.appendChild(checkbox);
    
        // ✅ Cria o texto (legenda) com id automático "_legenda"
        if (texto && texto !== '') {
            const span = document.createElement('span');
            span.innerText = texto;
            if (idBase) span.id = `${idBase}_legenda`;
            label.appendChild(span);
        }
    
        // Insere o label no destino
        if (destino[0] === 'body') {
            document.body.appendChild(label);
        } else if (destino.length === 1) {
            document.getElementById(destino[0]).appendChild(label);
        } else if (destino.length === 2) {
            document.getElementsByClassName(destino[0])[destino[1]].appendChild(label);
        }
    
        return;
    }



    
    // Destino
    if (tipo === 'option') {
        // Para <option>, destino[0] é o ID do select
        document.getElementById(destino[0]).appendChild(elemento);
    } 
    else if (destino[0] === 'body') {
        document.getElementsByTagName("body")[0].appendChild(elemento);
    } 
    else {
        if (destino.length === 1) {
            document.getElementById(`${destino[0]}`).appendChild(elemento);
        } 
        else if (destino.length === 2) {
            document.getElementsByClassName(`${destino[0]}`)[destino[1]].appendChild(elemento);
        }
    }
}

function criar_filter_select_unico(config) {
    const { id, classes, placeholder, opcoes, destino } = config;

    // Container principal
    const container = document.createElement('div');
    container.id = id;
    container.className = `${classes} filter-select-unico`;
    container.style.position = 'relative';
    container.style.userSelect = 'none';

    // Cabeçalho (parte clicável)
    const header = document.createElement('div');
    header.className = 'filter-select-header';
    header.style.cursor = 'pointer';
    header.style.width = '100%';
    header.style.height = '100%';
    header.style.display = 'flex';
    header.style.justifyContent = 'left';
    header.style.alignItems = 'center';

    const labelInterno = document.createElement('span');
    labelInterno.id = `${id}_valor`;
    labelInterno.className = 'filter-select-label';
    labelInterno.innerText = placeholder || 'Selecionar...';
    header.appendChild(labelInterno);

    // Dropdown (menu)
    const dropdown = document.createElement('div');
    dropdown.className = 'filter-select-dropdown';
    Object.assign(dropdown.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '260px',
        maxHeight: '320px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        zIndex: '9999'
    });

    // Campo de busca
    const busca = document.createElement('input');
    busca.type = 'text';
    busca.placeholder = 'Buscar...';
    Object.assign(busca.style, {
        width: '100%',
        marginBottom: '8px',
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px'
    });

    // Lista de opções
    const lista = document.createElement('div');
    Object.assign(lista.style, {
        maxHeight: '240px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });

    // Renderiza opções
    function renderizar(filtro = '') {
        lista.innerHTML = '';
        opcoes
            .filter(op => op.toString().toLowerCase().includes(filtro.toLowerCase()))
            .forEach(op => {
                const item = document.createElement('div');
                item.innerText = op;
                
                Object.assign(item.style, {
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    background: 'white',
                    fontSize: '14px',
                    fontWeight: '400',   // normal, evita bold
                    fontFamily: 'Arial, sans-serif', // fonte limpa
                    color: '#222',       // preto mais suave que o #000
                });
                
                item.addEventListener('mouseenter', () => {
                    item.style.background = '#f0f0f0';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = 'white';
                });


                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    labelInterno.innerText = op; // Atualiza o cabeçalho
                    dropdown.style.display = 'none'; // Fecha dropdown
                    if (typeof config.onFiltrar === 'function') {
                        config.onFiltrar(op);
                    }
                });

                lista.appendChild(item);
            });
    }

    renderizar();

    busca.addEventListener('input', e => renderizar(e.target.value));
    busca.addEventListener('click', e => e.stopPropagation());

    dropdown.appendChild(busca);
    dropdown.appendChild(lista);

    container.appendChild(header);
    container.appendChild(dropdown);

    // Abre / fecha dropdown
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const aberto = dropdown.style.display === 'flex';
        document.querySelectorAll('.filter-select-dropdown').forEach(el => el.style.display = 'none');
        if (!aberto) {
            renderizar();
            dropdown.style.display = 'flex';
        }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) dropdown.style.display = 'none';
    });

    // Inserir no destino
    if (destino[0] === 'body') document.body.appendChild(container);
    else document.getElementById(destino[0]).appendChild(container);
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

function limparTexto(t) {
    return String(t || "")
        // remove zero-width e caracteres invisíveis
        .replace(/[\u200B-\u200D\uFEFF\u2060\u2061\u2062\u2063]/g, "")
        // remove caracteres “fantasma” tipo LTR/RTL markers
        .replace(/[\u202A-\u202E]/g, "")
        // normaliza aspas especiais
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .trim();
}

function texto_maiusculo(dado){
    // 1. Verificamos se o dado é nulo, vazio ou indefinido
    if(['', null, undefined, 'null'].includes(dado)){
        return '-'
    }
    else {
        // 2. Convertemos para String e depois aplicamos o UpperCase
        // Isso evita erros se o dado for um número ou objeto
        return String(dado).toUpperCase()
    }
}

function remover_elementos(nome){
    while(document.body.contains ( document.getElementsByClassName(nome)[0]) == true  ) {
        document.getElementsByClassName(nome)[0].remove()
    }
}

function criar_menu_subniveis(config) {
    
    // Se executar uma segunda vez, é necessário excluir as classes antes de chamar a função
    // remover_elementos('item_do_menu')
    // remover_elementos('menu_submenu')
    
    const {
        itens,
        destino,
        orientacao,
        tamanhoFonte
    } = config;

    // Calcula o nível com base no nome do destino (menu principal = 0)
    const nivel = (destino.match(/submenu_/g) || []).length
    let bg_nivel = 'white'

    for (let c1 = 0; c1 < itens.length; c1++) {
        let indice = obter_quantidade_classe('item_do_menu')
        let item = itens[c1]
        let icone = item['icone'] || ''
        let titulo = item['titulo']
        let subitens = item['subitens']
        let onClick = item['onClick'] || ''
        let subnivel = subitens ? '▼' : ''
        if(subnivel && orientacao == 'direita') {
            subnivel = '▶'
        }
        if(subnivel && orientacao == 'abaixo') {
            subnivel = '▼'
        }
        let restricao = item['restricao'] 

        if(restricao == false){
            continue
        }


        if(orientacao == 'abaixo' || orientacao == 'direita'){
            
        }
        
        if(orientacao == 'cima'){
            
        }
        
        // Card do Item
        criar_elemento({
            id: `item_do_menu_${indice}`,
            tipo: 'div',
            classes: `item_do_menu f w-98 ml-1 hr-2 mt-02 pointer d-flex ai-center relative nivel-${nivel}`,
            hover_fundo: `#${cores['card_usuario']}`,
            onClick: onClick,
            destino: [destino]
        })
        

        let extensao = 'svg'
        if(icone.includes('.png') ){
            icone = icone.replace('.png','')
            extensao = 'png'
        }
    
        
        // Ícone
        criar_elemento({
            tipo: 'div',
            classes: 'f w-20 h-80 df-c-c',
            imagem: [icone, extensao],
            destino: [`item_do_menu_${indice}`]
        })

        // Título
        criar_elemento({
            // Se existir 'item.id_titulo' no config usa ele, senão gera um padrão
            id: item.id || `titulo_item_${indice}`, 
            tipo: 'div',
            classes: `f w-70 h-100 df-c-e font-${tamanhoFonte}`,
            texto: titulo,
            destino: [`item_do_menu_${indice}`]
        })

        // Indicador ▼ / ▲
        criar_elemento({
            id: `seta_${indice}`,
            tipo: 'div',
            classes: 'f h-100 df-c-c transicao-rapida',
            texto: subnivel,
            destino: [`item_do_menu_${indice}`]
        })

        // Submenu (caso tenha)
        if (subitens) {
            
            if(orientacao == 'abaixo'){
                const itemPai = document.getElementById(`item_do_menu_${indice}`)
                const seta = document.getElementById(`seta_${indice}`)
                const submenu_id = `submenu_${indice}`
                
                criar_elemento({
                    id: submenu_id,
                    tipo: 'div',
                    classes: `menu_submenu bg-${cores['menu']} ml-4 cor-white w-100 none`,
                    destino: [destino],
                    atributos: { 'data-nivel': nivel + 1 } 
                })
    
                const submenu = document.getElementById(submenu_id)
                
                criar_menu_subniveis({
                    itens: subitens,
                    destino: submenu_id,
                    orientacao: orientacao
                })
    
                itemPai.addEventListener('click', (e) => {
                    e.stopPropagation()
                    const aberto = !submenu.classList.contains('none')
                    submenu.classList.toggle('none')
                    seta.textContent = aberto ? '▼' : '▲'
                })   
            }
            
            if (orientacao == 'direita') {
                const itemPai = document.getElementById(`item_do_menu_${indice}`);
                itemPai.classList.add('relative');
            
                const submenu_id = `submenu_${indice}`;
            
                // cria o submenu na janela (para não ser cortado)
                criar_elemento({
                    id: submenu_id,
                    tipo: 'div',
                    classes: `menu_submenu absolute bg-${cores['menu']} cor-white borda-radius sombra-padrao none`,
                    destino: ['janela']
                });
            
                const submenu = document.getElementById(submenu_id);
                submenu.style.position = 'absolute';
                submenu.style.minWidth = `${itemPai.offsetWidth}px`;
                submenu.style.width = `${itemPai.offsetWidth}px`;
                submenu.style.zIndex = '9999';
            
                // calcula o nível com base no menu pai (fallback 0)
                const parentMenu = itemPai.closest('.menu_submenu');
                const parentNivel = parentMenu ? parseInt(parentMenu.dataset.nivel || 0) : 0;
                const nivelAtual = parentNivel + 1;
                submenu.dataset.nivel = nivelAtual;
            
                // cria os subitens dentro do submenu
                criar_menu_subniveis({
                    itens: subitens,
                    destino: submenu_id,
                    orientacao: orientacao
                });
            
                // helper: oculta (não remove) outros submenus do mesmo nível, exceto o que vamos abrir
                function fechar_submenus_mesmo_nivel_exceto(nivel, keepId) {
                    document.querySelectorAll('.menu_submenu').forEach(s => {
                        const nivelSub = parseInt(s.dataset.nivel || 0);
                        if (nivelSub === nivel && s.id !== keepId) {
                            s.classList.add('none');
                        }
                    });
                }
            
                // 👉 abre o submenu ao lado
                itemPai.addEventListener('mouseenter', () => {
                    const rect = itemPai.getBoundingClientRect();
            
                    // fecha outros submenus do mesmo nível (mantendo este)
                    fechar_submenus_mesmo_nivel_exceto(nivelAtual, submenu_id);
            
                    submenu.style.left = `${rect.right + 2}px`;
                    submenu.style.top = `${rect.top}px`;
                    submenu.style.minWidth = `${rect.width}px`;
                    submenu.style.width = `${rect.width}px`;
                    submenu.classList.remove('none');
                });
            
                // 🔸 fecha a cadeia quando o mouse sai completamente
                const fecharSubmenu = () => {
                    const dentroDeAlgum = document.querySelectorAll('.menu_submenu:not(.none):hover, .item_do_menu:hover').length > 0;
                    if (!dentroDeAlgum) {
                        fechar_todos_os_submenus();
                    }
                };
            
                itemPai.addEventListener('mouseleave', () => setTimeout(fecharSubmenu, 150));
                submenu.addEventListener('mouseleave', () => setTimeout(fecharSubmenu, 150));
            
                // 🔹 clique fecha tudo
                submenu.addEventListener('click', (e) => {
                    e.stopPropagation();
                    fechar_todos_os_submenus();
                });
            }
            
        // Dentro da sua função criar_menu_subniveis_cima(config)
        // Na parte onde você verifica a orientação:
        
        if (orientacao == 'cima') { // Novo modo: Menu no topo
            const itemPai = document.getElementById(`item_do_menu_${indice}`);
            const submenu_id = `submenu_${indice}`;
        
            // Cria o submenu na janela (para evitar problemas de overflow/z-index)
            criar_elemento({
                id: submenu_id,
                tipo: 'div',
                classes: `menu_submenu absolute bg-${cores['menu']} cor-white borda-radius sombra-padrao none`,
                destino: ['janela']
            });
        
            const submenu = document.getElementById(submenu_id);
            submenu.style.position = 'absolute';
            submenu.style.zIndex = '9999';
        
            // Nível para controle de fechamento
            const parentMenu = itemPai.closest('.menu_submenu');
            const parentNivel = parentMenu ? parseInt(parentMenu.dataset.nivel || 0) : 0;
            const nivelAtual = parentNivel + 1;
            submenu.dataset.nivel = nivelAtual;
        
            // Recursividade: Sub-submenus no topo geralmente abrem para a direita
            criar_menu_subniveis({
                itens: subitens,
                destino: submenu_id,
                orientacao: nivelAtual === 1 ? 'cima' : 'direita' 
            });
        
            itemPai.addEventListener('mouseenter', () => {
                const rect = itemPai.getBoundingClientRect();
                
                // Se for o primeiro nível (menu horizontal), abre abaixo
                if (nivelAtual === 1) {
                    submenu.style.left = `${rect.left}px`;
                    submenu.style.top = `${rect.bottom}px`; // Abaixo do item
                } else {
                    // Se for um sub-submenu (nível 2+), abre para a direita do item
                    submenu.style.left = `${rect.right}px`;
                    submenu.style.top = `${rect.top}px`;
                }
        
                submenu.style.minWidth = `${rect.width}px`;
                submenu.classList.remove('none');
            });
        
            // Lógica de fechamento (pode reaproveitar a que você já tem)
            const fecharSubmenu = () => {
                const hoverMenu = document.querySelector('.menu_submenu:hover');
                const hoverItem = document.querySelector('.item_do_menu:hover');
                if (!hoverMenu && !hoverItem) {
                    document.querySelectorAll('.menu_submenu').forEach(s => s.classList.add('none'));
                }
            };
        
            itemPai.addEventListener('mouseleave', () => setTimeout(fecharSubmenu, 100));
            submenu.addEventListener('mouseleave', () => setTimeout(fecharSubmenu, 100));
        }
            
        }
    }
}


function criarMenuCimaSubniveis(config) {
    const {
        itens,
        destino,
        orientacao
    } = config;

    const nivel = (destino.match(/submenu_/g) || []).length;

    for (let c1 = 0; c1 < itens.length; c1++) {
        let indice = obter_quantidade_classe('item_do_menu');
        let item = itens[c1];
        let icone = item['icone'] || '';
        let titulo = item['titulo'];
        let subitens = item['subitens'];
        let onClickOriginal = item['onClick'] || function() {};
        let restricao = item['restricao'];

        if (restricao == false) continue;

        // --- DEFINIÇÃO DE CLASSES ---
        let classesCard, classesIcone, classesTitulo;
        if (nivel === 0) {
            classesCard = `item_do_menu fr w-5 h-100 pointer df2-c-c relative nivel-${nivel} texto-centralizado`;
            classesIcone = 'f w-100 h-30';
            classesTitulo = 'f w-100 h-30 font-08';
        } else {
            classesCard = `item_do_menu f w-100 hr-3 pointer df-c-e relative nivel-${nivel} pl-1`;
            classesIcone = 'f w-15 h-60'; 
            classesTitulo = 'f w-75 h-100 ml-1 df-c-e font-08'; 
        }

        // --- FUNÇÃO PARA FECHAR TUDO ---
        const fecharTodosSubmenus = () => {
            document.querySelectorAll('.menu_submenu').forEach(s => s.classList.add('none'));
        };

        // --- 1. CARD DO ITEM ---
        criar_elemento({
            id: `item_do_menu_${indice}`,
            tipo: 'div',
            classes: classesCard,
            hover_fundo: `#${cores['card_usuario']}`,
            // Ao clicar, executa a ação e fecha os menus
            onClick: () => {
                onClickOriginal();
                fecharTodosSubmenus();
            },
            destino: [destino]
        });

        // --- 2. ÍCONE ---
        criar_elemento({
            tipo: 'div',
            classes: classesIcone,
            imagem: [icone, 'svg'],
            destino: [`item_do_menu_${indice}`]
        });

        // --- 3. TÍTULO ---
        criar_elemento({
            tipo: 'div',
            classes: classesTitulo,
            texto: titulo,
            destino: [`item_do_menu_${indice}`]
        });

        // --- LÓGICA DE SUBMENU ---
        if (subitens) {
            const itemPai = document.getElementById(`item_do_menu_${indice}`);
            const submenu_id = `submenu_${indice}`;

            criar_elemento({
                id: submenu_id,
                tipo: 'div',
                classes: `menu_submenu absolute bg-${cores['menu']} cor-white borda-radius sombra-padrao none`,
                destino: ['janela']
            });

            const submenu = document.getElementById(submenu_id);
            submenu.style.position = 'absolute';
            submenu.style.zIndex = '9999';
            submenu.style.width = '240px'; 

            const parentMenu = itemPai.closest('.menu_submenu');
            const parentNivel = parentMenu ? parseInt(parentMenu.dataset.nivel || 0) : 0;
            const nivelAtual = parentNivel + 1;
            submenu.dataset.nivel = nivelAtual;

            criarMenuCimaSubniveis({
                itens: subitens,
                destino: submenu_id,
                orientacao: nivelAtual === 1 ? 'cima' : 'direita'
            });

            // --- EVENTO: PASSAR O MOUSE ---
            itemPai.addEventListener('mouseenter', () => {
                const rect = itemPai.getBoundingClientRect();
                
                // Fecha menus do mesmo nível ou mais profundos para evitar duplicidade
                document.querySelectorAll('.menu_submenu').forEach(s => {
                    const sNivel = parseInt(s.dataset.nivel);
                    if (sNivel >= nivelAtual && s.id !== submenu_id) {
                        s.classList.add('none');
                    }
                    // Se for menu principal (topo), garante que qualquer outro de nível 1 feche
                    if (nivelAtual === 1 && sNivel === 1 && s.id !== submenu_id) {
                        s.classList.add('none');
                    }
                });
                
                // Posicionamento
                if (nivelAtual === 1) {
                    submenu.style.left = `${rect.left}px`;
                    submenu.style.top = `${rect.bottom}px`;
                } else {
                    submenu.style.left = `${rect.right}px`;
                    submenu.style.top = `${rect.top}px`;
                }
                submenu.classList.remove('none');
            });

            // Lógica de fechamento ao sair com o mouse
            const verificarFechamento = () => {
                const hoverMenu = document.querySelector('.menu_submenu:hover');
                const hoverItem = document.querySelector('.item_do_menu:hover');
                if (!hoverMenu && !hoverItem) {
                    fecharTodosSubmenus();
                }
            };

            itemPai.addEventListener('mouseleave', () => setTimeout(verificarFechamento, 150));
            submenu.addEventListener('mouseleave', () => setTimeout(verificarFechamento, 150));
        } else {
            // Se o item NÃO tem subitens, ao passar o mouse nele, fechamos os submenus abertos dos vizinhos
            const itemSimples = document.getElementById(`item_do_menu_${indice}`);
            itemSimples.addEventListener('mouseenter', () => {
                // Se eu estou no nível 0, ao passar em um ícone sem submenu, limpa os abertos
                if (nivel === 0) {
                    document.querySelectorAll('.menu_submenu').forEach(s => s.classList.add('none'));
                }
            });
        }
    }
}

function fechar_todos_os_submenus() {
  document.querySelectorAll('.menu_submenu:not(.none)').forEach(sub => {
    sub.classList.add('none');
  });
}

function obter_quantidade_classe(classe){
    return document.getElementsByClassName(classe).length
}

function criar_filter_select(config) {
    const { id, classes, placeholder, opcoes, destino } = config;

    // Container principal
    const container = document.createElement('div');
    container.id = id;
    container.className = `${classes} filter-select`;
    container.style.position = 'relative';
    container.style.userSelect = 'none';

    // Cabeçalho (parte clicável)
    const header = document.createElement('div');
    header.className = 'filter-select-header';
    header.style.cursor = 'pointer';
    header.style.width = '100%';
    header.style.height = '100%';
    header.style.display = 'flex';
    header.style.justifyContent = 'center';
    header.style.alignItems = 'center';

    const labelInterno = document.createElement('span');
    labelInterno.className = 'filter-select-label';
    labelInterno.innerText = placeholder || 'Filtrar...';
    header.appendChild(labelInterno);

    // Dropdown (menu)
    const dropdown = document.createElement('div');
    dropdown.className = 'filter-select-dropdown';
    Object.assign(dropdown.style, {
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '260px',
        maxHeight: '320px',
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'none',
        flexDirection: 'column',
        padding: '8px',
        zIndex: '9999'
    });

    // Campo de busca
    const busca = document.createElement('input');
    busca.type = 'text';
    busca.placeholder = 'Buscar...';
    Object.assign(busca.style, {
        width: '100%',
        marginBottom: '8px',
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px'
    });

    // Container para os botões de seleção rápida
    const botoesSelecao = document.createElement('div');
    Object.assign(botoesSelecao.style, {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px'
    });

    const btnSelecionarTodos = document.createElement('button');
    btnSelecionarTodos.innerText = 'Selecionar todos';
    Object.assign(btnSelecionarTodos.style, {
        fontSize: '12px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: '#f5f5f5',
        cursor: 'pointer'
    });

    const btnDesmarcarTodos = document.createElement('button');
    btnDesmarcarTodos.innerText = 'Desmarcar todos';
    Object.assign(btnDesmarcarTodos.style, {
        fontSize: '12px',
        padding: '4px 8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        background: '#f5f5f5',
        cursor: 'pointer'
    });

    botoesSelecao.appendChild(btnSelecionarTodos);
    botoesSelecao.appendChild(btnDesmarcarTodos);

    // Lista de opções
    const lista = document.createElement('div');
    Object.assign(lista.style, {
        maxHeight: '200px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    });

    let estadoAnterior = [];
    let estadoAtual = [];

    // Função para renderizar
    function renderizar(filtro = '') {
        lista.innerHTML = '';
        opcoes
            .filter(op => op.toString().toLowerCase().includes(filtro.toLowerCase()))
            .forEach(op => {
                const label = document.createElement('label');
                Object.assign(label.style, {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '2px 4px',
                    cursor: 'pointer'
                });

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = op;
                checkbox.checked = estadoAtual.includes(op);

                const span = document.createElement('span');
                span.textContent = op;

                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    if (e.target.checked) {
                        if (!estadoAtual.includes(op)) estadoAtual.push(op);
                    } else {
                        estadoAtual = estadoAtual.filter(v => v !== op);
                    }
                });

                span.addEventListener('click', (e) => {
                    e.stopPropagation();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                });

                label.appendChild(checkbox);
                label.appendChild(span);
                lista.appendChild(label);
            });
    }

    estadoAtual = [...opcoes];
    renderizar();

    busca.addEventListener('input', e => renderizar(e.target.value));
    busca.addEventListener('click', e => e.stopPropagation());

    // Selecionar todos
    btnSelecionarTodos.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoAtual = [...opcoes];
        renderizar(busca.value);
    });

    // Desmarcar todos
    btnDesmarcarTodos.addEventListener('click', (e) => {
        e.stopPropagation();
        estadoAtual = [];
        renderizar(busca.value);
    });

    // Botões de ação (OK / Cancelar)
    const botoes = document.createElement('div');
    Object.assign(botoes.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '6px',
        marginTop: '8px'
    });

    const btnCancelar = document.createElement('button');
    btnCancelar.innerText = 'Cancelar';
    Object.assign(btnCancelar.style, {
        padding: '4px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer'
    });
    btnCancelar.onclick = (e) => {
        e.stopPropagation();
        estadoAtual = [...estadoAnterior];
        dropdown.style.display = 'none';
    };

    const btnOk = document.createElement('button');
    btnOk.innerText = 'OK';
    Object.assign(btnOk.style, {
        padding: '4px 10px',
        background: '#27548A',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
    });
    btnOk.onclick = (e) => {
        e.stopPropagation();
        const selecionados = [...estadoAtual];
        labelInterno.innerText = `${placeholder}: ${selecionados.length}`;
        dropdown.style.display = 'none';
        if (typeof config.onFiltrar === 'function') config.onFiltrar(selecionados);
    };

    botoes.appendChild(btnCancelar);
    botoes.appendChild(btnOk);

    dropdown.appendChild(busca);
    dropdown.appendChild(botoesSelecao);
    dropdown.appendChild(lista);
    dropdown.appendChild(botoes);

    container.appendChild(header);
    container.appendChild(dropdown);

    // Abre / fecha dropdown
    header.addEventListener('click', (e) => {
        e.stopPropagation();
        const aberto = dropdown.style.display === 'flex';
        document.querySelectorAll('.filter-select-dropdown').forEach(el => el.style.display = 'none');
        if (!aberto) {
            estadoAnterior = [...estadoAtual];
            renderizar();
            dropdown.style.display = 'flex';
        }
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) dropdown.style.display = 'none';
    });

    // Inserir no destino
    if (destino[0] === 'body') document.body.appendChild(container);
    else document.getElementById(destino[0]).appendChild(container);
    
    estadoAtual = [...opcoes];
    labelInterno.innerText = `${placeholder}: ${estadoAtual.length}`;
    
    // --- Expor métodos no DOM para manipulação externa ---
    container.getValor = () => [...estadoAtual];

    container.setValor = (novosValores) => {
        estadoAtual = [...novosValores];
        labelInterno.innerText = `${placeholder}: ${estadoAtual.length}`;
        renderizar(busca.value);
    };
    
    /*
    if (typeof config.onFiltrar === 'function') config.onFiltrar(estadoAtual);
    */
}

async function carregarRegistros(config){
    let {
        linkDatabase,
        inserirRegistro,
        parametros
    } = config
    
    await iniciar_paginacao({
        link: linkDatabase, 
        funcao_de_inserir: inserirRegistro,
        parametros: parametros
    })   
}

async function iniciar_paginacao(dados){
    paginacao_resetar_dados()
    paginacao_atualizar_dados(dados)
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

function paginacao_resetar_dados(){
    paginacao = {
        link: '',

        parametros: {
            registros_adicionados: 0,
            filtros: {}
        },
        
        agrupamento: '',
        
        ordenacao: '',
        
        fluxo: '',
        
        funcao_de_inserir: '',
        total_de_registros: 0,
        registros_adicionados: 0,
        em_carregamento: false
    }
}

function paginacao_atualizar_dados(dados){
    paginacao['link'] =  dados['link'] || ''
    paginacao['funcao_de_inserir'] = dados['funcao_de_inserir'] || '' 
    paginacao['fluxo'] = dados['fluxo'] || '' 
    
    if (!paginacao['parametros']) {
        paginacao['parametros'] = {};
    }
    
    paginacao['parametros'] = dados['parametros'] || '' 
    // paginacao['parametros']['filtros'] = dados['filtros'] || {}
    
    paginacao['agrupamento'] = dados['agrupamento'] || ''
    paginacao['ordenacao'] = dados['ordenacao'] || ''
}

function paginacao_remover_registros(){
    // Colocar essa classe em todo registro pagincao ( register )
    remover_elementos('register')
}

async function paginacao_carregar_registros(){
    let registros_adicionados = paginacao['registros_adicionados']
    let parametros = paginacao['parametros']
    
    parametros['inicio'] = registros_adicionados
    
    let resultado = await apiDatabase(parametros)
    
    paginacao['total_de_registros'] = resultado['total']
    let total = paginacao['total_de_registros']
    
    let el = document.getElementById('total_de_resultados');
    if (el) {
        el.innerHTML = `${total} Resultados`;
    }
    
    let funcao_de_inserir = paginacao['funcao_de_inserir']
    let dados = resultado['dados']
    
    for ( let c1 = 0; ( c1 < dados.length && paginacao['registros_adicionados'] < total) ; c1 ++ ){
        paginacao['registros_adicionados'] += 1
        paginacao['parametros']['registros_adicionados'] += 1
        let registro = dados[c1]
        funcao_de_inserir(registro)
    }
    
}

async function paginacao_filtro_unico(atributo, filtro){
    paginacao['registros_adicionados'] = 0
    paginacao['parametros']['registros_adicionados'] = 0
    paginacao['parametros']['filtros'][atributo] = filtro
    paginacao_remover_registros()
    await paginacao_carregar_registros()
}

function converter_data_database_para_normal(data) {
    // 1. Verifica se é nulo, undefined ou se após remover espaços a string é vazia
    if (data === null || data === undefined || String(data).trim() === '') {
        return '-';
    }

    // 2. Se o Excel mandou um objeto de Data em vez de string, convertemos para string ISO
    let dataStr = String(data).trim();

    // 3. Verifica se a string parece uma data válida (contém o separador '-')
    if (!dataStr.includes('-')) {
        return '-';
    }

    try {
        let data_dividida = dataStr.split('-');
        let ano = data_dividida[0];
        let mes = data_dividida[1];
        let dia = data_dividida[2];

        // Garante que temos as 3 partes antes de retornar
        if (!dia || !mes || !ano) return '-';

        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        return '-';
    }
}

async function delay(tempo){
    await new Promise(resolve => setTimeout(resolve, tempo))
}

async function loading_comeco(){
    criar_elemento({
        tipo: 'div',
        id: 'loading',
        classes: 'absolute bg-black cor-white df-c-c w-100 h-100 font-2 texto-centralizado opacity-50 camada3',
        destino: ['janela']
    })
    
    criar_elemento({
        tipo: 'div',
        classes: 'spinner',
        destino: ['loading']
    })
    
    criar_elemento({
        tipo: 'div',
        texto: 'Carregando',
        destino: ['loading']
    })
    
    await delay(200)
}

function loading_final() {
    const el = document.getElementById('loading');
    if (el) {
        el.remove();
    }
}

function atualizarFilterSelect(id, valores) {
    const container = document.getElementById(id);
    if (!container) return;

    // 1. Atualiza a lógica interna (o que já funciona para você)
    if (typeof container.setValor === 'function') {
        container.setValor(valores);
    }

    // 2. Sincroniza os Checkboxes (A parte que está faltando)
    // Buscamos todos os checkboxes dentro desse container específico
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(cb => {
        // Converte para String para garantir a comparação (evita erro de '123' vs 123)
        const valorTexto = String(cb.value);
        const estaSelecionado = valores.map(String).includes(valorTexto);
        
        // Marca ou desmarca o input
        cb.checked = estaSelecionado;

        // 3. Atualiza a classe visual no elemento pai (para ficar azul/destacado)
        const itemLista = cb.closest('.item-opcao') || cb.parentElement; 
        if (estaSelecionado) {
            itemLista.classList.add('selecionado', 'active');
        } else {
            itemLista.classList.remove('selecionado', 'active');
        }
    });

    // 4. Se o seu componente tiver uma função de "render" ou "refresh", chame-a aqui
    if (typeof container.refresh === 'function') {
        container.refresh();
    }
}
function obterValorFilterSelect(id) {
    const container = document.getElementById(id);
    if (!container) return [];

    // Se o método getValor foi exposto internamente
    if (typeof container.getValor === 'function') {
        return container.getValor();
    }

    // Alternativa: tentar ler do dataset, se estiver sendo usado
    if (container.dataset.valor) {
        try {
            return JSON.parse(container.dataset.valor);
        } catch {
            return [];
        }
    }

    console.warn(`⚠️ filter_select "${id}" não possui método getValor nem dataset.valor.`);
    return [];
}

function remover_da_lista(lista, elemento) {
    return lista.filter(e => e !== elemento);
}

function my_confirm(mensagem, verdadeiro, falso) {
    return new Promise((resolve) => {
        criar_elemento({
            id: 'confirm',
            tipo: 'div',
            classes: 'absolute w-100 h-100 camada3 df-c-c bg-0000006b',
            destino: ['janela']
        })

        criar_elemento({
            id: 'confirm_card',
            tipo: 'div',
            classes: 'w-20 camada3 bg-292929 df2-c-c borda-radius padding-1 bg-white sombra-padrao font-arial',
            destino: ['confirm']
        })

        criar_elemento({
            tipo: 'div',
            texto: mensagem,
            classes: 'cor-008BA7 font-103 texto-centralizado padding-1 df-c-c w-100 quebra-texto',
            destino: ['confirm_card']
        })

        criar_elemento({
            id: 'confirm_opcoes',
            tipo: 'div',
            classes: 'w-70 df-c-c',
            destino: ['confirm_card']
        })

        criar_elemento({
            tipo: 'button',
            texto: verdadeiro,
            classes: 'bg-008BA7 cor-white font-1 texto-centralizado padding-1 borda-radius hr-2 w-40 pointer borda-008BA7 df-c-c',
            destino: ['confirm_opcoes'],
            onClick: () => {
                remover_elemento('confirm')
                resolve(true)
            }
        })

        criar_elemento({
            tipo: 'button',
            texto: falso,
            classes: 'bg-white cor-008BA7 font-1 texto-centralizado padding-1 borda-radius hr-2 w-40 pointer borda-008BA7 df-c-c',
            destino: ['confirm_opcoes'],
            onClick: () => {
                remover_elemento('confirm')
                resolve(false)
            }
        })
    })
}

function abrirFilterSelect(id) {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {

            const container = document.getElementById(id);
            if (!container) return;

            const dropdown = container.querySelector('.filter-select-dropdown');
            if (!dropdown) return;

            // Fecha todos os outros dropdowns
            document.querySelectorAll('.filter-select-dropdown')
                .forEach(el => el.style.display = 'none');

            // Abre este dropdown
            dropdown.style.display = 'flex';

            // Foca no campo de busca
            const busca = dropdown.querySelector('input');
            if (busca) busca.focus();
        });
    });
}

function focarElemento(id){
    document.getElementById(id).focus()
}

function solicitar_senha() {
    return new Promise((resolve) => {
        criar_elemento({
            id: 'pagina_senha',
            tipo: 'div',
            classes: 'absolute bg-f9fafb w-100 h-100 camada3 df-c-c',
            destino: ['janela']
        })

        criar_elemento({
            id: 'card_senha',
            tipo: 'div',
            classes: 'w-20 camada3 bg-white df2-c-c borda-radius padding-1 sombra-padrao',
            destino: ['pagina_senha']
        })

        criar_elemento({
            id: 'senha_digitada',
            tipo: 'input',
            placeholder: 'Digite sua senha',
            categoria: 'password',
            classes: 'font-1 hr-3 texto-centralizado w-100 borda-radius borda-d1d5db outline-none',
            destino: ['card_senha'],
            onEnter: async(event) => {
                let senha = document.getElementById('senha_digitada').value
                remover_elemento('pagina_senha')
                resolve(senha)   
            }
        })
        
        // Para evitar erro de vazamento de dados
        document.getElementById('senha_digitada').setAttribute('autocomplete', 'new-password')

        criar_elemento({
            tipo: 'div',
            texto: 'Confirmar',
            classes: 'bg-3484ac cor-white font-1 texto-centralizado borda-radius hr-3 w-100 pointer df-c-c',
            destino: ['card_senha'],
            onClick: () => {
                let senha = document.getElementById('senha_digitada').value
                remover_elemento('pagina_senha')
                resolve(senha)
            }
        })
        
        focarElemento('senha_digitada')
    })
}

function obter_hora_atual() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    return `${horas}:${minutos}:${segundos}`;
}



function converterNumeroParaMes(numero){
    return {
        1: 'Janeiro',
        2: 'Fevereiro',
        3: 'Março',
        4: 'Abril',
        5: 'Maio',
        6: 'Junho',
        7: 'Julho',
        8: 'Agosto',
        9: 'Setembro',
        10: 'Outubro',
        11: 'Novembro',
        12: 'Dezembro'
    }[numero]
}

function formatarDataHora2(datetime) {
    if (!datetime) return ["", ""];

    const [data, hora] = datetime.split(" ");

    const [ano, mes, dia] = data.split("-");

    const horaReduc = hora.slice(0, 5); // pega HH:MM

    return [`${dia}/${mes}/${ano} às ${hora}`, horaReduc];
}

function formatarDataHora(datetime) {
    if (!datetime) return ["", ""];

    const [data, hora] = datetime.split(" ");

    const [ano, mes, dia] = data.split("-");

    const horaReduc = hora.slice(0, 5); // pega HH:MM

    return [`${dia}/${mes}/${ano}`, horaReduc];
}

function baixarArquivo(caminho) {
  window.open(caminho, '_blank');
}

function criar_legenda(config){
    const {
        destino,
        legenda,
        valor,
        tipo,
        categoria,
        somente_leitura
    } = config
    
    criar_elemento({
        id: `container_${legenda}`,
        tipo: 'div',
        classes: 'f w-98 ml-1 hr-2 mt-02',
        destino: [destino]
    })
    
    let somente_leitura_valor = false
    if(somente_leitura){
        somente_leitura_valor = true
    }
    
    let tipo_valor = 'input'
    if(tipo){
        tipo_valor = tipo
    }
    
    let categoria_valor = undefined
    if(categoria){
        categoria_valor = categoria
    }

    criar_elemento({
        tipo: 'div',
        classes: 'f w-20 h-100 bg-27548A cor-white df-c-c',
        texto: texto_iniciais_maiusculas(legenda),
        destino: [`container_${legenda}`]
    })
    
    criar_elemento({
        id: `container_${legenda}_valor`,
        tipo: tipo_valor,
        categoria: categoria_valor,
        classes: 'f w-79 pl-1 h-100 borda-none bg-f5f5f5',
        valor: valor,
        opcoes: valor,
        somente_leitura: somente_leitura_valor,
        destino: [`container_${legenda}`]
    })
}

function texto_iniciais_maiusculas(nome) {
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return '-';
    }

    const excecoes = ['de', 'do', 'da', 'dos', 'das', 'e'];

    return nome
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((subnome) => {
            // 1. Pula se o subnome for vazio (previne o erro de undefined)
            if (!subnome) return '';

            // 2. Se for conectivo (da, de, dos...), retorna ele todo em minúsculo
            if (excecoes.includes(subnome)) {
                return subnome;
            }

            // 3. Usa charAt(0) que é mais seguro que [0] para evitar erros de índice
            return subnome.charAt(0).toUpperCase() + subnome.slice(1);
        })
        .filter(part => part !== '') // 4. Remove qualquer "buraco" vazio no array
        .join(' ');
}

function desabilitarSugestoes() {
    document.querySelectorAll('input.desabilitarSugestoes').forEach(input => {
        input.setAttribute('autocomplete', 'new-password')
        input.setAttribute('autocorrect', 'off')
        input.setAttribute('autocapitalize', 'off')
        input.setAttribute('spellcheck', 'false')
        input.setAttribute('inputmode', 'none')
        input.setAttribute('aria-autocomplete', 'none')
    })
}

function data_por_extenso(data){
    if (!data || typeof data !== 'string' || !data.includes('-')) {
        return '';
    }

    let partes = data.split('-');
    if (partes.length !== 3) return '';

    let [ano, mesStr, diaStr] = partes;

    let dia = parseInt(diaStr);
    let mes = parseInt(mesStr);
    let anoNum = parseInt(ano);

    // Meses
    const meses = {
        1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
        5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
        9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
    };

    // Verificações básicas
    if (isNaN(dia) || isNaN(mes) || isNaN(anoNum)) return '';
    if (mes < 1 || mes > 12) return '';

    // Verificar se o dia realmente existe no mês
    const ultimoDia = new Date(anoNum, mes, 0).getDate();
    if (dia < 1 || dia > ultimoDia) return '';

    return `${dia} de ${meses[mes]} de ${anoNum}`;
}

function definir_valor_div(id, valor){
    const el = document.getElementById(id);
    if (el) {
        el.innerHTML = valor;
        return true;     // só para indicar que deu certo
    }
    return false;        // div não existe
}

function proximo_input(event){
      event.preventDefault();
    
      // Pega todos os inputs da página (ou substitua 'input' pelo seletor do seu container)
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
    
      // Pega o input atual
      const currentInput = event.target;
    
      // Encontra o índice do input atual na lista
      const index = inputs.indexOf(currentInput);
    
      // Se não for o último input, foca o próximo
      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
}

function input_anterior(event) {
  event.preventDefault();

  // Pega todos os inputs, selects e textareas (na ordem do DOM)
  const inputs = Array.from(document.querySelectorAll('input, select, textarea'));

  // Input atual
  const currentInput = event.target;

  // Encontra o índice atual
  const index = inputs.indexOf(currentInput);

  // Se não for o primeiro, foca o anterior
  if (index > 0) {
    inputs[index - 1].focus();
  }
}

async function paginacao_carregar_mais_registros(){
    // O container dos registros deve se chamar 'registros'
    let conteudo = document.getElementById('registros')
    let altura_atual = conteudo.scrollTop
    let altura_total = conteudo.scrollHeight

    if ((altura_total - altura_atual) < 1500) {
        let em_carregamento = paginacao['em_carregamento']
        let registros_adicionados = paginacao['registros_adicionados']
        let total = paginacao['total_de_registros']
        
        if (em_carregamento) return;
        if (registros_adicionados >= total) return;

        paginacao['em_carregamento'] = true

        await paginacao_carregar_registros()
        
        paginacao['em_carregamento'] = false
    }
}

function remover_da_lista(lista, elemento) {
    return lista.filter(e => e !== elemento);
}

function converter_data_normal_para_database(data) {
    // 1. Verifica se 'data' existe e se é uma string para evitar o erro de 'undefined'
    if (!data || typeof data !== 'string') {
        return null;
    }

    // 2. Tenta encontrar as barras com segurança
    const barras = data.match(/\//g);
    if (!barras || barras.length !== 2) {
        return null;
    }

    const partes = data.split('/');
    if (partes.length !== 3) {
        return null;
    }

    let [dia, mes, ano] = partes;

    // Verifica se são números e se não estão vazios
    if (dia.trim() === '' || mes.trim() === '' || ano.trim() === '' || isNaN(dia) || isNaN(mes) || isNaN(ano)) {
        return null;
    }

    dia = parseInt(dia, 10);
    mes = parseInt(mes, 10);
    ano = parseInt(ano, 10);

    // Valida se a data é real (ex: evita 31/02)
    const dataObj = new Date(ano, mes - 1, dia);
    if (
        dataObj.getFullYear() !== ano ||
        dataObj.getMonth() !== mes - 1 ||
        dataObj.getDate() !== dia
    ) {
        return null;
    }

    // Formata YYYY-MM-DD
    const diaStr = String(dia).padStart(2, '0');
    const mesStr = String(mes).padStart(2, '0');

    return `${ano}-${mesStr}-${diaStr}`;
}

function jsonToString(obj) {
  return JSON.stringify(obj)
    .replace(/\\/g, '\\\\')    // escapa \ como \\
    .replace(/'/g, "''")       // escapa aspas simples como duas aspas simples
    .replace(/\n/g, '\\n')     // escapa quebra de linha
    .replace(/\r/g, '')        // remove carriage return
    .replace(/\t/g, ' ');      // troca tab por espaço
}

function stringToJson(str) {
    const restaurada = str
        .replace(/\\\\/g, '\\')    // desfaz \\\\ → \
        .replace(/''/g, "'")       // desfaz aspas simples duplicadas → '
        .replace(/\r/g, '')        // remove carriage returns
        .replace(/\t/g, ' ');      // substitui tabs por espaço
    return JSON.parse(restaurada);
}

function textUpper(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.toUpperCase()
    }
}

function textLower(dado){
    if(['',null,undefined,'null'].includes(dado)){
        return '-'
    }
    else{
        return dado.toLowerCase()
    }
}

function textToHTML(texto){
    return texto.replace(/\n/g, "<br>")
}

function rolar_ate_o_fim(id){
    const div = document.getElementById(id);
    div.scrollTop = div.scrollHeight;
}

// ==================================================================
// Módulo de registro
// ==================================================================

// Padrão automatico input , senão select, data ...
// Id criado baseado no nome

/*
    SISTEMAS DEPENDENTES
    - SIMP *
    - Catalogo *
    - GOVI *
    
    // Mostrar Dados
    // Atualizar Dados
    // Adicionar Dados

    function exemplo_atributos(){
        let listagem = [
        
        {
            id: 'item_categoria', 
            nome: 'Categoria', 
            tipo: 'select', 
            opcoes: ['Medicamentos','Saneantes'],
            valor: '',
            id_database: 'categoria'
        },
        
        {
            id: 'item_codigo_sigma', 
            nome: 'C贸digo Sigma', 
            tipo: 'input',
            valor: '',
            id_database: 'codigo_sigma'
        }
        
        return listagem
    }

*/

registro = {
    
    // app.registro.criar_estrutura
    criar_estrutura: (listagem) => {
        for(let c1 = 0; c1 < listagem.length; c1++){
            let registro = listagem[c1]
            let item_id = registro['id']
            let nome = registro['nome']
            let tipo_do_elemento = registro['tipo'] || 'input'
            let categoria_do_elemento = ''
            if(registro['categoria']){
                categoria_do_elemento = registro['categoria']
            }
            
            criar_elemento({
                id: `linha${c1}`,
                tipo: 'div',
                classes: 'f w-100 hr-2 mt-02',
                destino: ['conteudo']
            })
            
            criar_elemento({
                id: `legenda_${item_id}`,
                tipo: 'div',
                classes: 'f df-c-d bg-3484ac cor-white w-18 ml-1 pr-1 h-100 font-quicksand',
                texto: nome,
                destino: [`linha${c1}`]
            })
            
            criar_elemento({
                id: `atributo${c1}`,
                tipo: 'div',
                classes: 'f w-80 h-100 borda-none font-quicksand',
                destino: [`linha${c1}`]
            })   
            
            let largura = 99
            if(tipo_do_elemento == 'select'){
                largura = 100
            }
            criar_elemento({
                id: item_id,
                tipo: tipo_do_elemento,
                categoria: categoria_do_elemento,
                classes: `f w-${largura} pl-1 h-100 borda-none bg-F1EFEC`,
                destino: [`atributo${c1}`]
            })   
            
            if(nome == 'ID'){
                elemento_leitura(item_id)
            }
            
            if(tipo_do_elemento == 'select'){
                let opcoes = registro['opcoes']
                for(let c2 = 0; c2 < opcoes.length; c2++){
                    let opcao = opcoes[c2]
                    
                    criar_elemento({
                        tipo: 'option',
                        texto: opcao,
                        destino: [item_id]
                    })   
                }
            }
            
            if(registro['oculto']){
                document.getElementById(`linha${c1}`).style.display = 'none'
            }
        }
    },
    
    // app.registro.consultar_registro
    consultar_registro: async(id,tabela,listagem) => {
        let id_html = []
        let id_database = []
    
        for(let c1 = 0; c1 < listagem.length; c1++){
            let registro = listagem[c1]
            let html = registro['id']
            let database = registro['id_database']
            id_html.push(html)
            id_database.push(database)
        }
    
        let consulta_sql = `
            ${id_database.join(', ')}
            FROM ${tabela}
            WHERE id = '${id}'
        `
    
        let dados = await database('select',`${consulta_sql}`)
        
    
        for(let c1 = 0; c1 < id_database.length; c1++){
            let registro = dados[0]
            let atributo = id_database[c1]
            let campo = id_html[c1]
            let valor = registro[`${atributo}`]
            
            document.getElementById(`${campo}`).value = valor
        }
    },
    
    // app.registro.atualizar_registro
    atualizar_registro: async(id,tabela,listagem) => {
        let consulta_sql_1 = `${tabela} SET`
        let consulta_sql_2 = ``
        let consulta_sql_3 = `WHERE id = '${id}'`
    
        for(let c1 = 0; c1 < listagem.length; c1++){
            let registro = listagem[c1]
            let id_html = registro['id']
            let id_database = registro['id_database']
            let valor = document.getElementById(`${id_html}`).value
            
            // atualizar listagem com o valor
            registro['valor'] = valor
            
            consulta_sql_2 += `${id_database} = '${valor}'`
            if(c1 < listagem.length - 1){
                consulta_sql_2 += `,\n`
            }
        }
    
        let consulta_sql = `
            ${consulta_sql_1}
            ${consulta_sql_2}
            ${consulta_sql_3}
        `
    
        let dados = await database('update',`${consulta_sql}`)
        return listagem
    },
    
    // app.registro.adicionar_registro
    adicionar_registro: async(tabela,listagem) => {
        let lista_id_database = []
        let lista_valores = []
        
        let consulta_sql_1 = `INTO ${tabela} (`
        let consulta_sql_2 = ``
        let consulta_sql_3 = ``
    
        for(let c1 = 0; c1 < listagem.length; c1++){
            let registro = listagem[c1]
            let id_html = registro['id']
            let id_database = registro['id_database']
            let valor = document.getElementById(`${id_html}`).value
    
            registro['valor'] = valor
            
            lista_id_database.push(id_database)
            lista_valores.push(valor)
        }
    
        consulta_sql_2 = `${lista_id_database.join(', ')} ) VALUES (`
        
        for(let c1 = 0; c1 < lista_valores.length; c1 ++){
            let valor = lista_valores[c1]
            consulta_sql_3 += `'${valor}'`
            if(c1 < lista_valores.length - 1){
                 consulta_sql_3 += ', '
            }
        }
        consulta_sql_3 += ')'
    
        let consulta_sql = `
            ${consulta_sql_1}
            ${consulta_sql_2}
            ${consulta_sql_3}
        `
    
        let dados = await database('insert',`${consulta_sql}`)
    
        return listagem
    },
    
    planilha_atualizar_registro: (listagem) => {},
    
    planilha_adicionar_registro: (listagem) => {}
}


