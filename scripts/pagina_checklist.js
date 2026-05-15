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
            'atualizar_tarefas': self.atualizar_conteudo,
            'resetar_tarefas': self.resetar_tarefas,
            'apagar_anotacao': self.apagar_anotacao,
            'adicionar_categoria': self.adicionar_categoria,
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
            
            let registros = await db
                    .from('jeyo_anotacoes')
                    .select('nome') 
                    .order('nome', { ascending: true })

            document.getElementById('lista_de_categorias').innerHTML = '';

            for (let c1 = 0; c1 < registros.length; c1++) {
                let r = registros[c1];
                let categoria = r['nome'];

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

            let conteudo = resposta[0]['conteudo'];
                conteudo = tratarQuebrasDeLinha(conteudo)
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
            let anotacoes_sensiveis = [
                'Contas ( Jeyo )',
                'Contas ( Marcelo )',
            ]

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
                await paginas.checklist.funcoes.editar_tarefas()
            }
            
            if(modo_selecionado == 'Edição'){
                document.getElementById('registros_conteudo').style.display = 'none'
                paginas.checklist.funcoes.carregar_registros(0)
            }
            
        },

        async adicionar_categoria(){
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
        },

        async apagar_anotacao(){
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
        },

        async editar_tarefas(){
            let nome = document.getElementById('lista_de_categorias').value

            conteudo = await db
                    .from('jeyo_anotacoes')
                    .select('conteudo') 
                    .eq('nome', nome)
            
            conteudo = conteudo[0]['conteudo']
            
            document.getElementById('registros').style.display = 'none'
            document.getElementById('registros_conteudo').style.display = 'block'    
            document.getElementById('registros_conteudo').value = conteudo
            document.getElementById('modo_selecionado').innerHTML = 'Edição'
            
        },

        async atualizar_conteudo(){
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
        },

        async resetar_tarefas(){
            let tarefas_novas = ''
            let nome = document.getElementById('lista_de_categorias').value

            let conteudo = await db
                .from('jeyo_anotacoes')
                .select('conteudo')                     // Aqui você lista as colunas separadas por vírgula
                .eq('nome', nome)    
            
            conteudo = conteudo[0]['conteudo']
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
        
    }   
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