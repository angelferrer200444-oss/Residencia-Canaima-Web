// ========================================
// FADE-IN SINCRONIZADO DEL HERO (CON DECODE COMPLETO)
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

    // Usar decode() para esperar a que el 100% de la imagen esté en memoria
    if (imagenHero.decode) {
        imagenHero.decode()
            .then(activarFadeIn)
            .catch(activarFadeIn);
    } else if (imagenHero.complete) {
        activarFadeIn();
    } else {
        imagenHero.addEventListener("load", activarFadeIn);
        imagenHero.addEventListener("error", activarFadeIn);
    }

    // Tiempo límite de seguridad (máximo 3s)
    setTimeout(activarFadeIn, 3000);
});
