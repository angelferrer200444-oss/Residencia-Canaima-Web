/* ==========================================================================
   Condominio Residencia Canaima - Interactivity & Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. Toast Notification Utility
    // -------------------------------------------------------------------------
    const toast = document.getElementById('toastMessage');
    let toastTimeout;

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
    // 2. Theme Toggle (Diurno / Nocturno - Esquina derecha)
    // -------------------------------------------------------------------------
    const THEME_KEY = 'residencia-canaima-theme';
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-theme');
            const newTheme = isDark ? 'light' : 'dark';
            applyTheme(newTheme);
            try {
                localStorage.setItem(THEME_KEY, newTheme);
            } catch (e) {}
        });
    }

    // -------------------------------------------------------------------------
    // 3. User Profile (Visitante - Estático, sin acción)
    // -------------------------------------------------------------------------
    const userNameLabel = document.getElementById('userNameLabel');
    if (userNameLabel) {
        userNameLabel.textContent = 'Visitante';
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

    const noticiasTrack = document.getElementById('noticiasTrack');
    const noticiasViewport = document.querySelector('.noticias-viewport');
    const noticiasPrevBtn = document.getElementById('noticiasPrevBtn');
    const noticiasNextBtn = document.getElementById('noticiasNextBtn');
    let currentNoticiaIndex = 0;
    const maxIndex = Math.max(0, noticiasData.length - 2);

    function updateCarouselPosition() {
        if (!noticiasTrack || !noticiasViewport) return;
        const firstCard = noticiasTrack.querySelector('.scene-card');
        const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : (noticiasViewport.clientWidth - 8) / 2;
        const gap = 8;
        const shift = currentNoticiaIndex * (cardWidth + gap);
        noticiasTrack.style.transform = `translateX(-${shift}px)`;
    }

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

        updateCarouselPosition();
    }

    window.addEventListener('resize', updateCarouselPosition);

    if (noticiasPrevBtn) {
        noticiasPrevBtn.addEventListener('click', () => {
            if (currentNoticiaIndex > 0) {
                currentNoticiaIndex--;
            } else {
                currentNoticiaIndex = maxIndex; // Salto circular al final
            }
            updateCarouselPosition();
        });
    }

    if (noticiasNextBtn) {
        noticiasNextBtn.addEventListener('click', () => {
            if (currentNoticiaIndex < maxIndex) {
                currentNoticiaIndex++;
            } else {
                currentNoticiaIndex = 0; // Salto circular al inicio
            }
            updateCarouselPosition();
        });
    }

    renderNoticiasTrack();
});
