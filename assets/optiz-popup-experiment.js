/* Siwak-only intervention. Collection is delegated to the Shopify customer-events pixel.
 * Never send Klaviyo event.metaData: it can contain email addresses and phone numbers. */
(() => {
  const config = window.optizPopupExperimentConfig;
  if (!config?.running) return;
  const KEY = 'optiz:siwak_popup_v1';
  const TTL = 30 * 86400000;
  const QA = config.mode === 'qa';
  const pageStarted = Date.now();
  const log = [];
  let assignment, initializing = false, initializationDone, stopped = false, timer, cartWrite, generation = 0;
  let cartQueue = Promise.resolve();
  const privacy = () => window.Shopify?.customerPrivacy;
  const allowed = () => privacy()?.analyticsProcessingAllowed?.() === true;
  const uuid = () => crypto.randomUUID();
  const googleClientId = () => {
    const cookie = document.cookie.split('; ').find(value => value.startsWith('_ga='));
    return cookie?.match(/^_ga=GA\d+\.\d+\.(\d+\.\d+)$/)?.[1];
  };
  const diagnostics = (type, detail) => {
    log.push({ type, detail, time: new Date().toISOString() });
    if (log.length > 40) log.shift();
    if (QA) console.info('[Optiz popup QA]', type, detail);
  };
  function read() {
    try {
      const state = JSON.parse(localStorage.getItem(KEY));
      if (QA && state?.variant_id !== new URL(location.href).searchParams.get('optiz_ab')) return null;
      if (state?.experiment_id !== config.experimentId || !['popup', 'holdout'].includes(state.variant_id)
        || !/^[a-f0-9-]{36}$/.test(state.visitor_id) || !/^\d+\.\d+$/.test(state.ga_client_id)
        || !Number.isFinite(state.expires_at) || state.expires_at <= Date.now()
        || state.environment !== (QA ? 'qa' : 'production')) return null;
      return state;
    } catch { return null; }
  }
  function save() {
    // Persistent storage must work before a visitor can join a stable experiment.
    localStorage.setItem(KEY, JSON.stringify(assignment));
  }
  function payload() {
    return {
      experiment_id: config.experimentId, variant_id: assignment.variant_id,
      visitor_id: assignment.visitor_id, environment: assignment.environment,
      ga_client_id: assignment.ga_client_id,
      assigned_at: assignment.assigned_at, expires_at: assignment.expires_at,
      device_type: matchMedia('(max-width: 749px)').matches ? 'mobile' : 'desktop',
      page_path: location.pathname
    };
  }
  async function emit(name, extra = {}) {
    if (stopped || !assignment || !allowed()) return false;
    const data = { ...payload(), ...extra };
    try {
      if (typeof window.Shopify?.analytics?.publish !== 'function') throw Error('customer_events_unavailable');
      let deadline;
      const sent = await Promise.race([
        Promise.resolve(window.Shopify.analytics.publish(`optiz:${name}`, data)).finally(() => clearTimeout(deadline)),
        new Promise((_, reject) => { deadline = setTimeout(() => reject(Error('customer_events_timeout')), 1000); })
      ]);
      if (sent === false) throw Error('customer_event_rejected');
      diagnostics(name, data);
      return true; // Dispatch only. The pixel still needs independent end-to-end verification.
    } catch (error) {
      diagnostics('tracking_error', String(error.message));
      return false;
    }
  }
  function stampCart() {
    if (!assignment || !allowed()) return Promise.resolve(false);
    if (cartWrite) return cartWrite;
    const state = payload();
    // Private cart attributes stay in Shopify orders, without storefront/checkout copy.
    const attributes = { __optiz_experiment: JSON.stringify(state) };
    const version = generation;
    cartWrite = cartQueue.then(() => {
      if (version !== generation || stopped || !allowed()) return false;
      const controller = new AbortController();
      const deadline = setTimeout(() => controller.abort(), 2500);
      return fetch(`${window.Shopify.routes?.root || '/'}cart/update.js`, {
      method: 'POST', credentials: 'same-origin', keepalive: true,
        signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ attributes })
      }).then(response => {
      if (!response.ok) throw Error(`cart_stamp_${response.status}`);
      diagnostics('cart_stamped', { variant_id: state.variant_id });
        return true;
      }).finally(() => clearTimeout(deadline));
    }).catch(error => {
      diagnostics('cart_stamp_error', error.message);
      emit('experiment_tracking_error', { reason: 'cart_stamp_failed' });
      return false;
    })
      .finally(() => { cartWrite = null; });
    cartQueue = cartWrite;
    return cartWrite;
  }
  async function identified() {
    if (typeof window.klaviyo?.isIdentified !== 'function') throw Error('klaviyo_not_ready');
    return Promise.race([
      window.klaviyo.isIdentified(),
      new Promise((_, reject) => setTimeout(() => reject(Error('klaviyo_timeout')), 2500))
    ]);
  }
  function initialize() {
    if (initializing) return initializationDone;
    if (stopped || assignment || !allowed()) return Promise.resolve();
    initializing = true;
    initializationDone = enroll().finally(() => { initializing = false; });
    return initializationDone;
  }
  async function enroll() {
    const version = generation;
    const active = () => version === generation && !stopped && allowed();
    try {
      if (!navigator.locks?.request) throw Error('cross_tab_lock_unavailable');
      await navigator.locks.request(KEY, async () => {
      if (!active()) return;
      let state = read();
      if (!state && !config.eligiblePage) return;
      if (!state && !QA && await identified()) { diagnostics('excluded', 'known_profile'); stopped = true; return; }
      if (!active()) return;
      if (!state) {
        const clientId = googleClientId();
        if (!clientId) throw Error('ga_client_unavailable');
        const forced = new URL(location.href).searchParams.get('optiz_ab');
        const number = crypto.getRandomValues(new Uint32Array(1))[0];
        state = {
          experiment_id: config.experimentId,
          variant_id: QA ? forced : (number < 2147483648 ? 'popup' : 'holdout'),
          visitor_id: uuid(), ga_client_id: clientId, assigned_at: new Date().toISOString(),
          expires_at: Date.now() + TTL, environment: QA ? 'qa' : 'production',
          exposure_sent: false, closed_until: 0, submitted: false
        };
      }
      assignment = state;
      save();
      if (!window.Shopify?.analytics?.publish) throw Error('customer_events_unavailable');
      if (!assignment.exposure_sent && config.eligiblePage) {
        const sent = await emit('experiment_assigned');
        if (!active()) return;
        assignment.exposure_sent = sent;
        save();
      } else await emit('experiment_return');
      if (!active()) return;
      await stampCart();
      if (!active()) return;
      if (!assignment.exposure_sent || !config.eligiblePage || assignment.variant_id !== 'popup'
        || assignment.submitted || assignment.closed_until > Date.now()) return;
      const delay = Math.max(0, 7000 - (Date.now() - pageStarted));
      timer = setTimeout(async () => {
        if (stopped || !allowed() || document.visibilityState !== 'visible') return;
        try {
          // Custom triggers override Klaviyo audience/frequency rules: enforce them here.
          if (!QA && await identified()) return;
          if (!active()) return;
          window._klOnsite = window._klOnsite || [];
          window._klOnsite.push(['openForm', config.formId]);
          diagnostics('popup_requested', config.formId);
        } catch (error) { diagnostics('popup_error', error.message); }
      }, delay);
      });
    } catch (error) {
      diagnostics('excluded', error.message);
      assignment = undefined;
    }
  }
  window.addEventListener('klaviyoForms', event => {
    if (!assignment || stopped || !allowed()) return;
    const { formId, type } = event.detail || {};
    if (formId === config.originalFormId && config.eligiblePage && type === 'open') {
      emit('experiment_contaminated', { reason: 'original_popup_opened', form_id: formId });
      return;
    }
    if (formId !== config.formId) return;
    const names = { open: 'popup_open', close: 'popup_close', submit: 'popup_submit' };
    if (!names[type]) return;
    if (type === 'open' && assignment.variant_id === 'holdout') {
      emit('experiment_contaminated', { reason: 'holdout_popup_opened', form_id: formId });
    }
    if (type === 'submit') assignment.submitted = true;
    if (type === 'close') assignment.closed_until = Date.now() + 7 * 86400000;
    try { save(); } catch (error) { diagnostics('storage_error', error.message); }
    emit(names[type], { form_id: formId });
  });
  document.addEventListener('visitorConsentCollected', () => {
    if (!allowed()) {
      generation++;
      stopped = true;
      clearTimeout(timer);
      assignment = undefined;
      try { localStorage.removeItem(KEY); } catch { /* Storage may be disabled. */ }
      // Clear only our private annotation. Never clear cart items or other attributes.
      cartQueue = cartQueue.then(() => fetch(`${window.Shopify.routes?.root || '/'}cart/update.js`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributes: { __optiz_experiment: '' } }), keepalive: true
      }).then(response => {
        if (!response.ok) throw Error(`cart_clear_${response.status}`);
      })).catch(error => diagnostics('cart_clear_error', error.message));
    } else { stopped = false; initialize(); }
  });
  document.addEventListener('shopify:cart:lines-update', () => stampCart());
  async function ready() {
    if (stopped || !allowed()) return false;
    let deadline;
    const work = initialize().then(() => stampCart());
    const timeout = new Promise(resolve => {
      deadline = setTimeout(() => {
        emit('experiment_tracking_error', { reason: 'cart_stamp_deadline' });
        resolve(false);
      }, 1000);
    });
    try { return await Promise.race([work, timeout]); }
    finally { clearTimeout(deadline); }
  }
  window.optizPopupExperiment = { inspect: () => ({ assignment, log: [...log], config }), ready };
  // Consent and Klaviyo may load after the theme. Retry readiness, never a form submission.
  let attempts = 0;
  const readiness = setInterval(() => {
    initialize();
    if (assignment || ++attempts >= 30) clearInterval(readiness);
  }, 500);
  if (!privacy() && window.Shopify?.loadFeatures) {
    window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], error => {
      if (error) diagnostics('privacy_error', String(error));
      else initialize();
    });
  }
  initialize();
})();
