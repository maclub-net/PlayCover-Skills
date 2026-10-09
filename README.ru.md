# PlayCover CLI Skills

**Русский** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md)

Пакет agent Skill, который обучает ИИ-ассистентов по программированию (и людей) управлять [PlayCover](https://github.com/PlayCover/PlayCover) из **командной строки** — устанавливать, удалять, запускать, подписывать и экспортировать iOS-приложения, управлять раскладками клавиш, источниками IPA, настройками приложений, пользовательскими dylib и глобальными предпочтениями, всё **headlessly** (без GUI).

В эпоху ИИ ПО, предоставляющее только GUI, недоступно для agent, скриптов и CI. Этот Skill документирует текстовый интерфейс PlayCover, чтобы любой конвейер LLM/agent/shell pipeline мог управлять PlayCover от начала до конца.

## Содержимое

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← вы здесь (Русский)
├── package.json              ← метаданные npm-пакета (для установки через npx)
├── install.mjs               ← установщик npx (копирует skill в .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← основной skill (English) — agent загружает этот
    ├── SKILL.zh-CN.md          ← китайское зеркало основного skill (для людей)
    └── references/             ← по одному файлу на командную область (подробно)
        ├── dispatch.md          когда работает режим CLI vs. GUI
        ├── conventions.md       stdout/stderr, --json, прогресс, коды выхода
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (bundle ID или URL) + проверка контрольной суммы
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (глобальные предпочтения)
        └── where-to-get-ipas.md  где найти IPA-файлы
```

## Предварительные требования

- **PlayCover, собранный с функцией CLI.** Начиная с ветки `feat/cli-mode` / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238), CLI является частью того же бинарника `PlayCover.app`. Если ваш установленный `PlayCover.app` более старый, пересоберите из исходников.
- Node.js >= 18 (только если используете установщик `npx`).
- Проверьте, что CLI доступен:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  Он должен вывести список подкоманд. Если вместо этого открывается GUI, ваша сборка слишком старая.

## Установка

Это **agent Skill уровня проекта**. После установки в папку `.agents/skills/` проекта agent (Trae, Claude Code и т. д.) автоматически его обнаруживают.

### Вариант 1 — npx (без clone)

Самый быстрый путь. Запустите это из **корня проекта**, где вы хотите активировать skill:

```bash
npx playcover-skills
```

Или, до публикации в npm (запуск напрямую из GitHub):

```bash
npx github:maclub-net/PlayCover-Skills
```

Установщик копирует `playcover-cli/` в `./.agents/skills/playcover-cli` и выводит следующие шаги.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # установить в другой проект
npx playcover-skills --force                              # перезаписать существующую установку
npx playcover-skills --uninstall                          # удалить skill
```

### Вариант 2 — git clone + ручное копирование

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Вариант 3 — символьная ссылка (синхронизировать с этим репо)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` в `PlayCover-Skills` затем обновляет skill везде, где он связан символьной ссылкой.

### Вариант 4 — глобальная установка (доступно во всех проектах)

Поместите `playcover-cli/` в глобальный каталог skill вашего фреймворка agent. Для Trae это папка skill пользовательского уровня; точный путь см. в документации вашего agent.

## Проверка загрузки

В сессии agent спросите:

> Перечисли подкоманды PlayCover CLI для управления раскладками клавиш.

Загруженный skill `playcover-cli` ответит из `references/keymaps.md`. Если agent не может ответить, skill не установлен в активном проекте — перепроверьте путь `.agents/skills/`.

## Использование

Вы не вызываете skill напрямую — **agent загружает его по требованию**, когда ваш запрос соответствует его описанию (установка/удаление/запуск приложений, управление раскладками/источниками/настройками/dylibs/конфигурацией через CLI, скриптование или автоматизация PlayCover, или диагностика «почему открылся GUI»).

Вы также можете принудительно загрузить его, упомянув, например:

> Используй playcover-cli skill. Как скачать и установить приложение по bundle ID?

### Быстрые рецепты

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Инвентаризация установленных приложений в JSON
$BIN list --json | jq '.[].bundleIdentifier'

# Установка IPA с PlayTools
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Скачивание и установка из настроенного источника
$BIN download com.example.app --install

# Снапшот и восстановление раскладки клавиш
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Подавление всех всплывающих окон GUI для автономных запусков
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Соглашения кратко

- **stdout** = данные · **stderr** = ошибки (префикс `Error: `).
- `--json` на `list`/`info`/`source list`/`store list`/`settings list`/`config list` для структурированного вывода.
- Коды выхода: `0` успех · `1` общая · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- CLI-режим работает как `.accessory` — без иконки в Dock, без отскоков.
- Без GUI-диалогов в CLI-режиме — команды быстро падают в stderr вместо зависания.

См. [playcover-cli/SKILL.md](playcover-cli/SKILL.md) для полного обзора и [playcover-cli/references/](playcover-cli/references) для деталей по каждой команде.

## Реестры и платформы

`playcover-cli` следует открытому формату [Agent Skills](https://github.com/anthropics/skills) (`SKILL.md` + `references/`), поэтому загружается в любом совместимом agent. Он зарегистрирован в:

| Платформа | Статус | Установка / листинг |
|---|---|---|
| **npm** | Доступно | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Источник правды | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | В списке | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — категория Development |
| **awesome-skills.com** | Авто-индексация | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Авто-индексация | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Авто-индексация | встроено в TRAE IDE |
| **Smithery Skills** | Доступно | `smithery skill add maclub-net/PlayCover-Skills` |

Чтобы зарегистрировать этот skill на новой платформе, откройте issue или PR — вклады приветствуются.

## Лицензия

Распространяется под той же лицензией, что и проект PlayCover. См. репозиторий PlayCover для подробностей.
