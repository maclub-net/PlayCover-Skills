# PlayCover CLI Skills

**Deutsch** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Ein agent Skill-Paket, das KI-Codierungsassistenten (und Menschen) beibringt, [PlayCover](https://github.com/PlayCover/PlayCover) über die **Befehlszeile** zu steuern — installieren, deinstallieren, starten, signieren und iOS-Apps exportieren, Keymaps, IPA-Quellen, App-Einstellungen, Benutzer-dylibs und globale Voreinstellungen verwalten, alles **headlessly** (ohne GUI).

Im KI-Zeitalter ist Software, die nur eine GUI anbietet, für agent, Skripte und CI nicht erreichbar. Diese Skill dokumentiert die Textschnittstelle von PlayCover, sodass jede LLM/agent/shell-Pipeline PlayCover End-to-End bedienen kann.

## Inhalt

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← du bist hier (Deutsch)
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm-Paket-Metadaten (für npx-Installation)
├── install.mjs               ← npx-Installer (kopiert Skill in .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← Haupt-Skill (English) — agent lädt diese
    ├── SKILL.zh-CN.md          ← chinesischer Spiegel des Haupt-Skills (für Menschen)
    └── references/             ← eine Datei pro Befehlsbereich (detailliert)
        ├── dispatch.md          wann der CLI-Modus vs. die GUI läuft
        ├── conventions.md       stdout/stderr, --json, Fortschritt, Exit-Codes
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (Bundle-ID oder URL) + Prüfsummenprüfung
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (globale Voreinstellungen)
        └── where-to-get-ipas.md  wo IPA-Dateien zu finden sind
```

## Voraussetzungen

- **Mit CLI-Funktion gebautes PlayCover.** Ab dem Branch `feat/cli-mode` / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238) ist das CLI Teil derselben `PlayCover.app`-Binärdatei. Falls dein installiertes `PlayCover.app` älter ist, baue es erneut aus dem Quellcode.
- Node.js >= 18 (nur wenn du den `npx`-Installer nutzt).
- Prüfe, ob das CLI verfügbar ist:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  Es sollte eine Liste von Unterbefehlen ausgeben. Wenn stattdessen die GUI geöffnet wird, ist dein Build zu alt.

## Installation

Dies ist eine **projektbezogene agent Skill**. Sobald sie im `.agents/skills/`-Ordner eines Projekts installiert ist, wird sie von agent (Trae, Claude Code, etc.) automatisch erkannt.

### Option 1 — npx (kein Clone nötig)

Der schnellste Weg. Führe dies vom **Root des Projekts** aus, in dem der Skill aktiv sein soll:

```bash
npx playcover-skills
```

Oder, vor der npm-Veröffentlichung (direkt von GitHub ausführen):

```bash
npx github:maclub-net/PlayCover-Skills
```

Der Installer kopiert `playcover-cli/` nach `./.agents/skills/playcover-cli` und gibt die nächsten Schritte aus.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # in ein anderes Projekt installieren
npx playcover-skills --force                              # bestehende Installation überschreiben
npx playcover-skills --uninstall                          # Skill entfernen
```

### Option 2 — git clone + manuelles Kopieren

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Option 3 — Symlink (mit diesem Repo synchronisiert lassen)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` in `PlayCover-Skills` aktualisiert den Skill überall dort, wo er verlinkt ist.

### Option 4 — globale Installation (projektübergreifend verfügbar)

Lege `playcover-cli/` im globalen Skill-Verzeichnis deines agent-Frameworks ab. Für Trae ist das der benutzerbezogene Skill-Ordner; den genauen Pfad findest du in der Dokumentation deines agent.

## Laden prüfen

Frage in deiner agent-Sitzung:

> Liste die PlayCover-CLI-Unterbefehle zur Verwaltung von Keymaps auf.

Ein geladener `playcover-cli`-Skill antwortet aus `references/keymaps.md`. Wenn der agent nicht antworten kann, ist der Skill nicht im aktiven Projekt installiert — prüfe den `.agents/skills/`-Pfad erneut.

## Verwendung

Du ruft den Skill nicht direkt auf — **der agent lädt ihn bei Bedarf**, sobald deine Anfrage zu seiner Beschreibung passt (Apps installieren/deinstallieren/starten, Keymaps/Quellen/Einstellungen/Dylibs/Config per CLI verwalten, PlayCover skripten oder automatisieren, oder „Warum hat sich die GUI geöffnet?" diagnostizieren).

Du kannst ihn auch erzwingen, indem du ihn erwähnst, z. B.:

> Nutze den playcover-cli-Skill. Wie lade ich eine App per Bundle-ID herunter und installiere sie?

### Schnelle Rezepte

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Installierte Apps als JSON inventarisieren
$BIN list --json | jq '.[].bundleIdentifier'

# Ein IPA mit PlayTools installieren
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Herunterladen und installieren aus einer konfigurierten Quelle
$BIN download com.example.app --install

# Ein Keymap snapshoten und wiederherstellen
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Alle GUI-Popups für unbeaufsichtigte Läufe unterdrücken
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Konventionen auf einen Blick

- **stdout** = Daten · **stderr** = Fehler (`Error: `-Präfix).
- `--json` bei `list`/`info`/`source list`/`store list`/`settings list`/`config list` für strukturierte Ausgabe.
- Exit-Codes: `0` Erfolg · `1` allgemein · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- CLI-Modus läuft als `.accessory` — kein Dock-Icon, kein Hüpfen.
- Keine GUI-Dialoge im CLI-Modus — Befehle scheitern schnell zu stderr statt zu hängen.

Siehe [playcover-cli/SKILL.md](playcover-cli/SKILL.md) für den Gesamtüberblick und [playcover-cli/references/](playcover-cli/references) für Details pro Befehl.

## Registrierungen & Plattformen

`playcover-cli` folgt dem offenen [Agent-Skills](https://github.com/anthropics/skills)-Format (`SKILL.md` + `references/`), wird also in jedem kompatiblen agent geladen. Es ist gelistet auf:

| Plattform | Status | Installation / Listung |
|---|---|---|
| **npm** | Verfügbar | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Single Source of Truth | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | Gelistet | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Kategorie Development |
| **awesome-skills.com** | Auto-indiziert | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Auto-indiziert | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Auto-indiziert | in die TRAE IDE integriert |
| **Smithery Skills** | Verfügbar | `smithery skill add maclub-net/PlayCover-Skills` |

Um diesen Skill auf einer neuen Plattform zu listen, eröffne ein Issue oder einen PR — Beiträge willkommen.

## Lizenz

Vertrieben unter derselben Lizenz wie das PlayCover-Projekt. Siehe das PlayCover-Repository für Details.
