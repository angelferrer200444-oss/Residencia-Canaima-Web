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

    const THEME_ICONS_SVG = `
        <svg class="sun-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg class="moon-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
    `;

    function sincronizarUI(tema) {
        document.querySelectorAll('.theme-toggle').forEach((btn) => {
            if (!btn.querySelector('.sun-icon') || !btn.querySelector('.moon-icon')) {
                btn.innerHTML = THEME_ICONS_SVG;
            }
        });

        document.querySelectorAll('#themeToggleBtn, .theme-toggle').forEach((btn) => {
            if (tema === 'dark') {
                btn.setAttribute('aria-label', 'Cambiar a modo diurno');
                btn.setAttribute('title', 'Modo diurno');
            } else {
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
