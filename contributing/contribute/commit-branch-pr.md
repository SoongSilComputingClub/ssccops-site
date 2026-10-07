---
title: 커밋, 브랜치, PR 규칙
description: 이슈 유형과 커밋 타입의 차이, 커밋 메시지와 PR 제목 형식, PR 본문의 근거 줄, 서버 레포의 git 훅을 정리합니다.
sidebar_position: 2
---

# 커밋, 브랜치, PR 규칙

세 작업 레포(`ssccops-server`, `ssccops-web`, `ssccops-site`)는 같은 컨벤션을 씁니다. 이 문서는 처음 PR을 올릴 때 알아야 할 핵심만 모았습니다. 원본은 각 레포의 `AGENTS.md`이고, 규칙이 바뀌면 원본이 먼저 바뀝니다.

| 레포 | 원본 |
|---|---|
| ssccops-server | [`AGENTS.md`의 커밋, 브랜치, PR 절](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/AGENTS.md#커밋--브랜치--pr-컨벤션) |
| ssccops-web | [`AGENTS.md`의 커밋, 브랜치, PR 절](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md#커밋--브랜치--pr) |
| ssccops-site | [`AGENTS.md`의 커밋, 브랜치, PR 절](https://github.com/SoongSilComputingClub/ssccops-site/blob/develop/AGENTS.md#커밋-브랜치-pr-컨벤션) |

## 이슈 유형과 커밋 타입은 다른 어휘입니다

처음 오면 가장 헷갈리는 부분입니다. 둘은 이름이 겹치지만 따로 정해져 있습니다.

**이슈 유형은 넷뿐입니다.** `feat`, `fix`, `refactor`, `chore`입니다. 이슈 템플릿이 주는 제목 접두어(`[FEAT]`, `[FIX]`, `[REFACTOR]`, `[CHORE]`)에서 라벨과 브랜치 접두어가 나옵니다.

문서, 테스트, 스타일, CI 작업의 이슈는 모두 `[CHORE]`로 엽니다. `[DOCS]`나 `[CICD]` 같은 접두어로 열어도 봇이 `chore`로 받습니다. 넷으로 못 박은 이유는 같은 표가 워크플로 넷(`issue-labeler`, `issue-branch-creator`, `pr-labeler`, `pr-guard`)에 흩어져 있어서, 하나만 고치면 이슈와 PR의 라벨이 갈라지기 때문입니다.

**커밋 타입은 더 많습니다.** 레포마다 목록이 조금 다릅니다.

| 레포 | 커밋 타입 | 수 |
|---|---|---|
| ssccops-server | `feat`, `fix`, `refactor`, `design`, `style`, `docs`, `test`, `chore`, `init`, `rename`, `remove`, `cicd`, `hotfix` | 13 |
| ssccops-web | `feat`, `fix`, `refactor`, `design`, `style`, `docs`, `test`, `chore`, `init`, `rename`, `remove`, `cicd` | 12 |
| ssccops-site | `feat`, `fix`, `refactor`, `design`, `style`, `docs`, `test`, `chore`, `init`, `rename`, `remove`, `cicd` | 12 |

차이는 `hotfix` 하나입니다. 서버의 `AGENTS.md`에만 있고 웹과 사이트의 `AGENTS.md`에는 없습니다. 어느 쪽에 맞출지는 정해지지 않았습니다 `[확인 필요]`. 그 레포의 목록을 따르면 됩니다.

그래서 이슈는 `[CHORE]`인데 커밋은 `docs(agents): …`인 것이 정상입니다. PR의 타입 라벨은 연결된 이슈의 라벨에서만 옵니다(`pr-labeler.yml`). 커밋 타입은 라벨에 영향을 주지 않고, 지키는 이유는 `git log`가 읽히게 하기 위해서입니다.

## 브랜치

- 이슈를 열면 봇이 `{유형}/#{이슈번호}` 브랜치를 만듭니다. 예: `feat/#123`. 유형은 위의 이슈 유형 넷 가운데 하나입니다.
- 직접 만들어야 하면 같은 형식으로, `develop`에서 땁니다. 남의 작업 브랜치 위에서 따지 않습니다.
- 예전 형식 `{유형}/#N-슬러그`도 `pr-guard`가 아직 받습니다. 새로 만들 때는 슬러그를 붙이지 않습니다.
- `main`과 `develop`에 직접 커밋하지 않습니다.

브랜치가 만들어지는 과정은 [이슈에서 머지까지](./workflow.md)에 있습니다.

## 커밋 메시지

서버와 웹은 이슈 번호를 앞에 붙입니다.

```
#123 feat(event): 행사 신청 대기 순번을 응답에 담는다
```

| 레포 | 형식 |
|---|---|
| ssccops-server, ssccops-web | 이슈가 있으면 `#{이슈번호} {type}({scope}): 설명`, 없으면 `{type}({scope}): 설명` |
| ssccops-site | `{type}({scope}): 설명`. 글이면 `docs(blog): …`처럼 씁니다 |

squash merge라 `develop`에 남는 커밋 제목은 PR 제목입니다. 그래도 개별 커밋은 리뷰할 때 읽히니 형식을 지킵니다.

설명은 평범한 문장 한 줄로 씁니다. 사이트 레포 `AGENTS.md`에 적힌 규칙으로, 긴 대시(—)로 부제를 달거나 가운뎃점(·)으로 명사를 늘어놓지 않고 쉼표와 조사로 잇습니다.

```
chore(config): 사이트 이름, 주소, 언어와 블로그 규칙을 설정한다
```

## PR 제목

```
[#123] 행사 신청 대기 순번을 응답에 담는다
```

- 형식은 `[#이슈번호] 총 작업 내용`입니다.
- squash merge에서 이 제목이 그대로 `develop`의 커밋 제목이 됩니다. 저장소 설정이 커밋 제목으로 PR 제목을 쓰게 되어 있어(`squash_merge_commit_title = PR_TITLE`), 커밋이 하나뿐인 PR에서도 PR 제목이 남습니다.
- 잘못된 제목은 `git log`에 영구히 남고, 되돌리려면 배포 브랜치를 강제 푸시해야 합니다. 그래서 CI가 제목을 검사합니다.

## PR 본문

각 레포의 PR 템플릿을 채웁니다. 빠뜨리기 쉬운 두 줄이 있습니다.

**이슈 연결.** «🍀 이슈 번호»의 `- closed: #123`이 머지될 때 이슈를 닫습니다. 이 연결이 있어야 `pr-labeler`가 그 이슈의 타입 라벨을 PR에 붙입니다. 이슈를 닫고 싶지 않으면 `closed:`를 지웁니다.

**근거.** 이 변경이 어느 결정에서 나왔는지를 적습니다. 메타 레포 이슈 번호(`ssccops#N` 또는 `SoongSilComputingClub/ssccops#N`)나 결정 기록 번호(`ADR-NNNN`)입니다. PR에서 Sub-task, 상위 이슈, 결정 기록으로 거슬러 올라가는 사슬의 첫 고리입니다.

```
- 근거: ssccops#340
- 근거: ADR-0024
```

`pr-guard`가 근거를 보는 방식은 레포마다 조금 다릅니다.

| 레포 | 통과 조건 |
|---|---|
| ssccops-server | 한 줄 안에 `근거`라는 말과 `ssccops#숫자` 또는 `ADR-숫자4자리`가 함께 있어야 합니다 |
| ssccops-web | 본문 어디든 `ssccops#숫자` 또는 `ADR-숫자4자리`가 있으면 됩니다 |
| ssccops-site | web과 같습니다. 단 연결된 이슈 제목이 `[DOCS]`로 시작하면 근거를 보지 않습니다 |

템플릿의 `- 근거: ssccops#` 줄에 번호만 채우면 세 레포 모두 통과합니다. 템플릿 그대로 번호 없이 두면 실패합니다.

## pr-guard가 막는 것

`pr-guard.yml`은 PR을 열거나, 제목이나 본문을 고치거나, 커밋을 올릴 때마다 돕니다. 어긴 것을 한 번에 모두 보고합니다.

1. 제목이 `[#숫자] 내용` 형식인가
2. 브랜치가 `feat`, `fix`, `refactor`, `chore` 가운데 하나로 시작하는 `{유형}/#숫자` 형식인가
3. 제목의 번호와 브랜치의 번호가 같은가. 다르면 다른 작업의 브랜치에서 갈라져 나왔을 수 있습니다
4. 그 번호가 이 레포에 실제로 있는 이슈인가
5. 본문에 근거가 있는가(위 표)

`develop → main` 릴리즈 PR과 dependabot PR은 검사하지 않습니다.

## 머지

- 기능과 수정 PR은 **Squash and merge**로 `develop`에 들어갑니다.
- `develop → main` 릴리즈 PR은 일반 merge commit으로 머지합니다. squash하면 릴리즈에 무엇이 들어갔는지 사라지기 때문입니다. 사이트 레포에는 `main`이 없습니다.

## 서버 레포의 git 훅

`ssccops-server`의 `.husky/` 폴더에 훅 둘이 있습니다. 실제로 하는 일은 이것뿐입니다.

**`pre-commit`**

- 현재 브랜치가 `main`, `master`, `develop`이면 «직접 커밋할 수 없습니다»를 출력하고 커밋을 멈춥니다. 이때 안내 문구가 `feat/#nn-XXX` 형식의 브랜치를 쓰라고 하는데, 지금의 브랜치 형식은 `feat/#nn`입니다.
- 그 밖의 브랜치에서는 `pnpm exec lint-staged`를 부릅니다. `.lintstagedrc`는 스테이징된 `*.java` 파일이 있으면 `./gradlew spotlessApply checkstyleMain checkstyleTest --daemon`을 돌리게 되어 있습니다.

**`prepare-commit-msg`**

- 브랜치 이름에서 첫 `#숫자`를 꺼내, 커밋 메시지 첫 줄에 그 번호가 없으면 맨 앞에 붙입니다. `feat/#32`에서 `feat: Add login`으로 커밋하면 `#32 feat: Add login`이 됩니다.
- 이미 번호가 있으면 건드리지 않고, 브랜치에 번호가 없으면 아무것도 하지 않습니다.

알아 둘 점이 둘 있습니다.

- 훅을 켜는 설정은 레포에 없습니다. 서버 레포에는 `package.json`이 없어 husky를 설치하는 단계가 없고, `core.hooksPath`를 정하는 스크립트도 찾지 못했습니다. 훅을 쓰려면 각자 켜야 하는 것으로 보입니다. 정해진 방법은 `[확인 필요]`입니다.
- `pre-commit`은 Node와 pnpm이 있어야 합니다. `lint-staged`를 `pnpm exec`로 부르기 때문입니다. 훅을 켰는데 pnpm이 없으면 커밋이 실패합니다.

웹과 사이트 레포에는 git 훅이 없습니다.

## 다음 읽을 것

- [이슈에서 머지까지](./workflow.md): 이 규칙들이 이슈부터 머지까지 어느 단계에서 쓰이는지 봅니다.
- [CI 검사](./ci.md): `pr-guard` 말고 레포마다 도는 검사와 로컬에서 먼저 돌릴 명령을 봅니다.
