// ========================================
// FADE-IN SINCRONIZADO DEL HERO
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const rutaImagen = "menu/imagenes/residencia.jpg";
    const imagenHero = new Image();
    imagenHero.src = rutaImagen;

    let cargado = false;

    const activarFadeIn = () => {
        if (cargado) return;
        cargado = true;
        hero.classList.add("is-loaded");
    };

    // Si el navegador ya la tiene en caché, se activa de inmediato
    if (imagenHero.complete) {
        activarFadeIn();
    } else {
        imagenHero.addEventListener("load", activarFadeIn);
        imagenHero.addEventListener("error", activarFadeIn);

        // Tiempo límite de seguridad (máx 2.5s) para conexiones lentas
        setTimeout(activarFadeIn, 2500);
    }
});
