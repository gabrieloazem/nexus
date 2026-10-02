// ================= MAIN (carregador com versão única) =================
// A versão vem da URL deste próprio arquivo no index.html:
//     <script src="src/main.js?v=01"></script>
// Todos os outros arquivos são carregados com o MESMO ?v=, então
// mudar só o número no index.html força o navegador a baixar tudo de novo.
(function () {
    const atual = document.currentScript;
    const url = new URL(atual.src, location.href);
    const VERSION = url.searchParams.get('v') || 'dev';
    const BASE = url.href.slice(0, url.href.lastIndexOf('/') + 1);

    // Ordem importa: core primeiro, backup por último.
    const ARQUIVOS = [
        'core.js',
        'dashboard.js',
        'tarefas.js',
        'anotacoes.js',
        'financas.js',
        'aniversarios.js',
        'musicas.js',
        'senhas.js',
        'backup.js'
    ];

    window.NEXUS_VERSION = VERSION;

    function carregar(arquivo) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = `${BASE}${arquivo}?v=${encodeURIComponent(VERSION)}`;
            s.onload = resolve;
            s.onerror = () => reject(new Error(`Falha ao carregar ${arquivo}`));
            document.body.appendChild(s);
        });
    }

    async function iniciar() {
        for (const arquivo of ARQUIVOS) {
            await carregar(arquivo); // sequencial: mantém a ordem de dependência
        }
        initApp();
        initBackup();
        console.info(`Nexus v${VERSION} carregado`);
    }

    function iniciarQuandoPronto() {
        iniciar().catch(err => {
            console.error(err);
            const aviso = document.createElement('div');
            aviso.style.cssText = 'position:fixed;inset:auto 0 0 0;padding:12px;background:#dc2626;color:#fff;font:14px sans-serif;z-index:9999;text-align:center';
            aviso.textContent = `${err.message}. Recarregue a página (Ctrl+F5).`;
            document.body.appendChild(aviso);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarQuandoPronto);
    } else {
        iniciarQuandoPronto();
    }
})();
