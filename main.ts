/* ============================================================
   main.ts — lógica del portfolio
   Compilar con:  npx tsc main.ts --target ES2017 --outFile main.js
   (o simplemente:  tsc  si tenés un tsconfig.json)
   ============================================================ */

/** Inicializa un comparador antes/después.
 *  El <input type="range"> invisible cubre toda la card:
 *  eso nos da soporte de mouse, touch y teclado sin librerías. */
function initCompare(root: HTMLElement): void {
  const range = root.querySelector<HTMLInputElement>(".compare__range");
  if (!range) return;

  const update = (): void => {
    root.style.setProperty("--pos", `${range.value}%`);
  };

  range.addEventListener("input", update);

  // En algunos navegadores el drag directo sobre el range no sigue
  // exactamente al dedo/cursor; sincronizamos con eventos pointer.
  const setFromClientX = (clientX: number): void => {
    const rect = root.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    range.value = String(Math.min(100, Math.max(0, pct)));
    update();
  };

  let dragging = false;

  root.addEventListener("pointerdown", (e: PointerEvent) => {
    dragging = true;
    root.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  });

  root.addEventListener("pointermove", (e: PointerEvent) => {
    if (dragging) setFromClientX(e.clientX);
  });

  const stop = (): void => { dragging = false; };
  root.addEventListener("pointerup", stop);
  root.addEventListener("pointercancel", stop);

  update();
}

/** Animación de aparición al hacer scroll (respeta reduced motion). */
function initReveal(): void {
  const items = document.querySelectorAll<HTMLElement>(".reveal");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => io.observe(el));
}

/** Año actual en el footer. */
function initYear(): void {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLElement>("[data-compare]")
    .forEach(initCompare);
  initReveal();
  initYear();
});