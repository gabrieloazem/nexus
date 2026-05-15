class MyDatabase {
    constructor(endpoint = 'api/my_database.php') {
        this.endpoint = endpoint; // Endpoint padrão (sua API genérica)
        this.activeEndpoint = endpoint; // Endpoint que será usado na requisição atual
        this.queryData = {};
    }

    // Define a tabela e reseta o endpoint para o padrão
    from(table) {
        this.activeEndpoint = this.endpoint;
        this.queryData = {
            table: table,
            columns: '*',
            action: 'select',
            orderBy: null,
            updateData: null,
            filters: []
        };
        return this;
    }

    // NOVO MÉTODO: Acessa um endpoint específico para processamentos pesados
    rpc(url, params = {}) {
        this.activeEndpoint = url;
        this.queryData = {
            action: 'rpc',
            ...params // Permite enviar parâmetros extras se necessário
        };
        return this;
    }

    update(data) {
        this.queryData.action = 'update';
        this.queryData.updateData = data;
        return this;
    }

    insert(data) {
        this.queryData.action = 'insert';
        // O Supabase aceita um array de objetos [{}], vamos seguir o padrão
        this.queryData.insertData = Array.isArray(data) ? data : [data];
        return this;
    }

    delete() {
        this.queryData.action = 'delete';
        return this;
    }

    select(columns = '*') {
        this.queryData.columns = columns;
        return this;
    }

    ilike(column, value) {
        this.queryData.filters.push({
            column: column,
            value: value, // O valor já deve vir com os símbolos % de quem chama
            operator: 'LIKE' 
        });
        return this;
    }

    // Adiciona filtros de igualdade
    eq(column, value) {
        this.queryData.filters.push({
            column: column,
            value: value,
            operator: '='
        });
        return this;
    }

    // Adiciona suporte a filtros de lista (IN)
    in(column, values) {
        this.queryData.filters.push({
            column: column,
            value: values,
            operator: 'IN' 
        });
        return this;
    }

    // Exclusivo da API para agrupamento SQL
    groupBy(column) {
        this.queryData.groupBy = column;
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.queryData.orderBy = {
            column: column,
            order: ascending ? 'ASC' : 'DESC'
        };
        return this;
    }

    // Método que executa a requisição ao chegar no final da corrente (await)
    async then(resolve, reject) {
        try {
            const response = await fetch(this.activeEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.queryData)
            });
            const data = await response.json();
            
            // Importante: Resetamos para o endpoint padrão após a execução
            this.activeEndpoint = this.endpoint;
            
            resolve(data);
        } catch (error) {
            this.activeEndpoint = this.endpoint;
            reject(error);
        }
    }
}

const db = new MyDatabase();