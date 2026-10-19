// Hält --kb (Höhe der Bildschirmtastatur) aktuell, damit Sheets über der Tastatur bleiben.
export function trackViewport() {
  const vv = window.visualViewport;
  if (!vv) return;
  const root = document.documentElement;
  const update = () => {
    const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    root.style.setProperty('--kb', `${Math.round(kb)}px`);
    // iOS schiebt beim Fokussieren gern das ganze Dokument; die App scrollt aber nur intern.
    if (window.scrollY !== 0 && kb === 0) window.scrollTo(0, 0);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}
