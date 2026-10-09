# PlayCover CLI Skills

**English** · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

An agent Skill package that teaches AI coding assistants (and humans) how to drive [PlayCover](https://github.com/PlayCover/PlayCover) from the **command line** — installing, uninstalling, launching, signing, and exporting iOS apps, managing keymaps, IPA sources, per-app settings, user dylibs, and global preferences, all **headlessly** (no GUI).

In the AI era, software that only exposes a GUI is unreachable by agents, scripts, and CI. This Skill documents PlayCover's text interface so any LLM/agent/shell pipeline can operate PlayCover end-to-end.

## What's inside

```
PlayCover-Skills/
├── README.md                ← you are here (English)
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm package metadata (for npx install)
├── install.mjs               ← npx installer (copies skill into .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← main skill (English) — agent loads this
    ├── SKILL.zh-CN.md          ← Chinese mirror of the main skill (for humans)
    └── references/             ← one file per command area (detailed)
        ├── dispatch.md          when CLI mode runs vs. the GUI
        ├── conventions.md       stdout/stderr, --json, progress, exit codes
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (bundle ID or URL) + checksum verify
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (global prefs)
        └── where-to-get-ipas.md  where to find IPA files
```

## Prerequisites

- **PlayCover built with the CLI feature.** The CLI is part of the same `PlayCover.app` binary as of the `feat/cli-mode` branch / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238). If your installed `PlayCover.app` predates this, rebuild from source.
- Node.js >= 18 (only if you use the `npx` installer).
- Verify the CLI is available:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  It should print a subcommand list. If it opens the GUI instead, your build is too old.

## Install

This is a **project-scoped agent Skill**. Once installed into a project's `.agents/skills/` folder, agents (Trae, Claude Code, etc.) auto-discover it.

### Option 1 — npx (no clone required)

The fastest path. Run this from the **root of the project** where you want the skill active:

```bash
npx playcover-skills
```

Or, before npm publish (run straight from GitHub):

```bash
npx github:maclub-net/PlayCover-Skills
```

The installer copies `playcover-cli/` into `./.agents/skills/playcover-cli` and prints next steps.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # install into another project
npx playcover-skills --force                              # overwrite existing install
npx playcover-skills --uninstall                          # remove the skill
```

### Option 2 — git clone + manual copy

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Option 3 — symlink (keep it in sync with this repo)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` in `PlayCover-Skills` then updates the skill everywhere it's symlinked.

### Option 4 — global install (available across all projects)

Drop `playcover-cli/` into your agent framework's global skills directory. For Trae, this is the user-level skills folder; consult your agent's documentation for the exact path.

## Verify it loaded

In your agent session, ask:

> List the PlayCover CLI subcommands for managing keymaps.

A loaded `playcover-cli` skill will answer from `references/keymaps.md`. If the agent can't answer, the skill isn't installed in the active project — re-check the `.agents/skills/` path.

## Use

You don't invoke the skill directly — **the agent loads it on demand** whenever your request matches its description (installing/uninstalling/launching apps, managing keymaps/sources/settings/dylibs/config via CLI, scripting or automating PlayCover, or diagnosing "why did the GUI open").

You can also force-load it by mentioning it, e.g.:

> Use the playcover-cli skill. How do I download and install an app by bundle ID?

### Quick recipes

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Inventory installed apps as JSON
$BIN list --json | jq '.[].bundleIdentifier'

# Install an IPA with PlayTools
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Download + install from a configured source
$BIN download com.example.app --install

# Snapshot and restore a keymap
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Suppress all GUI popups for unattended runs
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Conventions at a glance

- **stdout** = data · **stderr** = errors (`Error: ` prefix).
- `--json` on `list`/`info`/`source list`/`store list`/`settings list`/`config list` for structured output.
- Exit codes: `0` success · `1` general · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- CLI mode runs as `.accessory` — no Dock icon, no bouncing.
- No GUI dialogs in CLI mode — commands fail fast to stderr instead of hanging.

See [playcover-cli/SKILL.md](playcover-cli/SKILL.md) for the full overview and [playcover-cli/references/](playcover-cli/references) for per-command detail.

## Registries & platforms

`playcover-cli` follows the open [Agent Skills](https://github.com/anthropics/skills) format (`SKILL.md` + `references/`), so it loads in any compatible agent. It's listed on:

| Platform | Status | Install / listing |
|---|---|---|
| **npm** | Available | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Source of truth | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | Listed | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Development category |
| **awesome-skills.com** | Auto-indexed | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Auto-indexed | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Auto-indexed | built into the TRAE IDE |
| **Smithery Skills** | Available | `smithery skill add maclub-net/PlayCover-Skills` |

To list this skill on a new platform, open an issue or PR — contributions welcome.

## License

Distributed under the same license as the PlayCover project. See the PlayCover repository for details.
