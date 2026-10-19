/** Hängt ein Element an <body>, damit Overlays über allem liegen. */
export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return {
    destroy() {
      node.remove();
    }
  };
}

/** Hält den Tastaturfokus innerhalb eines Dialogs und gibt ihn danach zurück. */
export function trapFocus(node: HTMLElement) {
  const previous = document.activeElement as HTMLElement | null;
  const selector = 'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])';
  queueMicrotask(() => {
    if (!node.contains(document.activeElement)) node.focus({ preventScroll: true });
  });
  function onKey(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    const items = [...node.querySelectorAll<HTMLElement>(selector)].filter((el) => !el.hasAttribute('disabled'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }
  node.addEventListener('keydown', onKey);
  return {
    destroy() {
      node.removeEventListener('keydown', onKey);
      previous?.focus?.({ preventScroll: true });
    }
  };
}
