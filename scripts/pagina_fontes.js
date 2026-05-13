paginas['fontes'] = {
    eventos: () => {

    criar_elemento({
        tipo: 'div',
        classes: 'f df-c-c w-98 ml-1 hr-3 font-105',
        texto: 'Fontes',
        destino: ['conteudo']
    })
    
    let fontes = [
    // ==== Sans-serif ====
    'arial',
    'cabin',
    'quicksand',
    'segoe_ui',
    'pacifico',
    'inter',
    'helvetica',
    'verdana',
    'tahoma',
    'trebuchet_ms',
    'gill_sans',
    'roboto',
    'ubuntu',
    'san_francisco',
    
    // ==== Serif ====
    'times_new_roman',
    'georgia',
    'garamond',
    'palatino_linotype',
    'book_antiqua',
    
    // ==== Monospace ====
    'courier_new',
    'consolas',
    'lucida_console',
    'monaco',
    
    // ==== Cursive ====
    'comic_sans_ms',
    'brush_script_mt',
    'apple_chancery',
    
    // ==== Fantasy ====
    'impact',
    'copperplate',
    'luminari',
    
    'montserrat'
    ]

    for(c1 = 0; c1 < fontes.length; c1 ++){
        let fonte = fontes[c1]
        console.log(fonte)
        
        criar_elemento({
            tipo: 'div',
            classes: `f df-c-e w-47 pl-1 ml-1 hr-2 font-${fonte} texto-centralizado borda-gray mt-02`,
            texto: `Hello World - ( ${fonte} )`,
            legenda: [fonte,'abaixo'],
            destino: ['conteudo']
        })
        
    }
    }
}