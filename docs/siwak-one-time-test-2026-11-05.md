# Test Siwak en achat unique — 5 novembre 2026

Prévisualisation : https://optiz.store/products/siwak?preview_theme_id=197781324158

Thème modifié : **V2 Sync IRT ArcSiwak**, `197781324158`, rôle `unpublished` vérifié avant envoi. Aucun envoi au thème actif et aucune publication. Le thème actif constaté pendant l'intervention est `198911066494` ; les anciennes notes de cible live sont obsolètes. Aucun produit, contrat client, abonnement, remise ou tarif de livraison n'a été modifié.

Source : branche `codex/siwak-one-time-test`, commit d'implémentation `99fe793`. Copie de travail isolée : `/Applications/Document/Jarvis/Projet/Optiz-Siwak-Achat-Unique-Test`. Les conflits et fichiers déjà présents dans le dossier de travail initial ont été préservés. Le déploiement de dev a été effectué avec Shopify CLI, uniquement pour les neuf fichiers du thème listés ci-dessous. La branche connectée `codex/optiz-dev-sync` n'a pas été poussée ; un futur déploiement sur cette branche doit tenir compte du test pour ne pas l'écraser.

## Modification

- Achat unique pour cette fiche ; suppression du sélecteur de mode et du renouvellement, retrait de `selling_plan` dans le formulaire puis dans le payload avant ajout, sur le chemin commun aux deux boutons.
- 1 boîte / 5 siwaks / 12 €, présélectionnée, sans cadeau ; 2 boîtes / 10 siwaks / 24 € et étui ; 4 boîtes / 20 siwaks / 48 €, étui, cadeau au choix et livraison pour les destinations éligibles.
- Prix lus sur le produit Siwak Shopify ; prix principal, barre rapide et CTA synchronisés sur le lot. La barre mobile affiche le texte du CTA sur une deuxième rangée afin de conserver un libellé explicite.
- Sélection et annulation du cadeau existantes conservées. L'application de remise reste responsable de la gratuité effective des cadeaux. Les cadeaux marqués sont dédupliqués et retirés lorsque le seuil n'est plus atteint ; l'étui est aussi ajouté quand une hausse de quantité dans le panier le débloque.
- Barre de livraison Opus recalculée depuis `cart.total_price`, après remises. Elle annonce les destinations FR/BE/LU ; pour les autres pays elle renvoie aux frais calculés au paiement.
- Visuels, arguments, avis, pop-up et sections conservés. Aucun nouvel appel de pixel ni nouvel événement publicitaire ajouté.

## Vérifications Shopify

La variante `56366142259582` (`OPT-SIW-5`) coûte bien 12,00 € et accepte l'achat ponctuel. La remise automatique « Siwak — étui dès 2 boîtes + cadeau dès 4 » est active. Les tests réels de panier confirment :

| Lot | Total des produits après remises | Étui | eBook choisi | Allocation d'abonnement |
| --- | --- | --- | --- | --- |
| 1 | 12 € | absent | absent | aucune |
| 2 | 24 € | 0 € | absent | aucune |
| 4 | 48 € | 0 € | 0 € | aucune |

Les tarifs actifs du profil général sont 4 € sous 40 €, puis 0 € dès 40 €, pour France, Belgique et Luxembourg. Les autres zones ont des tarifs distincts (11 € UE, 17 € international). Une remise de livraison séparée, active dès 80 € pour tous les pays, existe aussi ; elle n'a pas été modifiée.

Les tarifs retournés par l'API de calcul de livraison Shopify pour France / 75001 sont respectivement **4 €, 4 €, 0 €** pour les lots 1, 2 et 4, cadeaux inclus. Cela vérifie le calcul de tarif, sans créer de commande.

Anomalie reproduite avant correction dans le navigateur : 24 € de Siwak et un étui gratuit à valeur faciale 8 € annonçaient 8 € manquants. Après correction : **16 € manquants**, progression **60 %**. Un panier net de 20 € doit de même annoncer 20 € manquants ; cette valeur précise est déduite du calcul, sans test d'un code de remise produisant ce total.

## Résultats de validation

- **14 tests Node réussis** : choix/annulation/Escape, reprise d'un ajout après confirmation du cadeau, absence de cadeau requis sur les petits lots, absence de forfait sur les cadeaux, seuils, doublons, protection des lignes au détail et des autres produits, retrait sous les seuils, synchronisation des trois lots et suppression du forfait dans le formulaire.
- Syntaxe JavaScript et `git diff --check` : réussis.
- Shopify Theme Check : **561 erreurs et 13 avertissements**, déjà présents sur la base ; comparaison des diagnostics avant/après : **aucun nouveau diagnostic**. Notamment références aux blocs d'application et traductions déjà manquantes. Les composants Liquid modifiés n'ajoutent aucun diagnostic.
- Navigateur desktop : défaut à 1 boîte / 12 € ; lot 2 / 24 € et lot 4 / 48 € ; synchronisation prix/CTA ; ajout principal du lot 2 ; ajout rapide du lot 4 ouvrant la sélection ; annulation sans ajout ; sélection de l'eBook et reprise d'un ajout ; étui et eBook à 0 € ; total 48 € ; ajout répété conservant les lignes et un seul exemplaire de chaque cadeau ; changement de quantité et suppression du Siwak avec nettoyage des cadeaux.
- Vue responsive Chrome **400 px** : trois lots présents ; 1 boîte sélectionnée au chargement ; CTA principal et rapide avec total ; sélection du lot 2 et ajout principal ; cadeaux existants uniques, total 72 € pour 6 boîtes après ajout répété. Le parcours a aussi atteint 8 boîtes / 96 € lors de tests répétés, toujours avec un seul étui et un seul eBook.
- Checkout ouvert en mode preview, sans aucune commande et sans coordonnées saisies : lignes Siwak à 12 € par boîte, étui et eBook affichés **GRATUIT**, remises de 8 € et 37 €, total de produits cohérent (96 € pour 8 boîtes dans le dernier panier de test), aucune mention de renouvellement. Le checkout demande une adresse pour afficher les modes d'expédition ; les tarifs ont été vérifiés séparément via l'API Shopify ci-dessus.

## Vérifications restantes avant publication

La matrice complète de chaque lot × chaque bouton × desktop/mobile n'a pas été parcourue intégralement dans l'interface. Restent notamment les deux boutons pour le lot 1 sur mobile, l'ajout rapide mobile des lots 2 et 4, le rendu à 320/375 px et Safari/iPhone réel, ainsi que la navigation clavier complète. La vue mobile a été contrôlée à 400 px, sans certification sur appareil physique.

La disponibilité empêchait de choisir la poudre au charbon ; elle reste désactivée dans le sélecteur existant. L'eBook a été vérifié dans le panier et au checkout ; les autres cadeaux disponibles n'ont pas tous été essayés en conditions réelles.

Le code de suivi existant et ses points d'émission ont été conservés ; aucun appel `fbq`, `ttq`, `gtag` ou nouvel événement d'ajout n'a été ajouté. **La réception et la déduplication Meta/TikTok côté plateformes n'ont pas été certifiées** : compléter avec les outils de test d'événements, un ajout réussi par bouton, et vérifier un seul événement attribuable à chaque action, y compris après annulation/reprise du cadeau. Le navigateur utilisé contient des extensions et des erreurs de scripts tiers ; il ne constitue pas un environnement propre pour certifier ces événements.

Le Mac a temporairement manqué d'espace, provoquant l'échec de certaines captures. La validation a pu reprendre, mais aucune série complète de captures exportées n'est fournie.

## Retour arrière

Le commit `99fe793` contient uniquement cette implémentation et son test. Pour annuler le test, créer une branche depuis `codex/siwak-one-time-test`, exécuter `git revert 99fe793`, contrôler le diff, vérifier de nouveau que `197781324158` est non publié et renvoyer **uniquement** ces neuf fichiers au même thème avec Shopify CLI (`--nodelete`, cible explicite, sans option de publication). Ne pas pousser la branche connectée sans vérifier les changements entrants.

Une copie des neuf fichiers avant modification a également été conservée localement dans le dossier `rollback-siwak-one-time-2026-11-05` voisin de cette copie de travail. Elle permet un renvoi ciblé au même thème non publié. Le rollback n'affecte ni les contrats existants ni les tarifs/remises Shopify, qui n'ont pas été changés.

## Fichiers modifiés

- `blocks/siwak-product-offers.liquid` — offre, achat ponctuel, défaut, synchronisation et CTA mobile.
- `assets/product-form.js` — retrait du forfait au moment de construire la requête Siwak.
- `assets/siwak-gift-cart.js` — calcul net de livraison et étui lors d'une hausse de quantité.
- `layout/theme.liquid` — pays de la localisation transmis au calcul de livraison.
- `snippets/add-to-cart-button.liquid` — cible de texte stable pour le CTA Siwak.
- `snippets/siwak-offer-rewards.liquid` — précision des destinations de livraison.
- `locales/fr.json`, `locales/en.default.json` — remplacer la notion de premier envoi par cet achat.
- `templates/product.siwak-lp.json` — « Choisis ton lot ».
- `tests/siwak-one-time.test.mjs` — contrôle des trois totaux, deux CTA, données de cadeau et absence de forfait.

## Protocole de comparaison CRO

Hypothèse : retirer la complexité d'abonnement facilite le premier achat. Aucun lien causal avec une baisse des ventes n'est démontré et aucun gain n'est promis.

Ne pas envoyer les publicités vers une prévisualisation pour lancer une mesure de production. Après validation technique et autorisation explicite de publier, noter l'heure exacte du changement et exclure cette journée de transition, les sessions de prévisualisation et les tests internes. Conserver prix, publicités, budgets, promotions et autres éléments de page aussi stables que possible, ou journaliser leurs changements.

Comparer des journées **complètes**, dans le fuseau de la boutique, avec mêmes jours de semaine et fenêtres de même durée (par exemple 14 jours avant / 14 jours après, à prolonger selon volume). Fixer la durée avant de consulter les résultats. Attendre aussi la stabilisation des achats attribués.

Sur la cohorte des sessions arrivant sur `/products/siwak`, calculer :

1. taux session → panier = sessions comportant au moins un ajout réussi de Siwak / sessions de la cohorte ;
2. taux d'achat = sessions avec achat / sessions de la cohorte ;
3. revenu par session = revenu attribué selon une définition constante / sessions de la cohorte.

Distinguer Meta payant, TikTok payant, autres sources payantes, organique, direct et email ; conserver `source / medium / campaign` UTM et ventiler mobile/desktop, nouveaux/anciens visiteurs, pays et jours complets. Afficher effectifs et revenus bruts avec les taux. Conserver le même modèle d'attribution et la même définition de revenu avant/après ; ne pas additionner les conversions revendiquées par les plateformes.

Le taux panier est un indicateur intermédiaire : juger aussi le taux d'achat et le revenu par session. Avec peu de commandes, rendre les résultats descriptifs et éviter de déclarer un gagnant. Un avant/après reste exposé aux variations de trafic, de créatifs et de saisonnalité ; il ne suffit pas seul à démontrer une causalité.

## Publication autorisée par Matthieu

2026-11-05T14:42:21+01:00 : duplication du thème de test `197781324158`, puis publication de la copie **Optiz - Siwak achat unique 2 boites - 05-11-2026**, ID `199032209790`, à la demande explicite de Matthieu dans la conversation. Le thème de dev reste non publié. L’ancien thème actif `198911066494` est conservé non publié et permet le retour arrière par republication.

Vérification après publication : Shopify confirme le rôle live de `199032209790` ; la réponse publique de `/products/siwak` sans cookie de prévisualisation identifie ce même thème et contient le mode achat unique avec la quantité 2 cochée. Les fichiers de logique de prix et cadeaux de la copie ont été comparés à ceux validés sur le dev. Shopify a seulement supprimé du JSON le réglage obsolète `selling_plan_id`, dont le schéma a été retiré.

La valeur par défaut de 2 boîtes remplace le défaut de 1 boîte décrit dans le protocole initial (commit `a904261`). La journée de publication doit être exclue du comparatif avant/après. Les limites de validation Meta/TikTok et appareil physique mentionnées plus haut restent applicables.
