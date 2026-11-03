# Active Siwak reward discount

Store: tqka0j-vk.myshopify.com. App: Optiz - Cadeaux Siwak, client ID 96352aa5adbc53f5dee40bb27e0e932e. This standalone application preserves existing shipping and other product applications.

Released version: siwak-rewards-2026-11-03. Function handle: siwak-case-offer; installed ID: 01a1a123-1731-7389-b9c6-8734944a4de2. Automatic discount: gid://shopify/DiscountAutomaticNode/2448394289534, ACTIVE. Scope write_discounts explicitly approved by Matthieu on 2026-11-03. No credentials are stored here.

The server grants 100% off one marked case at 2+ paid Siwak boxes and one marked, whitelisted Optiz gift at 4+ boxes. Both purchase modes qualify. The discount enables one-time and subscription purchases, with recurringCycleLimit 1. The theme adds rewards without a selling plan, and the function rejects any reward line carrying a selling plan. Retail case/gift purchases remain charged. Product and shipping discounts can combine; order discounts cannot.

Old native BXGY gid://shopify/DiscountAutomaticNode/2437444141438 was deactivated after validating both gifts free together. It remains available for rollback. Existing shipping functions and the paid selling plan (711747076478, 3 months, 10 EUR/box) are unchanged. Stock OPT-SIW-HLD was set to 250 at HOUTCH NSL - FUTURLOG on 2026-11-03.

## Source and validation

App root: backend/, extension: backend/extensions/siwak-case-offer/. Build using Shopify CLI, then run node tests/run.mjs from the extension folder. Eleven fixtures run the compiled WASM for thresholds, subscriptions, renewals, duplicates, quantity caps, split paid lines and invalid variants. Cart helper tests: node --test tests/siwak-offer-cart.test.mjs from theme root (7 tests).

Theme cart integration uses exact Siwak variant 56366142259582; avoid closest.product.selected_or_first_available_variant as an identity guard, because the render context can resolve a gift variant. Case variant is 58340156768638. Reward lines are added atomically with the paid line. Reconciliation observes the Opus shadow root in #opus-shadow-container and removes/clamps marked gifts below their thresholds. Increasing cart quantity never silently chooses an Optiz gift; gift choice stays on the product offer.

Function and cart tests pass. Theme Check has existing violations, with no new offenses versus the prior baseline. First-party draft-theme preview was used for cart tests; the editor iframe does not share the first-party cart session. No order was placed and no theme was published. Shipping rates at checkout and actual future subscription renewals have not been exercised; renewal behavior is covered by WASM fixtures.

## Rollback

Review exact targets before mutations. Restore the prior cart assets and deactivate the new automatic discount before reactivating the old BXGY. Do not deploy the stale local calecon application: it omits deployed Siwak shipping modules. Theme target remains unpublished 197781324158 on codex/optiz-dev-sync.
