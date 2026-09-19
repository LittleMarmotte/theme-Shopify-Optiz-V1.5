# Système IA copywriting Optiz

Ce dossier et les quatre skills projet forment un système opérationnel :

1. `copywriting/AVATAR.md` = source de vérité consommateur.
2. `$optiz-lp-strategist` = décide quoi dire et dans quel ordre ; il ne rédige pas la page finale.
3. `$avatar-direct-response-copywriter` = seul skill de rédaction ; modes `LANDING_PAGE`, `EMAIL`, `AD`, `UGC_SCRIPT`.
4. `$optiz-copy-chief` = intervient uniquement après une V1, classe les claims et produit un brief de révision.
5. Le même copywriter applique ensuite le brief de révision pour produire la V2.
6. `$optiz-shopify` = encadre l’intégration finale dans la boutique : direction artistique, copywriting de section, Liquid, CSS, JavaScript et compatibilité Theme Editor. Il ne remplace pas les trois rôles du workflow de persuasion.

## Entrées minimales

Dupliquez `copywriting/BRIEF.md` pour chaque campagne et renseignez au minimum :

- produit et mode d’emploi réel ;
- offre, prix et garantie ;
- trafic / canal ;
- objectif et CTA ;
- mécanisme que la marque est autorisée à expliquer ;
- preuves disponibles et claims interdits ou non validés.

Si ces données manquent, les outils doivent utiliser des marqueurs `[À FOURNIR]`, jamais inventer.

## Workflow landing page

1. Prompt : `Utilise $optiz-lp-strategist avec copywriting/BRIEF.md. Sauvegarde la stratégie dans copywriting/runs/nom-campagne/01-strategy.md.`
2. Prompt : `Utilise $avatar-direct-response-copywriter en mode LANDING_PAGE avec le brief et 01-strategy.md. Sauvegarde la V1 dans 02-copy-v1.md.`
3. Prompt : `Utilise $optiz-copy-chief sur 02-copy-v1.md avec le brief et la stratégie. Sauvegarde l'audit dans 03-critique.md.`
4. Prompt : `Utilise $avatar-direct-response-copywriter en mode LANDING_PAGE pour produire une V2 à partir de 02-copy-v1.md et 03-critique.md. Sauvegarde-la dans 04-copy-v2.md et ajoute un journal court des changements.`

Le prompt prêt à coller se trouve dans `copywriting/prompts/RUN_LP_WORKFLOW.md`.

## Autres formats

- Email : `Utilise $avatar-direct-response-copywriter en mode EMAIL avec copywriting/BRIEF.md. Format : [broadcast/séquence]. Objectif : […].`
- Ad : `Utilise $avatar-direct-response-copywriter en mode AD. Plateforme : […]. Angle : […]. Fais 3 variantes réellement distinctes.`
- UGC : `Utilise $avatar-direct-response-copywriter en mode UGC_SCRIPT. Durée : […]. Créateur : […]. Preuves visuelles disponibles : […].`

Dans tous les cas, passe la V1 au `$optiz-copy-chief` seulement si vous souhaitez une seconde passe critique.

## Arborescence

```text
.agents/skills/
├── avatar-direct-response-copywriter/
├── optiz-lp-strategist/
├── optiz-copy-chief/
└── optiz-shopify/
copywriting/
├── AVATAR.md
├── BRIEF.md
├── README.md
├── prompts/
└── runs/
```
