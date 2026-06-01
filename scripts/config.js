let logado = 'N'
let senha = 'tsu'

const app = {

    id: {
        disciplina: null,
        pergunta: null
    },

    paginacao: {
        dados: [],
        quantidade: 0,
        ponteiro: 0,
    },

}

function obterDataAtual(){
    return new Date().toISOString().split('T')[0];
}

function tratarQuebrasDeLinha(texto) {
  if (!texto) return texto;
  // Usamos uma expressão regular com o sinalizador 'g' (global) 
  // para substituir todas as ocorrências na string.
  return texto.replace(/\\n/g, '\n');
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