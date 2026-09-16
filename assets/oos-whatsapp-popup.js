(() => {
  const root = document.getElementById("oos-wa-popup");
  if (!root) return;

  const overlay = document.getElementById("oos-wa-overlay");
  const closeBtn = document.getElementById("oos-wa-close");
  const joinBtn = document.getElementById("oos-wa-join");

  const open = () => {
    root.style.display = "block";
    document.documentElement.classList.add("oos-wa-popup-open");
  };

  const close = () => {
    root.style.display = "none";
    document.documentElement.classList.remove("oos-wa-popup-open");
  };

  overlay?.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);

  // Évite d’afficher en boucle (24h)
  const KEY = "oos_wa_popup_last_seen";
  const canShow = () => {
    const last = Number(localStorage.getItem(KEY) || "0");
    return Date.now() - last > 24 * 60 * 60 * 1000;
  };
  const markShown = () => localStorage.setItem(KEY, String(Date.now()));

  // Affichage initial (si la page charge déjà sur une variante en rupture)
  const initialOos = root.dataset.oosInitial === "true";
  if (initialOos && canShow()) {
    setTimeout(() => {
      open();
      markShown();
    }, 900);
  }

  // Mise à jour quand l’utilisateur change de variante
  // Beaucoup de thèmes déclenchent un event "variant:change"
  document.addEventListener("variant:change", (e) => {
    const available = e?.detail?.variant?.available;
    if (available === false && canShow()) {
      open();
      markShown();
    } else if (available === true) {
      close();
    }
  });

  // Fallback: si ton thème n’émet pas variant:change,
  // on surveille les changements sur le bouton ATC (disabled).
  const atc = document.querySelector('[ref="addToCartButton"]') || document.querySelector('button[name="add"]');
  if (atc) {
    const obs = new MutationObserver(() => {
      const disabled = atc.hasAttribute("disabled");
      if (disabled && canShow()) {
        open();
        markShown();
      } else if (!disabled) {
        close();
      }
    });
    obs.observe(atc, { attributes: true, attributeFilter: ["disabled"] });
  }

  // Met à jour le lien WhatsApp si tu veux un lien par produit via data attr
  const link = root.dataset.whatsappLink;
  if (link && joinBtn) joinBtn.href = link;
})();