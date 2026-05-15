posicao = 0

paginas['tempo_livre'] = {
    html: `
        <div id="menu" class="f bg-1C1C1C w-100 h-10 df-c-c">

            <select id="pesquisa_tipo" class="f bg-white w-24 ml-1 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer">
                <option value="Tipo" class="bg-white cor-black">Tipo</option>
                <option value="Jogo" class="bg-white cor-black">Jogo</option>
                <option value="Filme" class="bg-white cor-black">Filme</option>
                <option value="Série" class="bg-white cor-black">Série</option>
                <option value="Anime" class="bg-white cor-black">Anime</option>
                <option value="Manga" class="bg-white cor-black">Manga</option>
                <option value="Manhwa" class="bg-white cor-black">Manhwa</option>
                <option value="Livro" class="bg-white cor-black">Livro</option>
                <option value="Gameplay" class="bg-white cor-black">Gameplay</option>
            </select>

            <select id="pesquisa_finalizado" class="f bg-white w-24 ml-1 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer">
                <option value="Finalizado" class="bg-white cor-black">Finalizado</option>
                <option value="N" class="bg-white cor-black">N</option>
                <option value="S" class="bg-white cor-black">S</option>
            </select>
                
            <input id="pesquisa_nome" class="f bg-white w-24 ml-1 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer" placeholder="Nome">
            <div id="buscar" class="f bg-004ea2 cor-white w-24 ml-1 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer"> Buscar </div>
            <div id="adicionar" class="f bg-004ea2 cor-white w-14 mr-1 ml-1 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer"> + </div>
        </div>
        <div id = 'registros' class = 'f w-98 ml-1 h-90 scroll-y'> </div>
    `,

    eventos: async() => {
        pesquisar_tempo_livre()

        await db.rpc('api/sincronizar_finalizados.php')

        document.getElementById('buscar').addEventListener('click', async() => {
            await pesquisar_tempo_livre()
        })

        document.getElementById('pesquisa_tipo').addEventListener('change', async() => {
            await pesquisar_tempo_livre()
        })

        document.getElementById('pesquisa_finalizado').addEventListener('change', async() => {
            await pesquisar_tempo_livre()
        })

        document.getElementById('pesquisa_nome').addEventListener('keyup', async(event) => {
            let valor = event.target.value
            if(valor == '' || event.key == 'Enter'){
                await pesquisar_tempo_livre()
            }
        })

        document.getElementById('adicionar').addEventListener('click', async() => {
            let nome = prompt('Informe o nome')
            let escolha = confirm(`Você confirma a inclusão de ${nome}`)
            if(escolha){
                console.log('ok')
                console.log(escolha)

                await db
                    .from('tempo_livre')
                    .insert({
                        nome: nome
                    })

                alert('Inclusão realizada !')
                await pesquisar_tempo_livre()
            }
        })

    }
}

async function pesquisar_tempo_livre(){
    await iniciar_loading()
    remover_elementos('register')

    let pesquisa = document.getElementById('pesquisa_nome').value 
    let tipo = document.getElementById('pesquisa_tipo').value 
    let finalizado = document.getElementById('pesquisa_finalizado').value 

     let query = db
        .from('tempo_livre')
        .select('id, nome, finalizado, comprado, preco, categorias')

    if(pesquisa != ''){
        query = query.ilike('nome', `%${pesquisa}%`)
    }

    if(tipo != 'Tipo'){
        query = query.eq('tipo', tipo)
    }

    if(finalizado != 'Finalizado'){
        query = query.eq('finalizado', finalizado)
    }

    query = query.order('nome', { ascending: true });

    let registros = await query

    for(let c1 = 0; c1 < registros.length; c1++){
        let registro_id = `registro${c1}`
        let r = registros[c1]
        let nome = r.nome
        let finalizado = r.finalizado
        let id = r.id

        cor_fundo = {
            'N': 'CF0F47',
            'S': '024c51'
        }[finalizado]

        inserir_html({ destino: 'registros', html: `
            <div id = '${registro_id}' class = 'register f bg-${cor_fundo} w-92 pl-5 hr-3 mt-02 borda_padrao sombra_padrao borda-radius-10px df-c-e pointer font-09 cor-white') > ${nome} </div>
        `})

        document.getElementById(registro_id).addEventListener('click',async() => {
            pagina_individual_checklist({ id_tempo_livre: id})
        })
    }

    finalizar_loading()
}

async function pagina_individual_checklist(config){
    let {
        id_tempo_livre,
        finalizado = ''
    } = config
    
    id = id_tempo_livre

    let registro = await db
        .from('tempo_livre')
        .select('id, nome, link')
        .eq('id', id)

    let r = registro[0]
    let nome = r.nome
    let link = r.link

    limpar_conteudo()
    
    inserir_html({ html: `
        <div class = 'f bg-1a1a1a w-100 h-10 df-c-c'' > 
            <div id = 'titulo' class = 'f w-30 hr-2 cor-white df-c-e'> </div>
            <div id = 'hyperlink' class = 'f w-15 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer bg-004ea2 cor-white'> Hyperlink </div>
            <select id = 'desafio_status' class = 'w-15 h-70 borda-radius'> 
                <option> Status </option>
                <option> Andamento </option>
                <option> Finalizado </option>
            </select>
            <div id = 'editar' class = 'f bg-004ea2 cor-white w-15 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer'> Editar </div>
            <div id = 'voltar' class = 'f bg-004ea2 cor-white w-15 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer'> Voltar </div>
        </div>
        <div id = 'quantidade_resultados' class = 'f mt-1 df-c-c ml-1 w-98 hr-2'> Desafios </div>
        <div id = 'registros' class = 'f hr-35 ml-1 w-98 scroll-y' > </div>
    `})
    
    document.getElementById('titulo').innerHTML = nome

    document.getElementById('desafio_status').addEventListener('change',async(event) => {
        let tipo = event.target.value
        if(tipo == 'Status'){
            pagina_individual_checklist({ id_tempo_livre: id })
        }
        if(tipo == 'Andamento'){
            pagina_individual_checklist({ id_tempo_livre: id, finalizado: 'N' })
        }
        if(tipo == 'Finalizado'){
            pagina_individual_checklist({ id_tempo_livre: id, finalizado: 'S' })
        }
    })
    
    document.getElementById('editar').addEventListener('click',async() => {
        await pagina_individual_editar(id)
    })

    document.getElementById('voltar').addEventListener('click',async() => {
        await carregar_pagina({ nome: 'tempo_livre'})
    })

    document.getElementById('hyperlink').addEventListener('click',async() => {
        if(link){
            hyperlink(link)
        }
    })

    query = db
        .from('tempo_livre_desafios')
        .select('id, nome, descricao, finalizado')
        .eq('id_tempo_livre', id)

    if(finalizado){
        query = query.eq('finalizado', finalizado)
    }

    desafios = await query

    document.getElementById('quantidade_resultados').innerHTML = `${desafios.length} Desafios`

    finalizado = {
        '': 'Status',
        'S': 'Finalizado',
        'N': 'Andamento'
    }[finalizado]
    
    document.getElementById('desafio_status').value = finalizado

    for(let c1 = 0; c1 < desafios.length; c1++){
        let registro_id = `registro${c1}`
        let r = desafios[c1]
        let id_desafio = r.id
        let nome = r.nome
        let descricao = r.descricao
        let finalizado = r.finalizado

        let div_descricao = ''
        if(descricao){
            div_descricao = `<div class = 'f df-c-e w-98 ml-1 font-07 pl-1 cor-white borda-radius  ${status}' >${descricao}</div>`
        }
        
        let finalizado_novo = {
            'N': 'S',
            'S': 'N'
        }[finalizado]
        
        let cor_fundo = {
           'N': '9f2d4f',
           'S': '006A71'
        }[finalizado]
        
        inserir_html({ destino: 'registros', html: `
            <div id = '${registro_id}' class = 'f d-flex ai-center w-97 font-arial ml-1 mt-1 pt-05 pointer bg-${cor_fundo} borda-radius' onClick="atualizar_desafio_status(${id_desafio},${id_tempo_livre},'${finalizado_novo}')">
                <div class = 'ml-1 w-98'>
                    <div class = 'f mt-05 df-c-e w-98 ml-1 font-09 negrito pl-1 cor-white borda-radius ${status}' > ${nome} </div>
                    ${div_descricao}
                </div>
            </div>
        `})

        document.getElementById(`${registro_id}`).addEventListener('click', async() => {
            let classes = obter_classes(registro_id)
            if(classes.includes('andamento') == true){
                remover_classe(registro_id,'andamento')
                adicionar_classe(registro_id,'finalizado')
            }
            else{
                remover_classe(registro_id,'finalizado')
                adicionar_classe(registro_id,'andamento')
            }
        })
    }
    
    document.getElementById('registros').scrollTop = posicao
}

async function atualizar_desafio_status(id_desafio, id_tempo_livre, status){
    posicao = document.getElementById('registros').scrollTop
    
    let filtro_status = document.getElementById('desafio_status').value
        filtro_status = {
            'Status': '',
            'Andamento': 'N',
            'Finalizado': 'S'
        }[filtro_status]
    
    await db
        .from('tempo_livre_desafios')
        .update({ 'finalizado': status })
        .eq('id', id_desafio)

    await pagina_individual_checklist({ id_tempo_livre: id, finalizado: filtro_status })
    
}

async function pagina_individual_editar(id){
    let id_tempo_livre = id

    limpar_conteudo()

    inserir_html({ html: `
        <div id="submenu" class="f w-100 df-c-d bg-gray">
            <div id="salvar" class="f bg-004ea2 cor-white w-33 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer">
                Salvar
            </div>
            <div id="voltar" class="f bg-004ea2 cor-white w-33 hr-2 df-c-c borda-none borda-radius outline-none texto-centralizado pointer">
                Voltar
            </div>
        </div>

        <div id="conteudo" class="f w-100 mt-1 bg-gray">
            
            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Nome</div>
            <input id="nome" class="f w-75 ml-1 pl-1 hr-2 mt-1 borda-radius outline-none pointer" placeholder="Nome">

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Tipo</div>
            <select id="tipo" class="f w-76 ml-1 hr-2 mt-1 borda-radius outline-none pointer">
                <option value="Jogo">Jogo</option>
                <option value="Filme">Filme</option>
                <option value="Série">Série</option>
                <option value="Anime">Anime</option>
                <option value="Manga">Manga</option>
                <option value="Manhwa">Manhwa</option>
                <option value="Livro">Livro</option>
                <option value="Gameplay">Gameplay</option>
            </select>

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Comprado</div>
            <select id="comprado" class="f w-76 ml-1 hr-2 mt-1 borda-radius outline-none pointer">
                <option value="N">N</option>
                <option value="S">S</option>
            </select>

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Preço</div>
            <input id="preco" class="f w-76 ml-1 hr-2 mt-1 borda-radius outline-none pointer" placeholder="Preço">

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Categorias</div>
            <input id="categorias" class="f w-75 ml-1 pl-1 hr-2 mt-1 borda-radius outline-none pointer" placeholder="Categoria">

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Link</div>
            <input id="link" class="f w-75 ml-1 pl-1 hr-2 mt-1 borda-radius outline-none pointer" placeholder="Link">

            <div class="f df-c-c w-20 ml-1 hr-2 mt-1 bg-004ea2 cor-white texto-centralizado borda-radius">Favorito</div>
            <select id="favorito" class="f w-75 ml-1 pl-1 hr-2 mt-1 borda-radius outline-none pointer">
                <option value="N">N</option>
                <option value="S">S</option>
            </select>
        </div>

        <div class="cor-white f mt-1 ml-1 w-98"> Desafios </div>
        <div class="f mt-1 ml-1 w-98 hr-2 bg-gray">
            <input id="desafio_nome" class="f w-20 h-100 outline-none borda-none" placeholder="Nome">
            <input id="desafio_descricao" class="f ml-1 w-20 h-100 outline-none borda-none" placeholder="Descrição">
            <div id="adicionar_desafio" class="f ml-1 w-15 h-100 bg-27548A cor-white df-c-c pointer"> Adicionar </div>
            <textarea id="desafios" class="f w-15 ml-1 h-100 outline-none borda-none"></textarea>
            <div id="adicao_multipla" class="f w-15 ml-1 h-100 bg-27548A cor-white df-c-c pointer"> Adição Múltipla </div>
        </div>

        <div class="f mt-1 ml-1 w-98 hr-2 bg-13335a cor-white scroll-y font-07">
            <div class="f w-5 pl-1 h-100 df-c-e"> ID </div>
            <div class="f w-24 pl-1 h-100 df-c-e"> Título </div>
            <div class="f w-49 pl-1 h-100 df-c-e"> Descrição </div>
            <div class="f w-19 pl-1 h-100 df-c-e"> Ações </div>
        </div>
        <div id="registros_desafios" class="f ml-1 w-98 hr-20 scroll-y bg-gray"></div>

        <div class="cor-white f mt-1 ml-1 w-98"> Dicas </div>
        <div class="f mt-1 ml-1 w-98 hr-2 bg-gray">
            <input id="dicas_titulo" class="f w-10 pl-1 h-100 outline-none borda-none borda-radius" placeholder="Título">
            <textarea id="dicas_descricao" class="f ml-1 pl-1 w-70 h-100 outline-none borda-none borda-radius" placeholder="Descrição"></textarea>
            <div id="adicionar_dica" class="f w-15 ml-1 h-100 bg-27548A cor-white df-c-c pointer borda-radius"> Adicionar </div>
        </div>

        <div class="f mt-1 ml-1 w-98 hr-2 bg-13335a cor-white scroll-y bg-gray">
            <div class="f w-29 pl-1 h-100 df-c-e"> Título </div>
            <div class="f w-49 pl-1 h-100 df-c-e"> Descrição </div>
            <div class="f w-19 pl-1 h-100 df-c-e"> Ações </div>
        </div>
        <div id="registros_dicas" class="f ml-1 w-98 hr-20 scroll-y bg-gray"></div>
    `})
    
    document.getElementById('salvar').addEventListener('click',async() => {
        let nome = document.getElementById('nome').value
        let tipo = document.getElementById('tipo').value
        let comprado = document.getElementById('comprado').value 
        let preco = document.getElementById('preco').value 
        let categorias = document.getElementById('categorias').value
        let link = document.getElementById('link').value
        let favorito = document.getElementById('favorito').value
        let finalizado = 'N'
        
        await db
            .from('tempo_livre')
            .update({ 
                nome: nome,
                tipo: tipo,
                comprado: comprado,
                preco: preco,
                finalizado: finalizado,
                categorias: categorias,
                link: link,
                favorito: favorito
            })
            .eq('id', id)

        await pagina_individual_checklist({ id_tempo_livre: id })
    })

    document.getElementById('voltar').addEventListener('click',async() => {
        await pagina_individual_checklist({ id_tempo_livre: id })
    })

   let registros = await db
        .from('tempo_livre')
        .select(` id, nome, tipo, desafios, finalizado, comprado, preco, categorias, link, favorito`)
        .eq('id', id)

    let r = registros[0]

    document.getElementById('nome').value = r['nome']
    document.getElementById('tipo').value = r['tipo']
    document.getElementById('comprado').value = r['comprado']
    document.getElementById('preco').value = r['preco']
    document.getElementById('desafios').value = r['desafios']
    document.getElementById('categorias').value = r['categorias']
    document.getElementById('link').value = r['link']
    document.getElementById('favorito').value = r['favorito']

    let dicas = await db
        .from('tempo_livre_dicas')
        .select('*')
        .eq('id_tempo_livre', id)

    for(let c1 = 0; c1 < dicas.length; c1++){
        let r = dicas[c1]
        let id_dica = r.id
        let titulo = r.titulo
        let descricao = r.descricao
        if(descricao){
            descricao = descricao.replace(/\n/g, '<br>')
        }
        
        inserir_html({ destino: 'registros_dicas', html:`
            <div class = 'f mt-02 pt-05 w-100 display-flex bg-white'>
                <div class = 'f w-29 pl-1 df-c-e'> ${titulo} </div>
                <div class = 'f w-49 pl-1 df-c-e'> ${descricao} </div>
                <div class = 'f w-19 pl-1 df-c-e pointer' onClick="apagar_dica(${id_dica}, ${id_tempo_livre})"> Apagar </div>
            </div>
        `})
    }

    document.getElementById('adicionar_dica').addEventListener('click', async() => {
        let titulo = document.getElementById('dicas_titulo').value
        let descricao  = document.getElementById('dicas_descricao').value

        await db
            .from('tempo_livre_dicas')
            .insert({
                id_tempo_livre: id_tempo_livre,
                titulo: titulo,
                descricao: descricao
            })

        await pagina_individual_editar(id)
    })

    await mostrar_desafios_editaveis(id_tempo_livre)

    document.getElementById('adicionar_desafio').addEventListener('click', async() => {
        let titulo = document.getElementById('desafio_nome').value
        let descricao  = document.getElementById('desafio_descricao').value

        await db
            .from('tempo_livre_desafios')
            .insert({
                id_tempo_livre: id_tempo_livre,
                nome: titulo,
                descricao: descricao
            })

        await pagina_individual_editar(id)
    })
    
    document.getElementById('adicao_multipla').addEventListener('click', async() => {
        let textoDesafios = document.getElementById('desafios').value;
        let linhas = textoDesafios.split('\n');

        // 1. Criamos um array de objetos em vez de um array de strings SQL
        let dadosParaInserir = linhas
            .map(linha => {
                let nomeLimpo = linha.replace('*', '').trim();
                if (nomeLimpo === '') return null; // Ignora linhas vazias

                return {
                    id_tempo_livre: id_tempo_livre,
                    nome: nomeLimpo
                };
            })
            .filter(item => item !== null); // Remove os nulos

        // 2. Fazemos o insert uma única vez passando o array completo
        if (dadosParaInserir.length > 0) {
            await db
                .from('tempo_livre_desafios')
                .insert(dadosParaInserir);
        }

        await pagina_individual_editar(id)
    })
}

async function apagar_dica(id_dica, id_tempo_livre){
    let escolha = confirm(`Você confirma a exclusão dessa anotação ?`)
    
    await db
        .from('tempo_livre_dicas')
        .delete()
        .eq('id', id_dica)
    
    if(escolha){
        await pagina_individual_editar(id_tempo_livre)
    }
    
}

async function mostrar_desafios_editaveis(id_tempo_livre){
    remover_elementos('register')

    let desafios = await  db
        .from('tempo_livre_desafios')
        .eq('id_tempo_livre', id_tempo_livre)
        .order('id', {ascending: true})

    for(let c1 = 0; c1 < desafios.length; c1++){
        let r = desafios[c1]
        let id_desafio = r.id
        let id_atual = r.id
        let id_anterior = ''
        let nome = r.nome
        let descricao = r.descricao || '-'
        if(descricao){
            descricao = descricao.replace(/\n/g, '<br>')
        }
        let subir = ''
        if(c1 > 0){
            subir = 'Subir'
            id_anterior = desafios[c1-1].id
        }
        
        inserir_html({ destino: 'registros_desafios', html: `
            <div class = 'f mt-02 pt-05 w-100 display-flex bg-white font-07 register'>
                <div class = 'f w-5 pl-1 df-c-e'> ${id_desafio} </div>
                <div class = 'f w-24 pl-1 df-c-e'> ${nome} </div>
                <div class = 'f w-49 pl-1 df-c-e' onClick="atualizar_desafio_descricao(${id_desafio}, ${id_tempo_livre})"> ${descricao} </div>
                <div class = 'f w-8 pl-1 df-c-e pointer' onClick="apagar_desafio(${id_desafio}, ${id_tempo_livre})"> Apagar </div>
                <div class = 'f w-8 pl-1 df-c-e pointer' onClick="subir_desafio(${id_atual}, ${id_anterior}, ${id_tempo_livre})"> ${subir} </div>
            </div>
        `})
    }
    document.getElementById('registros_desafios').scrollTop = posicao
}

async function apagar_desafio(id_desafio, id_tempo_livre){
    let escolha = confirm(`Você confirma a exclusão dessa anotação ?`)
    
    if(escolha){
        await db
            .from('tempo_livre_desafios')
            .delete()
            .eq('id', id_desafio)

        await pagina_individual_editar(id_tempo_livre)
    }
    
}


async function atualizar_desafio_descricao(id_desafio, id_tempo_livre){
    let conteudo = prompt(`Informe a descrição do desafio`)

    await db
        .from('tempo_livre_desafios')
        .update({ 
            descricao: conteudo
        })
        .eq('id', id_desafio)

    await pagina_individual_editar(id_tempo_livre)
    
}

async function subir_desafio(id_atual, id_anterior, id_tempo_livre ){
    const id_temp = 999999999;

    // Passo 1: Move o atual para o temporário
    await db
        .from('tempo_livre_desafios')
        .update({ id: id_temp })
        .eq('id', id_atual);

    // Passo 2: Move o anterior para o lugar do atual
    await db
        .from('tempo_livre_desafios')
        .update({ id: id_atual })
        .eq('id', id_anterior);

    // Passo 3: Move o temporário para o lugar do anterior
    await db
        .from('tempo_livre_desafios')
        .update({ id: id_anterior })
        .eq('id', id_temp);
        
    posicao = document.getElementById('registros_desafios').scrollTop
    await mostrar_desafios_editaveis(id_tempo_livre)
}