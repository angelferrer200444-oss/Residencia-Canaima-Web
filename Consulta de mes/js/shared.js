/* ==========================================================================
   Utilidades y constantes compartidas para Consulta de Mes y Relación de Gastos
   ========================================================================== */
window.CanaimaGastos = (() => {
    const TIPOS_PERMITIDOS = ["bolivares", "divisas", "daru"];

    const MESES = [
        { value: "enero", label: "Enero" },
        { value: "febrero", label: "Febrero" },
        { value: "marzo", label: "Marzo" },
        { value: "abril", label: "Abril" },
        { value: "mayo", label: "Mayo" },
        { value: "junio", label: "Junio" },
        { value: "julio", label: "Julio" },
        { value: "agosto", label: "Agosto" },
        { value: "septiembre", label: "Septiembre" },
        { value: "octubre", label: "Octubre" },
        { value: "noviembre", label: "Noviembre" },
        { value: "diciembre", label: "Diciembre" }
    ];

    const MESES_VALIDOS = MESES.map((m) => m.value);

    function obtenerTipoValido(parametros) {
        const tipo = parametros.get("tipo") || "bolivares";
        return TIPOS_PERMITIDOS.includes(tipo) ? tipo : "bolivares";
    }

    function obtenerAnioValido(valor, fallback = 2026) {
        const anio = parseInt(valor, 10);
        if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) {
            return fallback;
        }
        return anio;
    }

    function cerrarMenusDesplegables(excepto = null) {
        const selectores = [
            { menu: ".period-select-menu", trigger: ".period-select-btn" },
            { menu: "#sort-menu", trigger: "#sort-button" }
        ];

        selectores.forEach(({ menu: menuSel, trigger: btnSel }) => {
            document.querySelectorAll(`${menuSel}:not([hidden])`).forEach((menu) => {
                if (menu === excepto) return;
                menu.hidden = true;
                const contenedor = menu.parentElement;
                const btn = contenedor ? contenedor.querySelector(btnSel) : null;
                if (btn) {
                    btn.setAttribute("aria-expanded", "false");
                }
            });
        });
    }

    let cierreGlobalVinculado = false;

    function vincularCierreMenus() {
        if (cierreGlobalVinculado) return;
        cierreGlobalVinculado = true;

        document.addEventListener("click", (e) => {
            if (
                !e.target.closest(".period-select-container") &&
                !e.target.closest(".sort-container")
            ) {
                cerrarMenusDesplegables(null);
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                cerrarMenusDesplegables(null);
            }
        });
    }

    return {
        TIPOS_PERMITIDOS,
        MESES,
        MESES_VALIDOS,
        obtenerTipoValido,
        obtenerAnioValido,
        cerrarMenusDesplegables,
        vincularCierreMenus
    };
})();
