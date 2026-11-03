import { planSiwakGiftUpdates } from './siwak-offer-cart.js';
// Keep the one-time Siwak gift eligible when shoppers edit quantities in any cart UI.
(() => {
  let timer, busy = false;
  const observedRoots = new WeakSet();
  const observerOptions = { subtree: true, childList: true, characterData: true };
  function observeOpus() {
    const root = document.getElementById('opus-shadow-container')?.shadowRoot;
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    observer.observe(root, observerOptions);
    root.addEventListener('change', onQuantityChange);
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
      const updates = planSiwakGiftUpdates(cart);
      if (!Object.keys(updates).length) return;
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
