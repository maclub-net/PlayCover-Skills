# PlayCover CLI Skills

**日本語** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

AI コーディングアシスタント（および人間）に、**コマンドライン**から [PlayCover](https://github.com/PlayCover/PlayCover) を操作する方法を教える agent Skill パッケージです——iOS アプリのインストール、アンインストール、起動、署名、エクスポート、キーマップの管理、IPA ソース、アプリごとの設定、ユーザー dylib、およびグローバル設定を、すべて **headlessly**（GUI なし）で行えます。

AI 時代において、GUI しか持たないソフトウェアは、agent、スクリプト、CI からアクセスできません。本 Skill は PlayCover のテキストインターフェースを文書化し、どのような LLM/agent/shell pipeline でも PlayCover をエンドツーエンドで操作できるようにします。

## 内容概要

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← ここにいます（日本語）
├── README.ko.md              ← 한국어
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm パッケージメタデータ（npx インストール用）
├── install.mjs               ← npx インストーラ（skill を .agents/skills/ にコピー）
└── playcover-cli/
    ├── SKILL.md                ← メイン skill（English）— agent がこれを読み込む
    ├── SKILL.zh-CN.md          ← メイン skill の中国語ミラー（人間向け）
    └── references/             ← コマンド領域ごとに 1 ファイル（詳細）
        ├── dispatch.md          CLI モードが GUI と対比していつ動作するか
        ├── conventions.md       stdout/stderr、--json、進捗、終了コード
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download（bundle ID または URL）+ チェックサム検証
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set（グローバル設定）
        └── where-to-get-ipas.md  IPA ファイルの入手先
```

## 前提条件

- **CLI 機能付きでビルドされた PlayCover。** `feat/cli-mode` ブランチ / PR [#2238](https://github.com/PlayCover/PlayCover/pull/2238) 以降、CLI は同じ `PlayCover.app` バイナリの一部です。インストール済みの `PlayCover.app` がこれより古い場合は、ソースからリビルドしてください。
- Node.js >= 18（`npx` インストーラを使用する場合のみ）。
- CLI が利用可能か確認：

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  サブコマンドリストが出力されるはずです。GUI が開いてしまう場合は、ビルドが古すぎます。

## インストール

これは**プロジェクトスコープの agent Skill** です。プロジェクトの `.agents/skills/` フォルダにインストールすると、agent（Trae、Claude Code など）が自動的に発見します。

### オプション 1 — npx（clone 不要）

最短の手順。skill を有効にしたい**プロジェクトのルート**で実行：

```bash
npx playcover-skills
```

または、npm 公開前（GitHub から直接実行）：

```bash
npx github:maclub-net/PlayCover-Skills
```

インストーラは `playcover-cli/` を `./.agents/skills/playcover-cli` にコピーし、次のステップを出力します。

Flags：

```bash
npx playcover-skills --path /Users/you/code/some-project  # 別のプロジェクトにインストール
npx playcover-skills --force                              # 既存のインストールを上書き
npx playcover-skills --uninstall                          # skill を削除
```

### オプション 2 — git clone + 手動コピー

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### オプション 3 — シンボリックリンク（本リポジトリと同期を維持）

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`PlayCover-Skills` で `git pull` を実行すると、シンボリックリンクされているすべての場所で skill が更新されます。

### オプション 4 — グローバルインストール（全プロジェクトで利用可能）

`playcover-cli/` をあなたの agent フレームワークのグローバル skill ディレクトリに置いてください。Trae の場合はユーザーレベルの skill フォルダです。正確なパスは agent のドキュメントを参照してください。

## 読み込み確認

agent セッションで、次のように尋ねてください：

> キーマップ管理用の PlayCover CLI サブコマンドを列挙してください。

読み込まれた `playcover-cli` skill は `references/keymaps.md` から回答します。agent が回答できない場合、skill がアクティブなプロジェクトにインストールされていません——`.agents/skills/` パスを再確認してください。

## 使い方

skill を直接呼び出す必要はありません——**agent は要求がその説明に一致するとオンデマンドで読み込みます**（CLI によるアプリのインストール/アンインストール/起動、キーマップ/ソース/設定/dylib/設定の管理、PlayCover のスクリプト化や自動化、または「なぜ GUI が開いたのか」の診断）。

明示的に言及して強制読み込みすることもできます。例：

> playcover-cli skill を使って。bundle ID でアプリをダウンロードしてインストールするには？

### クイックレシピ

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# インストール済みアプリを JSON で一覧
$BIN list --json | jq '.[].bundleIdentifier'

# PlayTools を使って IPA をインストール
$BIN install ~/Downloads/App.ipa --play-tools --category games

# 設定済みのソースからダウンロードしてインストール
$BIN download com.example.app --install

# キーマップのスナップショットと復元
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# 無人実行に向け GUI ポップアップをすべて抑制
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## 約定早見

- **stdout** = データ · **stderr** = エラー（`Error: ` 接頭辞）。
- `list`/`info`/`source list`/`store list`/`settings list`/`config list` で `--json` を指定すると構造化出力。
- 終了コード：`0` 成功 · `1` 一般 · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled。
- CLI モードは `.accessory` として実行——Dock アイコンなし、バウンスなし。
- CLI モードでは GUI ダイアログなし——コマンドはハングせず stderr に即座に失敗します。

完全な概要は [playcover-cli/SKILL.md](playcover-cli/SKILL.md)、コマンドごとの詳細は [playcover-cli/references/](playcover-cli/references) を参照してください。

## レジストリとプラットフォーム

`playcover-cli` はオープンな [Agent Skills](https://github.com/anthropics/skills) フォーマット（`SKILL.md` + `references/`）に従うため、互換性のある任意の agent で読み込めます。次の場所に掲載されています：

| プラットフォーム | 状態 | インストール / 掲載 |
|---|---|---|
| **npm** | 利用可能 | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | 正式ソース | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | 掲載済み | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Development カテゴリ |
| **awesome-skills.com** | 自動インデックス | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | 自動インデックス | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | 自動インデックス | TRAE IDE に組み込み |
| **Smithery Skills** | 利用可能 | `smithery skill add maclub-net/PlayCover-Skills` |

新しいプラットフォームにこの skill を掲載するには、issue または PR を立ててください——貢献を歓迎します。

## ライセンス

PlayCover プロジェクトと同じライセンスで配布されます。詳細は PlayCover リポジトリを参照してください。
