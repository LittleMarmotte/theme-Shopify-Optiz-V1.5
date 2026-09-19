# Développement Shopify Optiz

## Référence technique connue

Repo : `https://github.com/LittleMarmotte/theme-Shopify-Optiz-V1.5.git`

État inspecté lors de la création du skill :

- thème Shopify **Savor 3.0.0** ;
- architecture Online Store 2.0 : `assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/` ;
- corps Inter 400 ; titres, sous-titres et accents Barlow Condensed 600 ;
- rayons globaux déjà à `0` pour boutons principaux/secondaires, champs, popovers et variantes ;
- badge global très arrondi, à utiliser seulement lorsque la fonction le justifie ;
- sections Optiz existantes, dont `barre-defil`, `image_defile`, `image_db`, `avis-verif`, `avant-apres`, `offre-ghassoul`, `op-mastic-offer`, `product-scroll-reveal` et `section-book` ;
- intégrations observées : Klaviyo, Opus Cart Upsell, Microsoft Clarity et auto-add-to-cart.

La branche principale du repo est actuellement vide car le dernier commit supprime l'archive du thème ; l'archive existe dans l'historique au commit précédent. Toujours vérifier que le dossier de travail contient bien le thème attendu avant toute modification. Ne jamais pousser une restauration, un déploiement ou une modification de production sans demande explicite.

## Stratégie de modification

1. Chercher d'abord la section, le snippet, le bloc, le template et les réglages qui produisent le rendu.
2. Préférer une correction locale d'un composant existant lorsqu'elle préserve correctement le Theme Editor.
3. Créer une nouvelle section seulement si le rôle, le schéma ou la composition diffèrent réellement.
4. Ne pas refactorer les autres blocs ou templates au passage.
5. Éviter d'ajouter du CSS/JS inline dans les templates JSON ou les blocs `custom-liquid`. Quand une zone touchée contient déjà cette dette, améliorer prudemment le périmètre modifié sans lancer une migration globale non demandée.

## Liquid et Theme Editor

- Conserver un `{% schema %}` valide et des presets utiles pour les nouvelles sections.
- Exposer uniquement les réglages que le marchand doit réellement changer : contenu, image, produit, lien, couleurs prévues, alignement pertinent et espacements raisonnables.
- Utiliser des valeurs par défaut crédibles seulement lorsqu'elles sont vraies et génériques à la fonction. Ne jamais placer une fausse preuve ou promesse dans un défaut de schéma.
- Prévoir les valeurs `blank`, les produits absents, les images manquantes et les collections vides.
- Utiliser `{{ section.id }}` ou un sélecteur racine propre à la section pour isoler les styles et identifiants.
- Employer `section.shopify_attributes` et `block.shopify_attributes` quand le Theme Editor doit sélectionner les éléments.
- Respecter l'ordre sémantique du DOM ; ne pas simuler la composition uniquement avec des positions absolues.
- Utiliser les filtres Shopify d'image avec dimensions adaptées, `widths`, `sizes`, `loading` et texte alternatif pertinent.
- Échapper le texte simple ; rendre le `richtext` selon son type sans double échappement.
- Réutiliser les snippets de spacing, color schemes, boutons et variables du thème lorsque leur résultat correspond à l'intention.

## CSS

- Partir des variables existantes du thème avant de dupliquer des valeurs.
- Introduire des variables Optiz au niveau le plus étroit possible, par exemple `--optiz-red`, `--optiz-ink`, `--optiz-paper` et `--optiz-typewriter`.
- Conserver les boutons et champs commerciaux lisibles et cohérents avec leurs états natifs.
- Préférer bordures nettes, aplats et typographie aux ombres décoratives.
- Employer `clamp()` avec modération pour les grandes échelles typographiques.
- Tester les contenus longs et le français ; ne pas fixer des hauteurs qui coupent le texte.
- Ne pas masquer les débordements par défaut lorsque le concept comporte un produit ou une annotation qui dépasse ; contrôler le débordement volontairement.
- Respecter `prefers-reduced-motion` et les préférences de contraste lorsque pertinent.

## Ajout de la police typewriter

Ne pas multiplier les imports Google Fonts dans les sections. Procédure préférée :

1. vérifier si une famille mono/typewriter convenable existe dans le sélecteur de polices Shopify ;
2. sinon choisir une famille dont la licence autorise l'usage commercial et le self-hosting ;
3. vérifier les caractères français, chiffres, ponctuation et graisses nécessaires ;
4. ajouter seulement les WOFF2 utiles dans `assets/` ;
5. déclarer `@font-face` une fois avec `font-display: swap` ;
6. exposer `--optiz-typewriter` et l'utiliser uniquement pour les micro-contenus définis dans `art-direction.md` ;
7. vérifier le reflow, le CLS et le fallback.

Ne pas choisir une police précise ni télécharger un fichier sans vérifier la licence et obtenir l'accord si cette décision change l'identité.

## JavaScript

- Utiliser JavaScript seulement si HTML/CSS et les composants du thème ne suffisent pas.
- Encapsuler le comportement par section et éviter les sélecteurs globaux fragiles.
- Ne pas supposer que `DOMContentLoaded` ne se produit qu'une fois : le Theme Editor peut recharger les sections.
- Nettoyer les listeners et timers lors du déchargement d'une section si nécessaire.
- Utiliser les événements Shopify du Theme Editor lorsque la section doit fonctionner en mode design.
- Préserver navigation clavier, focus, annonces accessibles et comportement sans animation.
- Ne pas ajouter de particules, compteurs ou rotations décoratives sans rapport avec le concept.

## Compatibilité et performance

- Ne pas casser les app blocks ou leurs conteneurs.
- Ne pas réécrire le panier, le paiement accéléré ou le sélecteur de variantes sans nécessité explicite.
- Limiter les images lourdes, scripts tiers et polices.
- Éviter les requêtes réseau déclenchées par simple décoration.
- Vérifier Safari/iOS et Chrome au minimum lorsque l'environnement le permet.
- Garder un parcours utilisable sans hover.

## Validation technique

Selon les outils disponibles :

- exécuter Shopify Theme Check ;
- lancer l'aperçu du thème de développement ;
- vérifier la console et les erreurs réseau ;
- tester la section dans le Theme Editor ;
- tester largeur mobile étroite, tablette et desktop ;
- vérifier panier, variantes, disponibilité et CTA si touchés ;
- comparer avant/après avec des captures au même viewport.

Ne pas prétendre avoir testé la boutique en ligne si seule une lecture statique a été faite.
