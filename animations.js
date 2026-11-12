const scrollHint = document.querySelector(".scroll-hint");
const revealSections = document.querySelectorAll(".reveal-section");

const updateScrollHint = () => {
    const reachedBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
    scrollHint.classList.toggle("is-hidden", reachedBottom);
};

revealSections.forEach((section) => {
    section.querySelectorAll("*:not(.hero-brush):not(.tours-brush)").forEach((element, index) => {
        element.classList.add("reveal-item");
        element.style.setProperty("--reveal-delay", `${Math.min(index * 35, 280)}ms`);
    });
});

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
}, {
    rootMargin: "-8% 0px -8% 0px",
    threshold: 0.05
});

revealSections.forEach((section) => revealObserver.observe(section));

scrollHint.addEventListener("click", () => {
    window.scrollBy({
        top: Math.max(window.innerHeight * 0.72, 420),
        behavior: "smooth"
    });
});

window.addEventListener("scroll", updateScrollHint, { passive: true });
window.addEventListener("resize", updateScrollHint);
updateScrollHint();
