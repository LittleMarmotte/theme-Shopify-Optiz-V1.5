import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const block = read('../blocks/siwak-product-offers.liquid');
const source = block.split('{% javascript %}')[1].split('{% endjavascript %}')[0];
const money = value => new Intl.NumberFormat('fr', { style: 'currency', currency: 'EUR' }).format(value);

function setup({ quantity, mode }) {
  const registry = new Map();
  const context = vm.createContext({
    HTMLElement: class {}, Intl,
    customElements: { get: n => registry.get(n), define: (n, c) => registry.set(n, c) },
    document: { documentElement: { lang: 'fr' }, createElement: () => ({}) },
    Date: { now: () => Date.parse('2026-11-14T12:00:00Z') },
  });
  vm.runInContext(source, context);
  const offer = new (registry.get('siwak-product-offers'))();
  const elements = [{ name: 'quantity', value: '2' }];
  const form = {
    elements,
    querySelector: () => elements[0],
    querySelectorAll: () => elements.filter(e => e.name === 'selling_plan').map(e => ({ remove: () => elements.splice(elements.indexOf(e), 1) })),
    append: el => elements.push(el),
  };
  const headline = { dataset: {}, total: { textContent: '' }, value: { textContent: '', hidden: false }, meta: { textContent: '' } };
  headline.querySelectorAll = sel => sel.includes('total') ? [headline.total] : sel.includes('value') ? [headline.value] : [headline.meta];
  const sectionLists = { prices: [{ textContent: '12,00 €' }], labels: [{ textContent: 'Ajouter au panier' }] };
  const bonus = { 1: '0', 2: '8', 4: '12' }[quantity];
  const ticket = {
    querySelector: sel => sel.includes('bonus') ? (bonus === '0' ? null : { dataset: { bonusValue: bonus } }) : { textContent: `${quantity} boîtes` },
  };
  offer.form = form;
  offer.dataset = { unitCents: '1200', subUnitCents: '1000', plan: '711747076478', currency: 'EUR', cta: 'Ajouter au panier', perBox: '__PRICE__ / boîte', promoStart: '0', promoEnd: '1' };
  offer.querySelector = sel => {
    if (sel.includes('siwak-quantity')) return { value: quantity };
    if (sel.includes('siwak-mode') && sel.includes('+ strong')) return { textContent: mode === 'subscription' ? 'Abonnement' : 'Achat unique' };
    if (sel.includes('siwak-mode')) return { value: mode };
    if (sel.startsWith('[data-ticket=')) return ticket;
    if (sel === '[data-promo-message]') return {};
    return null;
  };
  offer.querySelectorAll = () => [];
  offer.closest = () => ({
    querySelectorAll: sel => sel === '[data-siwak-headline]' ? [headline] : sel.includes('bdi') ? sectionLists.prices : sel.includes('compare-at') ? [] : sectionLists.labels,
  });
  offer.syncForm();
  return { offer, elements, headline, sectionLists };
}

test('one-time purchase is the default: no selling plan, 12 € per box, struck value includes the case', () => {
  const { offer, elements, headline, sectionLists } = setup({ quantity: '2', mode: 'once' });
  assert.equal(offer.dataset.purchaseMode, 'once');
  assert.ok(!elements.some(e => e.name === 'selling_plan'));
  assert.equal(elements[0].value, '2');
  assert.equal(headline.total.textContent, money(24));
  assert.equal(headline.value.textContent, money(32));
  assert.equal(headline.value.hidden, false);
  assert.equal(headline.meta.textContent, '2 boîtes · Achat unique');
  assert.equal(sectionLists.prices[0].textContent, money(24));
  assert.equal(sectionLists.labels[0].textContent, `Ajouter au panier — ${money(24)}`);
});

test('subscription adds the selling plan and uses the plan price; value stays at the regular price', () => {
  const { offer, elements, headline } = setup({ quantity: '2', mode: 'subscription' });
  assert.equal(offer.dataset.purchaseMode, 'subscription');
  assert.equal(elements.find(e => e.name === 'selling_plan')?.value, '711747076478');
  assert.equal(headline.total.textContent, money(20));
  assert.equal(headline.value.textContent, money(32));
  assert.equal(headline.meta.textContent, '2 boîtes · Abonnement');
});

test('one box hides the struck value; four boxes value includes case and shipping bonus', () => {
  assert.equal(setup({ quantity: '1', mode: 'once' }).headline.value.hidden, true);
  const four = setup({ quantity: '4', mode: 'once' }).headline;
  assert.equal(four.total.textContent, money(48));
  assert.equal(four.value.textContent, money(60));
});

test('one-time is checked by default and subscription is the second choice', () => {
  const start = block.indexOf('siwak-product-offers__modes" role');
  const modes = block.slice(start, block.indexOf('</div>', start));
  assert.ok(modes.includes('value="once" checked'));
  assert.ok(modes.indexOf('value="once"') < modes.indexOf('value="subscription"'));
  assert.ok(!/value="subscription"[^>]*checked/.test(modes));
  assert.match(block, /value="\{\{ quantity \}\}"[^>]*\{% if quantity == 2 %\}checked/);
});
