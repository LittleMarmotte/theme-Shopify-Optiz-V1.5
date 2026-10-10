/* LP-only adapter: exhaust Klaviyo's native pagination, then shuffle the full result.
 * Keep the original React cards in place; display copies in DOM reading order.
 * New reviews and filter/search results remain sourced from Klaviyo, never a snapshot.
 */
(() => {
  const CARD = '.kl_reviews__review_item';
  const ROOT = '#MainContent #klaviyo-product-reviews-wrapper';
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  class RandomReviews {
    constructor(root) {
      this.root = root;
      this.limit = 5;
      this.version = 0;
      this.loading = false;
      this.cards = [];
      this.abort = new AbortController();
      this.view = document.createElement('div');
      this.view.className = 'siwak-random-reviews';
      this.view.hidden = true;
      this.status = document.createElement('p');
      this.status.className = 'siwak-random-reviews-status';
      this.status.setAttribute('role', 'status');
      this.status.hidden = true;
      this.status.textContent = 'Chargement des avis…';
      root.append(this.status, this.view);
      this.view.addEventListener('click', (event) => {
        if (event.target.closest('[data-random-more]')) {
          this.limit += 5;
          this.render();
          const next = this.view.querySelector('[data-random-more]') || this.view.querySelector('[role="list"]');
          if (next) {
            if (!next.matches('button')) next.tabIndex = -1;
            next.focus({ preventScroll: true });
          }
          return;
        }
        // Preserve Klaviyo's photo viewer and any review-specific button actions.
        const button = event.target.closest('[data-random-action]');
        if (button) this.actions[Number(button.dataset.randomAction)]?.click();
      }, { signal: this.abort.signal });
      const restart = (event) => {
        if (this.view.contains(event.target)) return;
        this.version++;
        this.queue();
      };
      root.addEventListener('input', restart, { signal: this.abort.signal });
      root.addEventListener('change', restart, { signal: this.abort.signal });
      root.addEventListener('click', (event) => {
        if (event.target.closest('.kl_reviews__list__tab')) restart(event);
      }, { signal: this.abort.signal });
      this.observer = new MutationObserver((records) => {
        if (records.every((r) => this.view.contains(r.target) || r.target === this.view ||
          r.target === this.status || ([...r.addedNodes, ...r.removedNodes].length > 0 &&
            [...r.addedNodes, ...r.removedNodes].every((n) => n === this.view || n === this.status)))) return;
        if (!this.loading) this.queue();
      });
      this.observer.observe(root, { childList: true, subtree: true, characterData: true });
      this.queue();
    }

    queue() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.update(), 400);
    }

    nativeCards() {
      return [...this.root.querySelectorAll(CARD)].filter((card) => !this.view.contains(card));
    }

    nativeMore() {
      // This container holds review cards and the native "show more" button;
      // write-review / question buttons sit outside it and must never be clicked.
      return this.root.querySelector('.kl_reviews__list_container button.kl_reviews__button') ||
        this.root.querySelector('.kl_reviews__list button.kl_reviews__button');
    }

    restore() {
      this.root.removeAttribute('data-siwak-random-state');
      this.view.hidden = true;
      this.status.hidden = true;
      this.root.querySelectorAll('[data-siwak-native-more]').forEach((button) => button.removeAttribute('data-siwak-native-more'));
    }

    async update() {
      if (this.loading || !this.root.isConnected) return;
      // The app may replace its own children during a full re-render.
      if (!this.status.isConnected || !this.view.isConnected) this.root.append(this.status, this.view);
      const tab = this.root.querySelector('#kl_reviews_tabs__reviews_tab');
      if (tab && tab.getAttribute('aria-selected') === 'false') {
        this.restore();
        return;
      }
      let cards = this.nativeCards();
      if (!cards.length) { this.restore(); return; }
      const signature = cards.map((c) => c.textContent).join('\u001e');
      if (this.signature === signature && this.root.dataset.siwakRandomState === 'ready') return;
      const version = this.version;
      this.loading = true;
      this.view.hidden = true;
      this.status.hidden = false;
      this.root.dataset.siwakRandomState = 'loading';
      const deadline = Date.now() + 45000;
      try {
        for (let page = 0; page < 100; page++) {
          if (version !== this.version || !this.root.isConnected) throw new Error('changed');
          const more = this.nativeMore();
          if (!more) break;
          if (Date.now() > deadline) throw new Error('pagination timeout');
          if (more.disabled || more.getAttribute('aria-disabled') === 'true') {
            await pause(250);
            continue;
          }
          const count = this.nativeCards().length;
          more.click();
          const pageDeadline = Math.min(deadline, Date.now() + 8000);
          while (this.nativeCards().length <= count) {
            if (version !== this.version || !this.root.isConnected) throw new Error('changed');
            if (Date.now() > pageDeadline) throw new Error('pagination stalled');
            await pause(150);
          }
          // Let React finish updating the next pagination control.
          await pause(300);
        }
        if (this.nativeMore()) throw new Error('pagination incomplete');
        cards = this.nativeCards();
        if (version !== this.version || !cards.length) throw new Error('changed');
        // With no active filters, the tab count also proves all reviews loaded.
        // Do not mistake an unknown pagination markup for an exhausted list.
        const searches = [...this.root.querySelectorAll('.kl_reviews__search input, input.kl_reviews__search')];
        const filters = [...this.root.querySelectorAll('.kl_reviews__filters__pill select')]
          .filter((select) => select.id !== 'kl_reviews__sort_by_reviews');
        const filtered = searches.some((input) => input.value.trim()) || filters.some((select) => select.selectedIndex > 0);
        const total = Number(tab?.textContent.replace(/[^0-9]/g, ''));
        if (!filtered && total > cards.length) throw new Error('missing reviews');
        this.cards = shuffle(cards);
        this.signature = cards.map((c) => c.textContent).join('\u001e');
        this.limit = 5;
        this.root.dataset.siwakRandomState = 'ready';
        this.status.hidden = true;
        this.render();
      } catch {
        // If the app changes its markup or cannot load all pages, preserve access
        // to native reviews rather than presenting a misleading partial shuffle.
        this.restore();
      } finally {
        this.loading = false;
        if (version !== this.version) this.queue();
      }
    }

    render() {
      const fragment = document.createDocumentFragment();
      const list = document.createElement('div');
      list.className = 'siwak-random-reviews-list';
      list.setAttribute('role', 'list');
      this.actions = [];
      this.cards.slice(0, this.limit).forEach((original, index) => {
        const copy = original.cloneNode(true);
        copy.setAttribute('role', 'listitem');
        // Avoid duplicate SVG gradient IDs / accessibility IDs in the copies.
        const ids = new Map();
        copy.querySelectorAll('[id]').forEach((node) => {
          const old = node.id;
          node.id = `siwak-review-${index}-${old}`;
          ids.set(old, node.id);
        });
        copy.querySelectorAll('*').forEach((node) => {
          [...node.attributes].forEach((attr) => {
            let value = attr.value;
            ids.forEach((next, old) => {
              value = value.replaceAll(`url(#${old})`, `url(#${next})`);
              if (value === `#${old}`) value = `#${next}`;
              if (['aria-labelledby', 'aria-describedby', 'for'].includes(attr.name)) {
                value = value.split(' ').map((id) => ids.get(id) || id).join(' ');
              }
            });
            if (value !== attr.value) node.setAttribute(attr.name, value);
          });
        });
        const originalActions = [...original.querySelectorAll('button, a')];
        copy.querySelectorAll('button, a').forEach((button, actionIndex) => {
          if (button.tagName === 'A') return; // Native href remains usable.
          button.dataset.randomAction = this.actions.length;
          this.actions.push(originalActions[actionIndex]);
        });
        list.append(copy);
      });
      fragment.append(list);
      if (this.limit < this.cards.length) {
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'kl_reviews__button siwak-random-reviews-more';
        more.dataset.randomMore = '';
        more.textContent = 'Voir plus d’avis';
        fragment.append(more);
      }
      this.view.replaceChildren(fragment);
      this.view.hidden = false;
    }

    destroy() {
      this.version++;
      clearTimeout(this.timer);
      this.abort.abort();
      this.observer.disconnect();
      this.restore();
      this.view.remove();
      this.status.remove();
    }
  }

  const instances = new Map();
  const discover = () => {
    instances.forEach((instance, root) => {
      if (!root.isConnected) { instance.destroy(); instances.delete(root); }
    });
    document.querySelectorAll(ROOT).forEach((root) => {
      if (!instances.has(root)) instances.set(root, new RandomReviews(root));
    });
  };
  const observer = new MutationObserver(discover);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  discover();
})();
