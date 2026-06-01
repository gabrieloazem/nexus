paginas['perguntas'] = {
    eventos: async() => {

        inserir_html({ html: `
            <div id = 'titulo' class = 'f df-c-c w-98 ml-1 hr-3 font-105'> Perguntas </div>

            <div class = 'f hr-2 mt-1 w-98 ml-1 borda-radius df-c-c'> 
                <input id = 'disciplinas' class = 'f w-70 h-100 borda-radius borda-gry'> </input>
                <button id = 'atualizar_pergunta' class = 'f w-15 h-100 borda-radius bg-174276 cor-white pointer'> A </button>
                <button id = 'adicionar_pergunta' class = 'f w-15 h-100 borda-radius bg-174276 cor-white pointer'> + </button>
            </div>

            <div class = 'f hr-2 mt-1 w-98 ml-1 borda-radius df-c-c'> 
                <button id = 'pergunta_anterior' class = 'f w-50 h-100 borda-radius bg-174276 cor-white pointer'> Anterior </button>
                <button id = 'pergunta_seguinte' class = 'f w-50 h-100 borda-radius bg-174276 cor-white pointer'> Seguinte </button>
            </div>

            <textarea id = 'pergunta' class = 'f w-98 ml-1 hr-10 mt-1'> </textarea>
            <details id = 'detalhes' class = 'f w-98 ml-1 mt-1'> <summary> Resposta </summary>
                <textarea id = 'resposta' class = 'f w-98 ml-1 hr-10 mt-1'> </textarea>
            </details>
        `})

        document.getElementById('adicionar_pergunta').addEventListener('click', async() => {
            await adicionar_pergunta()
        })

        document.getElementById('atualizar_pergunta').addEventListener('click', async() => {
            await atualizar_pergunta()
        })

        document.getElementById('pergunta_seguinte').addEventListener('click', async() => {
            await pergunta_seguinte()
        })

        document.getElementById('pergunta_anterior').addEventListener('click', async() => {
            await pergunta_anterior()
        })

        await carregar_perguntas()

        await exibir_pergunta()
    }
}

async function adicionar_pergunta(){

    await db
        .from('perguntas')
        .insert([{
            id_disciplina: app.id.disciplina
        }]);

    app.paginacao.dados = []
    app.paginacao.total = 0
    app.paginacao.ponteiro = 0
    
    await carregar_pagina({ nome: 'perguntas' });
}

async function carregar_perguntas(){
    resultado = await db
        .from('perguntas')
        .select('*') 
        .eq('id_disciplina', app.id.disciplina )
        .order('id', { ascending: true })

    app.paginacao.total = resultado.data.length
    app.paginacao.dados = resultado.data
}

function exibir_pergunta(){
    let pergunta = app.paginacao.dados[app.paginacao.ponteiro].pergunta
    let resposta = app.paginacao.dados[app.paginacao.ponteiro].resposta

    document.getElementById('pergunta').value = pergunta
    document.getElementById('resposta').value = resposta

    let inicio = app.paginacao.ponteiro + 1
    let fim = app.paginacao.total
    
    document.getElementById('titulo').innerHTML = `${inicio} de ${fim}`

    document.getElementById('detalhes').open = false ;
}

async function atualizar_pergunta(){
    let id = app.paginacao.dados[app.paginacao.ponteiro].id
    let pergunta = document.getElementById('pergunta').value
    let resposta = document.getElementById('resposta').value

    app.paginacao.dados[app.paginacao.ponteiro].pergunta = pergunta
    app.paginacao.dados[app.paginacao.ponteiro].resposta = resposta

    await db
        .from('perguntas')
        .update({ 
            pergunta: pergunta,
            resposta: resposta
        }) 
        .eq('id', id);
}

async function pergunta_seguinte(){
    let ponteiro = app.paginacao.ponteiro
    if(ponteiro < app.paginacao.total - 1){
        app.paginacao.ponteiro += 1
        await exibir_pergunta()
    }
}

async function pergunta_anterior(){
    let ponteiro = app.paginacao.ponteiro
    if(ponteiro > 0){
        app.paginacao.ponteiro = app.paginacao.ponteiro - 1
        await exibir_pergunta()
    }
}