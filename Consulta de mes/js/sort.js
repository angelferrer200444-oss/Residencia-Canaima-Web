document.addEventListener("DOMContentLoaded", () => {

    const tabla = document.querySelector(".ledger tbody");
    const boton = document.getElementById("sort-button");
    const menu = document.getElementById("sort-menu");

    if (!tabla || !boton || !menu) {
        console.error("No se encontraron los elementos de ordenamiento.");
        return;
    }

    const { cerrarMenusDesplegables, vincularCierreMenus } = window.CanaimaGastos;

    // Marcar el orden por defecto (fecha: más antiguo → más reciente)
    boton.classList.add("is-active");
    const opcionPorDefecto = menu.querySelector('.sort-option[data-sort="fecha-asc"]');
    if (opcionPorDefecto) opcionPorDefecto.classList.add("is-selected");

    // ========================================
    // ABRIR Y CERRAR EL MENÚ
    // ========================================

    boton.addEventListener("click", (e) => {
        e.stopPropagation();
        const abierto = !menu.hidden;
        cerrarMenusDesplegables(null);
        menu.hidden = abierto;
        boton.setAttribute("aria-expanded", String(!abierto));
    });

    vincularCierreMenus();

    // ========================================
    // CONVERTIR CIFRAS A NÚMEROS
    // ========================================

    function convertirNumero(texto) {

        if (!texto) return 0;

        return Number(
            texto.trim()
                .replace(/\./g, "")
                .replace(",", ".")
        ) || 0;

    }

    // ========================================
    // ORDENAR MOVIMIENTOS
    // ========================================

    function ordenarMovimientos(tipo) {

        const filas = Array.from(tabla.querySelectorAll("tr"));

        const movimientos = filas.filter(fila => {

            return !fila.classList.contains("empty-row") &&
                   !fila.classList.contains("search-empty-row");

        });

        movimientos.sort((a, b) => {

            const fechaA = Number(a.cells[0]?.textContent.trim()) || 0;
            const fechaB = Number(b.cells[0]?.textContent.trim()) || 0;

            const descripcionA = a.cells[1]?.textContent.trim() || "";
            const descripcionB = b.cells[1]?.textContent.trim() || "";

            const ingresosA = convertirNumero(a.cells[2]?.textContent);
            const ingresosB = convertirNumero(b.cells[2]?.textContent);

            const egresosA = convertirNumero(a.cells[3]?.textContent);
            const egresosB = convertirNumero(b.cells[3]?.textContent);

            switch (tipo) {

                case "fecha-asc":
                    return fechaA - fechaB;

                case "fecha-desc":
                    return fechaB - fechaA;

                case "ingresos":
                    return ingresosB - ingresosA;

                case "egresos":
                    return egresosB - egresosA;

                case "descripcion-asc":
                    return descripcionA.localeCompare(descripcionB, "es");

                case "descripcion-desc":
                    return descripcionB.localeCompare(descripcionA, "es");

                default:
                    return 0;
            }

        });

        // Conservar el aviso de búsqueda, si existe.
        const aviso = tabla.querySelector(".search-empty-row");

        movimientos.forEach(fila => {
            tabla.appendChild(fila);
        });

        if (aviso) {
            tabla.appendChild(aviso);
        }

    }

    // ========================================
    // DETECTAR LA OPCIÓN SELECCIONADA
    // ========================================

    menu.addEventListener("click", evento => {

        const opcion = evento.target.closest(".sort-option");

        if (!opcion) return;

        const tipo = opcion.dataset.sort;

        ordenarMovimientos(tipo);

        // Marcar la opción activa
        menu.querySelectorAll(".sort-option").forEach(o => o.classList.remove("is-selected"));
        opcion.classList.add("is-selected");

        // Resaltar el botón de ordenamiento para indicar que hay un orden activo
        boton.classList.add("is-active");

        menu.hidden = true;
        boton.setAttribute("aria-expanded", "false");

    });

});
