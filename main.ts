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

/** Inicializa y gestiona el toggle de dark mode. */
function initThemeToggle(): void {
  const button = document.getElementById("themeToggle");
  if (!button) return;

  const getSystemTheme = (): "light" | "dark" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  const getSavedTheme = (): "light" | "dark" | null => {
    try {
      return (localStorage.getItem("theme") as "light" | "dark" | null);
    } catch {
      return null;
    }
  };

  const applyTheme = (theme: "light" | "dark"): void => {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      button.textContent = "☀️";
      button.title = "Light mode";
    } else {
      document.documentElement.removeAttribute("data-theme");
      button.textContent = "🌙";
      button.title = "Dark mode";
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage no disponible
    }
  };

  const initialTheme = getSavedTheme() || getSystemTheme();
  applyTheme(initialTheme);

  button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll<HTMLElement>("[data-compare]")
    .forEach(initCompare);
  initReveal();
  initYear();
  initThemeToggle();
});
