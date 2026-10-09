# PlayCover CLI Skills

**Français** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Un paquet agent Skill qui enseigne aux assistants de codage IA (et aux humains) à piloter [PlayCover](https://github.com/PlayCover/PlayCover) depuis la **ligne de commande** — installer, désinstaller, lancer, signer et exporter des apps iOS, gérer les keymaps, les sources d'IPA, les réglages par application, les dylibs utilisateur et les préférences globales, le tout **headlessly** (sans GUI).

À l'ère de l'IA, les logiciels qui n'exposent qu'une GUI sont inaccessibles aux agent, aux scripts et à l'CI. Cette Skill documente l'interface textuelle de PlayCover afin que n'importe quel pipeline LLM/agent/shell puisse exploiter PlayCover de bout en bout.

## Ce qu'il contient

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← vous êtes ici (Français)
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← métadonnées du paquet npm (pour installation via npx)
├── install.mjs               ← installateur npx (copie le skill dans .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← skill principal (English) — l'agent charge celui-ci
    ├── SKILL.zh-CN.md          ← miroir chinois du skill principal (pour les humains)
    └── references/             ← un fichier par domaine de commande (détaillé)
        ├── dispatch.md          quand le mode CLI s'exécute vs. la GUI
        ├── conventions.md       stdout/stderr, --json, progression, codes de sortie
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (bundle ID ou URL) + vérification du checksum
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (préférences globales)
        └── where-to-get-ipas.md  où trouver des fichiers IPA
```

## Prérequis

- **PlayCover compilé avec la fonctionnalité CLI.** Le CLI est contribué en amont via [PR #2238](https://github.com/PlayCover/PlayCover/pull/2238) (branche `feat/cli-mode`) et **ne fait pas encore partie d'aucune version officielle de PlayCover**. Pendant la révision du PR, utilisez un **build fork de maclub**. Deux sources de téléchargement :
  - **Mac Club appstore** (interface navigateur, liste curatée) : [maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG](https://www.maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG)
  - **GitHub Releases** (DMG direct) : [maclub-net/PlayCover/releases](https://github.com/maclub-net/PlayCover/releases) — téléchargez le dernier `PlayCover_*.dmg`, montez-le et glissez `PlayCover.app` dans `/Applications`. Le DMG est signé et notarisé par Apple, il s'ouvre donc sans avertissements de Gatekeeper.
- Node.js >= 18 (uniquement si vous utilisez l'installateur `npx`).
- Vérifiez que le CLI est disponible :

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  Il doit afficher une liste de sous-commandes. S'il ouvre la GUI à la place, votre compilation est antérieure au CLI — installez une compilation plus récente de maclub.

## Installation

C'est une **Skill d'agent à portée projet**. Une fois installé dans le dossier `.agents/skills/` d'un projet, les agent (Trae, Claude Code, etc.) le découvrent automatiquement.

### Option 1 — npx (sans clone requis)

Le chemin le plus rapide. Exécutez ceci depuis la **racine du projet** où vous souhaitez activer le skill :

```bash
npx playcover-skills
```

Ou, avant la publication npm (exécuté directement depuis GitHub) :

```bash
npx github:maclub-net/PlayCover-Skills
```

L'installateur copie `playcover-cli/` dans `./.agents/skills/playcover-cli` et affiche les étapes suivantes.

Flags :

```bash
npx playcover-skills --path /Users/you/code/some-project  # installer dans un autre projet
npx playcover-skills --force                              # écraser une installation existante
npx playcover-skills --uninstall                          # supprimer le skill
```

### Option 2 — git clone + copie manuelle

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Option 3 — lien symbolique (le garder synchronisé avec ce dépôt)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` dans `PlayCover-Skills` met ensuite à jour le skill partout où il est lié symboliquement.

### Option 4 — installation globale (disponible dans tous les projets)

Déposez `playcover-cli/` dans le répertoire global de skills de votre framework d'agent. Pour Trae, il s'agit du dossier de skills au niveau utilisateur ; consultez la documentation de votre agent pour le chemin exact.

## Vérifier le chargement

Dans votre session d'agent, demandez :

> Liste les sous-commandes du CLI PlayCover pour gérer les keymaps.

Un skill `playcover-cli` chargé répondra depuis `references/keymaps.md`. Si l'agent ne peut pas répondre, le skill n'est pas installé dans le projet actif — revérifiez le chemin `.agents/skills/`.

## Utilisation

Vous n'invoquez pas le skill directement — **l'agent le charge à la demande** dès que votre requête correspond à sa description (installer/désinstaller/lancer des apps, gérer les keymaps/sources/réglages/dylibs/config via CLI, scripter ou automatiser PlayCover, ou diagnostiquer « pourquoi la GUI s'est-elle ouverte »).

Vous pouvez aussi le forcer en le mentionnant, par ex. :

> Utilise le skill playcover-cli. Comment télécharger et installer une app par bundle ID ?

### Recettes rapides

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Inventaire des apps installées en JSON
$BIN list --json | jq '.[].bundleIdentifier'

# Installe un IPA avec PlayTools
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Télécharge et installe depuis une source configurée
$BIN download com.example.app --install

# Capture et restaure un keymap
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Supprime toutes les popups GUI pour les exécutions sans surveillance
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Conventions en un coup d'œil

- **stdout** = données · **stderr** = erreurs (préfixe `Error: `).
- `--json` sur `list`/`info`/`source list`/`store list`/`settings list`/`config list` pour une sortie structurée.
- Codes de sortie : `0` succès · `1` général · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- Le mode CLI s'exécute comme `.accessory` — pas d'icône Dock, pas de rebond.
- Pas de dialogues GUI en mode CLI — les commandes échouent vite vers stderr au lieu de se bloquer.

Voir [playcover-cli/SKILL.md](playcover-cli/SKILL.md) pour la vue d'ensemble complète et [playcover-cli/references/](playcover-cli/references) pour le détail par commande.

## Registres et plateformes

`playcover-cli` suit le format ouvert [Agent Skills](https://github.com/anthropics/skills) (`SKILL.md` + `references/`), il se charge donc dans tout agent compatible. Il est listé sur :

| Plateforme | Statut | Installation / listage |
|---|---|---|
| **npm** | Disponible | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Source de vérité | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | Listé | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — catégorie Development |
| **awesome-skills.com** | Auto-indexé | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Auto-indexé | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Auto-indexé | intégré au TRAE IDE |
| **Smithery Skills** | Disponible | `smithery skill add maclub-net/PlayCover-Skills` |

Pour lister ce skill sur une nouvelle plateforme, ouvrez une issue ou un PR — contributions bienvenues.

## Licence

Distribué sous la même licence que le projet PlayCover. Consultez le dépôt PlayCover pour les détails.
