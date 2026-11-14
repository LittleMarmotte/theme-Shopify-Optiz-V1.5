/* Paste into Shopify > Settings > Customer events > Add custom pixel.
 * Permission: Analytics REQUIRED, Marketing NOT REQUIRED, data sale NOT REQUIRED.
 * Insert the merchant's real GA4 measurement ID before connecting this pixel.
 * This sends custom experiment events, NEVER a second standard purchase event.
 */
(() => {
  const MEASUREMENT_ID = 'G-V6ZGZG90XP';
  if (!/^G-[A-Z0-9]+$/.test(MEASUREMENT_ID)) {
    console.error('[Optiz experiment] Set the GA4 measurement ID before connecting this pixel.');
    return;
  }
  const KEY = 'optiz:pixel:siwak_popup_v1';
  const ORDERS = `${KEY}:orders`;
  let state, queue = Promise.resolve(), generation = 0;
  let consent = init.customerPrivacy?.analyticsProcessingAllowed === true;
  const valid = value => value?.experiment_id === 'siwak_popup_v1'
    && ['popup', 'holdout'].includes(value.variant_id)
    && ['production', 'qa'].includes(value.environment)
    && /^[a-f0-9-]{36}$/.test(value.visitor_id)
    && /^\d+\.\d+$/.test(value.ga_client_id)
    && Number.isFinite(value.expires_at) && value.expires_at > Date.now();
  const parse = value => { try { return JSON.parse(value); } catch { return null; } };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    analytics_storage: consent ? 'granted' : 'denied', ad_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  });
  gtag('js', new Date());
  const tag = document.createElement('script');
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  tag.async = true;
  tag.onerror = () => console.error('[Optiz experiment] GA4 could not load.');
  document.head.appendChild(tag);
  api.customerPrivacy.subscribe('visitorConsentCollected', event => {
    consent = event.customerPrivacy.analyticsProcessingAllowed === true;
    generation++;
    gtag('consent', 'update', { analytics_storage: consent ? 'granted' : 'denied' });
    if (!consent) {
      state = undefined;
      queue = queue.then(async () => {
        state = undefined;
        await browser.localStorage.removeItem(KEY);
        await browser.localStorage.removeItem(ORDERS);
      }).catch(error => console.error('[Optiz experiment] Consent cleanup failed:', error.message));
    }
  });

  function send(name, event, extra = {}) {
    if (!consent || !valid(state)) return;
    // Allowlist only. Never forward checkout email/address or Klaviyo metaData.
    // Reuse the existing Google tag's client ID, never create a second GA4 user per browser.
    gtag('config', MEASUREMENT_ID, { client_id: state.ga_client_id, send_page_view: false });
    gtag('event', name, {
      send_to: MEASUREMENT_ID,
      experiment_id: state.experiment_id, variant_id: state.variant_id,
      environment: state.environment, visitor_id: state.visitor_id,
      device_type: state.device_type, page_path: state.page_path,
      page_location: `https://optiz.store${state.page_path}`,
      page_referrer: '',
      event_id: event.id, debug_mode: state.environment === 'qa', ...extra
    });
  }
  async function restore(checkout, version) {
    // Cart metadata survives checkout-domain changes; storage covers the usual same-domain path.
    const attribute = checkout?.attributes?.find(item => item.key === '__optiz_experiment');
    const fromCart = parse(attribute?.value);
    if (valid(fromCart)) state = fromCart;
    if (!valid(state)) {
      const stored = parse(await browser.localStorage.getItem(KEY));
      if (!consent || version !== generation) return false;
      state = stored;
    }
    return consent && valid(state);
  }
  async function handle(event) {
    if (!consent) return;
    const version = generation;
    if (event.name.startsWith('optiz:')) {
      const data = event.customData;
      if (!valid(data)) return;
      state = {
        experiment_id: data.experiment_id, variant_id: data.variant_id,
        visitor_id: data.visitor_id, environment: data.environment,
        ga_client_id: data.ga_client_id,
        expires_at: data.expires_at, device_type: data.device_type,
        page_path: data.page_path
      };
      await browser.localStorage.setItem(KEY, JSON.stringify(state));
      if (!consent || version !== generation) return;
      const map = {
        'optiz:experiment_assigned': 'experiment_impression',
        'optiz:experiment_return': 'optiz_exp_return',
        'optiz:popup_open': 'optiz_exp_popup_open',
        'optiz:popup_close': 'optiz_exp_popup_close',
        'optiz:popup_submit': 'optiz_exp_popup_submit',
        'optiz:experiment_tracking_error': 'optiz_exp_tracking_error',
        'optiz:experiment_contaminated': 'optiz_exp_contaminated'
      };
      if (map[event.name]) send(map[event.name], event, {
        ...(data.form_id ? { form_id: data.form_id } : {}),
        ...(data.reason ? { reason: data.reason } : {})
      });
      return;
    }
    const checkout = event.data?.checkout;
    if (!await restore(checkout, version)) return;
    if (!consent || version !== generation) return;
    if (event.name === 'product_added_to_cart') {
      const variant = String(event.data?.cartLine?.merchandise?.id || '').split('/').pop();
      if (variant === '56366142259582') send('optiz_exp_add_to_cart', event);
      return;
    }
    const funnel = { checkout_started: 'optiz_exp_checkout', payment_info_submitted: 'optiz_exp_payment' };
    if (funnel[event.name]) { send(funnel[event.name], event); return; }
    if (event.name !== 'checkout_completed' || !checkout?.order?.id) return;
    const id = String(checkout.order.id);
    const stored = parse(await browser.localStorage.getItem(ORDERS));
    if (!consent || version !== generation) return;
    const seen = Array.isArray(stored) ? stored : [];
    if (seen.includes(id)) return;
    const amount = Number(checkout.totalPrice?.amount);
    if (!Number.isFinite(amount) || amount < 0 || !checkout.currencyCode) return;
    send('optiz_exp_purchase', event, {
      transaction_id: id, order_value: amount, value: amount, currency: checkout.currencyCode
    });
    await browser.localStorage.setItem(ORDERS, JSON.stringify([...seen.slice(-49), id]));
  }
  const receive = event => {
    queue = queue.then(() => handle(event)).catch(error => {
      console.error('[Optiz experiment] Pixel collection failed:', error.message);
    });
    return queue;
  };
  analytics.subscribe('all_custom_events', receive);
  ['product_added_to_cart', 'checkout_started', 'payment_info_submitted', 'checkout_completed']
    .forEach(name => analytics.subscribe(name, receive));
})();
