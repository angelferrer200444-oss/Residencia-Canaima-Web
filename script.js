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

            // Ignorar registros especiales
            if (datos[0] === "CIERRE" || datos[0] === "RESUMEN") {
                return;
            }

            if (datos.length !== 6) {
                console.warn("Línea ignorada:", linea);
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

    // ========================================
    // CARGAR CIERRE Y RESUMEN FINANCIERO
    // ========================================

    async function cargarResumenFinanciero() {

        try {

            const respuesta = await fetch("./datos.txt");

            if (!respuesta.ok) {
                throw new Error("No se pudo cargar el resumen.");
            }

            const contenido = await respuesta.text();

            const lineas = contenido
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .filter(linea => linea.trim() !== "");

            const cierre = document.querySelector(".closing-line strong");
            const resumen = document.querySelectorAll(".summary-item strong");

            lineas.forEach(linea => {

                const datos = linea.split(";").map(dato => dato.trim());

                // SALDO DE CIERRE
                if (datos[0] === "CIERRE" && datos.length >= 3) {

                    if (cierre) {
                        cierre.textContent = datos[2];
                    }

                }

                // RESUMEN FINANCIERO
                if (datos[0] === "RESUMEN" && datos.length >= 6) {

                    if (resumen.length >= 5) {

                        resumen[0].textContent = datos[1];
                        resumen[1].textContent = datos[2];
                        resumen[2].textContent = datos[3];
                        resumen[3].textContent = datos[4];
                        resumen[4].textContent = datos[5];

                    }

                }

            });

        } catch (error) {

            console.error("Error al cargar el resumen financiero:", error);

        }

    }

    // Ejecutar función
    cargarResumenFinanciero();

});