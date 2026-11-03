# Siwak reward discount — prepared, not activated

Function API 2026-07. The theme supplies one-time marked reward lines. The server independently verifies the paid Siwak quantity, exact variant whitelist and reward selling-plan absence. It grants 100% off one case at 2+ boxes and one selected Optiz gift at 4+ boxes. Regular retail lines remain charged. Subscription paid lines qualify, but renewal reward lines do not.

## Validation

Build with Shopify CLI from an app containing this extension, then run `node tests/run.mjs`. Eleven WASM fixtures cover thresholds, subscriptions, renewals, duplicate lines, quantity caps, split paid lines and invalid variants. Theme/cart tests: `node --test tests/siwak-offer-cart.test.mjs` from theme root.

## Release status and dependency

Do not sync the pending theme cart changes before the server discount is active: otherwise Shopify charges the 8 EUR case. No new discount has been created and the old BXGY remains active.

Release target: standalone app `Optiz - Cadeaux Siwak`, client ID `96352aa5adbc53f5dee40bb27e0e932e`, under the Optiz organization. The app is created but not deployed or installed. App root is `backend/`, with config in `backend/shopify.app.toml` and this extension under `backend/extensions/siwak-case-offer`. Required scope is only `write_discounts`. Deployment was blocked by automatic approval review pending explicit authorization of this app and scope. Existing apps are not release targets.

Do not integrate into or replace the stale local app source. Do not redeploy the old local calecon app wholesale: its local source predates active version `siwak-shipping-2026-10-12-v2` and could remove Siwak shipping behavior. This folder deliberately excludes app-level config and credentials.

Once the extension is deployed, inspect its actual function ID/handle and create an automatic PRODUCT discount combining with shipping. Verify the target store and exact discount before each mutation. Replace/deactivate old BXGY `gid://shopify/DiscountAutomaticNode/2437444141438` only in the validated handover, preserving its original configuration for rollback. Existing shipping and selling plan (3 months, 10 EUR/box) remain unchanged.

Stock was explicitly set to 250 at HOUTCH NSL - FUTURLOG on 2026-11-03 for SKU OPT-SIW-HLD. Case variant 58340156768638. Paid Siwak variant 56366142259582.

Cart reconciliation removes rewards when quantity falls below thresholds; automatic Optiz gift selection is intentionally never inferred when increasing a cart quantity. Gift selection remains on the product offer.
