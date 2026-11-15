# Test Siwak : avec ou sans pop-up

État : préparation/recette, pas de collecte de production ni de publication du thème.

### État de configuration au 15 novembre 2026

- Code initial `8f9d0c3`, recette autorisée par `b83efe7` ; synchronisation du thème vérifiée, aperçu ouvert dans Opera.
- GA4 : dimensions événement créées et relues dans l'administration : **Optiz Experience** (`experiment_id`), **Optiz Groupe** (`variant_id`), **Optiz Environnement** (`environment`). Métrique **Optiz Valeur commande experience** (`order_value`), unité Devise, catégorie revenus, créée et vérifiée.
- Pixel Shopify **Optiz Siwak popup experience**, ID `343277950` : **connecté**, état vérifié dans l'administration après accord explicite de Matthieu. Analyse requise, marketing/préférences non requis, données non considérées comme vente.
- Klaviyo : clone `VKsPes` et exclusion du marqueur sur `VVGheZ` **publiés après accord explicite**, règles live relues par API. Clone live `29718756`, original live `29718723`. Les cinq sélecteurs CSS du clone qui mentionnaient encore l'ID original ont été adaptés à `VKsPes` pour conserver le rendu mobile.
- Recette réelle : aucun formulaire dans le groupe `holdout`, clone uniquement dans `popup`. Affectation, ouverture, fermeture, ajout au panier et début du paiement acceptés par GA4 ; événements et paramètres du paiement relus dans **DebugView**. Retrait du consentement : affectation et stockage du contrôleur supprimés. Voir [RECETTE-2026-11-15.md](RECETTE-2026-11-15.md).
- Mode `qa`, ciblage vérifié **vrai**, collecte des achats vérifiée **faux**. Aucune activation de production ni publication du thème. Achat réel et inscription e-mail non effectués ; commande de test demandée à Matthieu pour le rapprochement final.

## Cibles et principe

- Expérience : `siwak_popup_v1` ; unité = navigateur consentant, pas personne tous appareils confondus.
- Répartition 50/50, stable 30 jours et verrouillée entre onglets du même domaine.
- `popup` : clone de la pop-up existante, demandé après 7 secondes, avec les mêmes textes, offre, consentement et liste Email magnet.
- `holdout` : aucune pop-up sur la fiche Siwak.
- Intervention uniquement sur `/products/siwak` et ses chemins localisés. Les autres pages gardent leurs règles normales : ce test mesure l'effet de la pop-up sur la fiche Siwak, pas sa suppression sur toute la boutique.
- Nouveaux participants : profils inconnus de Klaviyo, consentement analytics accordé, stockage, cookie Google Analytics existant et Web Locks disponibles. Sans consentement ou sans stockage, pas d'inscription à l'expérience.
- La pop-up originale est exclue sur l'URL contenant `optiz_popup_test=managed`, ajouté avant le chargement de Klaviyo. Le reste de l'URL, y compris les UTM et l'aperçu, est conservé.
- Aucun gagnant automatique, aucun changement du budget publicitaire.

## Ressources

- Thème de recette unique : `197781324158` (non publié), branche connectée `codex/optiz-dev-sync`.
- Branche d'implémentation : `codex/siwak-popup-experiment`, dans un espace Orca dédié.
- Formulaire original : `VVGheZ`, **OPTIZ | Bienvenue -10 %**. L'exclusion du marqueur est publiée ; les autres règles et le contenu sont conservés.
- Clone : `VKsPes`, **OPTIZ | Test Siwak popup v1 | Traitement**, déclenchement JavaScript uniquement ; même liste `VCwZhh`, donc même flux de bienvenue `WveiNa`.
- Sauvegarde du formulaire original avant modification : `sauvegardes/klaviyo-popup-VVGheZ-avant-experiment.json` dans le dossier principal du projet.
- Propriété GA4 : `518462075` ; flux Web Optiz `13245067098`, `https://optiz.store`, mesure **G-V6ZGZG90XP**, vérifiés dans Google Analytics.

## Suivi

Le thème publie des événements Shopify. **Publier un événement ne prouve pas qu'un pixel l'a reçu.** Le pixel fourni doit être installé/connecté, les dimensions créées et les événements vérifiés dans GA4 avant d'autoriser la production.

| Événement GA4 | Sens |
|---|---|
| `experiment_impression` | Affectation d'un navigateur éligible ; une fois par affectation |
| `optiz_exp_return` | Retour d'un participant existant |
| `optiz_exp_popup_open` | Ouverture réelle signalée par Klaviyo, distincte de la demande d'ouverture |
| `optiz_exp_popup_close` | Fermeture |
| `optiz_exp_popup_submit` | Action d'inscription principale ; pas chaque étape |
| `optiz_exp_add_to_cart` | Ajout du Siwak payé ; les lignes cadeau ne gonflent pas le compteur |
| `optiz_exp_checkout` | Début du paiement |
| `optiz_exp_payment` | Informations de paiement envoyées |
| `optiz_exp_purchase` | Achat signalé par Shopify, une fois par commande dans le stockage du navigateur |
| `optiz_exp_contaminated` | Pop-up originale encore ouverte ou pop-up vue dans le groupe sans |
| `optiz_exp_tracking_error` | Annotation du panier impossible ou délai dépassé |

Paramètres communs : `experiment_id`, `variant_id`, `environment`, `visitor_id`, `device_type`, `page_path`. Les données Klaviyo `metaData`, e-mails, adresses et numéros de téléphone ne sont jamais copiés. Le pixel remplace aussi l'URL et le référent automatiques par un chemin sans requête pour éviter d'envoyer des paramètres de paiement.

Le pixel émet un événement d'achat spécifique, **pas un second événement standard `purchase`**. Il ne change pas le suivi e-commerce déjà installé. `order_value` = total brut payé indiqué par le checkout, livraison et taxes incluses. Les remboursements, paiements en attente et commandes réellement payées doivent être rapprochés des commandes Shopify ; ne pas qualifier ce montant de marge ni de revenu net.

Une annotation privée `__optiz_experiment` contient le groupe, l'identifiant aléatoire et l'expiration dans le panier/commande Shopify. L'ajout au panier attend au maximum une seconde pour cette annotation et continue même si le suivi échoue. Le pixel utilise les attributs checkout quand disponibles et son stockage en secours ; les commandes Shopify restent la source de contrôle, notamment si le pixel est bloqué ou la page de confirmation ne charge pas.

## Configuration GA4 et Shopify

1. Dans GA4 > Administration > Affichage des données > Définitions personnalisées, créer les dimensions de portée **Événement** `experiment_id`, `variant_id`, `environment`. Ne pas enregistrer `visitor_id` comme dimension : forte cardinalité.
2. Créer la métrique personnalisée **Valeur commande expérience**, paramètre `order_value`, portée Événement, unité Monnaie (EUR). Utiliser une vue filtrée EUR ; ne pas additionner des devises différentes.
3. Dans Shopify > Paramètres > Événements clients, créer **Optiz — expérience pop-up Siwak**, coller `shopify-custom-pixel.js`. Régler la confidentialité : **Analytics requis**, marketing non requis, vente/partage non requis. Ne pas accepter un éventuel accord contractuel au nom de Matthieu.
4. Connecter le pixel seulement après vérification du code et du bon flux GA4. En recette, les événements portent `environment=qa` et `debug_mode=true`.
5. Dans GA4 DebugView, vérifier le chemin complet : affectation des deux groupes, ouverture uniquement en `popup`, inscription, panier, début du paiement. Un achat de test Shopify autorisé séparément reste nécessaire pour valider la réception réelle de `optiz_exp_purchase` ; les tests unitaires ne remplacent pas cet achat.
6. Rapprocher une commande test et son annotation privée avec son événement GA4 avant de cocher **Pixel et collecte des achats vérifiés** dans le thème.

## Rapport de décision

Exploration enregistrée : [Optiz — Siwak pop-up A/B — suivi](https://analytics.google.com/analytics/web/#/analysis/a379365749p518462075/edit/ZGONAhihTnu3D9aXvbz7OQ), onglet **Production — groupes et parcours**. Lignes groupe et événement ; colonnes appareil ; valeurs utilisateurs, événements et valeur commande ; 50 lignes. Les filtres d'expérience et de production sont déjà appliqués. La vue est vide tant que le test public n'est pas activé. Les 28 derniers jours sont la plage initiale : régler les dates sur toute la période du test lors de l'analyse finale.

Lire les lignes de cette exploration ainsi :

- Filtres `experiment_id = siwak_popup_v1`, `environment = production` ; dates de l'expérience seulement.
- Lignes : `variant_id` ; ventilation séparée par catégorie d'appareil.
- Dénominateur : utilisateurs avec `experiment_impression` (identifiant client Google existant réutilisé, sans créer un second utilisateur GA4). Ne pas utiliser les visiteurs qui ont vu/soumis le formulaire comme dénominateur.
- Achats : événements `optiz_exp_purchase` ; contrôle des doublons par `transaction_id`, rapprochement Shopify des commandes payées et remboursements.
- Taux d'achat = acheteurs affectés / visiteurs affectés. Revenu brut par visiteur = somme `order_value` des commandes retenues / visiteurs affectés. Taux d'inscription = `optiz_exp_popup_submit` / visiteurs affectés ; indicateur secondaire.
- Afficher aussi contaminations et erreurs de suivi par groupe. Si des vues du formulaire original apparaissent dans le test, ne pas conclure tant que le ciblage n'est pas corrigé.
- Ne pas additionner les revenus attribués au formulaire et au flux e-mail ; ils se recoupent.

Le tableau ne calcule pas automatiquement le taux d'achat ni le revenu par visiteur : utiliser les **utilisateurs de la ligne `experiment_impression`** comme dénominateur et ceux de `optiz_exp_purchase` comme acheteurs ; diviser la valeur de la ligne achat par ce dénominateur. Ne pas utiliser le total de tous les événements. Le rapprochement Shopify reste nécessaire avant une décision.

Faire au moins deux semaines complètes de collecte et laisser maturer la fenêtre de suivi de 30 jours des derniers entrants avant la décision finale. Deux semaines ne garantissent pas assez de volume. Définir le seuil d'effet utile et la taille d'échantillon après lecture du taux d'achat de référence ; ne pas arrêter sur une fluctuation quotidienne. Sans données suffisantes, conclure « non concluant », jamais « égalité ».

## Recette et activation

- Le mode `qa` agit uniquement après validation de la règle Klaviyo, sur un thème non publié, hors Theme Editor, avec `optiz_ab=popup` ou `optiz_ab=holdout` dans l'URL. Le paramètre ne force jamais le groupe en production.
- URLs :
  - https://tqka0j-vk.myshopify.com/products/siwak?preview_theme_id=197781324158&optiz_ab=popup
  - https://tqka0j-vk.myshopify.com/products/siwak?preview_theme_id=197781324158&optiz_ab=holdout
- Diagnostic local : `window.optizPopupExperiment.inspect()`. Il contient l'affectation et les erreurs, aucune donnée du formulaire.
- Après publication approuvée du clone et de l'exclusion Klaviyo, vérifier que le contrôle ne voit aucun formulaire et que le traitement voit uniquement `VKsPes`.
- Le mode `live` ne s'exécute que sur le rôle Liquid `main`, avec les deux cases de validation cochées. Le ciblage est vérifié ; les achats restent à vérifier.
- Ne pas publier le thème de test sans validation explicite. Le thème publié relevé le 15 novembre est **Offre mobil**, `199525990782`, différent du thème connecté de recette : comparer les versions avant de proposer une publication, afin de préserver les autres changements en production.

## Arrêt / retour arrière

Passer le mode du test à **Désactivé** dans une version non publiée, puis appliquer selon la procédure de publication autorisée. Retirer ensuite l'exclusion `*optiz_popup_test=managed*` du formulaire original et publier le formulaire après confirmation : le comportement antérieur revient. Le clone JavaScript ne s'ouvre plus sans le contrôleur. Ne pas supprimer les données recueillies.

Un nouveau test doit recevoir un nouvel `experiment_id`, une nouvelle clé de stockage et un nouveau dossier de rapport. Ne pas modifier la répartition ni le délai au milieu de `siwak_popup_v1`.

## Vérifications locales

`node --test tests/popup-experiment.test.mjs tests/siwak-*.test.mjs` : 33 tests passent, dont 16 pour cette expérience (consentement, révocation pendant identification, écriture panier en cours, deux onglets, stabilité, QA, PII, cadeaux et doublons d'achat).

Shopify Theme Check : 574 problèmes avant/après le code initial, aucun ajouté. Les nouvelles vérifications de syntaxe JavaScript passent. Recette réelle documentée séparément : réception GA4 vérifiée jusqu'au début du paiement, sans achat réel.

Sources : documentation officielle Shopify Customer Privacy / Web Pixels / Cart API, Klaviyo custom trigger et `klaviyoForms`, Google Analytics intégration d'expériences et dimensions personnalisées. Les limites de consentement, de stockage, de navigateurs, de pixels bloqués et de changement d'appareil empêchent de promettre une mesure de 100 % des visiteurs.
