# PlayCover CLI Skills

一个 agent Skill 包，教会 AI 编程助手（以及人类）如何从**命令行**驱动 [PlayCover](https://github.com/PlayCover/PlayCover) —— 安装、卸载、启动、签名、导出 iOS 应用，管理键位映射、IPA 源、应用设置、用户 dylib 和全局偏好，全程**无头**（不依赖 GUI）。

在 AI 时代，只暴露 GUI 的软件对 agent、脚本和 CI 来说是不可达的。本 Skill 文档化了 PlayCover 的文本接口，让任何 LLM/agent/shell 流程都能端到端地操作 PlayCover。

## 包含内容

```
PlayCover-Skills/
├── README.md                ← 英文版
├── README.zh-CN.md          ← 你在这里
└── playcover-cli/
    ├── SKILL.md              ← 主 Skill（英文）—— agent 加载这个
    ├── SKILL.zh-CN.md        ← 主 Skill 的中文镜像（供人类阅读）
    └── references/           ← 每个功能领域一个文件（详细）
        ├── dispatch.md         何时走 CLI 模式 vs GUI
        ├── conventions.md      stdout/stderr、--json、进度、退出码
        ├── app-lifecycle.md    install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md         list / info
        ├── aliases.md           alias create / remove
        ├── keymaps.md           keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md      settings list / get / set / reset
        ├── sources.md           source list / add / remove / refresh / enable / disable
        ├── store.md             store list
        ├── download.md          download（bundle ID 或 URL）+ 校验和验证
        ├── playtools.md         playtools install
        ├── dylibs.md            dylib list / add / remove
        └── config.md            config list / get / set（全局偏好）
```

## 前置条件

- **已构建带 CLI 功能的 PlayCover。** CLI 是 `feat/cli-mode` 分支 / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238) 起并入同一个 `PlayCover.app` 二进制的。如果你安装的 `PlayCover.app` 早于此，需从源码重新构建。
- 验证 CLI 可用：

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  应打印子命令列表。如果打开了 GUI，说明你的构建版本太旧。

## 下载

```bash
git clone https://github.com/maclub-net/PlayCover-Skills.git
```

## 安装

这是一个**项目级 Trae/agent Skill**。把它放入某个项目的 `.agents/skills/` 目录，即可在该项目内启用。

### 方式 A —— 安装到指定项目

```bash
# 在克隆下来的仓库里
cd PlayCover-Skills

# 目标项目（想让 skill 在其中生效的项目）
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

重启该项目里的编辑器 / agent 会话。Skill 会被自动发现，在 skill 列表里显示为 `playcover-cli`。

### 方式 B —— 软链接（与本仓库保持同步）

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

在 `PlayCover-Skills` 里 `git pull` 即可同步更新所有软链位置。

### 方式 C —— 全局安装（跨所有项目可用）

把 `playcover-cli/` 放到你所用 agent 框架的全局 skills 目录。Trae 一般在用户级 skills 文件夹，具体路径请查阅你的 agent 文档。

## 验证已加载

在 agent 会话里问：

> 列出 PlayCover CLI 中管理键位映射的子命令。

已加载的 `playcover-cli` skill 会从 `references/keymaps.md` 回答。如果 agent 答不上，说明 skill 没有安装到当前项目 —— 检查 `.agents/skills/` 路径。

## 使用

你不需要直接调用 skill —— **当你的请求匹配它的描述时，agent 会按需自动加载**（安装/卸载/启动应用、管理键位/源/设置/dylib/配置、脚本化或自动化 PlayCover、诊断"为什么打开了 GUI"等）。

也可以显式触发：

> 使用 playcover-cli skill。怎么按 bundle ID 下载并安装一个应用？

### 常用配方

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# 以 JSON 盘点已安装应用
$BIN list --json | jq '.[].bundleIdentifier'

# 带 PlayTools 安装 IPA
$BIN install ~/Downloads/App.ipa --play-tools --category games

# 从已配置源下载并安装
$BIN download com.example.app --install

# 快照并回灌一个键位映射
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# 关闭所有 GUI 弹窗以便无人值守运行
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## 约定速览

- **stdout** = 数据 · **stderr** = 错误（`Error: ` 前缀）。
- `list`/`info`/`source list`/`store list`/`settings list`/`config list` 加 `--json` 输出结构化数据。
- 退出码：`0` 成功 · `1` 通用错误 · `2` 参数错误 · `3` 应用未找到 · `4` 校验失败 · `5` 已取消。
- CLI 模式以 `.accessory` 运行 —— 无 Dock 图标、不弹跳。
- CLI 模式下无 GUI 对话框 —— 命令会快速失败到 stderr，而不是挂起。

完整概述见 [playcover-cli/SKILL.md](playcover-cli/SKILL.md)，按命令的细节见 [playcover-cli/references/](playcover-cli/references)。

## 许可证

与 PlayCover 项目采用同一许可证。详见 PlayCover 仓库。
