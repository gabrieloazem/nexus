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
        await iniciar_loading()
    
        let nome = document.getElementById('pesquisa').value
        let filtros = []
        
        let query = db
            .from('musicas')
            .select('id, versao, nome, tonalidade, conteudo, momento');

        if (nome && nome !== '') {
            query = query.ilike('nome', `%${nome}%`);
        }
        if (filtros.length > 0) {
            query = query.in('momento', filtros);
        }
        
        query = query.order('nome', { ascending: true });

        let registros = await query

        for(c1 = 0; c1 < registros.data.length; c1++){
            let r = registros.data[c1]
            let nome = r.nome
            let id = r.id
            let tonalidade = r.tonalidade
            
            inserir_html({ destino: 'registros', html: `
                <div class = 'register f w-90 pl-5 hr-3 mt-02 borda_padrao sombra_padrao borda-radius-10px df-c-e pointer font-09 cor-495057' onClick = paginaMusica(${id}) > ${nome} </div>
            `})
        }
        
        if(registros.data.length != 0){
            document.getElementById('quantidade_de_registros').innerHTML = `${registros.data.length} Músicas encontradas`
        }  
        else{
            document.getElementById('quantidade_de_registros').innerHTML = `Nenhuma música foi encontrada !`
        }
        
        
        finalizar_loading()
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

                    await db
                        .from('musicas')
                        .insert([{ 
                            nome: musica
                        }]);
                    
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
        await iniciar_loading()
    
        let nome = document.getElementById('pesquisa').value
        let filtros = ''
        
        let registros = await db
            .from('musicas')
            .select(' id, versao, nome, tonalidade, conteudo, momento') 
            .eq('favoritas', 'Sim')                     
            .order('nome', { ascending: true }); 

        
        for(c1 = 0; c1 < registros.data.length; c1++){
            let r = registros.data[c1]
            let nome = r.nome
            let id = r.id
            let tonalidade = r.tonalidade
            
            inserir_html({ destino: 'registros', html: `
                <div class = 'register f w-90 pl-5 hr-3 mt-02 borda_padrao sombra_padrao borda-radius-10px df-c-e pointer font-09 cor-495057' onClick = paginaMusica(${id}) > ${nome} </div>
            `})
        }
        
        if(registros.data.length != 0){
            document.getElementById('quantidade_de_registros').innerHTML = `${registros.data.length} Músicas encontradas`
        }  
        else{
            document.getElementById('quantidade_de_registros').innerHTML = `Nenhuma música foi encontrada !`
        }
        
        finalizar_loading()
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
                    await db
                        .from('musicas')
                        .insert([{ 
                            nome: musica
                        }]);
                    
                    alert('Música incluída com sucesso !')   
                }   
            }
        })
    },
}

paginas['musica'] =  {
    destino: 'conteudo',

    html: `
        <div id = 'musica' class = 'bg-1a1a1a font-arial f w-100 hr-3 cor-white texto-centraizado df-c-c'> </div>
        <div id = 'conteudox' class = 'f w-100 h-80 bg-222222 cor-white scroll-y'> </div>

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

                    await db
                        .from('musicas')
                        .delete()
                        .eq( id, id )
                    
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

    html: `
        <main class="card" style="background-color: #6b7280; width: 100%; height: 90vh;">
            <div class="df2-c-c" style="flex-wrap: wrap; gap: 8px; padding: 15px;">
                
                <button id="C" class="hr-2 w-20" style="background-color: white;">C</button>
                <button id="C#" class="hr-2 w-20" style="background-color: white;">C#</button>
                <button id="D" class="hr-2 w-20" style="background-color: white;">D</button>
                <button id="D#" class="hr-2 w-20" style="background-color: white;">D#</button>
                <button id="E" class="hr-2 w-20" style="background-color: white;">E</button>
                <button id="F" class="hr-2 w-20" style="background-color: white;">F</button>
                <button id="F#" class="hr-2 w-20" style="background-color: white;">F#</button>
                <button id="G" class="hr-2 w-20" style="background-color: white;">G</button>
                <button id="G#" class="hr-2 w-20" style="background-color: white;">G#</button>
                <button id="A" class="hr-2 w-20" style="background-color: white;">A</button>
                <button id="A#" class="hr-2 w-20" style="background-color: white;">A#</button>
                <button id="B" class="hr-2 w-20" style="background-color: white;">B</button>
                <button id="Graus" class="hr-2 w-20" style="background-color: white;">Graus</button>

            </div>
        </main>
    `,

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
                <textarea id="filtro_dados" class="f w-100 hr-20 ml-0 mt-02 borda-radius-5px borda-none pl-1"></textarea>
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
            
            await db
            .from('musicas')
            .update({ 
                nome: nome,
                tonalidade: tonalidade,
                conteudo: conteudo,
                momento: momento,
                favoritas: favoritas,
                finalizada: finalizada 
            }) 
            .eq('id', id);
            
            alert('Música Atualizada')
            await paginaMusica(id)
        })
    }
}

async function paginaMusica(id, tom = false){
    await iniciar_loading()
    
    await carregar_pagina({ nome: 'musica' })

    let r = await db
        .from('musicas')
        .select('id, versao, nome, tonalidade, momento,conteudo,favoritas,finalizada')
        .eq('id', id)  
    
    r =  r.data[0]

    let musica = r.nome
    
    let tonalidade = ''
    if(tom == false){
        tonalidade = r.tonalidade
    }
    else{
        tonalidade = ultimaConsulta.tonalidade
    }
    
    let conteudo = tratarQuebrasDeLinha ( r.conteudo )
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
    finalizar_loading()
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
                fim = 's'
            }
            if ( ( posicao + deslocamento ) < 0 && fim == 'n' ){
                nova_posicao = posicao + deslocamento 
                nova_posicao += 12
                fim = 's'
            }
                                
            if ( nova_posicao == ''  && fim == 'n' ) {
                nova_posicao = posicao + deslocamento 
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
