(() => {
  const script = document.currentScript;
  const stylesheet = script?.dataset.opusStylesheet;
  if (!stylesheet || window.optizOpusCartStyles) return;
  window.optizOpusCartStyles = true;
  const install = () => {
    const host = document.getElementById('opus-shadow-container');
    const root = host?.shadowRoot;
    if (!root || root.querySelector('[data-optiz-opus-styles]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = stylesheet;
    link.dataset.optizOpusStyles = '';
    root.append(link);
  };
  // Opus renders in an open shadow root; document styles cannot reach it.
  const observer = new MutationObserver(install);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  let ticks = 0;
  const timer = setInterval(() => {
    install();
    if (++ticks >= 40) clearInterval(timer);
  }, 500);
  document.addEventListener('click', install, { capture: true, passive: true });
  document.addEventListener('shopify:section:load', install);
  install();
  window.addEventListener('pagehide', () => {
    clearInterval(timer);
    observer.disconnect();
  });
  window.addEventListener('pageshow', () => {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    install();
  });
})();
