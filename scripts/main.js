/*
icone de hamburguer => Visualizar melhor
*/

// =============================================
// VARIAVEIS
// =============================================

let logado = 'N'
let senha = 'tsu'
let anotacoes_sensiveis = [
    'Contas ( Jeyo )',
    'Contas ( Marcelo )',
]

async function iniciar_sistema(){
    db = await iniciar_database()

    criar_pagina({
        layout: 'atual',
        marca: { tipo: 'imagem', imagem: 'imagens/logo2.png' },
        atalhos_mobile: [
            {nome: 'Início', icone: 'casa1', onClick: async() => { carregar_pagina({ nome: 'inicio' }) } },  
            {nome: 'Tarefas', icone: 'checklist1', onClick: async() => { carregar_pagina({ nome: 'checklist' }) } }, 
            {nome: 'Finanças', icone: 'dinheiro1' },
            {nome: 'Músicas', icone: 'musica1', onClick: async() => { carregar_pagina({ nome: 'musicas' }) } }, 
            {nome: 'Perfil', icone: 'config1' }
        ]
    })
} 

async function criar_pagina_inicial(){
    limpar_conteudo()
}

async function adicionar_categoria(){
    let nome = prompt('Informe o nome da nova categoria')
    let escolha = confirm(`Você realmente deseja adicionar a categoria ${nome} ?`)
    if(escolha == true){
        
        await db
            .from('jeyo_anotacoes')
            .insert([{ 
                nome: nome
            }]);
        
        await carregar_pagina({ nome: 'checklist' })
    }
}

paginas['inicio'] = {
    html: ''   
}

paginas['checklist'] = {
    
    html: `
        <div id="categoria" class="f w-98 ml-1 mt-05 hr-2">
            <div class="f df-c-c bg-27548A cor-white w-20 h-100">Categoria</div>
            <select id="lista_de_categorias" class="f df-c-c bg-F1EFEC w-80 pl-1 h-100 borda-none"> </select> 
        </div>
        
        <div id="modo" class="f w-98 ml-1 mt-05 hr-2">
            <div class="f df-c-c bg-27548A cor-white w-20 h-100">Modo</div>
            <div id="modo_selecionado" class="f bg-F1EFEC df-c-e w-79 pl-1 h-100 pointer">Checklist</div>
        </div>
        
        <div id="botoes" class="f w-98 ml-1 mt-1 hr-2 display-flex">
            <div id="apagar_anotacao" class="f df-c-c bg-27548A cor-white w-33 h-100 pointer borda-radius">Apagar</div>
            <div id="resetar_tarefas" class="f df-c-c bg-27548A cor-white w-33 h-100 pointer borda-radius">Resetar</div>
            <div id = 'atualizar_tarefas' class="f df-c-c bg-27548A cor-white w-33 h-100 pointer borda-radius">Salvar</div>
            <div id = 'adicionar_categoria' class="f df-c-c bg-27548A cor-white w-33 h-100 pointer borda-radius">Criar</div>
        </div>
        
        <textarea id = 'registros_conteudo' class = 'f w-98 ml-1 mt-1 hr-30 none'> </textarea>
        
        <div id = 'registros' class = 'f w-98 bg-F1EFEC ml-1 mt-1 mb-1 hr-30 scroll-y-invisivel' > </div>
    `,
    
    eventos: async() => {
        let self = paginas.checklist.funcoes
        
        await self.inserir_categorias()
        await self.carregar_registros()
        
        const acoes = {
            'modo_selecionado': self.mudar_modo,
            'atualizar_tarefas': atualizar_conteudo,
            'resetar_tarefas': resetar_tarefas,
            'apagar_anotacao': apagar_anotacao,
            'adicionar_categoria': adicionar_categoria,
            'lista_de_categorias': self.mudar_grupo_anotacoes
        };

        Object.entries(acoes).forEach(([id, func]) => {
            const el = document.getElementById(id);
            if(id === 'lista_de_categorias') el.addEventListener('change', func);
            else el.addEventListener('click', func);
        });
    },
    
    funcoes: {
        async inserir_categorias() {
            
            registros = await db
                    .from('jeyo_anotacoes')
                    .select('nome') 
                    .order('nome', { ascending: true })

            document.getElementById('lista_de_categorias').innerHTML = '';

            for (let c1 = 0; c1 < registros.data.length; c1++) {
                let registro = registros.data[c1];
                let categoria = registro['nome'];

                inserir_html({
                    destino: 'lista_de_categorias',
                    html: `<option>${categoria}</option>`
                });
            }
        },

        async carregar_registros(altura) {
            remover_elementos('register');
            let nome = document.getElementById('lista_de_categorias').value;

            resposta = await db
                    .from('jeyo_anotacoes')
                    .select('conteudo') 
                    .eq('nome', nome)

            let conteudo = resposta.data[0]['conteudo'];
            conteudo = conteudo.split('\n');

            document.getElementById('registros').style.display = 'block';
            document.getElementById('modo_selecionado').innerHTML = 'Checklist';

            for (let c1 = 0; c1 < conteudo.length; c1++) {
                let indice = c1;
                let id_registro = `Registro${indice}`
                let tarefa = conteudo[c1];

                let ocultar = '';
                let alinhamento = 'e';
                if (tarefa == '') { ocultar = 'none'; }
                if (tarefa.includes('##')) { alinhamento = 'c'; }

                let cor = get_cor(tarefa);
                tarefa = limpar_tarefa(tarefa);

                inserir_html({
                    destino: 'registros',
                    html: `
                        <div id='${id_registro}' class="f df-c-${alinhamento} w-99 bg-${cor} pt-05 pl-1 cor-white mt-02 pointer register ${ocultar}"> ${tarefa} </div>
                    `
                })
                
                document.getElementById(`${id_registro}`).addEventListener('click', () => {
                    paginas.checklist.funcoes.atualizar_tarefa( indice, conteudo )
                })
            }
            document.getElementById('registros').scrollTop = altura;
        },

        async atualizar_tarefa(indice,conteudo){

            let nome = document.getElementById('lista_de_categorias').value
            let tarefas_novas = ''
            let tarefa = conteudo[indice]
            
            if(tarefa == ''){
                return
            }
        
            let altura = document.getElementById('registros').scrollTop
            
            if(tarefa.includes('##') == false){
                if(tarefa.includes('*') == true){
                    conteudo[indice] = conteudo[indice].replace('*','')
                }
                else{
                    conteudo[indice] += '*'   
                }   
                
                for(let c1 = 0; c1 < conteudo.length; c1++){
                    tarefas_novas += conteudo[c1]
                    if( c1 < conteudo.length - 1 ){
                        tarefas_novas += '\n'
                    }
                }
                
                let id = `Registro${indice}`
                let classes = obter_classes(id)
                if(classes.includes('bg-545454') == true){
                    remover_classe(id,'bg-545454')
                    adicionar_classe(id,'bg-3484ac')
                }
                else{
                    remover_classe(id,'bg-3484ac')
                    adicionar_classe(id,'bg-545454')
                }
                
                await db
                    .from('jeyo_anotacoes')
                    .update({ conteudo: tarefas_novas }) 
                    .eq('nome', nome) 
                
            }
        },
        
        async mudar_grupo_anotacoes(){
            await db
                .from('jeyo_anotacoes')
                .update({ selecionado: '' }) 
            
            let anotacao = document.getElementById('lista_de_categorias').value
            if(anotacoes_sensiveis.includes(anotacao) == true){
                let senha_informada = prompt('Informe a senha para acessar esta anotação')
                if(senha == senha_informada){
                    await paginas.checklist.funcoes.carregar_registros(0)       
                }
            }
            if(anotacoes_sensiveis.includes(anotacao) == false){

                await db
                    .from('jeyo_anotacoes')
                    .update({ selecionado: 'S' }) 
                    .eq('nome', anotacao) 
                
                await paginas.checklist.funcoes.carregar_registros(0)   
            }
        },
        
        async mudar_modo(){
            let modo_selecionado = document.getElementById('modo_selecionado').innerHTML
            
            if(modo_selecionado == 'Checklist'){
                editar_tarefas()
            }
            
            if(modo_selecionado == 'Edição'){
                document.getElementById('registros_conteudo').style.display = 'none'
                paginas.checklist.funcoes.carregar_registros(0)
            }
            
        }
        
    }   
}

paginas['musicas'] = {
    html: `
        <div class = 'f w-100 h-100'> 
            <div class = 'f w-100 h-2'> </div>
            <div class = 'f w-100 h-8'> 
                <input id = 'pesquisa' class = 'f w-66 ml-1 pl-5 h-100 borda-radius-20px borda-none bg-E9ECEF outline-none pointer cor-495057' placeholder = '&#x1F50D; Pesquise uma música'> </input>
                <div id = 'filtros' class = 'f w-24 ml-1 h-100 df-c-c bg-E9ECEF borda-radius-20px pointer cor-495057 font-09'> ▼ Filtrar </div>
            </div>
            <div class = 'f d-flex flex-direction-colunm jc-center w-100 h-90 scroll-y'> 
                <div class = 'f w-84 ml-1 mt-1 padding-1 borda_padrao borda-radius' > 
                    <div id = 'quantidade_de_registros' class = 'f w-97 hr-2 font-09 df-c-e negrito'></div>
                    <div id = 'registros' class = 'f w-100'> </div>
                    <div id = 'adicionar_musica' class="f botao-flutuante df-c-c bg-11A5C3 font-105 distancia-bottom-12 distancia-right-4"> + </div>
                </div>
            </div>
        </div>
    `,
    carregar_registros: async() => {
        remover_elementos('register')
        await loading_comeco()
    
        let nome = document.getElementById('pesquisa').value
        let filtros = ''
        
        let registros = await api_database({
            fluxo: 'obterMusicas',
            nome: nome,
            filtros: filtros
        })
        
        for(c1 = 0; c1 < registros.dados.length; c1++){
            let r = registros.dados[c1]
            let nome = r.nome
            let id = r.id
            let tonalidade = r.tonalidade
            
            inserir_html({ destino: 'registros', html: `
                <div class = 'register f w-90 pl-5 hr-3 mt-02 borda_padrao sombra_padrao borda-radius-10px df-c-e pointer font-09 cor-495057' onClick = paginaMusica(${id}) > ${nome} </div>
            `})
        }
        
        if(registros.dados.length != 0){
            document.getElementById('quantidade_de_registros').innerHTML = `${registros.dados.length} Músicas encontradas`
        }  
        else{
            document.getElementById('quantidade_de_registros').innerHTML = `Nenhuma música foi encontrada !`
        }
        
        
        loading_final()
    },
    eventos: async() => {
        document.getElementById('pesquisa').addEventListener('keyup', async(event) => {
            let tecla = event.key
            let pesquisa = document.getElementById('pesquisa').value
            if(tecla == 'Enter' || pesquisa == ''){
                await paginas.musicas.carregar_registros()
            }
        })
        
        document.getElementById('filtros').addEventListener('click', async() => {
            await carregar_pagina({ nome: 'favoritas' })   
        })
        
        document.getElementById('adicionar_musica').addEventListener('click', async() => {
            if(logado == 'N'){
                let senha_digitada = prompt('Informe sua senha')
                if(senha == senha_digitada){
                    logado = 'S'
                }
                else{
                    alert('Senha incorreta !')
                }
            }
            
            if(logado == 'S'){
                let musica = prompt('Informe o nome da música')
                let escolha = confirm(`Você confirma a inclusão da música ${musica} ?`)
                if(escolha){
                    await api_database({
                        fluxo: 'adicionarMusica',
                        musica: musica
                    })
                    
                    alert('Música incluída com sucesso !')   
                }   
            }
        })
    },
}

paginas['favoritas'] = {
    html: `
        <div class = 'f w-100 h-100'> 
            <div class = 'f w-100 h-2'> </div>
            <div class = 'f w-100 h-8'> 
                <input id = 'pesquisa' class = 'f w-66 ml-1 pl-5 h-100 borda-radius-20px borda-none bg-E9ECEF outline-none pointer cor-495057' placeholder = '&#x1F50D; Pesquise uma música'> </input>
                <div class = 'f w-24 ml-1 h-100 df-c-c bg-E9ECEF borda-radius-20px pointer cor-495057 font-09'> ▼ Filtrar </div>
            </div>
            <div class = 'f d-flex flex-direction-colunm jc-center w-100 h-90 scroll-y'> 
                <div class = 'f w-84 ml-1 mt-1 padding-1 borda_padrao borda-radius' > 
                    <div id = 'quantidade_de_registros' class = 'f w-97 hr-2 font-09 df-c-e negrito'></div>
                    <div id = 'registros' class = 'f w-100'> </div>
                    <div id = 'adicionar_musica' class="f botao-flutuante df-c-c bg-11A5C3 font-105 distancia-bottom-12 distancia-right-4"> + </div>
                </div>
            </div>
        </div>
    `,
    carregar_registros: async() => {
        remover_elementos('register')
        await loading_comeco()
    
        let nome = document.getElementById('pesquisa').value
        let filtros = ''
        
        let registros = await api_database({
            fluxo: 'obterMusicasFavoritas'
        })
        
        for(c1 = 0; c1 < registros.dados.length; c1++){
            let r = registros.dados[c1]
            let nome = r.nome
            let id = r.id
            let tonalidade = r.tonalidade
            
            inserir_html({ destino: 'registros', html: `
                <div class = 'register f w-90 pl-5 hr-3 mt-02 borda_padrao sombra_padrao borda-radius-10px df-c-e pointer font-09 cor-495057' onClick = paginaMusica(${id}) > ${nome} </div>
            `})
        }
        
        if(registros.dados.length != 0){
            document.getElementById('quantidade_de_registros').innerHTML = `${registros.dados.length} Músicas encontradas`
        }  
        else{
            document.getElementById('quantidade_de_registros').innerHTML = `Nenhuma música foi encontrada !`
        }
        
        
        loading_final()
    },
    eventos: async() => {
        document.getElementById('pesquisa').addEventListener('keyup', async(event) => {
            let tecla = event.key
            let pesquisa = document.getElementById('pesquisa').value
            if(tecla == 'Enter' || pesquisa == ''){
                await paginas.musicas.carregar_registros()
            }
        })
        
        document.getElementById('adicionar_musica').addEventListener('click', async() => {
            if(logado == 'N'){
                let senha_digitada = prompt('Informe sua senha')
                if(senha == senha_digitada){
                    logado = 'S'
                }
                else{
                    alert('Senha incorreta !')
                }
            }
            
            if(logado == 'S'){
                let musica = prompt('Informe o nome da música')
                let escolha = confirm(`Você confirma a inclusão da música ${musica} ?`)
                if(escolha){
                    await api_database({
                        fluxo: 'adicionarMusica',
                        musica: musica
                    })
                    
                    alert('Música incluída com sucesso !')   
                }   
            }
        })
    },
}

paginas['musica'] =  {
    destino: 'conteudo',
    ui: [
        { tipo: 'menuSuperior', corFundo: '1a1a1a', corTexto: 'white', displayFlex: 'df-c-c', filhos: [
            { tipo: 'subtitulo', id: 'musica', texto: 'Nome da Música', fonte: 'arial', largura: 70, corTexto: 'white', alinhamento: 'centralizado' }
        ]},
        { id: 'conteudox', tipo: 'conteudo', largura: 100, altura: 80, corFundo: '222222', corTexto: 'white' }
    ],
    html: `
        <div id="menuInferior" class="f w-100 h-10 df-c-c 1 bg-1a1a1a cor-white ocultar_na_impressao">
            
                <div id="iconeVoltar" class="f w-20 h-80 pointer cor-undefined font-arial df2-c-c"> 
                    <div id="iconVoltar" class="f w-100 h-60 df-c-c font-102"> ◀️ </div>
                    <div class="f w-100 h-40 df-c-c font-09"> Voltar </div>
                </div>
            
                <div id="iconeApagar" class="f w-20 h-80 pointer cor-undefined font-arial df2-c-c"> 
                    <div id="iconApagar" class="f w-100 h-60 df-c-c font-102"> 🗑 </div>
                    <div class="f w-100 h-40 df-c-c font-09"> Apagar </div>
                </div>
            
                <div id="iconeEditar" class="f w-20 h-80 pointer cor-undefined font-arial df2-c-c"> 
                    <div id="iconEditar" class="f w-100 h-60 df-c-c font-102"> 📝 </div>
                    <div class="f w-100 h-40 df-c-c font-09"> Editar </div>
                </div>
            
                <div id="icone_pdf" class="f w-20 h-80 pointer cor-undefined font-arial df-c-c"> 
                    PDF
                </div>
                
                <div id="iconeTonalidade" class="f w-20 h-80 pointer cor-undefined font-arial df2-c-c"> 
                    <div id="iconTonalidade" class="f w-100 h-60 df-c-c font-102">G#</div>
                    <div class="f w-100 h-40 df-c-c font-09"> Tonalidade </div>
                </div>
            
        </div>
    `,
    eventos: async() => {
        document.getElementById('icone_pdf').addEventListener('click', () => {
            print()
        })
        
        document.getElementById('iconeTonalidade').addEventListener('click', () => {
            carregar_pagina({ nome: 'tonalidade' })
        })
        
        document.getElementById('iconeVoltar').addEventListener('click', async() => {
            carregar_pagina({ nome: 'musicas' })
        })
        
        document.getElementById('iconeApagar').addEventListener('click', async() => {
            let resultado = await solicitarSenha()
            if(resultado){ 
                let escolha = confirm('Você confirma a exclusão dessa música ?')
                if(escolha){
                    await api_database({
                        fluxo: 'apagarMusica',
                        id: ultimaConsulta.id
                    })
                    
                    alert('Música Excluída !')
                    
                    await carregar_pagina({ nome: 'inicio' })
                }
            }
        })
        
        document.getElementById('iconeEditar').addEventListener('click', async() => {
            let resultado = await solicitarSenha()
            if(resultado){ 
                await carregar_pagina({ nome: 'editarMusica' })
            }
        })
    }
}

paginas['tonalidade'] = {
    destino: 'conteudo',
    ui: [
        { tipo: 'menuSuperior', corFundo: '222222', corTexto: 'white', displayFlex: 'df-c-c', filhos: [
            { tipo: 'subtitulo', id: 'musica', texto: 'Alterar Tonalidade', fonte: 'arial', largura: 70, corTexto: 'white', alinhamento: 'centralizado' }
        ]},
        { tipo: 'card', largura: 100, altura: 90, corFundo: '6b7280', corTexto: 'white', margemTop: 0, bordaRadius: 0, displayFlex: 'df2-c-c', filhos: [
            
            { tipo: 'botao', id: 'C', texto: 'C', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'C#', texto: 'C#', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'D', texto: 'D', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'D#', texto: 'D#', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'E', texto: 'E', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'F', texto: 'F', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'F#', texto: 'F#', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'G', texto: 'G', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'G#', texto: 'G#', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'A', texto: 'A', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'A#', texto: 'A#', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'B', texto: 'B', largura: 55, corFundo: 'white' },
            { tipo: 'botao', id: 'Graus', texto: 'Graus', largura: 55, corFundo: 'white' }
        ]}
    ],
    eventos: () => {
        for(let c1 = 0; c1 < todasTonalidades.length; c1++){
            let tonalidade = todasTonalidades[c1]
            document.getElementById(`${tonalidade}`).addEventListener('click', async() => {
                let id = ultimaConsulta['id']
                ultimaConsulta['tonalidade'] = tonalidade
                await paginaMusica(id, true)
            })
        }
    }
}

paginas['editarMusica'] = {
    html: `
        <!-- Menu Superior -->
        <div class="f bg-222222 cor-white df-c-c h-10 w-100">
            <h2 id="musica" class="font-arial w-70 texto-centralizado">Editar Música</h2>
        </div>

        <!-- Card Central de Edição -->
        <div class="f bg-6b7280 cor-white w-100 h-80 scroll-y padding-1">
            
            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Nome</label>
                <input id="filtro_nome" class="f w-100 h-3 ml-0 mt-02 borda-radius-5px borda-none pl-1" type="text">
            </div>

            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Tonalidade</label>
                <select id="filtro_tonalidade" class="f w-100 h-3 ml-0 mt-02 borda-radius-5px borda-none">
                    <option value="C">C</option><option value="C#">C#</option>
                    <option value="D">D</option><option value="D#">D#</option>
                    <option value="E">E</option><option value="F">F</option>
                    <option value="F#">F#</option><option value="G">G</option>
                    <option value="G#">G#</option><option value="A">A</option>
                    <option value="A#">A#</option><option value="B">B</option>
                    <option value="Graus">Graus</option>
                </select>
            </div>

            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Conteúdo</label>
                <textarea id="filtro_dados" class="f w-100 h-20 ml-0 mt-02 borda-radius-5px borda-none pl-1"></textarea>
            </div>

            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Categorias</label>
                <input id="filtro_categorias" class="f w-100 h-3 ml-0 mt-02 borda-radius-5px borda-none pl-1" type="text">
            </div>

            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Favoritas</label>
                <select id="filtro_favoritas" class="f w-100 h-3 ml-0 mt-02 borda-radius-5px borda-none">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                </select>
            </div>

            <div class="f w-98 ml-1 mt-1">
                <label class="f w-100 font-09">Finalizada</label>
                <select id="filtro_finalizada" class="f w-100 h-3 ml-0 mt-02 borda-radius-5px borda-none">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                </select>
            </div>

        </div>

        <!-- Menu Inferior -->
        <div class="f bg-222222 cor-white w-100 h-10 d-flex jc-space-around ai-center">
            <div id="icone_voltar" class="df-c-c pointer"> <span>◀️</span> <small>Voltar</small> </div>
            <div id="icone_tempos" class="df-c-c pointer"> <span>🎵</span> <small>Tempos</small> </div>
            <div id="icone_salvar" class="df-c-c pointer"> <span>✅</span> <small>Salvar</small> </div>
        </div>
    `,
    
    eventos: async() => {
        document.getElementById('filtro_nome').value = ultimaConsulta.nome
        document.getElementById('filtro_tonalidade').value = ultimaConsulta.tonalidade
        document.getElementById('filtro_dados').value = ultimaConsulta.conteudo
        document.getElementById('filtro_categorias').value = ultimaConsulta.momento
        document.getElementById('filtro_favoritas').value = ultimaConsulta.favoritas
        document.getElementById('filtro_finalizada').value = ultimaConsulta.finalizada
        
        document.getElementById('icone_voltar').addEventListener('click', async() => {
            let id = ultimaConsulta.id
            await paginaMusica(id)
        })
        
        document.getElementById('icone_tempos').addEventListener('click', () => {
            inserirTempos()
        })
        
        document.getElementById('icone_salvar').addEventListener('click', async() => {
            let id = ultimaConsulta.id
            let nome = document.getElementById('filtro_nome').value
            let tonalidade = document.getElementById('filtro_tonalidade').value
            let conteudo = document.getElementById('filtro_dados').value
            let momento = document.getElementById('filtro_categorias').value
            let favoritas = document.getElementById('filtro_favoritas').value
            let finalizada = document.getElementById('filtro_finalizada').value
            
            momento = momento.replace('Finalizada', '')
            momento = momento.replace('Andamento', '')
            if(finalizada == 'Sim'){
                momento += ` Finalizada`
            }
            if(finalizada == 'Não'){
                momento += ` Andamento`
            }
            
            await api_database({
                fluxo: 'atualizarMusica',
                id: id,
                nome: nome,
                tonalidade: tonalidade,
                conteudo: conteudo,
                momento: momento,
                favoritas: favoritas,
                finalizada: finalizada
            })
            
            alert('Música Atualizada')
            await paginaMusica(id)
        })
    }
}

paginas['financas'] = {}

paginas['tempo_livre'] = {}

paginas['cores'] = {}

paginas['criptografia'] = {}

paginas['agenda'] = {}

async function atualizar_conteudo(){
    let modo_selecionado = document.getElementById('modo_selecionado').innerHTML
    if( modo_selecionado == 'Edição'){
        let nome = document.getElementById('lista_de_categorias').value
        let conteudo = document.getElementById('registros_conteudo').value

        await db
            .from('jeyo_anotacoes')
            .update({ conteudo: conteudo }) 
            .eq('nome', nome) 
        
        document.getElementById('registros_conteudo').style.display = 'none'
        
        paginas.checklist.funcoes.carregar_registros(0)
    }
}

async function editar_tarefas(){
    let nome = document.getElementById('lista_de_categorias').value

    conteudo = await db
            .from('jeyo_anotacoes')
            .select('conteudo') 
            .eq('nome', nome)
    
    conteudo = conteudo.data[0]['conteudo']
    
    document.getElementById('registros').style.display = 'none'
    document.getElementById('registros_conteudo').style.display = 'block'    
    document.getElementById('registros_conteudo').value = conteudo
    document.getElementById('modo_selecionado').innerHTML = 'Edição'
    
}

async function paginaMusica(id, tom = false){
    await loading_comeco()
    
    await carregar_pagina({ nome: 'musica' })
    
    let r = await api_database({
        fluxo: 'obterMusica',
        id: id
    })
    r = r.dados[0]

    let musica = r.nome
    
    let tonalidade = ''
    if(tom == false){
        tonalidade = r.tonalidade
    }
    else{
        tonalidade = ultimaConsulta.tonalidade
    }
    
    let conteudo = r.conteudo
    let momento = r.momento
    let favoritas = r.favoritas
    let finalizada = r.finalizada
    
    ultimaConsulta['id'] = id
    ultimaConsulta['nome'] = musica
    ultimaConsulta['conteudo'] = conteudo
    ultimaConsulta['tonalidade'] = tonalidade
    ultimaTonalidade = tonalidade
    ultimaConsulta['momento'] = momento
    ultimaConsulta['favoritas'] = favoritas
    ultimaConsulta['finalizada'] = finalizada
    
    document.getElementById('musica').innerHTML = musica
    
    mostrarMusica()
    loading_final()
}

function inserirTempos(){
 var cont = document.getElementById('filtro_dados').value
 cont = cont.split(`\n`)
 var novoConteudo = ``
 for(c1 = 0; c1 < cont.length; c1 ++){
  var linha = cont[c1]
  if(linha.includes(`*`) || linha == `` || linha.includes(`Solo`)){
   novoConteudo += cont[c1]
  }
  if(linha.includes(`*`) == false && linha != `` && linha.includes(`Solo`) == false){
   linha = linha.split(` `)
   for(c2 = 0; c2 < linha.length; c2 ++){
    if(linha[c2].includes(`^`) == false){
     novoConteudo += linha[c2] + `^4`
    }
    if(linha[c2].includes(`^`) == true){
     novoConteudo += linha[c2] + ``
    }
    if(c2 != linha.length - 1){
     novoConteudo += ` `
    }
   }
  }
  if(c1 != cont.length - 1){
   novoConteudo += `\n`
  }
 }
 novoConteudo = novoConteudo.replace('Base:^4','Base:')
 document.getElementById('filtro_dados').value = novoConteudo
}

function mostrarMusica(){
    document.getElementById('iconTonalidade').innerHTML = ultimaTonalidade
    document.getElementById('conteudox').innerHTML = `<div class = 'f hr-2 w-98 ml-1' > </div>`
    
    let tom = ultimaTonalidade
    let ultimaNota = tom
    
    let conteudo = ultimaConsulta.conteudo
    if(conteudo){
        conteudo = conteudo.split('\n')   
    }
    else{
        conteudo = []
    }
        
    for(let c1 = 0; c1 < conteudo.length; c1++){
        let linha = conteudo[c1]
        let corTexto = ''
        
        if(linha.includes('*')){
            linha = linha.replace('*', '')
            corTexto = 'FFFF00'
        }
        
        if(linha.includes('Solo: ')){
            linha = linha.replace('Solo: ', '')
            corTexto = '40b4e6'
            
            let novaLinha = linha.split(' ')
            linha = ''
            for(let c2 = 0; c2 < novaLinha.length; c2++){
                let nota = novaLinha[c2]
                if(tom != 'Graus'){
                    nota = Notas[tom][nota]
                    if(nota.includes('/')){
                        nota = nota.split('/')
                        nota = nota[1]
                    }
                    nota = nota.replace('m', '')
                    ultimaNota = nota
                }
                linha += `${nota} &nbsp&nbsp`
            }
        }
        
        if(linha.includes('^')){
            corTexto = 'white'
            linha = linha.replace('Base: ', '')
            let novaLinha = linha.split(' ')
            linha = ''
            for(let c2 = 0; c2 < novaLinha.length; c2++){
                let dados = novaLinha[c2].split('^')
                let nota = dados[0]
                let tempo = dados[1] || ''
                if(tom != 'Graus'){
                    if(nota.includes('-') || nota.includes('+')){
                        nota = deslocarNota(ultimaNota, nota)
                    }
                    else{
                        nota = Notas[tom][nota]   
                    }
                    // Dividir deslocamento e nota
                    // Encontrar a nota
                    // Substituir nota
                }
                ultimaNota = nota
                linha += `${nota}<sup>${tempo}</sup> &nbsp&nbsp`
            }
        }
        
        if( linha.includes ( 'Tonalidade: ' ) ) {
            corTexto = 'pink'

            let posicao = 0
            var quantidade = linha.replace ( '*Tonalidade: ', '' )
                quantidade = linha.replace ( 'Tonalidade: ', '' )
            let operacao = ''
            if(quantidade.includes('+')){
                operacao = '+'
            }
            if(quantidade.includes('-')){
                operacao = '-'
            }
            quantidade = quantidade.replace ( '+', '' )
            quantidade = quantidade.replace ( '-', '' )
            
            let c2 = 0
            for( c2 = 0; c2 < notes.length; c2++){
                if ( notes[c2] == tom ) {
                    let total = notes.length
                    if (operacao == '+') {
                        posicao = (c2 + parseInt(quantidade)) % total;
                    } else {
                        posicao = (c2 - parseInt(quantidade) + total) % total;
                    }
                    tom = notes[posicao]
                }
            }
            if(tom != 'Graus'){
                tom = notes [ posicao ]   
            }
        }
        
        inserir_html({ destino: 'conteudox', html:`
            <div class = 'f hr-2 w-98 ml-1 cor-${corTexto} font-arial' > ${linha} </div>
        `})
    }
}

async function solicitarSenha() {
    if (logado == 'S') return true;

    // Retorna uma promessa que "trava" o fluxo no await
    return new Promise((resolve) => {
        let senha = prompt('Informe a senha para acessar esse módulo');

        if (senha === 'tsu') {
            logado = 'S';
            resolve(true); // Libera o fluxo
        } else {
            alert('Senha Incorreta !');
            resolve(false); 
        }
    });
}

let filtrosLista = [
    'Finalizada',
    'Andamento',
    'Manhã',
    'Santa Ceia',
    'Hinário',
    'Pecado',
    'Celebração',
    'Gratidão',
    'Missões',
    'Secular',
    'Inglês',
    'Espanhol',
    'Coreano'
]

let filtrosTemporarios = []

let filtros = []

let todasTonalidades = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Graus' ]

const Notas = {
    'C':  { '1': 'C',  '2': 'Dm',  '3': 'Em',  '3B': 'C/E',  '4': 'F',  '5': 'G',  '6': 'Am',  '7': 'G/B'  },
    'C#': { '1': 'C#', '2': 'D#m', '3': 'Fm',  '3B': 'C#/F', '4': 'F#', '5': 'G#', '6': 'A#m', '7': 'G#/C' },
    'D':  { '1': 'D',  '2': 'Em',  '3': 'F#m', '3B': 'D/F#', '4': 'G',  '5': 'A',  '6': 'Bm',  '7': 'A/C#' },
    'D#': { '1': 'D#', '2': 'Fm',  '3': 'Gm',  '3B': 'D#/G', '4': 'G#', '5': 'A#', '6': 'Cm',  '7': 'A#/D' },
    'E':  { '1': 'E',  '2': 'F#m', '3': 'G#m', '3B': 'E/G#', '4': 'A',  '5': 'B',  '6': 'C#m', '7': 'B/D#' },
    'F':  { '1': 'F',  '2': 'Gm',  '3': 'Am',  '3B': 'F/A',  '4': 'A#', '5': 'C',  '6': 'Dm',  '7': 'C/E'  },
    'F#': { '1': 'F#', '2': 'G#m', '3': 'A#m', '3B': 'F#/A#','4': 'B',  '5': 'C#', '6': 'D#m', '7': 'C#/F' },
    'G':  { '1': 'G',  '2': 'Am',  '3': 'Bm',  '3B': 'G/B',  '4': 'C',  '5': 'D',  '6': 'Em',  '7': 'D/F#' },
    'G#': { '1': 'G#', '2': 'A#m', '3': 'Cm',  '3B': 'G#/C', '4': 'C#', '5': 'D#', '6': 'Fm',  '7': 'D#/G' },
    'A':  { '1': 'A',  '2': 'Bm',  '3': 'C#m', '3B': 'A/C#', '4': 'D',  '5': 'E',  '6': 'F#m', '7': 'E/G#' },
    'A#': { '1': 'A#', '2': 'Cm',  '3': 'Dm',  '3B': 'A#/D', '4': 'D#', '5': 'F',  '6': 'Gm',  '7': 'F/A'  },
    'B':  { '1': 'B',  '2': 'C#m', '3': 'D#m', '3B': 'B/D#', '4': 'E',  '5': 'F#', '6': 'G#m', '7': 'F#/A#'},
    'Graus': { '1': '1', '2': '2', '3': '3', '3B': '3B', '4': '4', '5': '5', '6': '6', '7': '7' },
    'Bases': { 
        'C': 'G#/C', 'C#': 'A/C#', 'D': 'A#/D', 'D#': 'B/D#', 'E': 'C/E', 'F': 'C#/F', 
        'F#': 'D/F#', 'G': 'D#/G', 'G#': 'E/G#', 'A': 'F/A', 'A#': 'F#/A#', 'B': 'G/B' 
    }
};

let ultimaTonalidade = ''
let ultimaConsulta = {}

let notes = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ]

function deslocarNota(ultima_nota,  item) {
    var notes = [ 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ]
    var menor = 'n'
    if ( item.includes ( 'm' ) ) {
        menor = 's'
    }
    
    ultima_nota1 = ultima_nota
    ultima_nota1 = ultima_nota1.replace ( 'm', '')
    ultima_nota1 = ultima_nota1.replace ( 'C/', '')
    ultima_nota1 = ultima_nota1.replace ( 'C#/', '')
    ultima_nota1 = ultima_nota1.replace ( 'D/', '')
    ultima_nota1 = ultima_nota1.replace ( 'D#/', '')
    ultima_nota1 = ultima_nota1.replace ( 'E/', '')
    ultima_nota1 = ultima_nota1.replace ( 'F/', '')
    ultima_nota1 = ultima_nota1.replace ( 'F#/', '')
    ultima_nota1 = ultima_nota1.replace ( 'G/', '')
    ultima_nota1 = ultima_nota1.replace ( 'G#/', '')
    ultima_nota1 = ultima_nota1.replace ( 'A/', '')
    ultima_nota1 = ultima_nota1.replace ( 'A#/', '')
    ultima_nota1 = ultima_nota1.replace ( 'B/', '')
                        
    var posicao = 0
    var nova_posicao = ''
    var fim = 'n'
    var c3 = 0
    while ( c3 < notes.length && fim == 'n' ) {
        if ( notes [ c3 ] == ultima_nota1 ) {
            posicao = c3
            var deslocamento = parseInt ( item  )
                                
            if ( ( posicao + deslocamento ) > 11 ){
                nova_posicao = posicao + deslocamento 
                nova_posicao -= 12
                console.log ( posicao, deslocamento, 'vai para o inicio', nova_posicao )
                fim = 's'
            }
            if ( ( posicao + deslocamento ) < 0 && fim == 'n' ){
                nova_posicao = posicao + deslocamento 
                nova_posicao += 12
                console.log ( posicao, deslocamento, 'vai para o fim', nova_posicao )
                fim = 's'
            }
                                
            if ( nova_posicao == ''  && fim == 'n' ) {
                nova_posicao = posicao + deslocamento 
                console.log ( posicao, deslocamento, 'normal', nova_posicao )
            }
        }
        c3 += 1
    }
                        
    var note = notes[nova_posicao]
    if ( item . includes ( 'B' ) == true ) {
        note = Notas['Bases'][note]
    }
    
    if ( menor == 's' ) {
        note += 'm'
    }
    
    return note
}

function get_cor(tarefa){
    if(tarefa == ''){
        return 'white'
    }
    if(tarefa.includes('##') == true){
        return '123458'
    }
    if(tarefa.includes('*') == true){
        return '3484ac'
    }
    if(tarefa.includes('*') == false){
        return '545454'
    }
}

function limpar_tarefa(tarefa){
    tarefa = tarefa.replace('##','')
    tarefa = tarefa.replace('*','')
    return tarefa
}


async function resetar_tarefas(){
    let tarefas_novas = ''
    let nome = document.getElementById('lista_de_categorias').value

    let conteudo = await db
        .from('jeyo_anotacoes')
        .select('conteudo')                     // Aqui você lista as colunas separadas por vírgula
        .eq('nome', nome)    
    
    conteudo = conteudo.data[0]['conteudo']
    conteudo = conteudo.split('\n')
    for(let c1 = 0; c1 < conteudo.length; c1++){
        let tarefa = conteudo[c1]
        if(tarefa.includes('*')){
            tarefa = tarefa.replace('*','')
        }
        tarefas_novas += tarefa
        if(c1 < conteudo.length - 1){
            tarefas_novas += `\n`
        }
    }

    await db
        .from('jeyo_anotacoes')
        .update({ conteudo: tarefas_novas }) 
        .eq('nome', nome) 
    
    paginas.checklist.funcoes.carregar_registros(0)
    
}

async function apagar_anotacao(){
    let senha_informada = prompt('Informe a senha para realizar esta ação')
    if(senha_informada == senha){
    let escolha = confirm('Você realmente deseja excluir esta anotação ?')
        if(escolha == true){
            let nome = document.getElementById('lista_de_categorias').value

            await db
                .from('jeyo_anotacoes')
                .delete()
                .eq('nome', nome )
            
            await db
                .from('jeyo_anotacoes')
                .update({ selecionado: '' }) 
            
            window.location.reload()
        }
    }
}


iniciar_sistema()
