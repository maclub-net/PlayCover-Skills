# PlayCover CLI Skills

**简体中文** · [English](README.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

一个 agent Skill 包，教会 AI 编程助手（以及人类）如何从**命令行**驱动 [PlayCover](https://github.com/PlayCover/PlayCover)——安装、卸载、启动、签名和导出 iOS 应用，管理键位映射、IPA 来源、逐应用设置、用户 dylib 以及全局偏好设置，全部 **headlessly**（无 GUI）完成。

在 AI 时代，仅暴露 GUI 的软件对 agent、脚本和 CI 而言是不可触达的。本 Skill 文档化了 PlayCover 的文本接口，使任何 LLM/agent/shell pipeline 都能端到端地操作 PlayCover。

## 内容概览

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 你在这里（简体中文）
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm 包元数据（用于 npx 安装）
├── install.mjs               ← npx 安装器（把 skill 复制到 .agents/skills/）
└── playcover-cli/
    ├── SKILL.md                ← 主 skill（English）— agent 加载此文件
    ├── SKILL.zh-CN.md          ← 主 skill 的中文镜像（供人类阅读）
    └── references/             ← 每个命令领域一个文件（详细）
        ├── dispatch.md          CLI 模式何时运行 vs. GUI
        ├── conventions.md       stdout/stderr、--json、进度、退出码
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download（bundle ID 或 URL）+ 校验和验证
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set（全局偏好）
        └── where-to-get-ipas.md  哪里可以找到 IPA 文件
```

## 前置条件

- **需以 CLI 功能构建的 PlayCover。** 自 `feat/cli-mode` 分支 / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238) 起，CLI 是同一个 `PlayCover.app` 二进制的一部分。若你已安装的 `PlayCover.app` 早于此，请从源码重新构建。
- Node.js >= 18（仅当你使用 `npx` 安装器时需要）。
- 验证 CLI 可用：

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  它应打印出子命令列表。若反而打开了 GUI，说明你的构建版本过旧。

## 安装

这是一个**项目级 agent Skill**。一旦安装到某个项目的 `.agents/skills/` 目录中，agent（Trae、Claude Code 等）会自动发现它。

### 选项 1 — npx（无需 clone）

最快的路径。在你希望启用 skill 的**项目根目录**下运行：

```bash
npx playcover-skills
```

或者，在 npm 发布之前（直接从 GitHub 运行）：

```bash
npx github:maclub-net/PlayCover-Skills
```

安装器会把 `playcover-cli/` 复制到 `./.agents/skills/playcover-cli` 并打印后续步骤。

Flags：

```bash
npx playcover-skills --path /Users/you/code/some-project  # 安装到另一个项目
npx playcover-skills --force                              # 覆盖已存在的安装
npx playcover-skills --uninstall                          # 移除该 skill
```

### 选项 2 — git clone + 手动复制

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### 选项 3 — 软链接（与本仓库保持同步）

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

在 `PlayCover-Skills` 中执行 `git pull` 即可更新所有通过软链接使用该 skill 的位置。

### 选项 4 — 全局安装（在所有项目中可用）

把 `playcover-cli/` 放入你的 agent 框架的全局 skill 目录。对 Trae 而言，这是用户级 skill 目录；具体路径请查阅你的 agent 文档。

## 验证是否加载

在你的 agent 会话中，询问：

> 列出用于管理键位映射的 PlayCover CLI 子命令。

已加载的 `playcover-cli` skill 会从 `references/keymaps.md` 中作答。若 agent 无法回答，说明该 skill 未安装到当前项目中——请重新检查 `.agents/skills/` 路径。

## 使用

你无需直接调用该 skill——**agent 会按需加载**它，只要你的请求匹配其描述（通过 CLI 安装/卸载/启动应用、管理键位映射/来源/设置/dylib/配置、脚本化或自动化 PlayCover，或诊断"为什么打开了 GUI"）。

你也可以通过提及它来强制加载，例如：

> 使用 playcover-cli skill。如何按 bundle ID 下载并安装应用？

### 快速配方

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# 以 JSON 清点已安装的应用
$BIN list --json | jq '.[].bundleIdentifier'

# 使用 PlayTools 安装 IPA
$BIN install ~/Downloads/App.ipa --play-tools --category games

# 从已配置的来源下载并安装
$BIN download com.example.app --install

# 快照并恢复键位映射
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# 为无人值守运行抑制所有 GUI 弹窗
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## 约定速览

- **stdout** = 数据 · **stderr** = 错误（`Error: ` 前缀）。
- 在 `list`/`info`/`source list`/`store list`/`settings list`/`config list` 上使用 `--json` 获取结构化输出。
- 退出码：`0` 成功 · `1` 通用错误 · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled。
- CLI 模式以 `.accessory` 方式运行——无 Dock 图标、无跳转。
- CLI 模式下无 GUI 对话框——命令会快速失败到 stderr 而非挂起。

完整概览见 [playcover-cli/SKILL.md](playcover-cli/SKILL.md)，逐命令详情见 [playcover-cli/references/](playcover-cli/references)。

## 注册表与平台

`playcover-cli` 遵循开放的 [Agent Skills](https://github.com/anthropics/skills) 格式（`SKILL.md` + `references/`），因此可在任何兼容的 agent 中加载。它已被列于：

| 平台 | 状态 | 安装 / 列表 |
|---|---|---|
| **npm** | 可用 | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | 权威来源 | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | 已收录 | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Development 分类 |
| **awesome-skills.com** | 自动索引 | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | 自动索引 | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | 自动索引 | 内置于 TRAE IDE |
| **Smithery Skills** | 可用 | `smithery skill add maclub-net/PlayCover-Skills` |

要在新平台上收录此 skill，请提交 issue 或 PR——欢迎贡献。

## 许可证

采用与 PlayCover 项目相同的许可证分发。详情见 PlayCover 仓库。
