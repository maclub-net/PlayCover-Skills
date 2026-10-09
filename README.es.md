# PlayCover CLI Skills

**Español** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

Un paquete de agent Skill que enseña a los asistentes de codificación por IA (y a los humanos) a controlar [PlayCover](https://github.com/PlayCover/PlayCover) desde la **línea de comandos** — instalar, desinstalar, lanzar, firmar y exportar apps de iOS, gestionar keymaps, fuentes de IPA, ajustes por aplicación, dylibs de usuario y preferencias globales, todo **headlessly** (sin GUI).

En la era de la IA, el software que solo expone una GUI es inalcanzable para agent, scripts y CI. Esta Skill documenta la interfaz de texto de PlayCover para que cualquier pipeline de LLM/agent/shell pueda operar PlayCover de extremo a extremo.

## Qué contiene

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← estás aquí (Español)
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← metadatos del paquete npm (para instalación con npx)
├── install.mjs               ← instalador de npx (copia el skill en .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← skill principal (English) — el agent carga este
    ├── SKILL.zh-CN.md          ← espejo en chino del skill principal (para humanos)
    └── references/             ← un archivo por área de comando (detallado)
        ├── dispatch.md          cuándo se ejecuta el modo CLI vs. la GUI
        ├── conventions.md       stdout/stderr, --json, progreso, códigos de salida
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (bundle ID o URL) + verificación de checksum
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (preferencias globales)
        └── where-to-get-ipas.md  dónde encontrar archivos IPA
```

## Requisitos previos

- **PlayCover compilado con la función CLI.** A partir de la rama `feat/cli-mode` / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238), el CLI forma parte del mismo binario `PlayCover.app`. Si tu `PlayCover.app` instalado es anterior, recompílalo desde el código fuente.
- Node.js >= 18 (solo si usas el instalador `npx`).
- Verifica que el CLI esté disponible:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  Debería imprimir una lista de subcomandos. Si abre la GUI en su lugar, tu compilación es demasiado antigua.

## Instalación

Esto es una **Skill de agent de ámbito de proyecto**. Una vez instalada en la carpeta `.agents/skills/` de un proyecto, los agent (Trae, Claude Code, etc.) la descubren automáticamente.

### Opción 1 — npx (sin clone necesario)

La vía más rápida. Ejecuta esto desde la **raíz del proyecto** donde quieras que el skill esté activo:

```bash
npx playcover-skills
```

O, antes de la publicación en npm (ejecútalo directo desde GitHub):

```bash
npx github:maclub-net/PlayCover-Skills
```

El instalador copia `playcover-cli/` en `./.agents/skills/playcover-cli` e imprime los siguientes pasos.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # instalar en otro proyecto
npx playcover-skills --force                              # sobrescribir instalación existente
npx playcover-skills --uninstall                          # eliminar el skill
```

### Opción 2 — git clone + copia manual

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Opción 3 — enlace simbólico (mantenerlo sincronizado con este repo)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` en `PlayCover-Skills` actualiza luego el skill en todos los lugares donde esté enlazado simbólicamente.

### Opción 4 — instalación global (disponible en todos los proyectos)

Coloca `playcover-cli/` en el directorio global de skills de tu framework de agent. Para Trae, esta es la carpeta de skills a nivel de usuario; consulta la documentación de tu agent para la ruta exacta.

## Verifica que se haya cargado

En tu sesión de agent, pregunta:

> Lista los subcomandos del CLI de PlayCover para gestionar keymaps.

Un skill `playcover-cli` cargado responderá desde `references/keymaps.md`. Si el agent no puede responder, el skill no está instalado en el proyecto activo — vuelve a revisar la ruta `.agents/skills/`.

## Uso

No invocas el skill directamente — **el agent lo carga bajo demanda** siempre que tu solicitud coincida con su descripción (instalar/desinstalar/lanzar apps, gestionar keymaps/fuentes/ajustes/dylibs/configuración vía CLI, scriptar o automatizar PlayCover, o diagnosticar "¿por qué se abrió la GUI?").

También puedes forzar su carga mencionándolo, p. ej.:

> Usa el skill playcover-cli. ¿Cómo descargo e instalo una app por bundle ID?

### Recetas rápidas

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Inventariar las apps instaladas como JSON
$BIN list --json | jq '.[].bundleIdentifier'

# Instala un IPA con PlayTools
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Descarga e instala desde una fuente configurada
$BIN download com.example.app --install

# Captura y restaura un keymap
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Suprime todos los popups de GUI para ejecuciones desatendidas
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Convenciones de un vistazo

- **stdout** = datos · **stderr** = errores (prefijo `Error: `).
- `--json` en `list`/`info`/`source list`/`store list`/`settings list`/`config list` para salida estructurada.
- Códigos de salida: `0` éxito · `1` general · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- El modo CLI se ejecuta como `.accessory` — sin icono en el Dock, sin rebotes.
- Sin diálogos de GUI en modo CLI — los comandos fallan rápido a stderr en lugar de colgarse.

Consulta [playcover-cli/SKILL.md](playcover-cli/SKILL.md) para el resumen completo y [playcover-cli/references/](playcover-cli/references) para el detalle por comando.

## Registros y plataformas

`playcover-cli` sigue el formato abierto de [Agent Skills](https://github.com/anthropics/skills) (`SKILL.md` + `references/`), por lo que se carga en cualquier agent compatible. Está listado en:

| Plataforma | Estado | Instalación / listado |
|---|---|---|
| **npm** | Disponible | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Fuente de verdad | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | Listado | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — categoría Development |
| **awesome-skills.com** | Auto-indexado | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Auto-indexado | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Auto-indexado | integrado en TRAE IDE |
| **Smithery Skills** | Disponible | `smithery skill add maclub-net/PlayCover-Skills` |

Para listar este skill en una nueva plataforma, abre un issue o un PR — contribuciones bienvenidas.

## Licencia

Distribuido bajo la misma licencia que el proyecto PlayCover. Consulta el repositorio de PlayCover para más detalles.
