const scrollHint = document.querySelector(".scroll-hint");
const revealSections = document.querySelectorAll(".reveal-section");

const updateScrollHint = () => {
    if (!scrollHint) return;

    const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollableHeight > 0
        ? Math.min(window.scrollY / scrollableHeight, 1)
        : 0;

    const intensity = 12 * (1 - progress);
    const duration = 1.2 + (progress * 1.8);


    scrollHint.style.setProperty("--shake-intensity", `${intensity}px`);
    scrollHint.style.setProperty("--shake-duration", `${duration}s`);

    scrollHint.classList.toggle("is-hidden", progress >= 0.98);
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

if (scrollHint) {
    scrollHint.addEventListener("click", () => {
        window.scrollBy({
            top: Math.max(window.innerHeight * 0.72, 420),
            behavior: "smooth"
        });
    });
}

const heroTitle = document.querySelector("#hero-title");

if (heroTitle) {
    const originalText = heroTitle.textContent;

    heroTitle.setAttribute("aria-label", originalText);
    heroTitle.innerHTML = "";

    [...originalText].forEach((character) => {
        const letter = document.createElement("span");

        letter.textContent = character === " " ? "\u00A0" : character;
        letter.setAttribute("aria-hidden", "true");

        heroTitle.appendChild(letter);
    });
}


window.addEventListener("scroll", updateScrollHint, { passive: true });
window.addEventListener("resize", updateScrollHint);

updateScrollHint();
