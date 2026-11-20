// ========================================
// CONTROL DE CARGA DEL FONDO HERO
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const rutaImagen = "menu/imagenes/residencia.jpg";
    const img = new Image();
    img.src = rutaImagen;

    const mostrarFondo = () => {
        hero.classList.add("has-image");
    };

    // Si ya está en caché del navegador se muestra de una vez
    if (img.complete) {
        mostrarFondo();
    } else {
        img.addEventListener("load", mostrarFondo);
    }
});
