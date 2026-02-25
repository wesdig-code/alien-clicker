# AGENTS

Règle principale pour les agents (humains ou automatisés) travaillant sur ce dépôt :

- À chaque modification effectuée dans le dépôt, terminer par un commit qui inclut toutes les modifications.
- Le message de commit doit commencer par l'un des préfixes suivants selon le type de changement :
  - :sparkles: <message>  — pour une nouvelle fonctionnalité (feature)
  - :bug: <message>       — pour une correction de bug
  - :art: <message>       — pour une amélioration de code / mise en forme (refactor ou style)

Exemples :

```bash
git add -A
git commit -m ":sparkles: ajouter système d'XP"
git push
```

Notes :

- Le commit doit inclure *toutes* les modifications que l'agent a effectuées lors de la tâche en cours.
- Si plusieurs types de changements sont présents, choisir le préfixe qui reflète le changement principal.
- Ce document définit une convention de travail pour garder l'historique clair et uniforme.

