---
title: CI 검사
description: 세 작업 레포에서 PR과 푸시마다 어떤 GitHub Actions 검사가 도는지, 실패하면 어디를 보고 로컬에서 무엇을 먼저 돌리면 되는지 정리합니다.
sidebar_position: 3
---

# CI 검사

PR을 올리면 레포마다 정해진 검사가 GitHub Actions에서 돕니다. 이 문서는 레포별로 무엇이 언제 도는지, 실패하면 어디를 보는지, 같은 검사를 로컬에서 먼저 돌리는 명령을 정리합니다. PR을 올리기 전이나 빨간 체크를 만났을 때 읽습니다.

워크플로 원본은 각 레포의 `.github/workflows/`에 있습니다.

## 한눈에 보기

| 레포 | PR에서 | `develop` 푸시에서 |
|---|---|---|
| ssccops-server | pr-guard, pr-labeler, Lint(Spotless, Checkstyle), Test, Build(`bootJar`), API Compat | Lint, Test, Build, SonarQube 분석 |
| ssccops-web | pr-guard, pr-labeler, Lint(typecheck, ESLint), Test(테스트 파일이 있을 때만), Build | Lint, Test, Build, SonarQube 분석 |
| ssccops-site | pr-guard, pr-labeler, typecheck와 build | typecheck와 build |

셋 모두 이슈가 열릴 때 `issue-branch-creator`(브랜치 생성)와 `issue-labeler`(라벨)가 돕니다. 이 둘은 검사가 아니라 자동화입니다. [이슈에서 머지까지](./workflow.md)에서 다룹니다.

배포 워크플로도 있지만 여기서는 다루지 않습니다. 서버와 웹은 `develop`이 dev 환경으로, `main`이 prod 환경으로 자동 배포되고, 사이트는 `develop` 머지가 곧 발행이라는 것만 알면 됩니다.

## 세 레포 공통: pr-guard와 라벨러

### pr-guard

PR 제목, 브랜치 이름, 이슈 연결, 본문의 근거를 검사합니다. PR을 열 때, 제목이나 본문을 고칠 때, 커밋을 올릴 때마다 다시 돕니다. `develop → main` 릴리즈 PR과 dependabot PR은 건너뜁니다.

| 검사 | 통과 조건 |
|---|---|
| 제목 | `[#숫자] 내용` |
| 브랜치 | `feat/#N`, `fix/#N`, `refactor/#N`, `chore/#N` |
| 번호 일치 | 제목의 번호와 브랜치의 번호가 같음 |
| 이슈 실재 | 그 번호의 이슈가 이 레포에 있음 |
| 근거 | 본문에 메타 레포 이슈 번호나 `ADR-NNNN`. 레포별 차이는 [커밋, 브랜치, PR 규칙](./commit-branch-pr.md#pr-본문) |

실패하면 job 로그와 Annotations에 어긴 항목이 모두 한꺼번에 나옵니다. 제목과 본문은 PR 화면에서 고치면 검사가 다시 돕니다. 브랜치 이름이 틀렸다면 맞는 이름의 브랜치로 PR을 새로 엽니다.

### pr-labeler

검사가 아니라 라벨을 붙이는 일만 하고, 실패로 PR을 막지 않습니다.

- 크기 라벨: 더하고 뺀 줄 수 합으로 `size/XS`(10 이하), `size/S`(50 이하), `size/M`(200 이하), `size/L`(500 이하), `size/XL`을 붙입니다.
- 타입 라벨: 본문의 `closed: #N`으로 연결된 이슈의 라벨(`feat`, `fix`, `refactor`, `chore`)을 그대로 가져옵니다. 이슈가 연결되지 않았으면 타입 라벨은 붙지 않습니다.

## ssccops-server

워크플로는 둘입니다. `develop`으로 향하는 PR과 `develop` 푸시는 `integrate-dev.yml`, `main`으로 향하는 PR과 `main` 푸시는 `integrate-prod.yml`이 맡습니다. 두 파일의 Lint, Test, Build는 같은 명령을 씁니다. 다르게 두면 `develop`에서 통과한 코드가 `main`에서 떨어지기 때문입니다.

| job | 하는 일 | 언제 |
|---|---|---|
| Lint | `./gradlew spotlessCheck`, `./gradlew checkstyleMain checkstyleTest` | PR, 푸시 |
| Test | `./gradlew test jacocoTestReport` | PR, 푸시 |
| Build | `./gradlew bootJar`. Lint와 Test가 통과해야 돕니다 | PR, 푸시 |
| API Compat | PR의 base와 head에서 OpenAPI 스펙을 각각 만들어 하위 호환이 깨졌는지 비교 | `develop`으로 향하는 PR만 |
| Analyze | SonarQube 분석 | `develop` 푸시만 |

**실패하면 어디를 보나**

- **Lint의 Spotless**: 포맷이 어긋난 것입니다. `./gradlew spotlessApply`가 자동으로 고칩니다.
- **Lint의 Checkstyle**: 설정은 `config/checkstyle/checkstyle.xml`입니다. import 순서 위반이면 손으로 고치지 말고 `./gradlew spotlessApply`를 돌립니다. Spotless의 import 순서가 Checkstyle 규칙과 같게 맞춰져 있습니다.
- **Test**: job 로그에서 실패한 테스트 이름을 찾습니다. 실행 결과는 `test-results` 아티팩트(`build/test-results/`, `build/reports/jacoco/`)로도 올라갑니다. 로컬에서 그 클래스만 돌리려면 `./gradlew test --tests "*클래스이름"`을 씁니다.
- **API Compat**: job 요약에 oasdiff 보고서가 있습니다. 응답 필드 삭제, 이름이나 타입 변경, 요청 필드를 필수로 바꾸기, 엔드포인트나 enum 값 삭제가 걸립니다. 필드나 엔드포인트, 선택 파라미터를 더하는 것은 통과합니다.

API Compat 실패가 의도한 변경이라면 리뷰어와 상의해 PR에 `api-breaking-approved` 라벨을 붙이고 실패한 job을 다시 돌립니다. 이 라벨은 마이너 버전업과 릴리즈 노트의 마이그레이션 항목을 함께 요구합니다. 심각도 설정은 [`config/oasdiff/`](https://github.com/SoongSilComputingClub/ssccops-server/tree/develop/config/oasdiff)에 있습니다.

**로컬에서 먼저 돌리기**

```bash
./gradlew spotlessApply                      # 포맷 자동 정리
./gradlew spotlessCheck                      # CI Lint와 같은 검사
./gradlew checkstyleMain checkstyleTest
./gradlew test                               # CI Test
./gradlew bootJar                            # CI Build
./gradlew build                              # 위를 한 번에 (compileJava, checkstyle, spotless, test, jacoco)
```

- `FlywayMigrationValidateTest` 같은 일부 테스트는 Testcontainers로 PostgreSQL을 띄우므로, `./gradlew test`를 돌릴 때 Docker가 떠 있어야 합니다.
- API Compat을 로컬에서 보려면 base와 head에서 각각 `./gradlew test --tests '*OpenApiSnapshotTest'`를 돌려 `build/openapi.json`을 만들고, oasdiff로 둘을 비교합니다. 대부분은 PR에서 결과를 보는 편이 빠릅니다.

명령의 원본은 [서버 `AGENTS.md`의 빌드, 테스트, 린트 절](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/AGENTS.md#빌드--테스트--린트)입니다.

## ssccops-web

워크플로는 `integrate.yml` 하나입니다. `main`이나 `develop`으로 향하는 PR, `develop` 푸시, 수동 실행에서 돕니다. 검증 명령은 모두 루트의 Turborepo로 돌아서, 앱 셋(`apps/admin`, `apps/www`, `apps/lms`)과 `packages/*`를 한 번에 봅니다.

| job | 하는 일 | 언제 |
|---|---|---|
| Lint | `pnpm typecheck`(앱마다 `next typegen` 뒤 `tsc`), `pnpm lint`(ESLint) | PR, 푸시 |
| Test | `apps/*/src`, `packages/*/src`에 `*.test.*`나 `*.spec.*` 파일이 있을 때만 `pnpm -r test:coverage` | PR, 푸시 |
| Build | `pnpm build`, 이어서 컨테이너 배포용 설정(`CONTAINER_BUILD=1`)으로 `apps/www`를 한 번 더 빌드 | PR, 푸시 |
| Analyze | SonarQube 분석 | `develop` 푸시만 |

:::note[테스트 러너는 아직 없습니다]
지금은 테스트 파일이 하나도 없어 Test job은 통과만 하고 지나갑니다. 테스트를 처음 더하는 사람이 러너와 `test:coverage` 스크립트를 함께 붙입니다. Prettier 검사도 없습니다.
:::

**실패하면 어디를 보나**

- **Lint의 typecheck**: `Cannot find name 'PageProps'`가 나오면 `next typegen`이 빠진 것입니다. 루트의 `pnpm typecheck`는 typegen을 먼저 돌리게 되어 있으니 앱 폴더에서 `tsc`만 따로 돌리지 말고 루트 명령을 씁니다.
- **Lint의 ESLint**: ESLint는 타입을 검사하지 않습니다. `pnpm lint`만 통과했다고 typecheck가 통과하는 것은 아닙니다.
- **Build**: `NEXT_PUBLIC_*` 값이 없어도 컴파일은 통과하므로, 빌드 실패는 대개 코드 문제입니다. 컨테이너 경로 단계에서 실패하면 `apps/www/.next/standalone`이 만들어졌는지를 봅니다.

**로컬에서 먼저 돌리기**

```bash
pnpm install --frozen-lockfile
pnpm typecheck      # CI Lint의 타입 검사
pnpm lint           # CI Lint의 ESLint
pnpm build          # CI Build
CONTAINER_BUILD=1 pnpm build --filter=@ssccops/www --force   # CI Build의 컨테이너 경로 단계
```

순서와 이유의 원본은 [웹 `AGENTS.md`의 검증 절](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md#검증--ci와-같은-순서로-돌린다)입니다.

웹 레포에는 dev 공개 화면의 Lighthouse 점수를 매일 재는 워크플로(`lighthouse.yml`)도 있습니다. 리포트만 남기고 PR이나 머지와는 관계가 없습니다.

## ssccops-site

워크플로는 `integrate.yml` 하나이고, `develop`으로 향하는 PR과 `develop` 푸시에서 돕니다. job 하나가 `pnpm typecheck`와 `pnpm build`를 차례로 돌립니다.

사이트 빌드는 그 자체가 검사입니다. 깨진 링크와 `blog/authors.yml`에 등록되지 않은 작성자가 있으면 빌드가 멈추도록 설정되어 있습니다(`docusaurus.config.ts`).

**실패하면 어디를 보나**

- **Typecheck**: `tsc` 오류입니다. 주로 `src/`, `plugins/`, 설정 파일에서 납니다.
- **Build**: 로그에서 깨진 링크가 어느 문서의 어느 링크인지 알려 줍니다. 문서 안 링크는 상대 경로 md 링크로 쓰고, 그 파일이 실제로 있는지 확인합니다.
- PR에는 Cloudflare Pages가 미리보기 주소를 붙입니다. 글과 화면은 거기서 직접 봅니다.

**로컬에서 먼저 돌리기**

```bash
pnpm install
pnpm typecheck
pnpm build          # CI와 같은 검사
pnpm start          # 로컬 미리보기 (http://localhost:3000)
```

Node 버전은 `.nvmrc`(22)를 따릅니다. 원본은 [사이트 `AGENTS.md` «명령»](https://github.com/SoongSilComputingClub/ssccops-site/blob/develop/AGENTS.md#명령)입니다.

## SonarQube는 머지를 막지 않습니다

서버와 웹에는 SonarQube 분석(Analyze job)이 있지만, PR에서는 돌지 않고 `develop` 푸시에서만 돕니다.

쓰는 SonarQube는 브랜치를 나눠 분석하지 못해서 모든 분석이 한 자리를 덮어씁니다. PR마다 돌리면 그 자리가 PR 내용으로 바뀌어 «지금 develop이 어떤 상태인가»를 알 수 없게 됩니다. 그래서 머지된 상태만 분석합니다.

- Analyze job의 색이 Quality Gate 결과입니다. 통과하면 초록, 게이트가 깨지면 빨강, 분석에 필요한 토큰이 없어 건너뛰면 회색입니다.
- **이 결과는 머지를 막지 않습니다.** PR에서 돌지 않으니 막을 머지가 없고, 결정 기록(ADR-0018)이 «Quality Gate는 보고만 하고 머지를 막지 않는다»로 정했습니다. dev 배포도 막지 않습니다.
- Build도 Analyze를 기다리지 않습니다. 품질 리포트가 없다고 «이 브랜치가 빌드되는가»라는 판정까지 막을 이유가 없어서입니다.
- 서버의 `main`(`integrate-prod.yml`)에는 Analyze가 없습니다. 같은 자리를 두 브랜치가 덮어쓰지 않게 `develop` 하나만 남겼습니다.

머지한 뒤 `develop` 커밋의 Analyze가 빨갛게 되면, 그 실행 화면의 Annotations에 깨진 조건이 나옵니다. 분석 서버 자체는 운영진이 관리하니 접근이 필요하면 운영진에게 묻습니다.

## 다음 읽을 것

- [커밋, 브랜치, PR 규칙](./commit-branch-pr.md): `pr-guard`에 걸렸을 때 제목, 브랜치, 근거 줄 규칙을 봅니다.
- [이슈에서 머지까지](./workflow.md): 검사가 이슈부터 머지까지의 흐름 어디에 들어가는지 봅니다.
