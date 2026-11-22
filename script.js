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

    // -------------------------------------------------------------------------
    // 7. Fondo Dinámico Natural (Atmósfera y Brisa de Canaima)
    // -------------------------------------------------------------------------
    function initNatureBackground() {
        const canvas = document.getElementById('natureCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let dpr = 1;
        let animationFrameId = null;
        let isVisible = true;

        // Detección de movimiento reducido
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let isReducedMotion = motionQuery.matches;
        motionQuery.addEventListener('change', (e) => {
            isReducedMotion = e.matches;
        });

        // Paletas de color botánicas para hojas
        const leafPalettesLight = [
            { fill: 'rgba(56, 123, 85, 0.48)', vein: 'rgba(255, 255, 255, 0.55)' },
            { fill: 'rgba(77, 154, 110, 0.45)', vein: 'rgba(255, 255, 255, 0.50)' },
            { fill: 'rgba(102, 178, 134, 0.40)', vein: 'rgba(255, 255, 255, 0.60)' },
            { fill: 'rgba(45, 107, 71, 0.52)', vein: 'rgba(255, 255, 255, 0.45)' },
            { fill: 'rgba(130, 196, 158, 0.42)', vein: 'rgba(255, 255, 255, 0.65)' }
        ];

        const leafPalettesDark = [
            { fill: 'rgba(62, 136, 93, 0.42)', vein: 'rgba(168, 230, 195, 0.40)' },
            { fill: 'rgba(45, 112, 75, 0.45)', vein: 'rgba(140, 220, 175, 0.35)' },
            { fill: 'rgba(82, 163, 119, 0.40)', vein: 'rgba(180, 245, 205, 0.45)' },
            { fill: 'rgba(32, 85, 55, 0.48)', vein: 'rgba(130, 210, 165, 0.30)' },
            { fill: 'rgba(109, 182, 141, 0.38)', vein: 'rgba(200, 255, 220, 0.50)' }
        ];

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.scale(dpr, dpr);
        }

        window.addEventListener('resize', resize, { passive: true });
        resize();

        // ---------------------------------------------------------------------
        // Interacción de viento al mover el ratón / toque
        // ---------------------------------------------------------------------
        const mouse = {
            x: -1000,
            y: -1000,
            vx: 0,
            vy: 0,
            lastX: 0,
            lastY: 0,
            lastTime: Date.now()
        };

        function updateMouse(clientX, clientY) {
            const now = Date.now();
            const dt = Math.max(now - mouse.lastTime, 16);
            mouse.vx = ((clientX - mouse.lastX) / dt) * 8;
            mouse.vy = ((clientY - mouse.lastY) / dt) * 8;
            // Limitar velocidad de ráfaga
            mouse.vx = Math.max(-12, Math.min(12, mouse.vx));
            mouse.vy = Math.max(-12, Math.min(12, mouse.vy));
            mouse.x = clientX;
            mouse.y = clientY;
            mouse.lastX = clientX;
            mouse.lastY = clientY;
            mouse.lastTime = now;
        }

        window.addEventListener('mousemove', (e) => {
            updateMouse(e.clientX, e.clientY);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches[0]) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // ---------------------------------------------------------------------
        // Clase Hoja (Tropical Leaf)
        // ---------------------------------------------------------------------
        class Leaf {
            constructor(initRandom = true) {
                this.reset(initRandom);
            }

            reset(initRandom = false) {
                const isMobile = width < 768;
                this.size = isMobile ? (9 + Math.random() * 9) : (11 + Math.random() * 13);
                
                if (initRandom) {
                    this.x = Math.random() * (width + 100) - 50;
                    this.y = Math.random() * (height + 100) - 50;
                } else {
                    // Respawn suave desde arriba o por la izquierda
                    if (Math.random() < 0.65) {
                        this.x = Math.random() * (width + 60) - 30;
                        this.y = -this.size * 2 - Math.random() * 40;
                    } else {
                        this.x = -this.size * 2 - Math.random() * 40;
                        this.y = Math.random() * (height * 0.7);
                    }
                }

                this.speedY = 0.35 + Math.random() * 0.55;
                this.speedX = 0.25 + Math.random() * 0.50;
                this.swayAmp = 18 + Math.random() * 26;
                this.swayFreq = 0.007 + Math.random() * 0.010;
                this.swayPhase = Math.random() * Math.PI * 2;

                this.flipPhase = Math.random() * Math.PI * 2;
                this.flipSpeed = 0.016 + Math.random() * 0.024;

                this.rotation = (Math.random() - 0.5) * 0.8;
                this.rotSpeed = (Math.random() - 0.5) * 0.008;

                this.paletteIndex = Math.floor(Math.random() * 5);
                this.vx = 0;
                this.vy = 0;
            }

            update(globalTime, isDark) {
                if (isReducedMotion) return;

                // Influencia del ratón / toque (ráfaga suave)
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distSq = dx * dx + dy * dy;
                const maxDist = 130;

                if (distSq < maxDist * maxDist && distSq > 0) {
                    const dist = Math.sqrt(distSq);
                    const force = (1 - dist / maxDist) * 1.8;
                    this.vx += (dx / dist) * force + mouse.vx * 0.15;
                    this.vy += (dy / dist) * force + mouse.vy * 0.15;
                }

                // Amortiguación de ráfagas
                this.vx *= 0.94;
                this.vy *= 0.94;

                // Desplazamiento orgánico
                this.swayPhase += this.swayFreq;
                this.flipPhase += this.flipSpeed;
                this.rotation += this.rotSpeed;

                const swayOffset = Math.sin(this.swayPhase) * 0.6;
                this.x += this.speedX + swayOffset + this.vx;
                this.y += this.speedY + this.vy;

                // Reiniciar si sale del campo visual
                if (this.y > height + this.size * 2 || this.x > width + this.size * 2) {
                    this.reset(false);
                }
            }

            draw(ctx, isDark) {
                const palette = isDark ? leafPalettesDark[this.paletteIndex] : leafPalettesLight[this.paletteIndex];
                const flip = Math.sin(this.flipPhase);
                const currentSway = Math.sin(this.swayPhase) * (this.swayAmp * 0.15);

                ctx.save();
                ctx.translate(this.x + currentSway, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(Math.max(Math.abs(flip), 0.12) * Math.sign(flip || 1), 1);

                // Silueta de la hoja (curvas de Bézier orgánicas)
                const s = this.size;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.bezierCurveTo(s * 0.55, -s * 0.45, s * 0.55, s * 0.45, 0, s);
                ctx.bezierCurveTo(-s * 0.55, s * 0.45, -s * 0.55, -s * 0.45, 0, -s);
                ctx.fillStyle = palette.fill;
                ctx.fill();

                // Nervadura central
                ctx.beginPath();
                ctx.moveTo(0, -s * 0.85);
                ctx.lineTo(0, s * 0.88);
                ctx.strokeStyle = palette.vein;
                ctx.lineWidth = Math.max(0.65, s * 0.06);
                ctx.stroke();

                // Nervaduras secundarias sutiles para hojas más grandes
                if (s > 14) {
                    ctx.beginPath();
                    ctx.moveTo(0, -s * 0.25);
                    ctx.lineTo(s * 0.28, -s * 0.42);
                    ctx.moveTo(0, -s * 0.25);
                    ctx.lineTo(-s * 0.28, -s * 0.42);
                    ctx.moveTo(0, s * 0.22);
                    ctx.lineTo(s * 0.26, s * 0.06);
                    ctx.moveTo(0, s * 0.22);
                    ctx.lineTo(-s * 0.26, s * 0.06);
                    ctx.lineWidth = Math.max(0.45, s * 0.04);
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        // ---------------------------------------------------------------------
        // Clase Espora / Luciérnaga (Floating Spore / Bioluminescent Particle)
        // ---------------------------------------------------------------------
        class Spore {
            constructor(initRandom = true) {
                this.reset(initRandom);
            }

            reset(initRandom = false) {
                this.x = Math.random() * width;
                this.y = initRandom ? Math.random() * height : height + 10 + Math.random() * 30;
                this.radius = 1.2 + Math.random() * 2.2;
                this.speedY = -(0.25 + Math.random() * 0.45);
                this.speedX = (Math.random() - 0.4) * 0.35;
                this.pulseSpeed = 0.02 + Math.random() * 0.03;
                this.pulsePhase = Math.random() * Math.PI * 2;
                this.baseAlpha = 0.25 + Math.random() * 0.35;
            }

            update() {
                if (isReducedMotion) return;
                this.pulsePhase += this.pulseSpeed;
                this.y += this.speedY;
                this.x += this.speedX + Math.sin(this.pulsePhase) * 0.3;

                if (this.y < -20 || this.x < -20 || this.x > width + 20) {
                    this.reset(false);
                }
            }

            draw(ctx, isDark) {
                const pulse = (Math.sin(this.pulsePhase) + 1) * 0.5;
                const alpha = this.baseAlpha * (0.6 + pulse * 0.4);

                ctx.save();
                if (isDark) {
                    // En modo nocturno: resplandor de luciérnaga bioluminiscente
                    const grad = ctx.createRadialGradient(
                        this.x, this.y, 0,
                        this.x, this.y, this.radius * 3.2
                    );
                    grad.addColorStop(0, `rgba(180, 245, 205, ${alpha})`);
                    grad.addColorStop(0.35, `rgba(102, 217, 150, ${alpha * 0.65})`);
                    grad.addColorStop(1, 'rgba(40, 140, 85, 0)');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 3.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // En modo diurno: polen flotante dorado/menta natural
                    ctx.fillStyle = `rgba(90, 175, 125, ${alpha * 0.75})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // Crear colección de partículas balanceadas para rendimiento óptimo
        const isMobile = window.innerWidth < 768;
        const leafCount = isMobile ? 16 : 28;
        const sporeCount = isMobile ? 12 : 22;

        const leaves = Array.from({ length: leafCount }, () => new Leaf(true));
        const spores = Array.from({ length: sporeCount }, () => new Spore(true));

        let globalTime = 0;

        function animate() {
            if (!isVisible) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            const isDark = document.body.classList.contains('dark-theme');
            ctx.clearRect(0, 0, width, height);

            globalTime += 0.016;

            // Actualizar y dibujar esporas (fondo suave)
            for (let i = 0; i < spores.length; i++) {
                spores[i].update();
                spores[i].draw(ctx, isDark);
            }

            // Actualizar y dibujar hojas (brisa natural)
            for (let i = 0; i < leaves.length; i++) {
                leaves[i].update(globalTime, isDark);
                leaves[i].draw(ctx, isDark);
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Pausar animación si la pestaña no está visible (ahorro de batería)
        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
        });

        animate();
    }

    initNatureBackground();
});
