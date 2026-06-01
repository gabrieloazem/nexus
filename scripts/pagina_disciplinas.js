paginas['disciplinas'] = {
    eventos: async() => {

        inserir_html({ html: `
            <div class = 'f df-c-c w-98 ml-1 hr-3 font-105'> Questões </div>

            <div class = 'f hr-2 mt-1 w-98 ml-1 borda-radius df-c-c'> 
                <input id = 'disciplinas' class = 'f w-85 h-100 borda-radius borda-gry'> </input>
                <button id = 'adicionar_disciplina' class = 'f w-15 h-100 borda-radius bg-174276 cor-white'> + </button>
            </div>
            <div id = 'registros' class = 'f w-98 ml-1 hr-20 mt-1 scroll-y'> </div>
            
        `})

        await inserir_disciplinas()

        document.getElementById('adicionar_disciplina').addEventListener('click', async() => {
            let disciplina = prompt('Digite o nome da disciplina')
            let escolha = confirm(`Você deseja adicionar a disciplina '${disciplina}'`)
            if(escolha){

                await db
                    .from('disciplinas')
                    .insert([{ 
                        nome: disciplina
                    }]);

                alert('Disciplina incluída com sucesso !')

                await inserir_disciplinas()
            }
        })
    }
}

async function inserir_disciplinas(){
    let disciplinas = await db
        .from('disciplinas')
        .select('id, nome');
    
    if (!disciplinas.data) return;

    let htmlLista = '';

    for(let c1 = 0; c1 < disciplinas.data.length; c1++){
        let r = disciplinas.data[c1];
        let id_disciplina = r.id;
        let nome_disciplina = r.nome;

        htmlLista += `
            <div onclick="abrirQuestoesDaDisciplina(${id_disciplina})" 
                 class="f w-96 mt-02 padding-1 borda_padrao borda-radius df-c-e pointer"> 
                ${nome_disciplina} 
            </div>`;
    }

    document.getElementById('registros').innerHTML = htmlLista;
}

// Função auxiliar global para gerenciar a transição de página salvando o ID no seu objeto 'app' ou 'ctx'
async function abrirQuestoesDaDisciplina(id) {
    app.id.disciplina = id;
    
    app.paginacao.dados = []
    app.paginacao.total = 0
    app.paginacao.ponteiro = 0
    
    await carregar_pagina({ nome: 'perguntas' });
}
