# PlayCover CLI Skills

**한국어** · [English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Русский](README.ru.md)

AI 코딩 어시스턴트(및 인간)에게 **명령줄**에서 [PlayCover](https://github.com/PlayCover/PlayCover)를 다루는 방법을 알려주는 agent Skill 패키지입니다——iOS 앱 설치, 제거, 실행, 서명 및 내보내기, 키맵, IPA 소스, 앱별 설정, 사용자 dylib, 전역 환경설정 관리를 모두 **headlessly**(GUI 없이) 수행합니다.

AI 시대에 GUI만 노출하는 소프트웨어는 agent, 스크립트, CI가 접근할 수 없습니다. 이 Skill은 PlayCover의 텍스트 인터페이스를 문서화하여 어떤 LLM/agent/shell pipeline도 PlayCover를 엔드 투 엔드로 운영할 수 있게 합니다.

## 내용물

```
PlayCover-Skills/
├── README.md                ← English
├── README.zh-CN.md           ← 简体中文
├── README.zh-TW.md           ← 繁體中文
├── README.ja.md              ← 日本語
├── README.ko.md              ← 여기 있습니다(한국어)
├── README.es.md              ← Español
├── README.fr.md              ← Français
├── README.de.md              ← Deutsch
├── README.pt-BR.md           ← Português (Brasil)
├── README.ru.md              ← Русский
├── package.json              ← npm 패키지 메타데이터(npx 설치용)
├── install.mjs               ← npx 설치기(skill을 .agents/skills/에 복사)
└── playcover-cli/
    ├── SKILL.md                ← 메인 skill(English) — agent가 이것을 로드
    ├── SKILL.zh-CN.md          ← 메인 skill의 중국어 미러(인간용)
    └── references/             ← 명령 영역별로 파일 하나씩(상세)
        ├── dispatch.md          CLI 모드가 GUI 대비 언제 실행되는지
        ├── conventions.md       stdout/stderr, --json, 진행, 종료 코드
        ├── app-lifecycle.md     install / export / uninstall / launch / sign
        ├── app-maintenance.md   clear-cache / clear-play-chain / show-in-finder / open-container / prune
        ├── app-query.md          list / info
        ├── aliases.md            alias create / remove
        ├── keymaps.md            keymap list / create / delete / rename / set-default / reset / import / export
        ├── app-settings.md       settings list / get / set / reset
        ├── sources.md            source list / add / remove / refresh / enable / disable
        ├── store.md              store list
        ├── download.md           download(bundle ID 또는 URL) + 체크섬 검증
        ├── playtools.md          playtools install
        ├── dylibs.md             dylib list / add / remove
        ├── config.md             config list / get / set(전역 환경설정)
        └── where-to-get-ipas.md  IPA 파일 구하는 곳
```

## 필수 조건

- **CLI 기능으로 빌드된 PlayCover.** CLI는 [PR #2238](https://github.com/PlayCover/PlayCover/pull/2238)(`feat/cli-mode` 브랜치)을 통해 업스트림에 기여되었으며, **아직 공식 PlayCover 릴리스에 포함되지 않았습니다**. PR 검토 중에는 **maclub 포크 빌드**를 사용하십시오. 두 가지 다운로드 방법:
  - **Mac Club appstore**(브라우저 UI, 큐레이션 목록): [maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG](https://www.maclub.net/appstore/01HSACVCVC0HZGBD3BQX6QY1VG)
  - **GitHub Releases**(직접 DMG): [maclub-net/PlayCover/releases](https://github.com/maclub-net/PlayCover/releases) — 최신 `PlayCover_*.dmg`를 다운로드하고, 마운트한 뒤 `PlayCover.app`을 `/Applications`로 드래그하십시오. 이 DMG는 Apple 서명 및 공증되었으므로 Gatekeeper 경고 없이 열립니다.
- Node.js >= 18(`npx` 설치기를 사용하는 경우에만).
- CLI 사용 가능 여부 확인:

  ```bash
  PlayCover.app/Contents/MacOS/PlayCover --help
  ```

  서브커맨드 목록이 출력되어야 합니다. GUI가 열린다면 빌드가 CLI보다 이전 버전입니다 — 더 새로운 maclub 빌드를 설치하십시오.

## 설치

이것은 **프로젝트 범위의 agent Skill**입니다. 프로젝트의 `.agents/skills/` 폴더에 설치하면 agent(Trae, Claude Code 등)가 자동으로 발견합니다.

### 옵션 1 — npx(clone 불필요)

가장 빠른 방법. skill을 활성화할 **프로젝트 루트**에서 실행:

```bash
npx playcover-skills
```

또는 npm 퍼블리시 전(GitHub에서 직접 실행):

```bash
npx github:maclub-net/PlayCover-Skills
```

설치기는 `playcover-cli/`를 `./.agents/skills/playcover-cli`에 복사하고 다음 단계를 출력합니다.

Flags:

```bash
npx playcover-skills --path /Users/you/code/some-project  # 다른 프로젝트에 설치
npx playcover-skills --force                              # 기존 설치 덮어쓰기
npx playcover-skills --uninstall                          # skill 제거
```

### 옵션 2 — git clone + 수동 복사

```bash
git clone --depth 1 https://github.com/maclub-net/PlayCover-Skills.git
cd PlayCover-Skills

TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
cp -R playcover-cli "$TARGET/.agents/skills/playcover-cli"
```

### 옵션 3 — 심볼릭 링크(이 리포지토리와 동기화 유지)

```bash
TARGET="/Users/you/code/some-project"
mkdir -p "$TARGET/.agents/skills"
ln -s "$(pwd)/playcover-cli" "$TARGET/.agents/skills/playcover-cli"
```

`PlayCover-Skills`에서 `git pull`하면 심볼릭 링크된 모든 위치에서 skill이 업데이트됩니다.

### 옵션 4 — 전역 설치(모든 프로젝트에서 사용 가능)

`playcover-cli/`를 agent 프레임워크의 전역 skill 디렉토리에 넣으십시오. Trae의 경우 사용자 수준 skill 폴더입니다. 정확한 경로는 agent 문서를 참조하십시오.

## 로드 확인

agent 세션에서 다음과 같이 물어보십시오:

> 키맵 관리용 PlayCover CLI 서브커맨드를 나열해 주세요.

로드된 `playcover-cli` skill은 `references/keymaps.md`에서 답합니다. agent가 답하지 못하면 skill이 활성 프로젝트에 설치되지 않은 것입니다——`.agents/skills/` 경로를 다시 확인하십시오.

## 사용법

skill을 직접 호출하지 않습니다——**agent는 요청이 설명과 일치하면 주문식으로 로드합니다**(CLI로 앱 설치/제거/실행, 키맵/소스/설정/dylib/구성 관리, PlayCover 스크립트화나 자동화, 또는 "왜 GUI가 열렸는지" 진단).

언급하여 강제 로드할 수도 있습니다. 예:

> playcover-cli skill을 사용해. bundle ID로 앱을 다운로드하고 설치하려면?

### 빠른 레시피

```bash
BIN="PlayCover.app/Contents/MacOS/PlayCover"

# 설치된 앱을 JSON으로 목록화
$BIN list --json | jq '.[].bundleIdentifier'

# PlayTools로 IPA 설치
$BIN install ~/Downloads/App.ipa --play-tools --category games

# 설정된 소스에서 다운로드 및 설치
$BIN download com.example.app --install

# 키맵 스냅샷 및 복원
$BIN keymap export com.example.app default -o /tmp/km.plist
$BIN keymap import com.example.app default /tmp/km.plist --force

# 무인 실행을 위해 모든 GUI 팝업 억제
$BIN config set ShowInstallPopup false
$BIN config set ShowUninstallPopup false
```

## 규약 요약

- **stdout** = 데이터 · **stderr** = 오류(`Error: ` 접두사).
- `list`/`info`/`source list`/`store list`/`settings list`/`config list`에 `--json`으로 구조화된 출력.
- 종료 코드: `0` 성공 · `1` 일반 · `2` badArguments · `3` appNotFound · `4` verificationFailed · `5` cancelled.
- CLI 모드는 `.accessory`로 실행——Dock 아이콘 없음, 바운스 없음.
- CLI 모드에서는 GUI 대화상자 없음——명령은 멈추는 대신 stderr로 빠르게 실패합니다.

전체 개요는 [playcover-cli/SKILL.md](playcover-cli/SKILL.md), 명령별 상세는 [playcover-cli/references/](playcover-cli/references)를 참조하십시오.

## 레지스트리 및 플랫폼

`playcover-cli`는 오픈 [Agent Skills](https://github.com/anthropics/skills) 형식(`SKILL.md` + `references/`)을 따르므로 호환되는 agent 어디서든 로드됩니다. 다음에 등록되어 있습니다:

| 플랫폼 | 상태 | 설치 / 목록 |
|---|---|---|
| **npm** | 사용 가능 | `npx playcover-skills` · [npmjs.com/package/playcover-skills](https://www.npmjs.com/package/playcover-skills) |
| **GitHub** | 공식 소스 | [maclub-net/PlayCover-Skills](https://github.com/maclub-net/PlayCover-Skills) |
| **ComposioHQ/awesome-claude-skills** | 등록됨 | [awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — Development 카테고리 |
| **awesome-skills.com** | 자동 인덱스 | [awesome-skills.com](https://awesome-skills.com) |
| **LobeHub Skills** | 자동 인덱스 | [lobehub.com/skills](https://lobehub.com/skills) |
| **TRAE Skills marketplace** | 자동 인덱스 | TRAE IDE에 내장 |
| **Smithery Skills** | 사용 가능 | `smithery skill add maclub-net/PlayCover-Skills` |

새 플랫폼에 이 skill을 등록하려면 issue나 PR을 여십시오——기여를 환영합니다.

## 라이선스

PlayCover 프로젝트와 동일한 라이선스로 배포됩니다. 자세한 내용은 PlayCover 리포지토리를 참조하십시오.
