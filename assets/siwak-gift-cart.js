import { planSiwakGiftUpdates, planSiwakAdditions, siwakQuantity, SIWAK_VARIANT_ID } from '@theme/siwak-offer-cart';
// Keep the one-time Siwak gift eligible when shoppers edit quantities in any cart UI.
(() => {
  let timer, busy = false, latestCart;
  const observedRoots = new WeakSet();
  const observerOptions = { subtree: true, childList: true, characterData: true };
  function observeOpus() {
    const root = document.getElementById('opus-shadow-container')?.shadowRoot;
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    observer.observe(root, observerOptions);
    root.addEventListener('change', onQuantityChange);
    renderShipping();
  }
  // The checkout rates are 4 EUR below 40 EUR, free from 40 EUR in FR/BE/LU.
  // cart.total_price includes product and order discounts, so free gifts contribute zero.
  function renderShipping() {
    if (!latestCart || latestCart.currency !== 'EUR') return;
    const root = document.getElementById('opus-shadow-container')?.shadowRoot;
    const container = root?.querySelector('.cd-rewards-container');
    if (!container) return;
    const eligible = ['FR', 'BE', 'LU'].includes(document.documentElement.dataset.optizShippingCountry);
    const amount = Math.max(0, 4000 - latestCart.total_price);
    const money = new Intl.NumberFormat(document.documentElement.lang || 'fr', {style:'currency',currency:'EUR'}).format(amount / 100);
    const text = eligible ? (amount ? `Il manque ${money} pour la livraison offerte — France, Belgique, Luxembourg (après remises).` : 'Livraison offerte — France, Belgique, Luxembourg.') : 'Frais de livraison calculés au paiement selon la destination.';
    const label = container.querySelector('.rewards-text');
    if (label && label.textContent !== text) label.textContent = text;
    const bar = container.querySelector('.cd-progress-bar');
    const percent = eligible ? Math.min(100, latestCart.total_price / 4000 * 100) : 0;
    if (bar && bar.style.width !== `${percent}%`) bar.style.width = `${percent}%`;
    container.querySelectorAll('[role="progressbar"]').forEach(el => {
      if (el.getAttribute('aria-valuenow') !== String(percent)) el.setAttribute('aria-valuenow', String(percent));
    });
    const progress = container.querySelector('.cd-progress-container');
    if (progress) progress.hidden = !eligible;
    const icons = container.querySelector('.cd-icon-container-wrapper');
    if (icons) icons.hidden = !eligible;
  }
  function onQuantityChange(event) {
    if (event.target instanceof Element && event.target.matches('input[name="updates[]"],input[name^="updates["],input[name="quantity"],input.cd-number-input-field')) schedule();
  }
  async function reconcile() {
    observeOpus();
    if (busy) return;
    busy = true;
    try {
      const root = window.Shopify?.routes?.root || '/';
      const response = await fetch(`${root}cart.js`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const cart = await response.json();
      latestCart = cart;
      renderShipping();
      const updates = planSiwakGiftUpdates(cart);
      if (!Object.keys(updates).length) {
        // Quantity increases in the drawer can unlock the case, too.
        const additions = siwakQuantity(cart) >= 2 ? planSiwakAdditions(cart, SIWAK_VARIANT_ID, 1, null) : [];
        if (additions.length) {
          const added = await fetch(`${root}cart/add.js`, {
            method: 'POST', headers: {'Content-Type':'application/json', Accept:'application/json'}, body:JSON.stringify({items:additions})
          });
          if (added.ok) window.location.reload();
        }
        return;
      }
      const changed = await fetch(`${root}cart/update.js`, {
        method: 'POST', headers: {'Content-Type':'application/json', Accept:'application/json'}, body:JSON.stringify({updates})
      });
      if (changed.ok) window.location.reload();
    } catch { /* Shopify still enforces the promotion if a network check fails. */ }
    finally {busy = false;}
  }
  function schedule() {
    if (timer) return;
    timer = setTimeout(() => { timer = undefined; reconcile(); }, 1200);
  }
  document.addEventListener('shopify:cart:lines-update',schedule);
  document.addEventListener('cart:updated',schedule);
  document.addEventListener('click',event => {
    const target = event.composedPath().find(node => node instanceof Element);
    const button = target?.closest('button,a');
    const label = `${button?.getAttribute('aria-label') || ''} ${button?.textContent || ''}`;
    if (button?.closest('#opus-drawer-id .cd-product-list') || /quantity|quantité|Remove item|supprimer/i.test(label)) schedule();
  },true);
  document.addEventListener('change', onQuantityChange);
  const observer = new MutationObserver(records => {
    observeOpus();
    renderShipping();
    if (records.some(record => {
      const node = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
      if (node?.closest('#opus-drawer-id .cd-product-list')) return true;
      const cartUI = node?.closest('cart-items-component,cart-drawer-component');
      return cartUI && /panier|cart/i.test(`${cartUI.getAttribute('aria-label') || ''} ${cartUI.textContent}`);
    })) schedule();
  });
  observer.observe(document.body, observerOptions);
  observeOpus();
  schedule();
})();
