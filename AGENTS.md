# Optiz Shopify theme — project instructions

## Project identity

- Brand: Optiz.
- Shopify store: `tqka0j-vk.myshopify.com`.
- Repository: `https://github.com/LittleMarmotte/theme-Shopify-Optiz-V1.5.git`.
- This repository contains the Shopify theme source. Theme files must live uncompressed at the repository root in the standard Shopify directories.
- Preserve Optiz's existing visual identity and avoid generic AI-generated storefront patterns.

## Safety rules

- Never request, display, store, or commit passwords, Shopify access tokens, GitHub tokens, or other secrets.
- Never place secrets in this file, committed `.env` files, source code, commands shown in reports, or logs.
- Never edit or push directly to the published Shopify theme.
- Develop against a development theme or an unpublished duplicate.
- Never publish a theme without Matthieu's explicit confirmation in the current conversation.
- Never modify products, discounts, orders, customers, inventory, or store settings unless explicitly requested.
- Before a consequential GraphQL mutation, summarize its effect and verify the exact target.

## Git workflow

- Inspect `git status` before editing and preserve unrelated user changes.
- Create focused commits with descriptive messages.
- Prefer a dedicated branch for substantial changes.
- Do not commit exported theme ZIP files after the theme source has been extracted and verified.
- Treat GitHub as the source history; a Git commit does not update Shopify by itself.

## Shopify CLI workflow

- Check the CLI with `shopify version` before using it.
- Use `shopify commands` or `shopify help <command>` when command availability or flags are uncertain.
- Always specify `--store tqka0j-vk.myshopify.com` for store-specific theme commands.
- Inspect available themes before selecting a target.
- Use a development theme for live preview during implementation.
- Run `shopify theme check` after meaningful Liquid changes.
- Push only to the confirmed unpublished theme. Never target the live theme implicitly.
- Publishing is a separate final action and always requires explicit confirmation.

## Admin GraphQL

- Discover and validate the schema before executing an operation.
- Request only the minimum required scopes.
- Prefer read-only queries when they are sufficient.
- For mutations, verify Shopify GIDs, variables, scope, and reversibility before execution.
- Summarize results clearly without dumping sensitive or unnecessary raw JSON.

## Theme implementation standards

- Inspect existing architecture, sections, blocks, snippets, CSS variables, and JavaScript conventions before writing code.
- Reuse existing components when they fit the requested design.
- Avoid interchangeable card grids, gratuitous gradients, generic marketing copy, and decorative elements unrelated to Optiz.
- Keep compatibility with Shopify's theme editor and existing merchant settings.
- Give new schema settings stable IDs, clear labels, and sensible defaults.
- Preserve localization and use locale files for translatable interface copy.
- Check desktop and mobile layouts, keyboard navigation, focus states, contrast, and image alt text.
- Minimize JavaScript and dependencies; protect storefront performance.
- Prefer focused edits over large rewrites.

## Validation and handoff

- Review the diff before syncing anything to Shopify.
- Run the relevant checks, including `shopify theme check` for Liquid changes.
- Preview affected pages on desktop and mobile using a non-published theme.
- Test relevant edge cases such as missing content, long text, variants, cart state, loading, and errors.
- Clearly report validation that could not be performed.
- At handoff, list modified files, visible behavior, checks completed, and any manual steps remaining.

## Theme targets to record

- Development or unpublished theme name: `To be filled after theme discovery`.
- Development or unpublished theme ID: `To be filled after theme discovery`.
- Published theme name and ID: `Record for read-only identification; do not target without confirmation`.
