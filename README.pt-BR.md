# PlayCover CLI Skills

**Português (Brasil)** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

Um pacote de agent Skill que ensina assistentes de codificação por IA (e humanos) a controlar o [PlayCover](https://github.com/PlayCover/PlayCover) pela **linha de comando** — instalar, desinstalar, lançar, assinar e exportar apps iOS, gerenciar keymaps, fontes de IPA, configurações por aplicativo, dylibs de usuário e preferências globais, tudo **headlessly** (sem GUI).

Na era da IA, software que só expõe uma GUI é inalcançável por agent, scripts e CI. Esta Skill documenta a interface de texto do PlayCover para que qualquer pipeline de LLM/agent/shell possa operar o PlayCover de ponta a ponta.

## O que contém

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
├── README.pt-BR.md           ← você está aqui (Português (Brasil))
├── README.ru.md              ← Русский
├── package.json              ← metadados do pacote npm (para instalação via npx)
├── install.mjs               ← instalador do npx (copia o skill para .agents/skills/)
└── playcover-cli/
    ├── SKILL.md                ← skill principal (English) — o agent carrega este
    ├── SKILL.zh-CN.md          ← mirror em chinês do skill principal (para humanos)
    └── references/             ← um arquivo por área de comando (detalhado)
        ├── dispatch.md          quando o modo CLI roda vs. a GUI
        ├── conventions.md       stdout/stderr, --json, progresso, códigos de saída
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download (bundle ID ou URL) + verificação de checksum
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set (preferências globais)
        └── where-to-get-ipas.md  onde encontrar arquivos IPA
```

## Pré-requisitos

- **PlayCover compilado com o recurso de CLI.** O CLI é contribuído upstream via [PR #2238](https://github.com/PlayCover/PlayCover/pull/2238) (branch `feat/cli-mode`) e **ainda não faz parte de nenhum lançamento oficial do PlayCover**. Enquanto o PR é revisado, use um **build fork do maclub**. Duas fontes de download:
  - **Mac Club appstore** (interface do navegador, lista curada): [maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG](https://www.maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG)
  - **GitHub Releases** (DMG direto): [maclub-net/PlayCover/releases](https://github.com/maclub-net/PlayCover/releases) — baixe o último `PlayCover_*.dmg`, monte-o e arraste `PlayCover.app` para `/Applications`. O DMG é assinado e notarizado pela Apple, então abre sem avisos do Gatekeeper.
- Node.js >= 18 (somente se usar o instalador `npx`).
- Verifique se o CLI está disponível:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  Ele deve imprimir uma lista de subcomandos. Se abrir a GUI em vez disso, seu build é anterior ao CLI — instale um build mais novo do maclub.

## Instalação

Este é um **Skill de agent de escopo de projeto**. Depois de instalado na pasta `.agents/skills/` de um projeto, os agent (Trae, Claude Code, etc.) o descobrem automaticamente.

### Opção 1 — npx (clone não necessário)

O caminho mais rápido. Execute isto a partir da **raiz do projeto** onde deseja o skill ativo:

```bash
npx playcover-skills
```

Ou, antes do publish no npm (execute direto do GitHub):

```bash
npx github:maclub-net/PlayCover-Skills
```

O instalador copia `playcover-cli/` para `./.agents/skills/playcover-cli` e imprime os próximos passos.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # instalar em outro projeto
npx playcover-skills --force                              # sobrescrever instalação existente
npx playcover-skills --uninstall                          # remover o skill
```

### Opção 2 — git clone + cópia manual

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### Opção 3 — symlink (mantenha sincronizado com este repo)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`git pull` em `PlayCover-Skills` então atualiza o skill em todos os lugares onde está symlinked.

### Opção 4 — instalação global (disponível em todos os projetos)

Coloque `playcover-cli/` no diretório global de skills do seu framework de agent. Para o Trae, este é a pasta de skills em nível de usuário; consulte a documentação do seu agent para o caminho exato.

## Verifique se carregou

Na sua sessão de agent, pergunte:

> Liste os subcomandos do CLI do PlayCover para gerenciar keymaps.

Um skill `playcover-cli` carregado responderá a partir de `references/keymaps.md`. Se o agent não conseguir responder, o skill não está instalado no projeto ativo — verifique novamente o caminho `.agents/skills/`.

## Uso

Você não invoca o skill diretamente — **o agent o carrega sob demanda** sempre que sua requisição corresponde à sua descrição (instalar/desinstalar/lançar apps, gerenciar keymaps/fontes/configurações/dylibs/config via CLI, scriptar ou automatizar o PlayCover, ou diagnosticar "por que a GUI abriu").

Você também pode forçar o carregamento mencionando-o, p. ex.:

> Use o skill playcover-cli. Como faço para baixar e instalar um app por bundle ID?

### Receitas rápidas

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# Inventariar os apps instalados como JSON
$BIN list --json | jq '.[].bundleIdentifier'

# Instala um IPA com PlayTools
$BIN install ~/Downloads/App.ipa --play-tools --category games

# Baixa e instala de uma fonte configurada
$BIN download com.example.app --install

# Snapshot e restauração de um keymap
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# Suprime todos os popups de GUI para execuções não assistidas
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## Convenções em um relance

- **stdout** = dados · **stderr** = erros (prefixo `Error: `).
- `--json` em `list`/`info`/`source list`/`store list`/`settings list`/`config list` para saída estruturada.
- Códigos de saída: `0` sucesso · `1` geral · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- O modo CLI roda como `.accessory` — sem ícone no Dock, sem bounce.
- Sem diálogos de GUI no modo CLI — comandos falham rápido para stderr em vez de travar.

Veja [playcover-cli/SKILL.md](playcover-cli/SKILL.md) para a visão geral completa e [playcover-cli/references/](playcover-cli/references) para detalhes por comando.

## Registros e plataformas

`playcover-cli` segue o formato aberto de [Agent Skills](https://github.com/anthropics/skills) (`SKILL.md` + `references/`), então carrega em qualquer agent compatível. Está listado em:

| Plataforma | Status | Instalação / listagem |
|---|---|---|
| **npm** | Disponível | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | Fonte da verdade | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | Listado | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — categoria Development |
| **awesome-skills.com** | Auto-indexado | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | Auto-indexado | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | Auto-indexado | integrado ao TRAE IDE |
| **Smithery Skills** | Disponível | `smithery skill add maclub-net/PlayCover-Skills` |

Para listar este skill em uma nova plataforma, abra uma issue ou PR — contribuições bem-vindas.

## Licença

Distribuído sob a mesma licença que o projeto PlayCover. Consulte o repositório PlayCover para detalhes.
