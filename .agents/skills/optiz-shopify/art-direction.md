# Direction artistique Optiz

## Intention

Créer un univers vivant, contrasté, légèrement chargé et tactile. La bonne tension est : **commerce contemporain × print artisanal × packaging rétro × typographie éditoriale/typewriter**.

L'ensemble doit évoquer une petite équipe créative qui imprime ses affiches, colle ses étiquettes et manipule ses produits — pas une interface générée à partir des tendances du moment.

## Couleurs

### Palette principale

- **Rouge Optiz** : vif, frontal, énergique. Tester autour de `#E52219`, `#E62B22` ou `#E32B24` selon le contexte.
- **Noir cassé** : proche de `#212121`, suffisamment dense pour les fonds et les titres.
- **Blanc papier** : blanc légèrement chaud plutôt qu'un blanc bleuté clinique.

Le rouge doit rester immédiatement perçu comme rouge. Ne pas le convertir en bordeaux « premium », terracotta sage ou rouge désaturé triste. Éviter le `#FF0000` numérique lorsqu'une nuance plus organique donne le même impact.

### Chaleur secondaire

Les tons crème, bois, brun et les matières naturelles des photos sont une partie du système. Ils empêchent le rouge/noir de devenir agressif ou sportif générique. Les introduire par les images et matières plutôt que par une multiplication de couleurs UI.

### Usage

- Employer les aplats rouges pour les moments forts, bandeaux et accents structurants.
- Employer le noir pour donner de la densité, cadrer un produit ou créer une rupture.
- Laisser le blanc papier respirer, sans transformer toute la page en minimalisme clinique.
- Ne pas appliquer le rouge à tous les éléments interactifs et à tous les mots importants : hiérarchiser.

## Typographie

### Système actuel à préserver

- **Barlow Condensed** : titres, signalétique, navigation, impact.
- **Inter** : corps, informations fonctionnelles et lecture soutenue.

Le contraste de largeur et d'échelle entre ces deux familles fait déjà partie de l'identité.

### Typewriter

Ajouter une vraie famille typewriter/monospace expressive comme troisième voix, après vérification de sa licence et des accents français. La charger localement en WOFF2 si elle n'est pas disponible dans le sélecteur Shopify.

Utilisations adaptées :

- petits titres et surtitres ;
- annotations, légendes et références ;
- bénéfices courts et informations produit ;
- numéros, dates, lots, notes et petits CTA secondaires ;
- détails éditoriaux donnant l'impression d'avoir été écrits ou imprimés.

Ne pas utiliser la typewriter pour de longs paragraphes, tous les boutons ou tous les titres. Elle est une voix, pas un filtre décoratif.

## Composition

Composer certaines sections comme une petite affiche ou une page de magazine :

- titre massif et franchement aligné ;
- annotation typewriter sur un autre axe ;
- produit détouré dépassant légèrement d'un cadre ;
- photo plein cadre ou recadrage volontaire ;
- encadré rouge, bandeau imprimé, numéro ou légende ;
- flèche dessinée, astérisque, soulignement imparfait ou petit tampon ;
- variation d'échelle forte entre manifeste, preuve et détail.

Accepter l'**irrégularité contrôlée** : asymétrie, débordement, décalage et rythme inégal sont permis s'ils clarifient ou donnent de la tension. L'ordre de lecture et l'accessibilité ne doivent jamais dépendre de cette irrégularité.

Chaque section importante doit avoir une idée décrivable en une phrase, par exemple : « un manifeste typographique traversé par un ruban rouge », et non « un titre avec trois cartes ».

### Registre éditorial illustré

Utiliser plus souvent, lorsque la section doit comparer, vendre ou expliquer un produit, un registre **magazine/cartoon imprimé** inspiré des encarts publicitaires et modes d’emploi illustrés :

- aplats rouge, noir et blanc papier sans dégradé ;
- contours noirs francs autour des images et informations importantes ;
- ombres dures et légèrement décalées, comme un élément imprimé posé sur la page ;
- titres condensés en capitales, prix ou mots clés volontairement surdimensionnés ;
- cases cochées, croix, flèches, astérisques et petits encarts dessinés avec des formes simples ;
- photos carrées ou détourées traitées comme des vignettes éditoriales ;
- contrastes de blocs rappelant une BD, une affiche ou une double page de magazine.

Ce registre doit donner de l’énergie et rendre l’information plus mémorable, pas infantiliser le produit. Le réserver aux moments qui gagnent à être démonstratifs — offre, comparaison, bénéfices, mode d’emploi — et conserver des sections plus calmes entre eux. Préférer une composition nette avec un ou deux gestes expressifs à une accumulation de stickers, rotations et effets dessinés.

## Éléments print

Employer avec mesure :

- étiquettes et bouts de papier ;
- cadres fins et bordures franches ;
- tampons, astérisques, numéros et repères ;
- soulignements imparfaits et flèches dessinées ;
- petits pictogrammes simples ;
- découpes, superpositions et textures très légères.

Une page n'a pas besoin de tous ces éléments. Un ou deux gestes cohérents valent mieux qu'une accumulation de gimmicks.

## UI commerciale

Le panier, les variantes, le prix, la disponibilité, les formulaires et les CTA principaux restent immédiatement lisibles.

- Préférer aplats, lignes, bordures et contraste typographique.
- Limiter rayons, ombres et capsules.
- Garder les états interactifs explicites.
- Utiliser une hiérarchie forte, mais ne jamais sacrifier le libellé d'une action à l'esthétique.
- Réserver les formes très arrondies aux cas où la fonction ou l'existant les justifie.
- Pour les offres et sélecteurs importants, préférer des « tickets » éditoriaux : bordure noire, aplat franc, case de sélection explicite, prix massif et détail court. L'état choisi doit se lire par le contraste et une ombre dure, jamais par une ombre diffuse ou un simple halo.

## Photographie

- Préserver la chaleur : crème, bois, brun, matières naturelles et lumière tangible.
- Favoriser des cadrages qui montrent le produit comme un objet réel, pas comme un rendu flottant de catalogue tech.
- Mélanger détails matière, gestes d'usage, personne et produit selon le message.
- Un fond noir peut donner de la force au produit ; un fond chaud peut réhumaniser la page.
- Ne pas uniformiser toutes les images au même ratio si la composition gagne à varier.

## Mouvement

Le mouvement sert le concept : bandeau qui défile, révélation liée à un geste, produit qui entre dans le cadre. Éviter le fade-up appliqué à chaque élément, les halos pulsants, particules décoratives et animations permanentes sans fonction. Respecter `prefers-reduced-motion`.

## Cohérence sans répétition

Conserver les couleurs, la voix typographique, la matérialité, la chaleur photographique et la logique de hiérarchie. Ne pas reproduire mécaniquement un layout existant. Toutes les sections ne doivent pas devenir des affiches complexes ; certaines doivent rester calmes pour que les moments forts aient de l'impact.
