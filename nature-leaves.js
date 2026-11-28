/* ==========================================================================
   Fondo Dinámico Natural (Atmósfera, Hojas y Brisa de Canaima)
   Módulo compartido entre la página principal, consulta de mes y relación de gastos.
   ========================================================================== */
(function () {
    function initNatureBackground() {
        const canvas = document.getElementById('natureCanvas');
        if (!canvas || canvas.dataset.natureInitialized === 'true') return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.dataset.natureInitialized = 'true';

        if (!canvas.classList.contains('nature-canvas')) {
            canvas.style.position = 'fixed';
            canvas.style.inset = '0';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '0';
        }

        let width = 0;
        let height = 0;
        let dpr = 1;
        let isVisible = true;

        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        let isReducedMotion = motionQuery.matches;
        motionQuery.addEventListener('change', (e) => {
            isReducedMotion = e.matches;
        });

        // Paletas de color botánicas para hojas
        const leafPalettesLight = [
            { fill: 'rgba(56, 123, 85, 0.48)',  vein: 'rgba(255, 255, 255, 0.55)' },
            { fill: 'rgba(77, 154, 110, 0.45)', vein: 'rgba(255, 255, 255, 0.50)' },
            { fill: 'rgba(102, 178, 134, 0.40)', vein: 'rgba(255, 255, 255, 0.60)' },
            { fill: 'rgba(45, 107, 71, 0.52)',  vein: 'rgba(255, 255, 255, 0.45)' },
            { fill: 'rgba(130, 196, 158, 0.42)', vein: 'rgba(255, 255, 255, 0.65)' }
        ];

        const leafPalettesDark = [
            { fill: 'rgba(62, 136, 93, 0.42)',  vein: 'rgba(168, 230, 195, 0.40)' },
            { fill: 'rgba(45, 112, 75, 0.45)',  vein: 'rgba(140, 220, 175, 0.35)' },
            { fill: 'rgba(82, 163, 119, 0.40)', vein: 'rgba(180, 245, 205, 0.45)' },
            { fill: 'rgba(32, 85, 55, 0.48)',   vein: 'rgba(130, 210, 165, 0.30)' },
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
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        window.addEventListener('resize', resize, { passive: true });
        resize();

        // Interacción de viento al mover el ratón / toque
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
            mouse.vx = Math.max(-12, Math.min(12, ((clientX - mouse.lastX) / dt) * 8));
            mouse.vy = Math.max(-12, Math.min(12, ((clientY - mouse.lastY) / dt) * 8));
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

        class Leaf {
            constructor(initRandom = true) {
                this.vx = 0;
                this.vy = 0;
                this.reset(initRandom);
            }

            reset(initRandom = false) {
                const isMobile = width < 768;
                this.size = isMobile ? (9 + Math.random() * 9) : (11 + Math.random() * 13);

                if (initRandom) {
                    this.x = Math.random() * (width + 100) - 50;
                    this.y = Math.random() * (height + 100) - 50;
                } else if (Math.random() < 0.65) {
                    this.x = Math.random() * (width + 60) - 30;
                    this.y = -this.size * 2 - Math.random() * 40;
                } else {
                    this.x = -this.size * 2 - Math.random() * 40;
                    this.y = Math.random() * (height * 0.7);
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
            }

            update() {
                if (isReducedMotion) return;

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

                this.vx *= 0.94;
                this.vy *= 0.94;

                this.swayPhase += this.swayFreq;
                this.flipPhase += this.flipSpeed;
                this.rotation += this.rotSpeed;

                this.x += this.speedX + Math.sin(this.swayPhase) * 0.6 + this.vx;
                this.y += this.speedY + this.vy;

                if (this.y > height + this.size * 2 || this.x > width + this.size * 2) {
                    this.reset(false);
                }
            }

            draw(isDark) {
                const palette = isDark ? leafPalettesDark[this.paletteIndex] : leafPalettesLight[this.paletteIndex];
                const flip = Math.sin(this.flipPhase);
                const currentSway = Math.sin(this.swayPhase) * (this.swayAmp * 0.15);

                ctx.save();
                ctx.translate(this.x + currentSway, this.y);
                ctx.rotate(this.rotation);
                ctx.scale(Math.max(Math.abs(flip), 0.12) * Math.sign(flip || 1), 1);

                const s = this.size;
                ctx.beginPath();
                ctx.moveTo(0, -s);
                ctx.bezierCurveTo(s * 0.55, -s * 0.45, s * 0.55, s * 0.45, 0, s);
                ctx.bezierCurveTo(-s * 0.55, s * 0.45, -s * 0.55, -s * 0.45, 0, -s);
                ctx.fillStyle = palette.fill;
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0, -s * 0.85);
                ctx.lineTo(0, s * 0.88);
                ctx.strokeStyle = palette.vein;
                ctx.lineWidth = Math.max(0.65, s * 0.06);
                ctx.stroke();

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

            draw(isDark) {
                const pulse = (Math.sin(this.pulsePhase) + 1) * 0.5;
                const alpha = this.baseAlpha * (0.6 + pulse * 0.4);

                ctx.save();
                if (isDark) {
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
                    ctx.fillStyle = `rgba(90, 175, 125, ${alpha * 0.75})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        const isMobile = window.innerWidth < 768;
        const leaves = Array.from({ length: isMobile ? 16 : 28 }, () => new Leaf(true));
        const spores = Array.from({ length: isMobile ? 12 : 22 }, () => new Spore(true));

        document.addEventListener('visibilitychange', () => {
            isVisible = !document.hidden;
        });

        function animate() {
            requestAnimationFrame(animate);
            if (!isVisible) return;

            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < spores.length; i++) {
                spores[i].update();
                spores[i].draw(isDark);
            }

            for (let i = 0; i < leaves.length; i++) {
                leaves[i].update();
                leaves[i].draw(isDark);
            }
        }

        animate();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNatureBackground);
    } else {
        initNatureBackground();
    }
})();
