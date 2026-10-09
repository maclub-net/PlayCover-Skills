# PlayCover CLI Skills

**繁體中文** · [English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

一個 agent Skill 套件，教導 AI 程式設計助手（以及人類）如何從**命令列**驅動 [PlayCover](https://github.com/PlayCover/PlayCover)——安裝、解除安裝、啟動、簽署和匯出 iOS 應用程式，管理鍵位映射、IPA 來源、逐應用程式設定、使用者 dylib 以及全域偏好設定，全部 **headlessly**（無 GUI）完成。

在 AI 時代，僅暴露 GUI 的軟體對 agent、腳本和 CI 而言是不可觸達的。本 Skill 將 PlayCover 的文字介面文件化，使任何 LLM/agent/shell pipeline 都能端到端地操作 PlayCover。

## 內容概覽

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 你在這裡（繁體中文）
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm 套件元資料（用於 npx 安裝）
├── install.mjs               ← npx 安裝器（將 skill 複製到 .agents/skills/）
└── playcover-cli/
    ├── SKILL.md                ← 主 skill（English）— agent 載入此檔案
    ├── SKILL.zh-CN.md          ← 主 skill 的中文鏡像（供人類閱讀）
    └── references/             ← 每個命令領域一個檔案（詳細）
        ├── dispatch.md          CLI 模式何時執行 vs. GUI
        ├── conventions.md       stdout/stderr、--json、進度、退出碼
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download（bundle ID 或 URL）+ 校驗碼驗證
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set（全域偏好）
        └── where-to-get-ipas.md  哪裡可以找到 IPA 檔案
```

## 前置條件

- **需以 CLI 功能建置的 PlayCover。** CLI 透過 [PR #2238](https://github.com/PlayCover/PlayCover/pull/2238)（`feat/cli-mode` 分支）上游貢獻，目前**尚未包含在任何正式的 PlayCover 發布版本中**。在 PR 審核期間，請使用 **maclub fork 建置**。兩個下載來源：
  - **Mac Club appstore**（瀏覽器介面，精選列表）：[maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG](https://www.maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG)
  - **GitHub Releases**（直接下 DMG）：[maclub-net/PlayCover/releases](https://github.com/maclub-net/PlayCover/releases) — 下載最新的 `PlayCover_*.dmg`，掛載後將 `PlayCover.app` 拖入 `/Applications`。該 DMG 由 Apple 簽署並公證，開啟時不會有 Gatekeeper 警告。
- Node.js >= 18（僅當你使用 `npx` 安裝器時需要）。
- 驗證 CLI 可用：

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  它應印出子命令列表。若反而開啟了 GUI，表示你的建置早於 CLI — 請安裝較新的 maclub 建置。

## 安裝

這是一個**專案級 agent Skill**。一旦安裝到某個專案的 `.agents/skills/` 目錄中，agent（Trae、Claude Code 等）會自動發現它。

### 選項 1 — npx（無需 clone）

最快的方式。在你希望啟用 skill 的**專案根目錄**下執行：

```bash
npx playcover-skills
```

或者，在 npm 發布之前（直接從 GitHub 執行）：

```bash
npx github:maclub-net/PlayCover-Skills
```

安裝器會將 `playcover-cli/` 複製到 `./.agents/skills/playcover-cli` 並印出後續步驟。

Flags：

```bash
npx playcover-skills --path /Users/you/code/some-project  # 安裝到另一個專案
npx playcover-skills --force                              # 覆蓋已存在的安裝
npx playcover-skills --uninstall                          # 移除該 skill
```

### 選項 2 — git clone + 手動複製

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### 選項 3 — 符號連結（與本倉庫保持同步）

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

在 `PlayCover-Skills` 中執行 `git pull` 即可更新所有透過符號連結使用該 skill 的位置。

### 選項 4 — 全域安裝（在所有專案中可用）

將 `playcover-cli/` 放入你的 agent 框架的全域 skill 目錄。對 Trae 而言，這是使用者級 skill 目錄；確切路徑請查閱你的 agent 文件。

## 驗證是否載入

在你的 agent 工作階段中，詢問：

> 列出用於管理鍵位映射的 PlayCover CLI 子命令。

已載入的 `playcover-cli` skill 會從 `references/keymaps.md` 中作答。若 agent 無法回答，表示該 skill 未安裝到當前專案中——請重新檢查 `.agents/skills/` 路徑。

## 使用

你無需直接呼叫該 skill——**agent 會按需載入**它，只要你的請求匹配其描述（透過 CLI 安裝/解除安裝/啟動應用程式、管理鍵位映射/來源/設定/dylib/配置、腳本化或自動化 PlayCover，或診斷「為什麼開啟了 GUI」）。

你也可以透過提及它來強制載入，例如：

> 使用 playcover-cli skill。如何按 bundle ID 下載並安裝應用程式？

### 快速配方

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# 以 JSON 盤點已安裝的應用程式
$BIN list --json | jq '.[].bundleIdentifier'

# 使用 PlayTools 安裝 IPA
$BIN install ~/Downloads/App.ipa --play-tools --category games

# 從已配置的來源下載並安裝
$BIN download com.example.app --install

# 快照並還原鍵位映射
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# 為無人值守執行抑制所有 GUI 彈窗
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## 約定速覽

- **stdout** = 資料 · **stderr** = 錯誤（`Error: ` 前綴）。
- 在 `list`/`info`/`source list`/`store list`/`settings list`/`config list` 上使用 `--json` 取得結構化輸出。
- 退出碼：`0` 成功 · `1` 通用錯誤 · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled。
- CLI 模式以 `.accessory` 方式執行——無 Dock 圖示、無跳動。
- CLI 模式下無 GUI 對話框——命令會快速失敗到 stderr 而非掛起。

完整概覽見 [playcover-cli/SKILL.md](playcover-cli/SKILL.md)，逐命令詳情見 [playcover-cli/references/](playcover-cli/references)。

## 註冊表與平台

`playcover-cli` 遵循開放的 [Agent Skills](https://github.com/anthropics/skills) 格式（`SKILL.md` + `references/`），因此可在任何相容的 agent 中載入。它已被列於：

| 平台 | 狀態 | 安裝 / 列表 |
|---|---|---|
| **npm** | 可用 | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | 權威來源 | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | 已收錄 | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Development 分類 |
| **awesome-skills.com** | 自動索引 | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | 自動索引 | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | 自動索引 | 內建於 TRAE IDE |
| **Smithery Skills** | 可用 | `smithery skill add maclub-net/PlayCover-Skills` |

要在新平台上收錄此 skill，請提交 issue 或 PR——歡迎貢獻。

## 授權條款

採用與 PlayCover 專案相同的授權條款散布。詳情見 PlayCover 倉庫。
