# Journal des prompts

Liste exhaustive des prompts utilisateur et des actions de l'agent pour ce projet.

---

## 2026-07-15 19:33 — #1

### Prompt exact

```text
Cursor peut-il lire des rules globales et par projet =
```

### Résumé de la demande

- Savoir si Cursor lit à la fois des rules globales et des rules par projet.

### Actions réalisées

- Consultation de la doc Cursor (cursor-guide).
- Explication : User Rules (Settings) + Project Rules (`.cursor/rules/`) + AGENTS.md ; priorité Team → Project → User.

---

## 2026-07-15 19:42 — #2

### Prompt exact

```text
Écris un fichier global pour les roulces curseurs. Donne juste les idées, n'écris rien.
```

### Résumé de la demande

- Idées pour des User Rules globales, sans écrire de fichier.

### Actions réalisées

- Liste d'idées (langue, git, périmètre, secrets, etc.) — aucun fichier modifié.

---

## 2026-07-15 19:43 — #3

### Prompt exact

```text
D'accord, écris un template de ça sans ne modifier aucun fichier.
```

### Résumé de la demande

- Template markdown des User Rules, affiché seulement (pas d'écriture disque).

### Actions réalisées

- Template fourni dans le chat — aucun fichier modifié.

---

## 2026-07-15 19:43 — #4

### Prompt exact

```text
Très bien, écris ça dans les rules.
```

### Résumé de la demande

- Écrire le template dans les rules Cursor globales.

### Actions réalisées

- Création de `C:\Users\thoma\.cursor\rules\global-preferences.mdc` (règle globale fichier).

---

## 2026-07-15 20:00 — #5

### Prompt exact

```text
ajoute la possibilité pour le chat d'entendre Le microphone, je voudrais qu'on puisse... entendre le microphone et que ce soit transcrit en texte. Explique-moi comment on peut concrètement le faire, si c'est trop compliqué dis-le-moi.
```

### Résumé de la demande

- Activer / comprendre la dictée micro → texte dans le chat Cursor.

### Actions réalisées

- Explication de la voix native Cursor (micro / `Ctrl+Shift+Space`, permissions Windows).
- Pas d'implémentation custom (déjà intégré ; custom trop complexe).

---

## 2026-07-15 20:00 — #6

### Prompt exact

```text
Ajoute des skills à la racine de ce projet. Je voudrais que chaque fois que je te demande quelque chose, tu Enregistre mon prompt exact exactement ce que je t'ai dit et tu résume ce que je t'ai dit dans un fichier. Donc il faut qu'il y ait la racine du projet. figure une liste exhaustive de tous les prompts que j'ai faits et un résumé de ce que tu as fait.
```

### Résumé de la demande

- Créer un skill projet qui journalise chaque prompt exact + résumé des actions dans un fichier à la racine.

### Actions réalisées

- Création de `.cursor/skills/log-prompts/SKILL.md`.
- Création de `.cursor/rules/log-prompts.mdc` (`alwaysApply: true`) pour forcer l'exécution à chaque tour.
- Création / initialisation de `prompts-log.md` avec le rattrapage de cette conversation (#1–#6).

---

## 2026-07-15 20:02 — #7

### Prompt exact

```text
Merci. On va faire un test. Il faudrait que... L'interface Front end. The layout, layout agents. un peu plus subtil. Les marges sont un peu trop grosses et parfois. Dans les conversations, les espaces sont trop grands. Quand on y pense, c'est quelque chose de plus intuitif, de plus beau, de plus... Dans l'air du temps.
```

### Résumé de la demande

- Rendre l'UI de `layout-agent` plus subtile : marges et espacements (surtout conversations) trop grands ; viser un rendu plus intuitif, beau, contemporain.

### Actions réalisées

- Ajout d'une échelle d'espacement et rayons plus discrets dans `layout-agent/src/styles/_variables.scss`.
- Resserrage de `App.module.scss` (padding page, gaps, composer).
- Densification de `ChatMessages.module.scss` (gap messages, padding bulles, line-height).
- Compactage sidebar, header et composer (`ConversationSidebar`, `ChatHeader`, `PromptComposer` modules SCSS).

---

## 2026-07-15 20:05 — #8

### Prompt exact

```text
Dans le prompt de réponse, il y a une marge inexplicable, il y a énormément d'espace entre les paragraphes, même dans une liste, il y a beaucoup trop d'espace. Alors que moi-même j'ai analysé le CSS et il semble pas devoir en avoir beaucoup, mais il y en a énormément, je ne comprends pas pourquoi. Je sais que tu n'as pas fait exprès. Et je sais pas pourquoi ça arrive, mais il faudrait avoir un espace raisonnable.
```

### Résumé de la demande

- Espaces trop grands entre paragraphes et dans les listes des réponses assistant, malgré un CSS qui paraît serré ; obtenir un rythme d'espacement raisonnable.

### Actions réalisées

- Diagnostic : `white-space: pre-wrap` sur le HTML markdown + marges navigateur des `<p>`/`<li>` (et souvent `<p>` dans les `<li>` via marked) cumulaient les trous.
- `pre-wrap` limité aux messages user (classe `.plain`) ; reset typo markdown dans `ChatMessages.module.scss`.
- Mise à jour de `ChatMessages.tsx` pour appliquer `.plain` uniquement au rôle user.

---

## 2026-07-15 20:06 — #9

### Prompt exact

```text
Bravo, c'était exactement ça. Bah du coup les paragraphes sont un petit peu trop collés donc il faudrait faire un peu le contraire.
```

### Résumé de la demande

- Les paragraphes des réponses sont un peu trop serrés ; augmenter légèrement l'espacement (sans revenir à l'excès précédent).

### Actions réalisées

- Marges bas des `<p>` / listes / pre / blockquote : `$space-3` (8px) → `$space-5` (12px).
- Gap entre `<li>` : `$space-1` → `$space-2` ; entre paragraphes dans un `li` : `$space-2` → `$space-3`.

---

## 2026-07-15 20:08 — #10

### Prompt exact

```text
commit that
```

### Résumé de la demande

- Créer un commit git pour les changements en cours.

### Actions réalisées

- `git status` / `git diff` / `git log` pour préparer le commit.
- Commit des changements UI layout-agent + journalisation prompts (selon résultat du commit).
