async function iniciar_sistema(){
    criar_pagina({
        layout: 'atual',
        marca: { tipo: 'imagem', imagem: 'imagens/logo.png' },
        atalhos_mobile: [
            {nome: 'Início', icone: 'casa1', onClick: async() => { carregar_pagina({ nome: 'inicio' }) } },  
            {nome: 'Tarefas', icone: 'checklist1', onClick: async() => { carregar_pagina({ nome: 'checklist' }) } }, 
            {nome: 'Finanças', icone: 'dinheiro1', onClick: async() => { carregar_pagina({ nome: 'financas' }) }  },
            {nome: 'Músicas', icone: 'musica1', onClick: async() => { carregar_pagina({ nome: 'musicas' }) } }, 
            {nome: 'Perfil', icone: 'config1' }
        ]
    })

    document.getElementById('menu_hamburguer').addEventListener('click', async() => {
        await carregar_pagina({nome: 'menu_mobile'})
    })

    await carregar_pagina({ nome: 'checklist' })
} 

iniciar_sistema()
