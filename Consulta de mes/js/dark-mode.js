// ========================================
// CONTROL ROBUSTO DE MODO NOCTURNO (SOL / LUNA)
// ========================================

(() => {
    const STORAGE_KEY = "residencia-canaima-theme";
    const root = document.documentElement;

    const safeGet = () => {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    };

    const safeSet = (val) => {
        try {
            localStorage.setItem(STORAGE_KEY, val);
        } catch (e) {}
    };

    const obtenerTema = () => {
        const guardado = safeGet();
        if (guardado === "dark" || guardado === "light") {
            return guardado;
        }
        return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";
    };

    const sincronizarBotones = (tema) => {
        // Si el botón no existe en el DOM por caché de navegador, se crea e inyecta automáticamente
        if (!document.querySelector(".theme-toggle") && document.body) {
            const btn = document.createElement("button");
            btn.className = "theme-toggle";
            btn.type = "button";
            btn.innerHTML = '<span class="theme-toggle-icon" aria-hidden="true">🌙</span>';
            document.body.appendChild(btn);
        }

        const botones = document.querySelectorAll(".theme-toggle");
        botones.forEach(btn => {
            const icono = btn.querySelector(".theme-toggle-icon");
            if (tema === "dark") {
                if (icono) icono.textContent = "☀️";
                btn.setAttribute("aria-label", "Cambiar a modo diurno");
                btn.setAttribute("title", "Modo diurno");
            } else {
                if (icono) icono.textContent = "🌙";
                btn.setAttribute("aria-label", "Cambiar a modo nocturno");
                btn.setAttribute("title", "Modo nocturno");
            }
        });

        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", tema === "dark" ? "#121714" : "#f1f7f1");
        }
    };

    const aplicarTema = (tema) => {
        root.setAttribute("data-theme", tema);
        safeSet(tema);
        sincronizarBotones(tema);
    };

    // 1. Aplicación inmediata en el tag <html> para evitar cualquier parpadeo
    const temaInicial = obtenerTema();
    root.setAttribute("data-theme", temaInicial);

    // 2. Delegación de eventos para clics (funciona siempre sin importar el ciclo de vida del DOM)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".theme-toggle");
        if (!btn) return;
        const actual = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        aplicarTema(actual);
    });

    // 3. Inicialización cuando el DOM esté listo o si ya cargó
    const inicializar = () => {
        aplicarTema(obtenerTema());
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializar);
    } else {
        inicializar();
    }

    // 4. Soporte para navegación atrás/adelante (BFCache del navegador)
    window.addEventListener("pageshow", () => {
        aplicarTema(obtenerTema());
    });

    // 5. Sincronización en tiempo real entre pestañas
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
            aplicarTema(e.newValue);
        }
    });
})();
