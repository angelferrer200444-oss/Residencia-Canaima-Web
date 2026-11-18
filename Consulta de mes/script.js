document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONFIGURACIÓN
    // ========================================

    const ARCHIVO_DATOS = "./datos.txt";
    const tabla = document.querySelector(".ledger tbody");
    const resumen = document.querySelectorAll(".summary-item strong");

    // ========================================
    // MENSAJES DE ESTADO
    // ========================================

    function mostrarMensaje(mensaje) {
        tabla.innerHTML = "";

        const fila = document.createElement("tr");
        fila.classList.add("empty-row");

        const celda = document.createElement("td");
        celda.colSpan = 7;
        celda.textContent = mensaje;

        fila.appendChild(celda);
        tabla.appendChild(fila);
    }

    // ========================================
    // MOSTRAR MOVIMIENTOS
    // ========================================

    function mostrarMovimientos(lineas) {
        tabla.innerHTML = "";

        if (lineas.length === 0) {
            mostrarMensaje("Todavía no hay movimientos registrados.");
            return;
        }

        let movimientosValidos = 0;

        lineas.forEach(linea => {
            const datos = linea.split(";").map(dato => dato.trim());

            // Ignorar registros de control y resumen
            if (datos[0] === "CIERRE" || datos[0] === "RESUMEN") {
                return;
            }

            if (datos.length < 6 || datos.length > 7) {
                console.warn("Línea ignorada:", linea);
                return;
            }

            const [fecha, descripcion, ingreso, egreso, saldo, tasa] = datos;
            const fila = document.createElement("tr");

            [fecha, descripcion, ingreso, egreso, saldo, tasa].forEach((valor, indice) => {
                const celda = document.createElement("td");
                celda.textContent = (valor === "0" || valor === "—") ? "" : valor;

                if (indice >= 2) {
                    celda.classList.add("number");
                }

                fila.appendChild(celda);
            });

            // Celda de factura
            const celdaFactura = document.createElement("td");
            celdaFactura.classList.add("invoice-cell");
            fila.appendChild(celdaFactura);

            tabla.appendChild(fila);
            movimientosValidos++;
        });

        if (movimientosValidos === 0) {
            mostrarMensaje("Se encontró el archivo, pero sus movimientos tienen un formato incorrecto.");
        }
    }

    // ========================================
    // MOSTRAR RESUMEN FINANCIERO
    // ========================================

    function mostrarResumen(lineas) {
        if (!resumen || resumen.length < 5) return;

        lineas.forEach(linea => {
            const datos = linea.split(";").map(dato => dato.trim());

            if (datos[0] === "RESUMEN" && datos.length >= 6) {
                resumen[0].textContent = datos[1];
                resumen[1].textContent = datos[2];
                resumen[2].textContent = datos[3];
                resumen[3].textContent = datos[4];
                resumen[4].textContent = datos[5];
            }
        });
    }

    // ========================================
    // CARGAR DATOS (Lectura única)
    // ========================================

    async function cargarDatos() {
        try {
            const respuesta = await fetch(ARCHIVO_DATOS);

            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const contenido = await respuesta.text();
            const lineas = contenido
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .filter(linea => linea.trim() !== "");

            mostrarMovimientos(lineas);
            mostrarResumen(lineas);

        } catch (error) {
            console.error("Error al cargar los datos:", error);
            mostrarMensaje("No se pudieron cargar los movimientos.");
        }
    }

    cargarDatos();

});
