paginas['cores'] = {
    eventos: () => {
        palhetas = []

        palhetas.push([
            // 🟢 VERDES (do mais escuro → mais claro)
            '#014e53',
            '#024c51',
            '#046d6c',
            '#006A71',
            '#048d6c',
            '#488b85',
            '#46A4A5',
            '#48A6A7',
            '#19e0cd',
            '#399d2d',
            '#42c505',
            '#01f86b',
            'green',
            
        // 🔵 AZUIS
        '#648DB3',
        '#9fd1e7',
        '#0a1c3f',
        '#0a1c3fd6',
        '#0a2745',
        '#123458',
        '#13335a',
        '#174276',
        '#213448',
        '#2563eb',
        '#27548A',
        '#2f71d7',
        '#3484ac',
        '#3674B5',
        '#3a9cca',
        '#40b4e6',
        '#578FCA',
        '#7F8CAA',
        '#8cb8ed',
        '#e6f2ff',

        // 🟣 ROXOS E MAGENTAS
        '#432364',
        '#7e0a90',
        '#7965C1',
        '#c93964',
        '#CD4C72',
        '#CF0F47',
        '#E75480',
        '#FF69B4',
        '#FF9898',

        // 🔴/🟠 VERMELHOS E LARANJAS
        '#331F19',
        '#FB9E3A',
        '#FFD586',
        'orange',
        'red',

        // ⚪ NEUTROS / CINZAS / PRETOS
        '#1a1a1a',
        '#1C1C1C',
        '#222222',
        '#26262d',
        '#292929',
        '#2c3e50',
        '#374151',
        '#444040',
        '#545454',
        '#6b7280',
        '#C9C8C8',
        '#CBBBA7',
        '#CCD595',
        '#c1b9b9',
        '#d1d5db',
        '#e1dbdb',
        '#e5e7eb',
        '#eaf0f1',
        '#f0f0f0',
        '#f3f4f6',
        '#f4fbff',
        '#f5f5f5',
        '#f9fafb',
        'gray',
        '#ccc',
        'black',

        // 🟡 AMARELOS / BEGES
        '#D4C9BE',
        '#F1EFEC',
        '#F2EFE7',
        '#F4FBFF',

        // ⚪ BRANCOS E TRANSPARÊNCIAS
        'white',
        '#FFFFFF1A',
        '#FFFFFF66',
        'transparent',
        'blue',
        ])

        for(c1 = 0; c1 < palhetas.length; c1 ++){
            inserir_html({ html: `
                <div class = 'f df-c-c w-98 ml-1 hr-3 font-105'> Cores </div>
            `})
            
            for(c2 = 0; c2 < palhetas[c1].length; c2 ++){
                var texto = 'white'
                var cor = palhetas[c1][c2]
                if( [
                        'white',
                        '',
                        '#FFFFFF1A',
                        '#F1EFEC',
                        '#D4C9BE',
                        '#FFFFFF66',
                        '#e6f2ff',
                        'transparent',
                        '#eaf0f1',
                        '#f0f0f0',
                        '#f3f4f6',
                        '#f4fbff',
                        '#f5f5f5',
                        '#f9fafb',
                        '#F2EFE7',
                        '#F4FBFF',
                        '#e5e7eb'
                    ].includes(cor) ){
                    texto = 'black'
                }

                inserir_html({ html: `
                    <div class = 'f df-c-c w-48 ml-1 hr-2 bg-${cor.replace('#','')} cor-${texto} texto-centralizado borda-gray mt-02'> 
                        ${cor} 
                    </div>
                `})
                
            }
        }
    }
}