/* ==========================================================================
   Control Unificado de Tema (Diurno / Nocturno)
   Compartido entre la página principal, consulta de mes y relación de gastos.
   ========================================================================== */
(() => {
    const STORAGE_KEY = 'residencia-canaima-theme';
    const root = document.documentElement;

    function safeGet() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    function safeSet(val) {
        try {
            localStorage.setItem(STORAGE_KEY, val);
        } catch (e) {}
    }

    function obtenerTema() {
        const guardado = safeGet();
        if (guardado === 'dark' || guardado === 'light') {
            return guardado;
        }
        return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
            ? 'dark'
            : 'light';
    }

    function sincronizarUI(tema) {
        const botonesFlotantes = document.querySelectorAll('.theme-toggle');
        botonesFlotantes.forEach((btn) => {
            const icono = btn.querySelector('.theme-toggle-icon');
            if (tema === 'dark') {
                if (icono) icono.textContent = '☀️';
                btn.setAttribute('aria-label', 'Cambiar a modo diurno');
                btn.setAttribute('title', 'Modo diurno');
            } else {
                if (icono) icono.textContent = '🌙';
                btn.setAttribute('aria-label', 'Cambiar a modo nocturno');
                btn.setAttribute('title', 'Modo nocturno');
            }
        });

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', tema === 'dark' ? '#121714' : '#dde9e2');
        }
    }

    function aplicarTema(tema, persistir = true) {
        root.setAttribute('data-theme', tema);
        if (persistir) {
            safeSet(tema);
        }
        sincronizarUI(tema);
    }

    // Aplicación inmediata antes del primer pintado para evitar parpadeos
    aplicarTema(obtenerTema(), false);

    // Delegación única para cualquier botón de tema (.theme-toggle o #themeToggleBtn)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('#themeToggleBtn, .theme-toggle');
        if (!btn) return;
        const nuevoTema = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        aplicarTema(nuevoTema, true);
    });

    function inicializar() {
        sincronizarUI(obtenerTema());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        inicializar();
    }

    // Soporte para navegación atrás/adelante (BFCache) y sincronización entre pestañas
    window.addEventListener('pageshow', () => aplicarTema(obtenerTema(), false));
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
            aplicarTema(e.newValue, false);
        }
    });
})();
