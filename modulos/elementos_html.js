
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

function limpar_conteudo(id = 'conteudo') {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
}

function remover_elemento(id) {
    const el = document.getElementById(id);
    if (el) {
        el.remove();
    }
}

function remover_elementos(classe) {
    document.querySelectorAll(`.${classe}`).forEach(el => el.remove());
}

function obter_classes(id){
    return document.getElementById(id)?.className || ''
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

function obter_imagem(config){
    let {
        caminho = '',
        altura = 100,
        largura = 40
    } = config
    
    return `<div style = " background-image: url(${caminho}); " class = 'f w-${largura} h-${altura} foto' > </div>`
}

async function iniciar_loading() {
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

function finalizar_loading() {
    document.getElementById('loading')?.remove();
}

async function delay(tempo){
    await new Promise(resolve => setTimeout(resolve, tempo))
}