"use strict";
/** Inicializa un comparador antes/después. */
function initCompare(root) {
    const range = root.querySelector(".compare__range");
    if (!range)
        return;
    const update = () => {
        root.style.setProperty("--pos", `${range.value}%`);
    };
    range.addEventListener("input", update);
    const setFromClientX = (clientX) => {
        const rect = root.getBoundingClientRect();
        const pct = ((clientX - rect.left) / rect.width) * 100;
        range.value = String(Math.min(100, Math.max(0, pct)));
        update();
    };
    let dragging = false;
    root.addEventListener("pointerdown", (e) => {
        dragging = true;
        root.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
    });
    root.addEventListener("pointermove", (e) => {
        if (dragging)
            setFromClientX(e.clientX);
    });
    const stop = () => { dragging = false; };
    root.addEventListener("pointerup", stop);
    root.addEventListener("pointercancel", stop);
    update();
}
/** Animación de aparición al hacer scroll (respeta reduced motion). */
function initReveal() {
    const items = document.querySelectorAll(".reveal");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("is-visible"));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                io.unobserve(entry.target);
            }
        }
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
}
/** Año actual en el footer. */
function initYear() {
    const el = document.getElementById("year");
    if (el)
        el.textContent = String(new Date().getFullYear());
}
document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll("[data-compare]")
        .forEach(initCompare);
    initReveal();
    initYear();
});

