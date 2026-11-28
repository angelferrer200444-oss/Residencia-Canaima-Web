document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONFIGURACIÓN
    // ========================================

    const {
        MESES,
        MESES_VALIDOS,
        obtenerTipoValido,
        obtenerAnioValido,
        cerrarMenusDesplegables,
        vincularCierreMenus
    } = window.CanaimaGastos;

    const parametros = new URLSearchParams(window.location.search);
    const tipo = obtenerTipoValido(parametros);

    const ARCHIVOS = {
        bolivares: "./js/datos.txt",
        divisas: "./js/datos-divisas.txt",
        daru: "./js/datos-daru.txt"
    };

    const CONFIGURACIONES = {
        bolivares: {
            nombre: "Bolívares",
            columnas: ["Fecha", "Descripción", "Ingreso", "Egreso", "Saldo", "Tasa", "Factura"],
            cantidad: 7,
            resumen: true,
            minDatos: 6,
            maxDatos: 7,
            camposTexto: 6,
            indiceFactura: 6,
            ocultarCeros: true,
            tieneNumeros: true
        },
        divisas: {
            nombre: "Divisas",
            columnas: ["Fecha", "Descripción", "Ingreso", "Egreso", "Saldo", "Factura"],
            cantidad: 6,
            resumen: true,
            minDatos: 6,
            maxDatos: 6,
            camposTexto: 5,
            indiceFactura: 5,
            ocultarCeros: true,
            tieneNumeros: true
        },
        daru: {
            nombre: "DARU",
            columnas: ["Fecha", "Descripción", "Factura"],
            cantidad: 3,
            resumen: false,
            minDatos: 3,
            maxDatos: 3,
            camposTexto: 2,
            indiceFactura: 2,
            ocultarCeros: false,
            tieneNumeros: false
        }
    };

    const configuracion = CONFIGURACIONES[tipo];

    const tabla = document.querySelector(".ledger tbody");
    const encabezados = document.getElementById("ledger-headers");
    const resumen = document.querySelectorAll(".summary-item strong");
    const seccionResumen = document.querySelector(".summary-section");
    const opcionesIngreso = document.querySelectorAll('[data-sort="ingresos"], [data-sort="egresos"]');

    let mesSel = parametros.get("mes") || "febrero";
    if (!MESES_VALIDOS.includes(mesSel)) {
        mesSel = "febrero";
    }

    let anioSel = String(obtenerAnioValido(parametros.get("anio"), 2026));
    let lineasCache = [];


    // ========================================
    // UTILIDADES DE DATOS Y UI
    // ========================================

    function parsearLinea(linea) {
        return linea.split(";").map((dato) => dato.trim());
    }

    function limpiarResumen() {
        if (!configuracion.resumen || !resumen) return;
        resumen.forEach((item) => {
            item.textContent = "—";
        });
    }

    function poblarOpcionesPeriodo() {
        const mesMenu = document.getElementById("mes-select-menu");
        const anioMenu = document.getElementById("anio-select-menu");

        if (mesMenu) {
            mesMenu.innerHTML = MESES.map(
                (m) => `<button type="button" class="period-select-option" data-value="${m.value}">${m.label}</button>`
            ).join("");
        }

        if (anioMenu) {
            const anios = Array.from({ length: 10 }, (_, idx) => 2026 + idx);
            anioMenu.innerHTML = anios.map(
                (anio) => `<button type="button" class="period-select-option" data-value="${anio}">${anio}</button>`
            ).join("");
        }
    }


    // ========================================
    // CONFIGURAR INTERFAZ
    // ========================================

    function configurarInterfaz() {
        encabezados.innerHTML = "";

        configuracion.columnas.forEach((nombre) => {
            const th = document.createElement("th");
            th.textContent = nombre;

            if (
                nombre === "Ingreso" ||
                nombre === "Egreso" ||
                nombre === "Saldo" ||
                nombre === "Tasa"
            ) {
                th.classList.add("number");
            }

            encabezados.appendChild(th);
        });

        if (seccionResumen) {
            seccionResumen.style.display = configuracion.resumen ? "" : "none";
        }

        opcionesIngreso.forEach((opcion) => {
            opcion.style.display = tipo === "daru" ? "none" : "";
        });

        document.title = `Residencia Canaima | Gastos ${configuracion.nombre}`;

        poblarOpcionesPeriodo();
        actualizarBotonesPeriodo();
    }


    // ========================================
    // ACTUALIZAR SELECTORES
    // ========================================

    function actualizarBotonesPeriodo() {
        const mesBtn = document.querySelector("#mes-select-btn .period-select-text");
        const anioBtn = document.querySelector("#anio-select-btn .period-select-text");

        if (mesBtn) {
            mesBtn.textContent = mesSel.charAt(0).toUpperCase() + mesSel.slice(1);
        }

        if (anioBtn) {
            anioBtn.textContent = anioSel;
        }

        document.querySelectorAll("#mes-select-menu .period-select-option").forEach((opcion) => {
            opcion.classList.toggle("is-selected", opcion.dataset.value === mesSel);
        });

        document.querySelectorAll("#anio-select-menu .period-select-option").forEach((opcion) => {
            opcion.classList.toggle("is-selected", opcion.dataset.value === anioSel);
        });
    }


    // ========================================
    // MENSAJES DE ESTADO
    // ========================================

    function mostrarMensaje(mensaje) {
        tabla.innerHTML = "";
        const fila = document.createElement("tr");
        fila.classList.add("empty-row");

        const celda = document.createElement("td");
        celda.colSpan = configuracion.cantidad;
        celda.textContent = mensaje;

        fila.appendChild(celda);
        tabla.appendChild(fila);
    }


    // ========================================
    // MOSTRAR FACTURA Y MOVIMIENTOS
    // ========================================

    function crearCeldaFactura(valor) {
        const celda = document.createElement("td");
        celda.classList.add("invoice-cell");

        if (!valor || valor === "—" || valor === "0") {
            celda.textContent = "—";
            return celda;
        }

        const pareceURL = /^(https?:\/\/|\.{0,2}\/|[\w-]+\/)/i.test(valor);
        if (pareceURL) {
            const enlace = document.createElement("a");
            enlace.href = valor;
            enlace.textContent = "Ver factura";
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";
            celda.appendChild(enlace);
        } else {
            celda.textContent = valor;
        }

        return celda;
    }

    function crearFilaMovimiento(datos) {
        if (datos.length < configuracion.minDatos || datos.length > configuracion.maxDatos) {
            return null;
        }

        const fila = document.createElement("tr");
        for (let i = 0; i < configuracion.camposTexto; i++) {
            const celda = document.createElement("td");
            const valor = datos[i];
            celda.textContent = (configuracion.ocultarCeros && (valor === "0" || valor === "—")) ? "" : valor;
            if (configuracion.tieneNumeros && i >= 2) {
                celda.classList.add("number");
            }
            fila.appendChild(celda);
        }

        fila.appendChild(crearCeldaFactura(datos[configuracion.indiceFactura] || ""));
        return fila;
    }

    function mostrarMovimientos(lineas) {
        tabla.innerHTML = "";

        const movimientos = lineas.filter((linea) => {
            const datos = parsearLinea(linea);
            return datos[0] !== "CIERRE" && datos[0] !== "RESUMEN";
        });

        if (movimientos.length === 0) {
            mostrarMensaje("Todavía no hay movimientos registrados.");
            return;
        }

        let movimientosValidos = 0;

        movimientos.forEach((linea) => {
            const datos = parsearLinea(linea);
            const fila = crearFilaMovimiento(datos);
            if (!fila) {
                console.warn("Línea ignorada:", linea);
                return;
            }
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
        if (!configuracion.resumen || !resumen || resumen.length < 5) return;

        limpiarResumen();

        lineas.forEach((linea) => {
            const datos = parsearLinea(linea);
            if (datos[0] === "RESUMEN" && datos.length >= 6) {
                for (let i = 0; i < 5; i++) {
                    resumen[i].textContent = datos[i + 1];
                }
            }
        });
    }


    // ========================================
    // CARGAR DATOS
    // ========================================

    async function cargarDatos() {
        try {
            const respuesta = await fetch(ARCHIVOS[tipo]);
            if (!respuesta.ok) {
                throw new Error(`Error HTTP: ${respuesta.status}`);
            }

            const contenido = await respuesta.text();
            lineasCache = contenido
                .replace(/^\uFEFF/, "")
                .split(/\r?\n/)
                .filter((linea) => linea.trim() !== "");

            mostrarMovimientos(lineasCache);
            mostrarResumen(lineasCache);
        } catch (error) {
            console.error("Error al cargar los datos:", error);
            mostrarMensaje("No se pudieron cargar los movimientos.");
            limpiarResumen();
        }
    }


    // ========================================
    // CONTROL DEL PERÍODO
    // ========================================

    async function actualizarPeriodo() {
        actualizarBotonesPeriodo();

        const parametrosActualizados = new URLSearchParams();
        parametrosActualizados.set("tipo", tipo);
        parametrosActualizados.set("mes", mesSel);
        parametrosActualizados.set("anio", anioSel);

        history.replaceState(null, "", `${window.location.pathname}?${parametrosActualizados}`);

        // Por ahora, los TXT de prueba contienen febrero de 2026
        if (mesSel === "febrero" && anioSel === "2026") {
            if (lineasCache.length > 0) {
                mostrarMovimientos(lineasCache);
                mostrarResumen(lineasCache);
            } else {
                await cargarDatos();
            }
        } else {
            const nombreMes = mesSel.charAt(0).toUpperCase() + mesSel.slice(1);
            mostrarMensaje(`Todavía no hay movimientos registrados para ${nombreMes} ${anioSel}.`);
            limpiarResumen();
        }
    }


    // ========================================
    // CONTROL DE DROPDOWNS
    // ========================================

    function iniciarDropdownPeriodo(containerId, menuId, btnId, onSelect) {
        const container = document.getElementById(containerId);
        const menu = document.getElementById(menuId);
        const btn = document.getElementById(btnId);

        if (!container || !menu || !btn) return;

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const abierto = !menu.hidden;
            cerrarMenusDesplegables(null);
            menu.hidden = abierto;
            btn.setAttribute("aria-expanded", String(!abierto));
        });

        menu.addEventListener("click", (e) => {
            const opcion = e.target.closest(".period-select-option");
            if (!opcion) return;

            const valor = opcion.dataset.value;
            const texto = opcion.textContent.trim();

            menu.querySelectorAll(".period-select-option").forEach((o) => {
                o.classList.remove("is-selected");
            });
            opcion.classList.add("is-selected");

            const textSpan = btn.querySelector(".period-select-text");
            if (textSpan) {
                textSpan.textContent = texto;
            }

            menu.hidden = true;
            btn.setAttribute("aria-expanded", "false");
            onSelect(valor);
        });

        container.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                cerrarMenusDesplegables(null);
                btn.focus();
            }
        });
    }

    iniciarDropdownPeriodo("mes-select-container", "mes-select-menu", "mes-select-btn", (valor) => {
        mesSel = valor;
        actualizarPeriodo();
    });

    iniciarDropdownPeriodo("anio-select-container", "anio-select-menu", "anio-select-btn", (valor) => {
        anioSel = valor;
        actualizarPeriodo();
    });

    vincularCierreMenus();


    // ========================================
    // INICIAR
    // ========================================

    configurarInterfaz();
    actualizarPeriodo();

});
