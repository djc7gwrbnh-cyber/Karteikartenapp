/** Lässt ein Textfeld mit dem Inhalt mitwachsen. */
export function autosize(node: HTMLTextAreaElement, _value?: unknown) {
  const resize = () => {
    node.style.height = 'auto';
    node.style.height = node.scrollHeight + 2 + 'px';
  };
  node.addEventListener('input', resize);
  queueMicrotask(resize);
  return {
    update: resize,
    destroy() {
      node.removeEventListener('input', resize);
    }
  };
}
