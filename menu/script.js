/* ==========================================================================
   Condominio Residencia Canaima - Interactivity & Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Toast Notification Utility
    // -------------------------------------------------------------------------
    const toast = document.getElementById('toastMessage');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let toastTimeout;

    function crearAutoCarrusel({ intervaloMs, onAvanzar, contenedorPausa = null, respetarMovimientoReducido = false }) {
        let timer = null;
        let estaPausadoPorInteraccion = false;

        function pausar() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        function iniciar() {
            pausar();
            if (document.hidden || estaPausadoPorInteraccion) return;
            if (respetarMovimientoReducido && reducedMotionQuery.matches) return;
            timer = setInterval(onAvanzar, intervaloMs);
        }

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) pausar();
            else iniciar();
        });

        if (contenedorPausa) {
            contenedorPausa.addEventListener('mouseenter', () => {
                estaPausadoPorInteraccion = true;
                pausar();
            });
            contenedorPausa.addEventListener('mouseleave', () => {
                estaPausadoPorInteraccion = false;
                iniciar();
            });
            contenedorPausa.addEventListener('focusin', () => {
                estaPausadoPorInteraccion = true;
                pausar();
            });
            contenedorPausa.addEventListener('focusout', (e) => {
                if (!contenedorPausa.contains(e.relatedTarget)) {
                    estaPausadoPorInteraccion = false;
                    iniciar();
                }
            });
        }

        if (respetarMovimientoReducido) {
            reducedMotionQuery.addEventListener('change', () => {
                if (reducedMotionQuery.matches) pausar();
                else iniciar();
            });
        }

        return { iniciar, pausar };
    }

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    // -------------------------------------------------------------------------
    // 2. User Profile (Visitante - Estático, sin acción)
    // -------------------------------------------------------------------------
    const userNameLabel = document.getElementById('userNameLabel');
    if (userNameLabel) {
        userNameLabel.textContent = 'Visitante';
    }

    // -------------------------------------------------------------------------
    // 3. Hero Carousel System (3s rotation, preload & fallback a fondo verde)
    // -------------------------------------------------------------------------
    const heroCarouselImages = [
        'menu/imagenes/photo_2026-11-18_16-37-37.jpg',
        'menu/imagenes/photo_2026-11-18_16-37-37 (2).jpg',
        'menu/imagenes/photo_2026-11-18_16-37-37 (3).jpg'
    ];

    const heroSlides = document.querySelectorAll('.hero-carousel-slide');
    const introSlide = document.getElementById('introCarouselSlide');
    const loadedSlideIndices = new Set();
    let currentHeroSlide = 0;

    function markSlideAsLoaded(index) {
        loadedSlideIndices.add(index);
        if (index === 0 && introSlide) {
            introSlide.classList.add('is-loaded');
        }
        if (heroSlides[index]) {
            heroSlides[index].classList.add('is-loaded');
        }
    }

    // Precargar las 3 imágenes empezando por la primera (para la animación de aparición)
    function preloadHeroImages() {
        heroCarouselImages.forEach((src, idx) => {
            const img = new Image();
            img.onload = () => markSlideAsLoaded(idx);
            img.onerror = () => {
                // Fallback automático: permanece sin clase .is-loaded mostrando el fondo verde original
                console.warn(`[Hero Carousel] Fallo al cargar imagen ${idx + 1}: ${src}`);
            };
            img.src = src;
            // Si la imagen ya fue cargada por el navegador (ej: <link rel="preload"> o caché)
            if (img.complete && img.naturalWidth > 0) {
                markSlideAsLoaded(idx);
            }
        });
    }

    function goToHeroSlide(nextIndex) {
        if (!heroSlides || heroSlides.length === 0) return;
        heroSlides.forEach((slide, idx) => {
            if (idx === nextIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        currentHeroSlide = nextIndex;
    }

    function advanceHeroSlide() {
        if (!heroSlides || heroSlides.length === 0) return;
        const nextIndex = (currentHeroSlide + 1) % heroSlides.length;
        goToHeroSlide(nextIndex);
    }

    const heroAutoCarrusel = crearAutoCarrusel({
        intervaloMs: 3000,
        onAvanzar: advanceHeroSlide
    });

    // Iniciar precarga inmediata y activar ciclo de 3 segundos
    preloadHeroImages();
    heroAutoCarrusel.iniciar();

    // -------------------------------------------------------------------------
    // 4. Hero Card Mouse Interactive Hover (Brillo, inclinación 3D y parallax)
    // -------------------------------------------------------------------------
    const heroCard = document.getElementById('heroCard');

    if (heroCard) {
        function resetHeroHover() {
            heroCard.classList.remove('is-hovering');
            heroCard.style.setProperty('--hero-tilt-x', '0deg');
            heroCard.style.setProperty('--hero-tilt-y', '0deg');
            heroCard.style.setProperty('--hero-shift-x', '0px');
            heroCard.style.setProperty('--hero-shift-y', '0px');
        }

        heroCard.addEventListener('pointermove', (e) => {
            if (e.pointerType !== 'mouse' || reducedMotionQuery.matches || document.body.classList.contains('intro-active')) {
                return;
            }

            const rect = heroCard.getBoundingClientRect();
            if (!rect.width || !rect.height) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const normX = (x / rect.width - 0.5) * 2;  // -1 a 1
            const normY = (y / rect.height - 0.5) * 2; // -1 a 1

            heroCard.classList.add('is-hovering');
            heroCard.style.setProperty('--hero-mouse-x', `${x.toFixed(1)}px`);
            heroCard.style.setProperty('--hero-mouse-y', `${y.toFixed(1)}px`);
            heroCard.style.setProperty('--hero-tilt-x', `${(-normY * 3.5).toFixed(2)}deg`);
            heroCard.style.setProperty('--hero-tilt-y', `${(normX * 4.5).toFixed(2)}deg`);
            heroCard.style.setProperty('--hero-shift-x', `${(normX * 8).toFixed(2)}px`);
            heroCard.style.setProperty('--hero-shift-y', `${(normY * 6).toFixed(2)}px`);
        });

        heroCard.addEventListener('pointerleave', resetHeroHover);
        heroCard.addEventListener('pointercancel', resetHeroHover);
    }

    // -------------------------------------------------------------------------
    // 5. Modal System
    // -------------------------------------------------------------------------
    const infoModal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalIcon = document.getElementById('modalIcon');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalActionBtn = document.getElementById('modalActionBtn');

    function openModal({ title, body, iconSvg }) {
        if (!infoModal) return;
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = body;
        if (modalIcon && iconSvg) modalIcon.innerHTML = iconSvg;
        infoModal.classList.add('active');
    }

    function closeModal() {
        if (infoModal) infoModal.classList.remove('active');
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
    if (infoModal) {
        infoModal.addEventListener('click', (e) => {
            if (e.target === infoModal) closeModal();
        });
    }

    // -------------------------------------------------------------------------
    // 6. Noticias Carousel System (< y > interactivos con deslizamiento)
    // -------------------------------------------------------------------------
    const noticiasData = [
        {
            badge: "1",
            title: "Bombas",
            sub: "20 Nov",
            fullTitle: "Mantenimiento de Bombas",
            date: "20 de Noviembre",
            fullText: "Se ejecutó la calibración y sustitución de filtros en el sistema hidroneumático principal. El suministro de agua opera con normalidad en todos los pisos."
        },
        {
            badge: "2",
            title: "Limpieza",
            sub: "18 Nov",
            fullTitle: "Jornada de Limpieza",
            date: "18 de Noviembre",
            fullText: "Agradecemos a todos los vecinos por su colaboración durante el saneamiento perimetral, poda de áreas verdes y desinfección de pasillos comunes."
        },
        {
            badge: "3",
            title: "Alícuotas",
            sub: "15 Nov",
            fullTitle: "Cierre de Alícuotas Mensuales",
            date: "15 de Noviembre",
            fullText: "Se recuerda a todos los propietarios reportar sus transferencias antes del 25 para mantener actualizada la solvencia administrativa del condominio."
        },
        {
            badge: "4",
            title: "Portón",
            sub: "10 Nov",
            fullTitle: "Mantenimiento del Portón Vehicular",
            date: "10 de Noviembre",
            fullText: "Se calibraron los motores del portón principal y se habilitó la programación de nuevos controles remotos en la administración."
        },
        {
            badge: "5",
            title: "Pintura",
            sub: "05 Nov",
            fullTitle: "Restauración de Fachada",
            date: "05 de Noviembre",
            fullText: "Inicio de las labores de impermeabilización y pintura en los accesos peatonales y barandas perimetrales."
        }
    ];

    function iniciarCarruselDeslizante({ track, viewport, prevBtn, nextBtn, slideSelector, gap = 8, autoMs = 0, wrapper = null }) {
        if (!track || !viewport) return null;

        let currentIndex = 0;

        function getMaxIndex() {
            return Math.max(0, track.querySelectorAll(slideSelector).length - 1);
        }

        function actualizarPosicion() {
            const firstSlide = track.querySelector(slideSelector);
            const slideWidth = firstSlide ? firstSlide.offsetWidth : viewport.clientWidth;
            const shift = currentIndex * (slideWidth + gap);
            track.style.transform = `translateX(-${shift}px)`;
        }

        function mover(delta) {
            const maxIndex = getMaxIndex();
            if (delta > 0) {
                currentIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
            } else {
                currentIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
            }
            actualizarPosicion();
        }

        const autoCarrusel = autoMs > 0
            ? crearAutoCarrusel({
                intervaloMs: autoMs,
                onAvanzar: () => mover(1),
                contenedorPausa: wrapper,
                respetarMovimientoReducido: true
            })
            : null;

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                mover(-1);
                if (autoCarrusel) autoCarrusel.iniciar();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                mover(1);
                if (autoCarrusel) autoCarrusel.iniciar();
            });
        }

        window.addEventListener('resize', actualizarPosicion);
        actualizarPosicion();
        if (autoCarrusel) autoCarrusel.iniciar();

        return { actualizarPosicion, mover };
    }

    const noticiasWrapper = document.querySelector('.noticias-carousel-wrapper');
    const noticiasTrack = document.getElementById('noticiasTrack');
    const noticiasViewport = document.querySelector('.noticias-viewport');
    const noticiasPrevBtn = document.getElementById('noticiasPrevBtn');
    const noticiasNextBtn = document.getElementById('noticiasNextBtn');

    function renderNoticiasTrack() {
        if (!noticiasTrack) return;
        noticiasTrack.innerHTML = '';

        noticiasData.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = 'scene-card placeholder-card';
            card.setAttribute('data-index', idx);
            card.innerHTML = `
                <div class="placeholder-content">
                    <div class="scene-num-badge">${item.badge}</div>
                    <span class="card-caption">${item.title}</span>
                    <span class="scene-sub">${item.sub}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                openModal({
                    title: `Noticia #${item.badge}: ${item.fullTitle}`,
                    body: `<p><strong>Fecha:</strong> ${item.date}</p><p style='margin-top:10px;'>${item.fullText}</p>`,
                    iconSvg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>`
                });
            });

            noticiasTrack.appendChild(card);
        });
    }

    renderNoticiasTrack();
    iniciarCarruselDeslizante({
        track: noticiasTrack,
        viewport: noticiasViewport,
        prevBtn: noticiasPrevBtn,
        nextBtn: noticiasNextBtn,
        slideSelector: '.scene-card',
        autoMs: 6000,
        wrapper: noticiasWrapper
    });

    // Carrusel de Norma del Trabajador / Cronograma Limpieza (reutilizando lógica)
    iniciarCarruselDeslizante({
        track: document.getElementById('normasTrack'),
        viewport: document.querySelector('.normas-viewport'),
        prevBtn: document.getElementById('normasPrevBtn'),
        nextBtn: document.getElementById('normasNextBtn'),
        slideSelector: '.character-card'
    });

    // -------------------------------------------------------------------------
    // 7. Animación de Entrada Pantalla Completa ("Encaje Perfecto")
    // -------------------------------------------------------------------------
    function initIntroAnimation() {
        const introOverlay = document.getElementById('introOverlay');
        const introContent = document.getElementById('introContent');
        const introTitle = introContent ? introContent.querySelector('.intro-title') : null;
        const heroCenter = document.querySelector('.hero-center-content');
        const heroTitle = document.querySelector('.hero-main-title');

        if (!introOverlay || !introContent || !heroCenter || !heroTitle) {
            document.body.classList.remove('intro-active');
            document.body.classList.add('buttons-entered');
            return;
        }

        // Respetar preferencia de movimiento reducido
        if (reducedMotionQuery.matches) {
            document.body.classList.remove('intro-active');
            document.body.classList.add('buttons-entered');
            introOverlay.style.display = 'none';
            return;
        }

        // Bloquear desplazamiento mientras dura la intro
        document.body.classList.add('intro-active');
        window.scrollTo(0, 0);

        async function startDocking() {
            // Asegurar que las fuentes web estén listas para mediciones exactas
            if (document.fonts && document.fonts.ready) {
                try {
                    await document.fonts.ready;
                } catch (e) {}
            }

            // Duración de la presentación en pantalla completa antes del encaje
            setTimeout(() => {
                // Medir posiciones en coordenadas del viewport
                const heroTitleRect = heroTitle.getBoundingClientRect();
                const introTitleRect = introTitle.getBoundingClientRect();

                if (!heroTitleRect.width || !introTitleRect.width) {
                    finishIntro();
                    return;
                }

                const heroCenterX = heroTitleRect.left + heroTitleRect.width / 2;
                const heroCenterY = heroTitleRect.top + heroTitleRect.height / 2;
                const introCenterX = introTitleRect.left + introTitleRect.width / 2;
                const introCenterY = introTitleRect.top + introTitleRect.height / 2;

                const deltaX = heroCenterX - introCenterX;
                const deltaY = heroCenterY - introCenterY;
                let scale = heroTitleRect.width / introTitleRect.width;
                if (Math.abs(scale - 1) < 0.05) {
                    scale = 1;
                }

                // Iniciar transición de encaje
                introOverlay.classList.add('docking');
                introContent.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

                // Concluir cuando termine la animación de desplazamiento y disparar aparición de botones
                setTimeout(finishIntro, 850);
            }, 1250);
        }

        function finishIntro() {
            // Revelar el título estático de la tarjeta hero
            heroCenter.style.opacity = '1';

            // Desvanecer suavemente el clon de la intro para una transición 100% natural sin saltos
            introContent.style.transition = 'opacity 0.2s ease';
            introContent.style.opacity = '0';

            document.body.classList.remove('intro-active');
            // Activa el efecto de aparición de los botones
            document.body.classList.add('buttons-entered');

            setTimeout(() => {
                introOverlay.classList.add('finished');
                introOverlay.style.display = 'none';
            }, 200);
        }

        startDocking();
    }

    initIntroAnimation();
});
