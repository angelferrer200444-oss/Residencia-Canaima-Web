document.addEventListener("DOMContentLoaded", () => {

    const tabla = document.querySelector(".ledger tbody");
    const boton = document.getElementById("sort-button");
    const menu = document.getElementById("sort-menu");

    if (!tabla || !boton || !menu) {
        console.error("No se encontraron los elementos de ordenamiento.");
        return;
    }

    // ========================================
    // ABRIR Y CERRAR EL MENÚ
    // ========================================

    boton.addEventListener("click", () => {

        const abierto = !menu.hidden;

        menu.hidden = abierto;
        boton.setAttribute("aria-expanded", String(!abierto));

    });

    // Cerrar al hacer clic fuera del menú.
    document.addEventListener("click", evento => {

        if (!boton.contains(evento.target) &&
            !menu.contains(evento.target)) {

            menu.hidden = true;
            boton.setAttribute("aria-expanded", "false");

        }

    });

    // Cerrar con Escape.
    document.addEventListener("keydown", evento => {

        if (evento.key === "Escape") {
            menu.hidden = true;
            boton.setAttribute("aria-expanded", "false");
        }

    });

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

        menu.hidden = true;
        boton.setAttribute("aria-expanded", "false");

    });

});
