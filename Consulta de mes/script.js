document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONFIGURACIÓN
    // ========================================

    const ARCHIVO_DATOS = "./datos.txt";
    const tabla = document.querySelector(".ledger tbody");
    const resumen = document.querySelectorAll(".summary-item strong");

    // Estado del período seleccionado
    let mesSel  = "febrero";
    let anioSel = "2026";

    let lineasCache = [];

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
            lineasCache = contenido
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .filter(linea => linea.trim() !== "");

            mostrarMovimientos(lineasCache);
            mostrarResumen(lineasCache);

        } catch (error) {
            console.error("Error al cargar los datos:", error);
            mostrarMensaje("No se pudieron cargar los movimientos.");
        }
    }

    // ========================================
    // CONTROL DE PERÍODO — DROPDOWNS CUSTOM
    // ========================================

    function actualizarPeriodo() {
        if (mesSel === "febrero" && anioSel === "2026") {
            if (lineasCache.length > 0) {
                mostrarMovimientos(lineasCache);
                mostrarResumen(lineasCache);
            } else {
                cargarDatos();
            }
        } else {
            // Capitalizar el nombre del mes para el mensaje
            const nombreMes = mesSel.charAt(0).toUpperCase() + mesSel.slice(1);
            mostrarMensaje(`Todavía no hay movimientos registrados para ${nombreMes} ${anioSel}.`);

            if (resumen && resumen.length) {
                resumen.forEach(item => { item.textContent = "—"; });
            }
        }
    }

    function cerrarTodosLosMenus(excepto) {
        document.querySelectorAll(".period-select-menu:not([hidden])").forEach(menu => {
            if (menu !== excepto) {
                menu.hidden = true;
                const btn = menu.previousElementSibling;
                if (btn) btn.setAttribute("aria-expanded", "false");
            }
        });
    }

    function iniciarDropdownPeriodo(containerId, menuId, btnId, onSelect) {
        const container = document.getElementById(containerId);
        const menu      = document.getElementById(menuId);
        const btn       = document.getElementById(btnId);
        if (!container || !menu || !btn) return;

        // Abrir / cerrar al pulsar el botón
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const abierto = !menu.hidden;
            cerrarTodosLosMenus(null);
            menu.hidden = abierto;
            btn.setAttribute("aria-expanded", String(!abierto));
        });

        // Seleccionar opción
        menu.addEventListener("click", (e) => {
            const opcion = e.target.closest(".period-select-option");
            if (!opcion) return;

            const valor = opcion.dataset.value;
            const texto = opcion.textContent.trim();

            // Marcar seleccionada
            menu.querySelectorAll(".period-select-option").forEach(o => o.classList.remove("is-selected"));
            opcion.classList.add("is-selected");

            // Actualizar texto del botón
            const textSpan = btn.querySelector(".period-select-text");
            if (textSpan) textSpan.textContent = texto;

            // Cerrar menú
            menu.hidden = true;
            btn.setAttribute("aria-expanded", "false");

            onSelect(valor);
        });

        // Cerrar con teclado
        container.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                menu.hidden = true;
                btn.setAttribute("aria-expanded", "false");
                btn.focus();
            }
        });
    }

    iniciarDropdownPeriodo(
        "mes-select-container", "mes-select-menu", "mes-select-btn",
        (valor) => { mesSel = valor; actualizarPeriodo(); }
    );

    iniciarDropdownPeriodo(
        "anio-select-container", "anio-select-menu", "anio-select-btn",
        (valor) => { anioSel = valor; actualizarPeriodo(); }
    );

    // Cerrar menús al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".period-select-container")) {
            cerrarTodosLosMenus(null);
        }
    });

    cargarDatos();

});
