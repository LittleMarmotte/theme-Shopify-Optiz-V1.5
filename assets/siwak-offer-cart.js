export const SIWAK_VARIANT_ID = '56366142259582';
export const SIWAK_CASE_VARIANT_ID = '58340156768638';
export const SIWAK_GIFT_VARIANTS = new Set([
  '56866953396606', '56366150680958', '56366116241790', '57856612565374', '56421695390078',
]);

export function siwakQuantity(cart) {
  return (cart.items || []).filter(item => String(item.variant_id) === SIWAK_VARIANT_ID)
    .reduce((total, item) => total + Number(item.quantity), 0);
}

export function isSiwakCase(item) {
  return String(item.variant_id) === SIWAK_CASE_VARIANT_ID && item.properties?._optiz_siwak_case === 'true';
}

export function isSiwakGift(item) {
  return SIWAK_GIFT_VARIANTS.has(String(item.variant_id)) && item.properties?._optiz_siwak_gift === 'true';
}

export function planSiwakAdditions(cart, variantId, quantity, giftVariant) {
  if (String(variantId) !== SIWAK_VARIANT_ID || !Number.isInteger(quantity) || quantity < 1) return [];
  const items = cart.items || [];
  const additions = [];
  if (siwakQuantity(cart) + quantity >= 2 && !items.some(isSiwakCase)) {
    additions.push({ id: SIWAK_CASE_VARIANT_ID, quantity: 1, properties: {
      _optiz_siwak_case: 'true', 'Cadeau offert': 'Étui Siwak offert dès 2 boîtes',
    }});
  }
  if (quantity >= 4 && SIWAK_GIFT_VARIANTS.has(String(giftVariant)) && !items.some(isSiwakGift)) {
    additions.push({ id: String(giftVariant), quantity: 1, properties: {
      _optiz_siwak_gift: 'true', 'Cadeau offert': 'Offre 4 boîtes de Siwak',
    }});
  }
  return additions;
}

export function planSiwakGiftUpdates(cart) {
  const quantity = siwakQuantity(cart);
  const updates = {};
  let caseKept = false;
  let giftKept = false;
  for (const item of cart.items || []) {
    let wanted;
    if (isSiwakCase(item)) {
      wanted = quantity >= 2 && !caseKept ? 1 : 0;
      caseKept ||= wanted === 1;
    } else if (isSiwakGift(item)) {
      wanted = quantity >= 4 && !giftKept ? 1 : 0;
      giftKept ||= wanted === 1;
    } else {
      continue;
    }
    if (item.quantity !== wanted) updates[item.key] = wanted;
  }
  return updates;
}
