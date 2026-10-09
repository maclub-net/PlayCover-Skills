# PlayCover CLI Skills

An agent Skill package that teaches AI coding assistants (and humans) how to drive [PlayCover](https://github.com/PlayCover/PlayCover) from the **command line** — installing, uninstalling, launching, signing, and exporting iOS apps, managing keymaps, IPA sources, per-app settings, user dylibs, and global preferences, all **headlessly** (no GUI).

In the AI era, software that only exposes a GUI is unreachable by agents, scripts, and CI. This Skill documents PlayCover's text interface so any LLM/agent/shell pipeline can operate PlayCover end-to-end.

## What's inside

```
PlayCover-Skills/
├── README.md                ← you are here
├── README.zh-CN.md          ← 中文版
└── playcover-cli/
    ├── SKILL.md              ← main skill (English) — agent loads this
    ├── SKILL.zh-CN.md        ← Chinese mirror of the main skill (for humans)
    └── references/           ← one file per command area (detailed)
        ├── dispatch.md         when CLI mode runs vs. the GUI
        ├── conventions.md      stdout/stderr, --json, progress, exit codes
        ├── app-lifecycle.md    install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md         list / info
        ├── aliases.md           alias create / remove
        ├── keymaps.md           keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md      settings list / get / set / reset
        ├── sources.md           source list / add / remove / refresh / enable / disable
        ├── store.md             store list
        ├── download.md          download (bundle ID or URL) + checksum verify
        ├── playtools.md         playtools install
        ├── dylibs.md            dylib list / add / remove
        └── config.md            config list / get / set (global prefs)
```

## Prerequisites

- **PlayCover built with the CLI feature.** The CLI is part of the same `PlayCover.app` binary as of the `feat/cli-mode` branch / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238). If your installed `PlayCover.app` predates this, rebuild from source.
- Verify the CLI is available:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  It should print a subcommand list. If it opens the GUI instead, your build is too old.

## Download

```bash
git clone https://github.com/maclub-net/PlayCover-Skills.git
```

Or, if you only need the skill and not the READMEs:

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
```

## Install

This is a **project-scoped Trae/agent Skill**. To make it available inside a project, drop the `playcover-cli/` directory into that project's `.agents/skills/` folder.

### Option A — install into a specific project

```bash
# from the cloned repo
cd PlayCover-Skills

# target any project you want the skill active in
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

Restart your editor / agent session in that project. The skill will be auto-discovered and appear as `playcover-cli` in the skill list.

### Option B — symlink (keep it in sync with this repo)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` in `PlayCover-Skills` then updates the skill everywhere it's symlinked.

### Option C — global install (available across all projects)

Drop `playcover-cli/` into your agent framework's global skills directory. For Trae, this is typically the user-level skills folder; consult your agent's documentation for the exact path.

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

## License

Distributed under the same license as the PlayCover project. See the PlayCover repository for details.
