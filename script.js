document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONFIGURACIÓN
    // ========================================

    const ARCHIVO_DATOS = "./datos.txt";
    const tabla = document.querySelector(".ledger tbody");

    // ========================================
    // MENSAJES DE ESTADO
    // ========================================

    function mostrarMensaje(mensaje) {
        tabla.innerHTML = "";

        const fila = document.createElement("tr");
        fila.classList.add("empty-row");

        const celda = document.createElement("td");
        celda.colSpan = 6;
        celda.textContent = mensaje;

        fila.appendChild(celda);
        tabla.appendChild(fila);
    }

    // ========================================
    // CARGAR MOVIMIENTOS
    // ========================================

    async function cargarMovimientos() {

        try {
            const respuesta = await fetch(ARCHIVO_DATOS);

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const contenido = await respuesta.text();

            console.log("Contenido recibido:", JSON.stringify(contenido));

            mostrarMovimientos(contenido);

        } catch (error) {
            console.error("Error al cargar los movimientos:", error);
            mostrarMensaje("No se pudieron cargar los movimientos.");
        }
    }

    // ========================================
    // MOSTRAR MOVIMIENTOS
    // ========================================

    function mostrarMovimientos(contenido) {

        const lineas = contenido
            .replace(/^\uFEFF/, "")
            .split(/\r?\n/)
            .filter(linea => linea.trim() !== "");

        tabla.innerHTML = "";

        if (lineas.length === 0) {
            mostrarMensaje("Todavía no hay movimientos registrados.");
            return;
        }

        let movimientosValidos = 0;

        lineas.forEach(linea => {

            const datos = linea.split(";").map(dato => dato.trim());

            if (datos.length !== 6) {
                console.warn("Línea ignorada:", linea, "Campos:", datos.length);
                return;
            }

            const [fecha, descripcion, ingreso, egreso, saldo, tasa] = datos;

            const fila = document.createElement("tr");

            [fecha, descripcion, ingreso, egreso, saldo, tasa]
                .forEach((valor, indice) => {

                    const celda = document.createElement("td");

                    celda.textContent = (valor === "0" || valor === "—") ? "" : valor;

                    if (indice >= 2) {
                        celda.classList.add("number");
                    }

                    fila.appendChild(celda);
                });

            tabla.appendChild(fila);
            movimientosValidos++;

        });

        if (movimientosValidos === 0) {
            mostrarMensaje("Se encontró el archivo, pero sus movimientos tienen un formato incorrecto.");
        }

        console.log("Movimientos cargados:", movimientosValidos);
    }

    // ========================================
    // INICIAR
    // ========================================

    cargarMovimientos();

});