import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { webcrypto } from 'node:crypto';

const runtime = readFileSync(new URL('../assets/optiz-popup-experiment.js', import.meta.url), 'utf8');
const pixel = readFileSync(new URL('../docs/experiments/siwak-popup/shopify-custom-pixel.js', import.meta.url), 'utf8');
const key = 'optiz:siwak_popup_v1';
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
function lockManager() {
  let queue = Promise.resolve();
  return { request: (_key, cb) => { const run = queue.then(cb); queue = run.catch(() => {}); return run; } };
}
function setup({ consent = true, known = false, identification, locks = lockManager(), fetchHook, storage = new Map(), quota = false, mode = 'qa', forced = 'holdout', eligible = true, running = true } = {}) {
  const events = [], requests = [], listeners = {}, timers = [], opens = [];
  const localStorage = { getItem: k => storage.get(k) ?? null, removeItem: k => storage.delete(k),
    setItem: (k, v) => { if (quota) throw Error('quota'); storage.set(k, v); } };
  const config = { running, mode, experimentId: 'siwak_popup_v1', formId: 'VKsPes', originalFormId: 'VVGheZ', eligiblePage: eligible };
  const window = { optizPopupExperimentConfig: config,
    Shopify: { routes: { root: '/fr/' }, customerPrivacy: { analyticsProcessingAllowed: () => consent },
      analytics: { publish: async (name, data) => { events.push({ name, data }); return true; } } },
    klaviyo: { isIdentified: identification || (async () => known) }, _klOnsite: { push: data => opens.push(data) },
    addEventListener: (name, cb) => { listeners[name] = cb; } };
  const context = vm.createContext({ window, crypto: webcrypto, URL, Date, Promise, Error, JSON, Number, AbortController,
    localStorage, navigator: { locks },
    location: { href: `https://optiz.store/products/siwak?optiz_ab=${forced}`, pathname: '/products/siwak' },
    matchMedia: () => ({ matches: true }), console: { info() {}, error() {} },
    document: { cookie: '_ga=GA1.1.123456.789012', visibilityState: 'visible', addEventListener: (name, cb) => { listeners[name] = cb; } },
    setInterval: cb => { listeners.readiness = cb; return 1; }, clearInterval() {},
    setTimeout: (cb, ms) => { timers.push({ cb, ms }); return timers.length; }, clearTimeout() {},
    fetch: async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); if (fetchHook) await fetchHook(); return { ok: true }; }
  });
  vm.runInContext(runtime, context);
  return { window, events, requests, storage, listeners, timers, opens,
    consent: async value => { consent = value; listeners.visitorConsentCollected?.(); await flush(); } };
}
test('disabled runtime has no storage, cart or tracking side effects', async () => {
  const app = setup({ running: false }); await flush();
  assert.equal(app.events.length, 0); assert.equal(app.requests.length, 0);
  assert.equal(app.window.optizPopupExperiment, undefined);
});
test('no consent means no assignment; accepting later enrolls exactly once', async () => {
  const app = setup({ consent: false }); await flush();
  assert.equal(app.events.length, 0); assert.equal(app.requests.length, 0); assert.equal(app.storage.size, 0);
  await app.consent(true); await app.consent(true);
  assert.equal(app.events.filter(e => e.name === 'optiz:experiment_assigned').length, 1);
});
test('holdout gets a stable assignment and private cart stamp, never requests the popup', async () => {
  const app = setup(); await flush();
  const state = JSON.parse(app.storage.get(key));
  assert.equal(state.variant_id, 'holdout');
  assert.equal(app.events[0].name, 'optiz:experiment_assigned');
  assert.equal(app.requests[0].url, '/fr/cart/update.js');
  assert.deepEqual(Object.keys(app.requests[0].body), ['attributes']);
  assert.equal(JSON.parse(app.requests[0].body.attributes.__optiz_experiment).visitor_id, state.visitor_id);
  assert.equal(app.opens.length, 0);
  const next = setup({ storage: app.storage }); await flush();
  assert.equal(JSON.parse(next.storage.get(key)).visitor_id, state.visitor_id);
  assert.equal(next.events.filter(e => e.name === 'optiz:experiment_assigned').length, 0);
});
test('treatment requests only the dedicated form; actual open and submit are distinct events', async () => {
  const app = setup({ forced: 'popup' }); await flush();
  await app.timers.find(t => t.ms > 2500).cb();
  assert.equal(app.opens[0][1], 'VKsPes');
  assert.equal(app.events.some(e => e.name === 'optiz:popup_open'), false);
  app.listeners.klaviyoForms({ detail: { type: 'open', formId: 'VKsPes' } });
  app.listeners.klaviyoForms({ detail: { type: 'submit', formId: 'VKsPes', metaData: { email: 'private@example.org' } } });
  await flush();
  assert.equal(app.events.filter(e => e.name === 'optiz:popup_open').length, 1);
  assert.equal(app.events.filter(e => e.name === 'optiz:popup_submit').length, 1);
  assert.equal(JSON.stringify(app.events).includes('private@example.org'), false);
  assert.equal(JSON.parse(app.storage.get(key)).submitted, true);
});
test('revocation cancels tracking, removes assignment and clears only the experiment attribute', async () => {
  const app = setup(); await flush(); const before = app.events.length;
  await app.consent(false);
  app.listeners.klaviyoForms({ detail: { type: 'submit', formId: 'VKsPes' } }); await flush();
  assert.equal(app.storage.has(key), false);
  assert.equal(app.events.length, before);
  assert.equal(app.requests.at(-1).body.attributes.__optiz_experiment, '');
});
test('known profiles, blocked storage and unrelated pages do not enroll', async () => {
  for (const options of [{ mode: 'live', known: true }, { quota: true }, { eligible: false }]) {
    const app = setup(options); await flush();
    assert.equal(app.events.length, 0); assert.equal(app.requests.length, 0);
  }
});
test('production ignores URL forcing and excludes QA assignments', async () => {
  const qa = setup(); await flush(); const previous = JSON.parse(qa.storage.get(key));
  const live = setup({ mode: 'live', storage: qa.storage }); await flush();
  const state = JSON.parse(live.storage.get(key));
  assert.equal(state.environment, 'production'); assert.notEqual(state.visitor_id, previous.visitor_id);
});
test('a legacy popup opening on Siwak raises a contamination event', async () => {
  const app = setup(); await flush();
  app.listeners.klaviyoForms({ detail: { type: 'open', formId: 'VVGheZ' } }); await flush();
  assert.equal(app.events.at(-1).name, 'optiz:experiment_contaminated');
});
test('consent withdrawal during identification cannot recreate an assignment', async () => {
  let resolve;
  const app = setup({ mode: 'live', identification: () => new Promise(r => { resolve = r; }) });
  await flush(); await app.consent(false); resolve(false); await flush();
  assert.equal(app.storage.has(key), false); assert.equal(app.events.length, 0);
});
test('two simultaneous tabs get one assignment and one exposure', async () => {
  const storage = new Map(), locks = lockManager();
  const first = setup({ mode: 'live', storage, locks });
  const second = setup({ mode: 'live', storage, locks });
  await flush(); await flush(); await flush();
  const exposures = [...first.events, ...second.events].filter(e => e.name === 'optiz:experiment_assigned');
  assert.equal(exposures.length, 1);
  assert.equal(first.window.optizPopupExperiment.inspect().assignment.visitor_id,
    second.window.optizPopupExperiment.inspect().assignment.visitor_id);
});
test('withdrawal clears metadata after an in-flight cart stamp', async () => {
  let release, count = 0;
  const app = setup({ fetchHook: () => ++count === 1 ? new Promise(r => { release = r; }) : undefined });
  await flush(); await app.consent(false);
  assert.equal(app.requests.length, 1);
  release(); await flush(); await flush();
  assert.equal(app.requests.at(-1).body.attributes.__optiz_experiment, '');
  assert.equal(app.storage.has(key), false);
});

function setupPixel(storage = new Map()) {
  const callbacks = {}, dataLayer = [], errors = [];
  const context = vm.createContext({ window: { dataLayer }, Date, Number, JSON, String,
    document: { createElement: () => ({}), head: { appendChild() {} } },
    init: { customerPrivacy: { analyticsProcessingAllowed: true } },
    api: { customerPrivacy: { subscribe: (name, cb) => { callbacks[name] = cb; } } },
    browser: { localStorage: { getItem: async k => storage.get(k) ?? null, setItem: async (k, v) => storage.set(k, v), removeItem: async k => storage.delete(k) } },
    analytics: { subscribe: (name, cb) => { callbacks[name] = cb; } },
    console: { error: (...args) => errors.push(args) } });
  vm.runInContext(pixel.replace("const MEASUREMENT_ID = 'G-V6ZGZG90XP';", "const MEASUREMENT_ID = 'G-TEST123';"), context);
  return { dataLayer, errors, storage, callbacks, send: e => callbacks[e.name.startsWith('optiz:') ? 'all_custom_events' : e.name](e) };
}
const exposure = () => ({ name: 'optiz:experiment_assigned', id: 'event-1', customData: {
  experiment_id: 'siwak_popup_v1', variant_id: 'holdout', environment: 'qa',
  visitor_id: '12345678-1234-1234-1234-123456789012', expires_at: Date.now() + 86400000,
  ga_client_id: '123456.789012',
  device_type: 'mobile', page_path: '/products/siwak', email: 'secret@example.org'
} });
test('pixel stores both variants and forwards only allowlisted parameters', async () => {
  const app = setupPixel(); await app.send(exposure());
  const event = app.dataLayer.find(a => a[0] === 'event');
  assert.equal(event[1], 'experiment_impression'); assert.equal(event[2].variant_id, 'holdout');
  assert.equal(JSON.stringify(app.dataLayer).includes('secret@example.org'), false);
  assert.equal(app.errors.length, 0);
});
test('pixel records one custom purchase per order, not another ecommerce purchase', async () => {
  const app = setupPixel(); await app.send(exposure());
  const event = { name: 'checkout_completed', id: 'checkout-1', data: { checkout: {
    order: { id: 'order-123' }, totalPrice: { amount: '28.00' }, currencyCode: 'EUR', email: 'secret@example.org'
  } } };
  await Promise.all([app.send(event), app.send(event)]);
  const events = app.dataLayer.filter(a => a[0] === 'event');
  assert.equal(events.filter(a => a[1] === 'optiz_exp_purchase').length, 1);
  assert.equal(events.some(a => a[1] === 'purchase'), false);
  assert.equal(events.at(-1)[2].order_value, 28);
  assert.equal(JSON.stringify(events).includes('secret@example.org'), false);
});
test('checkout can restore the variant from Shopify attributes without browser storage', async () => {
  const app = setupPixel(); const state = exposure().customData;
  await app.send({ name: 'checkout_started', id: 'c', data: { checkout: {
    attributes: [{ key: '__optiz_experiment', value: JSON.stringify(state) }]
  } } });
  assert.equal(app.dataLayer.find(a => a[0] === 'event')[1], 'optiz_exp_checkout');
});
test('expired assignments and free gift additions do not inflate the funnel', async () => {
  const app = setupPixel(); const data = exposure(); data.customData.expires_at = 0;
  await app.send(data); assert.equal(app.dataLayer.filter(a => a[0] === 'event').length, 0);
  await app.send(exposure());
  await app.send({ name: 'product_added_to_cart', id: 'gift', data: { cartLine: { merchandise: { id: 'gid://shopify/ProductVariant/56449444544894' } } } });
  await app.send({ name: 'product_added_to_cart', id: 'paid', data: { cartLine: { merchandise: { id: 'gid://shopify/ProductVariant/56366142259582' } } } });
  assert.equal(app.dataLayer.filter(a => a[0] === 'event' && a[1] === 'optiz_exp_add_to_cart').length, 1);
});
test('pixel stops and removes its own storage when consent is withdrawn', async () => {
  const app = setupPixel(); await app.send(exposure());
  const before = app.dataLayer.filter(a => a[0] === 'event').length;
  app.callbacks.visitorConsentCollected({ customerPrivacy: { analyticsProcessingAllowed: false } });
  await app.send(exposure());
  assert.equal(app.dataLayer.filter(a => a[0] === 'event').length, before);
  assert.equal(app.storage.size, 0);
});
