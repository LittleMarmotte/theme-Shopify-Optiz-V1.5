/**
 * Enlarges the complete mobile product gallery frame as the page scrolls vertically.
 * Shopify's existing gallery owns media selection, touch gestures and zoom.
 * The tiny custom element reconnects automatically after Theme Editor reloads
 * and product/variant HTML replacements, without a global MutationObserver.
 */
class SiwakGalleryScroll extends HTMLElement {
  #gallery;
  #controller;
  #observer;
  #mobile;
  #reducedMotion;
  #frame = 0;
  #listening = false;

  connectedCallback() {
    this.#gallery = this.closest('[data-siwak-gallery]');
    if (!this.#gallery) return;

    this.#controller = new AbortController();
    this.#mobile = window.matchMedia('(max-width: 749px)');
    this.#reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const { signal } = this.#controller;

    this.#mobile.addEventListener('change', this.#configure, { signal });
    this.#reducedMotion.addEventListener('change', this.#configure, { signal });
    window.addEventListener('resize', this.#schedule, { passive: true, signal });
    this.#configure();
  }

  disconnectedCallback() {
    this.#controller?.abort();
    this.#observer?.disconnect();
    this.#stopListening();
    this.#clearFrame();
    this.#reset();
  }

  #configure = () => {
    this.#observer?.disconnect();
    this.#stopListening();
    this.#clearFrame();
    this.#reset();

    if (!this.#mobile.matches || this.#reducedMotion.matches) return;

    this.#observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.#startListening();
          this.#schedule();
        } else {
          this.#stopListening();
        }
      },
      { rootMargin: '150px 0px' }
    );
    this.#observer.observe(this.#gallery);
    this.#schedule();
  };

  #startListening() {
    if (this.#listening) return;
    window.addEventListener('scroll', this.#schedule, { passive: true });
    this.#listening = true;
  }

  #stopListening() {
    window.removeEventListener('scroll', this.#schedule);
    this.#listening = false;
  }

  #clearFrame() {
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #reset() {
    this.#gallery?.style.removeProperty('--siwak-gallery-scale');
    this.#gallery?.style.removeProperty('--siwak-gallery-radius');
  }

  #schedule = () => {
    if (this.#frame || !this.#mobile.matches || this.#reducedMotion.matches) return;
    this.#frame = requestAnimationFrame(this.#update);
  };

  #update = () => {
    this.#frame = 0;
    if (!this.#gallery?.isConnected) return;

    // Read the unchanged outer gallery, never the scaled frame, so the scroll
    // calculation cannot feed back into its own size or move the product form.
    const bounds = this.#gallery.getBoundingClientRect();
    const documentTop = bounds.top + window.scrollY;
    const start = Math.max(0, documentTop - window.innerHeight * 0.65);
    const distance = Math.max(150, Math.min(bounds.height * 0.55, 280));
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    const eased = progress * progress * (3 - 2 * progress);

    this.#gallery.style.setProperty('--siwak-gallery-scale', (0.9 + 0.1 * eased).toFixed(4));
  };
}

if (!customElements.get('siwak-gallery-scroll')) {
  customElements.define('siwak-gallery-scroll', SiwakGalleryScroll);
}
