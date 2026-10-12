// Keep the one-time Siwak gift eligible when shoppers edit quantities in any cart UI.
(() => {
  const siwakId = 56366142259582;
  const giftIds = new Set([56866953396606,56366150680958,56366116241790,57856612565374,56421695390078]);
  let timer, busy = false;
  async function reconcile() {
    if (busy) return;
    busy = true;
    try {
      const root = window.Shopify?.routes?.root || '/';
      const response = await fetch(`${root}cart.js`, { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const cart = await response.json();
      const quantity = cart.items.filter(item => item.variant_id === siwakId).reduce((total,item)=>total+item.quantity,0);
      const gifts = cart.items.filter(item => giftIds.has(item.variant_id) && item.properties?._optiz_siwak_gift === 'true');
      const updates = {};
      gifts.forEach((item,index) => {
        const wanted = quantity >= 4 && index === 0 ? 1 : 0;
        if (item.quantity !== wanted) updates[item.key] = wanted;
      });
      if (!Object.keys(updates).length) return;
      const changed = await fetch(`${root}cart/update.js`, {
        method: 'POST', headers: {'Content-Type':'application/json', Accept:'application/json'}, body:JSON.stringify({updates})
      });
      if (changed.ok) window.location.reload();
    } catch { /* Shopify still enforces the promotion if a network check fails. */ }
    finally {busy = false;}
  }
  function schedule() {clearTimeout(timer);timer=setTimeout(reconcile,1200);}
  document.addEventListener('shopify:cart:lines-update',schedule);
  document.addEventListener('cart:updated',schedule);
  document.addEventListener('click',event => {
    const button = event.target.closest('button,a');
    const label = `${button?.getAttribute('aria-label') || ''} ${button?.textContent || ''}`;
    if (/quantity|quantité|Remove item|supprimer/i.test(label)) schedule();
  },true);
  document.addEventListener('change',event => {
    if (event.target.matches('input[name="updates[]"],input[name^="updates["],input[name="quantity"]')) schedule();
  });
  const observer = new MutationObserver(records => {
    if (records.some(record => {
      const node = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
      const cartUI = node?.closest('[role="dialog"],cart-items-component,cart-drawer-component');
      return cartUI && /panier|cart/i.test(`${cartUI.getAttribute('aria-label') || ''} ${cartUI.textContent}`);
    })) schedule();
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});
  schedule();
})();
