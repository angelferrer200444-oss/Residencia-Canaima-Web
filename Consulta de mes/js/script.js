document.addEventListener("DOMContentLoaded", () => {

    // ========================================
    // CONFIGURACIÓN
    // ========================================

    const parametros = new URLSearchParams(window.location.search);

    const tiposPermitidos = ["bolivares", "divisas", "daru"];

    let tipo = parametros.get("tipo") || "bolivares";

    if (!tiposPermitidos.includes(tipo)) {
        tipo = "bolivares";
    }

    const ARCHIVOS = {
        bolivares: "./js/datos.txt",
        divisas: "./js/datos-divisas.txt",
        daru: "./js/datos-daru.txt"
    };

    const CONFIGURACIONES = {

        bolivares: {
            columnas: [
                "Fecha",
                "Descripción",
                "Ingreso",
                "Egreso",
                "Saldo",
                "Tasa",
                "Factura"
            ],
            cantidad: 7,
            resumen: true
        },

        divisas: {
            columnas: [
                "Fecha",
                "Descripción",
                "Ingreso",
                "Egreso",
                "Saldo",
                "Factura"
            ],
            cantidad: 6,
            resumen: true
        },

        daru: {
            columnas: [
                "Fecha",
                "Descripción",
                "Factura"
            ],
            cantidad: 3,
            resumen: false
        }

    };

    const configuracion = CONFIGURACIONES[tipo];

    const tabla = document.querySelector(".ledger tbody");
    const encabezados = document.getElementById("ledger-headers");
    const resumen = document.querySelectorAll(".summary-item strong");
    const seccionResumen = document.querySelector(".summary-section");

    const opcionesIngreso = document.querySelectorAll(
        '[data-sort="ingresos"], [data-sort="egresos"]'
    );

    let mesSel = parametros.get("mes") || "febrero";
    let anioSel = parametros.get("anio") || "2026";

    const mesesValidos = [
        "enero", "febrero", "marzo", "abril",
        "mayo", "junio", "julio", "agosto",
        "septiembre", "octubre", "noviembre", "diciembre"
    ];

    if (!mesesValidos.includes(mesSel)) {
        mesSel = "febrero";
    }

    if (!/^\d{4}$/.test(anioSel)) {
        anioSel = "2026";
    }

    let lineasCache = [];


    // ========================================
    // CONFIGURAR INTERFAZ
    // ========================================

    function configurarInterfaz() {

        // Crear encabezados de la tabla

        encabezados.innerHTML = "";

        configuracion.columnas.forEach((nombre, indice) => {

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


        // Ocultar resumen en DARU

        if (seccionResumen) {
            seccionResumen.style.display =
                configuracion.resumen ? "" : "none";
        }


        // Ocultar ordenamientos que no corresponden a DARU

        opcionesIngreso.forEach(opcion => {

            opcion.style.display =
                tipo === "daru" ? "none" : "";

        });


        // Actualizar título del documento

        const nombres = {
            bolivares: "Bolívares",
            divisas: "Divisas",
            daru: "DARU"
        };

        document.title =
            `Residencia Canaima | Gastos ${nombres[tipo]}`;

        actualizarBotonesPeriodo();

    }


    // ========================================
    // ACTUALIZAR SELECTORES
    // ========================================

    function actualizarBotonesPeriodo() {

        const mesBtn = document.querySelector(
            "#mes-select-btn .period-select-text"
        );

        const anioBtn = document.querySelector(
            "#anio-select-btn .period-select-text"
        );

        if (mesBtn) {
            mesBtn.textContent =
                mesSel.charAt(0).toUpperCase() + mesSel.slice(1);
        }

        if (anioBtn) {
            anioBtn.textContent = anioSel;
        }

        document.querySelectorAll(
            "#mes-select-menu .period-select-option"
        ).forEach(opcion => {

            opcion.classList.toggle(
                "is-selected",
                opcion.dataset.value === mesSel
            );

        });

        document.querySelectorAll(
            "#anio-select-menu .period-select-option"
        ).forEach(opcion => {

            opcion.classList.toggle(
                "is-selected",
                opcion.dataset.value === anioSel
            );

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
    // MOSTRAR FACTURA
    // ========================================

    function crearCeldaFactura(valor) {

        const celda = document.createElement("td");
        celda.classList.add("invoice-cell");

        if (!valor || valor === "—" || valor === "0") {
            celda.textContent = "—";
            return celda;
        }

        // Solo convertir en enlace si parece una dirección válida

        const pareceURL =
            /^(https?:\/\/|\.{0,2}\/|[\w-]+\/)/i.test(valor);

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


    // ========================================
    // MOSTRAR MOVIMIENTOS
    // ========================================

    function mostrarMovimientos(lineas) {

        tabla.innerHTML = "";

        const movimientos = lineas.filter(linea => {

            const datos = linea.split(";").map(
                dato => dato.trim()
            );

            return (
                datos[0] !== "CIERRE" &&
                datos[0] !== "RESUMEN"
            );

        });

        if (movimientos.length === 0) {

            mostrarMensaje(
                "Todavía no hay movimientos registrados."
            );

            return;

        }

        let movimientosValidos = 0;

        movimientos.forEach(linea => {

            const datos = linea.split(";").map(
                dato => dato.trim()
            );

            const fila = document.createElement("tr");

            let valores = [];

            // BOLÍVARES

            if (tipo === "bolivares") {

                if (datos.length < 6 || datos.length > 7) {
                    console.warn("Línea ignorada:", linea);
                    return;
                }

                valores = [
                    datos[0],
                    datos[1],
                    datos[2],
                    datos[3],
                    datos[4],
                    datos[5]
                ];

                valores.forEach((valor, indice) => {

                    const celda = document.createElement("td");

                    celda.textContent =
                        (valor === "0" || valor === "—") ? "" : valor;

                    if (indice >= 2) {
                        celda.classList.add("number");
                    }

                    fila.appendChild(celda);

                });

                // La séptima columna es la factura, si existe

                fila.appendChild(
                    crearCeldaFactura(datos[6] || "")
                );

            }


            // DIVISAS

            else if (tipo === "divisas") {

                if (datos.length !== 6) {
                    console.warn("Línea ignorada:", linea);
                    return;
                }

                valores = datos.slice(0, 5);

                valores.forEach((valor, indice) => {

                    const celda = document.createElement("td");

                    celda.textContent =
                        (valor === "0" || valor === "—") ? "" : valor;

                    if (indice >= 2) {
                        celda.classList.add("number");
                    }

                    fila.appendChild(celda);

                });

                fila.appendChild(
                    crearCeldaFactura(datos[5])
                );

            }


            // DARU

            else if (tipo === "daru") {

                if (datos.length !== 3) {
                    console.warn("Línea ignorada:", linea);
                    return;
                }

                const celdaFecha = document.createElement("td");
                celdaFecha.textContent = datos[0];

                const celdaDescripcion = document.createElement("td");
                celdaDescripcion.textContent = datos[1];

                fila.appendChild(celdaFecha);
                fila.appendChild(celdaDescripcion);

                fila.appendChild(
                    crearCeldaFactura(datos[2])
                );

            }

            tabla.appendChild(fila);
            movimientosValidos++;

        });

        if (movimientosValidos === 0) {

            mostrarMensaje(
                "Se encontró el archivo, pero sus movimientos tienen un formato incorrecto."
            );

        }

    }


    // ========================================
    // MOSTRAR RESUMEN FINANCIERO
    // ========================================

    function mostrarResumen(lineas) {

        if (!configuracion.resumen) return;

        if (!resumen || resumen.length < 5) return;

        resumen.forEach(item => {
            item.textContent = "—";
        });

        lineas.forEach(linea => {

            const datos = linea.split(";").map(
                dato => dato.trim()
            );

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
                .filter(linea => linea.trim() !== "");

            mostrarMovimientos(lineasCache);
            mostrarResumen(lineasCache);

        } catch (error) {

            console.error(
                "Error al cargar los datos:",
                error
            );

            mostrarMensaje(
                "No se pudieron cargar los movimientos."
            );

            if (configuracion.resumen) {
                resumen.forEach(item => {
                    item.textContent = "—";
                });
            }

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

        history.replaceState(
            null,
            "",
            `${window.location.pathname}?${parametrosActualizados}`
        );

        // Por ahora, los TXT de prueba contienen febrero de 2026

        if (mesSel === "febrero" && anioSel === "2026") {

            if (lineasCache.length > 0) {

                mostrarMovimientos(lineasCache);
                mostrarResumen(lineasCache);

            } else {

                await cargarDatos();

            }

        } else {

            const nombreMes =
                mesSel.charAt(0).toUpperCase() + mesSel.slice(1);

            mostrarMensaje(
                `Todavía no hay movimientos registrados para ${nombreMes} ${anioSel}.`
            );

            if (configuracion.resumen) {

                resumen.forEach(item => {
                    item.textContent = "—";
                });

            }

        }

    }


    // ========================================
    // CONTROL DE DROPDOWNS
    // ========================================

    function cerrarTodosLosMenus(excepto) {

        document.querySelectorAll(
            ".period-select-menu:not([hidden])"
        ).forEach(menu => {

            if (menu !== excepto) {

                menu.hidden = true;

                const btn = menu.previousElementSibling;

                if (btn) {
                    btn.setAttribute("aria-expanded", "false");
                }

            }

        });

    }


    function iniciarDropdownPeriodo(
        containerId,
        menuId,
        btnId,
        onSelect
    ) {

        const container = document.getElementById(containerId);
        const menu = document.getElementById(menuId);
        const btn = document.getElementById(btnId);

        if (!container || !menu || !btn) return;

        btn.addEventListener("click", e => {

            e.stopPropagation();

            const abierto = !menu.hidden;

            cerrarTodosLosMenus(null);

            menu.hidden = abierto;

            btn.setAttribute(
                "aria-expanded",
                String(!abierto)
            );

        });


        menu.addEventListener("click", e => {

            const opcion = e.target.closest(
                ".period-select-option"
            );

            if (!opcion) return;

            const valor = opcion.dataset.value;
            const texto = opcion.textContent.trim();

            menu.querySelectorAll(
                ".period-select-option"
            ).forEach(o => {

                o.classList.remove("is-selected");

            });

            opcion.classList.add("is-selected");

            const textSpan = btn.querySelector(
                ".period-select-text"
            );

            if (textSpan) {
                textSpan.textContent = texto;
            }

            menu.hidden = true;

            btn.setAttribute("aria-expanded", "false");

            onSelect(valor);

        });


        container.addEventListener("keydown", e => {

            if (e.key === "Escape") {

                menu.hidden = true;

                btn.setAttribute("aria-expanded", "false");

                btn.focus();

            }

        });

    }


    iniciarDropdownPeriodo(
        "mes-select-container",
        "mes-select-menu",
        "mes-select-btn",
        valor => {

            mesSel = valor;
            actualizarPeriodo();

        }
    );


    iniciarDropdownPeriodo(
        "anio-select-container",
        "anio-select-menu",
        "anio-select-btn",
        valor => {

            anioSel = valor;
            actualizarPeriodo();

        }
    );


    document.addEventListener("click", e => {

        if (!e.target.closest(".period-select-container")) {
            cerrarTodosLosMenus(null);
        }

    });


    // ========================================
    // INICIAR
    // ========================================

    configurarInterfaz();

    actualizarPeriodo();

});
