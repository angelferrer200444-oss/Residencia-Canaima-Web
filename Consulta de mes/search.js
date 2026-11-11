document.addEventListener("DOMContentLoaded", () => {

    const buscador = document.getElementById("search-movements");
    const tabla = document.querySelector(".ledger tbody");

    if (!buscador || !tabla) {
        console.error("No se encontró el buscador o la tabla.");
        return;
    }

    function buscarMovimientos() {

        const busqueda = buscador.value
            .trim()
            .toLocaleLowerCase("es");

        // Eliminar el aviso anterior, si existe.
        const avisoAnterior = tabla.querySelector(".search-empty-row");

        if (avisoAnterior) {
            avisoAnterior.remove();
        }

        const filas = Array.from(tabla.querySelectorAll("tr"));

        let resultados = 0;

        filas.forEach(fila => {

            // Ignorar filas que no sean movimientos.
            if (fila.classList.contains("empty-row")) {
                fila.style.display = busqueda ? "none" : "";
                return;
            }

            const descripcion = fila.cells[1];

            if (!descripcion) return;

            const texto = descripcion.textContent.toLocaleLowerCase("es");

            const coincide = texto.includes(busqueda);

            fila.style.display = coincide ? "" : "none";

            if (coincide) {
                resultados++;
            }

        });

        // Mostrar aviso cuando no hay coincidencias.
        if (busqueda !== "" && resultados === 0) {

            const filaAviso = document.createElement("tr");
            filaAviso.classList.add("search-empty-row");

            const celda = document.createElement("td");
            celda.colSpan = 6;
            celda.textContent = "No se encontraron movimientos.";

            filaAviso.appendChild(celda);
            tabla.appendChild(filaAviso);
        }
    }

    buscador.addEventListener("input", buscarMovimientos);

});
