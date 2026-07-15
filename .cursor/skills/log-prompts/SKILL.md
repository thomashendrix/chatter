---
name: log-prompts
description: >
  Journalise chaque message utilisateur et un résumé des actions de l'agent
  dans prompts-log.md à la racine du projet. À utiliser à CHAQUE tour de
  conversation dans ce projet, avant et après avoir traité la demande —
  y compris questions, explications, modifications de code, skills, rules.
---

# Journal des prompts

## Obligatoire

Sur **chaque** message utilisateur de ce projet :

1. **Au début** : préparer l'entrée (datetime + prompt exact).
2. **À la fin** : écrire/mettre à jour `prompts-log.md` à la racine du workspace avec le prompt exact et le résumé des actions réellement faites.
3. Ne jamais paraphraser le prompt : **copie verbatim** du texte utilisateur.
4. Ne pas demander confirmation pour journaliser (sauf si l'utilisateur demande d'arrêter).

## Fichier cible

- Chemin : `prompts-log.md` (racine du projet / workspace)
- Créer le fichier s'il n'existe pas (template ci-dessous)
- **Append** uniquement : ne pas réécrire ni supprimer d'entrées existantes

## Format d'une entrée

```markdown
## YYYY-MM-DD HH:MM — #<numéro>

### Prompt exact

```text
<texte utilisateur verbatim, inchangé>
```

### Résumé de la demande

- <1–3 puces : ce que l'utilisateur voulait>

### Actions réalisées

- <liste concrète de ce que l'agent a fait : fichiers créés/modifiés, réponses, outils, etc.>
- Si aucune action fichier : indiquer la nature de la réponse (explication, refus, etc.)
```

## Numérotation

- Lire `prompts-log.md`, trouver le dernier `#N`, incrémenter.
- Si le fichier est vide / nouveau : commencer à `#1`.

## En-tête du fichier (création initiale seulement)

```markdown
# Journal des prompts

Liste exhaustive des prompts utilisateur et des actions de l'agent pour ce projet.

---
```

## Cas particuliers

- Message multi-lignes / avec code : tout conserver dans le bloc `Prompt exact`.
- Demande annulée / erreur : journaliser quand même, avec les actions tentées.
- Si `prompts-log.md` est ouvert ailleurs : écrire quand même ; ne pas bloquer la tâche principale.
- La journalisation est **secondaire** : faire d'abord le travail demandé, puis append l'entrée (sauf si la tâche est longue — alors préparer l'entrée tôt et la finaliser à la fin).

## Interdit

- Ne pas journaliser hors de ce projet.
- Ne pas mettre de secrets détectés (clés API, tokens) : remplacer par `[REDACTED]`.
- Ne pas créer d'autres fichiers de log sauf demande explicite.
