---
name: optiz-shopify
description: Conçoit, rédige, modifie et audite la boutique Shopify Optiz en respectant son identité rouge/noir/blanc, son langage print artisanal et son message de marque. À utiliser pour toute intervention de design, copywriting, Liquid, CSS, JavaScript, section, template ou Theme Editor sur Optiz.
---

# Optiz Shopify

## Principe directeur

**REFINE, DON'T REDESIGN.**

Optiz possède déjà une identité. Toute intervention doit sembler être une meilleure exécution de cette identité, jamais une nouvelle marque plaquée sur l'ancienne. Préserver ce qui a du caractère, corriger ce qui est générique, fragile ou incohérent.

L'objectif n'est pas de « faire premium ». L'objectif est de rendre Optiz plus net, plus vivant, plus crédible et plus mémorable : commerce contemporain + print artisanal + packaging rétro + typographie éditoriale/typewriter.

## Références à lire

Lire les fichiers utiles avant d'agir :

- Toujours lire [brand.md](brand.md).
- Pour une décision visuelle, une section ou une page, lire [art-direction.md](art-direction.md), [anti-ai-slop.md](anti-ai-slop.md) et [references.md](references.md).
- Pour écrire, réécrire ou valider du contenu, lire [copywriting.md](copywriting.md).
- Pour modifier le thème, lire [shopify-development.md](shopify-development.md).

Ne pas appliquer une règle isolée sans tenir compte de l'ensemble. La cohérence Optiz ne vient ni d'un seul rouge, ni d'une police typewriter, ni d'une texture : elle vient de la relation entre message, composition, matière, photographie et hiérarchie.

## Hiérarchie de décision

Pour chaque demande, raisonner dans cet ordre :

1. **BRAND** — que défend Optiz, pour qui, et quelle émotion doit rester ?
2. **MESSAGE** — quelle idée vraie et utile la page doit-elle faire comprendre ?
3. **SECTION** — quel rôle précis cette section joue-t-elle dans le parcours ?
4. **COMPOSITION** — quelle idée visuelle identifiable sert ce rôle ?
5. **CODE** — quelle implémentation Shopify est la plus simple, robuste et éditable ?

Si le but de la section ou les faits produit indispensables manquent, ne pas remplir les vides avec du texte marketing générique. Utiliser des champs clairement signalés entre crochets, proposer les informations à fournir, ou conserver le contenu existant jusqu'à validation.

## Workflow obligatoire

### 1. Avant modification

- Inspecter la page, la section, ses voisines et les styles réellement chargés.
- Identifier ce qui est signature, ce qui est fonctionnel et ce qui est générique.
- Vérifier le contenu disponible : produit, bénéfice démontrable, preuve, offre, CTA et contraintes légales.
- Formuler en une phrase : **« L'idée de cette section est… »**. Si la phrase ne décrit qu'un assemblage de composants, revoir la composition.
- Décider ce qui doit être conservé, simplifié, déplacé ou créé.
- Pour une modification risquée ou large, expliquer brièvement l'intention avant de coder.

### 2. Conception

- Produire une composition propre au rôle de la section, sans copier mécaniquement une section existante.
- Préserver au moins les repères Optiz pertinents : contraste, hiérarchie, rouge énergique, noir/blanc, chaleur photographique, matérialité ou détail éditorial.
- Ajouter au maximum quelques gestes print justifiés. Ne pas transformer chaque bloc en collage.
- Garder les fonctions commerciales immédiatement compréhensibles.

### 3. Implémentation

- Réutiliser les primitives, variables, snippets et conventions du thème quand elles conviennent.
- Préserver l'édition dans le Theme Editor et les données marchand.
- Encapsuler les styles et comportements ; ne pas modifier globalement le thème pour résoudre un problème local.
- Ne pas ajouter de dépendance, police distante ou bibliothèque sans nécessité et autorisation.
- Préserver accessibilité, responsive, performance et compatibilité Shopify.

### 4. Validation après modification

Vérifier au minimum :

- rendu desktop et mobile, y compris longueurs de texte réalistes ;
- hiérarchie au premier coup d'œil et continuité avec les sections voisines ;
- focus clavier, contrastes, textes alternatifs, ordre de lecture et zones tactiles ;
- états vides, contenu absent, produits épuisés, prix longs et traductions ;
- Theme Editor : ajout, suppression, réordonnancement et mise à jour de la section si applicable ;
- absence d'erreur Liquid/JavaScript et de régression visible ;
- absence de placeholder, promesse inventée ou allégation santé non étayée ;
- résultat comparé aux deux captures de [references.md](references.md).

Terminer par ces trois questions :

1. **Ai-je raffiné Optiz ou remplacé Optiz par une esthétique à la mode ?**
2. **La section a-t-elle une idée de composition reconnaissable ?**
3. **Chaque phrase et chaque effet visuel ont-ils une fonction réelle ?**

## Contrat de sortie

Lors d'une intervention, livrer de façon concise :

- l'intention retenue ;
- les fichiers changés ;
- les choix de contenu qui demandent encore une validation humaine ;
- les vérifications effectuées et les limites restantes.

Ne jamais déclarer une allégation, une compatibilité ou un résultat validé si cela n'a pas été vérifié.
