// ========================================
// CONTROL DE MODO NOCTURNO (SOL / LUNA)
// ========================================

(() => {
    const STORAGE_KEY = "residencia-canaima-theme";
    const root = document.documentElement;

    // Obtener tema almacenado o preferencia del sistema
    const obtenerTemaActual = () => {
        const guardado = localStorage.getItem(STORAGE_KEY);
        if (guardado === "dark" || guardado === "light") {
            return guardado;
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    // Aplicar tema en el HTML y actualizar icono del botón
    const aplicarTema = (tema) => {
        root.setAttribute("data-theme", tema);
        localStorage.setItem(STORAGE_KEY, tema);

        const botones = document.querySelectorAll(".theme-toggle");
        botones.forEach(boton => {
            const icono = boton.querySelector(".theme-toggle-icon");
            if (tema === "dark") {
                if (icono) icono.textContent = "☀️";
                boton.setAttribute("aria-label", "Cambiar a modo diurno");
                boton.setAttribute("title", "Modo diurno");
            } else {
                if (icono) icono.textContent = "🌙";
                boton.setAttribute("aria-label", "Cambiar a modo nocturno");
                boton.setAttribute("title", "Modo nocturno");
            }
        });

        // Actualizar barra de estado en móviles
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", tema === "dark" ? "#121714" : "#f1f7f1");
        }
    };

    // Ejecución inmediata para evitar destello blanco
    aplicarTema(obtenerTemaActual());

    // Al cargar el contenido interactivo
    document.addEventListener("DOMContentLoaded", () => {
        aplicarTema(obtenerTemaActual());

        const botones = document.querySelectorAll(".theme-toggle");
        botones.forEach(boton => {
            boton.addEventListener("click", () => {
                const temaActual = root.getAttribute("data-theme");
                const nuevoTema = temaActual === "dark" ? "light" : "dark";
                aplicarTema(nuevoTema);
            });
        });
    });
})();
