const supabase_url = 'https://zdriboihloujzdjgtbmq.supabase.co'
let supabase_key = localStorage.getItem('supabase_key')
let db

async function iniciar_database() {
    let chave_valida = false;

    while (!chave_valida) {
        if (!supabase_key) {
            supabase_key = prompt("🔒 Informe a senha para acessar o sistema");
            if (!supabase_key) continue;
        }

        const cliente_teste = supabase.createClient(supabase_url, supabase_key);
        
        // O sistema "trava" aqui esperando o Supabase responder
        const { data, error } = await cliente_teste.from(backup_sql_tabelas[0]).select('id').limit(1);

        if (error) {
            alert("❌ Senha inválida !\n\nTente novamente.");
            supabase_key = null;
            localStorage.removeItem('supabase_key');
        } else {
            localStorage.setItem('supabase_key', supabase_key);
            db = cliente_teste; // Define o db global
            chave_valida = true;
            return db; // Sai da função com o banco pronto
        }
    }
}

let backup_sql_tabelas = [
    'jeyo_anotacoes',
    'jeyo_tarefa',
    'musicas',
    'questoes',
    'recursos',
    'tempo_livre',
    'tempo_livre_dicas',
    'tempo_livre_desafios'
];

async function backup_sql() {
    console.log("### Iniciando Backup Unificado...");
    
    let conteudo_sql_final = `-- BACKUP UNIFICADO SUPABASE\n`;
    conteudo_sql_final += `-- Gerado em: ${new Date().toLocaleString()}\n\n`;

    for (const nome_tabela of backup_sql_tabelas) {
        console.log(`Processando tabela: ${nome_tabela}`);
        
        let dados_tabela = [];
        let inicio = 0;
        let limite = 999;
        let continua = true;

        // Loop de Paginação para cada tabela
        while (continua) {
            const { data, error } = await db
                .from(nome_tabela)
                .select('*')
                .range(inicio, inicio + limite)
                .order('id', { ascending: true });

            if (error) {
                console.error(`Erro na tabela ${nome_tabela}:`, error);
                continua = false;
                continue;
            }

            if (data && data.length > 0) {
                dados_tabela = [...dados_tabela, ...data];
                inicio += limite + 1;
                if (data.length < limite + 1) continua = false;
            } else {
                continua = false;
            }
        }

        // Se a tabela tiver dados, gera o bloco de INSERT
        if (dados_tabela.length > 0) {
            const colunas = Object.keys(dados_tabela[0]).join(", ");
            
            conteudo_sql_final += `-- Tabela: ${nome_tabela}\n`;
            conteudo_sql_final += `INSERT INTO ${nome_tabela} (${colunas}) VALUES\n`;

            const linhasValores = dados_tabela.map(obj => {
                const valores = Object.values(obj).map(valor => {
                    if (valor === null) return "NULL";
                    if (typeof valor === "number") return valor;
                    return `'${String(valor).replace(/'/g, "''")}'`;
                }).join(", ");
                return `(${valores})`;
            });

            conteudo_sql_final += linhasValores.join(",\n") + ";\n\n";
            
            // Comando para resetar a sequência do ID (IDENTITY) após o insert
            conteudo_sql_final += `SELECT setval(pg_get_serial_sequence('${nome_tabela}', 'id'), MAX(id)) FROM ${nome_tabela};\n\n`;
        }
    }

    // --- GERAÇÃO DO NOME DO ARQUIVO (data-mes-dia-hora-minuto-segundo) ---
    const agora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    
    const nome_arquivo = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())}-` +
                         `${pad(agora.getHours())}-${pad(agora.getMinutes())}-${pad(agora.getSeconds())}-database-supabase.sql`;

    // --- DISPARO DO DOWNLOAD ÚNICO ---
    const blob = new Blob([conteudo_sql_final], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = nome_arquivo;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`### Backup Concluído: ${nome_arquivo}`);
}