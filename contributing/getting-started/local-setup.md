---
title: 로컬 개발 환경
description: 서버와 웹 앱 셋을 내 컴퓨터에서 띄우는 순서입니다. 필요한 도구, 포트, 환경 변수 이름을 정리하고 세부는 각 레포 README로 연결합니다.
sidebar_position: 3
---

# 로컬 개발 환경

서버(`ssccops-server`)와 웹 앱 셋(`ssccops-web`)을 내 컴퓨터에서 띄우는 순서를 정리합니다. 명령과 변수의 원본은 각 레포 README와 `.env.example`이고, 이 문서는 순서와 막히기 쉬운 곳을 짚습니다. 둘이 다르면 README가 맞습니다.

- 서버: [ssccops-server README «빠른 시작»](https://github.com/SoongSilComputingClub/ssccops-server#readme)
- 웹: [ssccops-web README «빠른 시작»](https://github.com/SoongSilComputingClub/ssccops-web#readme)

## 필요한 것

| 도구 | 버전 | 근거 |
|---|---|---|
| JDK | 17 | 서버 `build.gradle`의 Java toolchain(`JavaLanguageVersion.of(17)`), CI도 17 |
| Gradle | 따로 설치하지 않습니다 | 레포의 wrapper(`./gradlew`, Gradle 8.14.3)를 씁니다 |
| Docker | Docker Compose를 쓸 수 있는 버전 | 로컬 PostgreSQL을 띄우고, Testcontainers를 쓰는 서버 테스트에도 필요합니다 |
| Node.js | 20 이상 | 웹 README, 웹 CI(`NODE_VERSION: '20'`) |
| pnpm | 10.29.3 | 웹 `package.json`의 `packageManager`. `corepack enable`을 켜 두면 이 버전이 자동으로 쓰입니다 |

웹 레포에는 `.nvmrc`가 없습니다. Node 버전은 위의 README와 CI 값을 따릅니다.

서버 레포의 `.husky/pre-commit` 훅은 `develop`, `main` 브랜치에서의 직접 커밋을 막은 뒤 `pnpm exec lint-staged`를 부르고, lint-staged는 커밋에 Java 파일이 있으면 `./gradlew spotlessApply checkstyleMain checkstyleTest`를 돌립니다(`.lintstagedrc`). 그래서 이 훅을 쓰려면 서버 작업에도 pnpm이 필요합니다. 다만 서버 레포에는 `package.json`이 없어, 훅을 어떻게 켜고 lint-staged를 어디서 받는지는 `[확인 필요]`입니다.

## 접속 정보는 운영진에게 받습니다

서버와 웹 모두 **Supabase 프로젝트 값**이 있어야 로그인과 토큰 검증이 됩니다. 서버의 `SUPABASE_URL`과 웹 세 앱의 `NEXT_PUBLIC_SUPABASE_URL`은 **모두 같은 프로젝트**를 가리켜야 합니다. 같은 계정으로 로그인한 사람이 서버에서 같은 회원으로 식별되어야 하기 때문입니다.

이 값들은 레포에도 이 사이트에도 적지 않습니다. **값은 운영진에게 받습니다.** 개인이 Supabase 프로젝트를 따로 만들어 써도 되는지는 `[확인 필요]`입니다.

## 서버 띄우기

```bash
cp .env.example .env          # 값을 채웁니다 (아래 표)
docker compose up postgres    # DB만 컨테이너로 띄웁니다
./gradlew bootRun             # 앱은 호스트에서 실행합니다 (http://localhost:8080)
```

- `docker-compose.yml`의 DB 서비스 이름은 `postgres`이고, 호스트에 `DB_PORT`(기본 `15432`)로 게시됩니다. `.env.example`의 `DB_HOST`, `DB_PORT`가 이 값에 맞춰져 있어 `bootRun`이 그대로 붙습니다.
- 앱까지 컨테이너로 띄우려면 `docker compose up` 한 줄이면 됩니다. 이때는 compose가 `DB_HOST`, `DB_PORT`를 컨테이너 네트워크 값으로 덮어써서 `.env` 한 벌로 두 방식이 모두 동작합니다.
- 서버 포트는 `PORT`(기본 `8080`)입니다. 로컬 프로필은 `SPRING_PROFILES_ACTIVE=local`입니다.
- 스키마는 Flyway 마이그레이션(`src/main/resources/db/migration`)이 만듭니다. 빈 DB면 첫 기동에서 V1부터 전부 돕니다.

:::warning[확인 필요]

`docker-compose.yml`의 DB 이미지는 `postgres:17`인데, 마이그레이션 `V10__create_assistant_tables.sql`은 `CREATE EXTENSION IF NOT EXISTS vector`(pgvector)를 실행합니다. 서버 테스트의 Testcontainers는 `pgvector/pgvector:pg17` 이미지를 씁니다. 기본 `postgres:17` 이미지로 빈 DB에서 첫 기동이 통과하는지는 아직 확인하지 못했습니다. 첫 기동에서 `vector` 확장 오류가 나면 이 부분을 이슈로 알려 주세요.

:::

### 떴는지 확인하기

```bash
curl http://localhost:8080/actuator/health/readiness
```

`readiness`는 DB 연결까지 봅니다. 토큰 없이 열리는 actuator 경로는 `/actuator/health/liveness`, `/actuator/health/readiness`, `/actuator/info`뿐이라 **`/actuator/health` 자체는 401**이 정상입니다.

API 문서는 `local`과 `dev` 프로필에서 `http://localhost:8080/swagger-ui.html`로 열립니다.

### 빈 DB에서 처음 가입한 사람이 최고관리자가 됩니다

권한 관리 화면은 `ROLE_MANAGE` 권한을 요구하므로, 새 환경에서는 아무도 역할을 줄 수 없는 닫힌 고리가 생깁니다. 그래서 **회원 테이블이 비어 있을 때 가입하는 첫 회원에게 `최고관리자` 역할(권한 트리의 최상위 `SUPER`)을 자동으로 줍니다.** 판정 기준은 «회원이 한 명도 없는가» 하나입니다.

로컬에서 새 DB를 만들었다면, 웹에서 처음 가입하는 내 계정이 최고관리자가 되어 admin의 모든 화면을 열 수 있습니다. 구현은 `MemberServiceImpl`의 `claimBootstrapRole`, `grantBootstrapRole`이고, 규칙은 [domain/member/AGENTS.md](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/member/AGENTS.md)의 «최초 가입자 부트스트랩»에 있습니다.

### 서버 환경 변수

원본은 [`.env.example`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/.env.example)이고, 각 변수의 설명과 함정이 주석으로 달려 있습니다.

| 이름 | 필수 | 무엇 |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | 예 | 로컬은 `local` |
| `PORT` | 아니요 | 서버 포트. 기본 8080 |
| `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | 예 | PostgreSQL 접속. compose와 `bootRun`이 함께 읽습니다 |
| `SUPABASE_URL` | 예 | JWT 검증용 JWKS와 issuer. 웹 세 앱과 같은 프로젝트여야 합니다 |
| `FRONTEND_URL` | 예 | CORS 허용 오리진. 쉼표로 여러 개를 넣습니다 |
| `APP_PUBLIC_BASE_URL` | 예 | 이 API 자신의 공개 주소. 이미지 읽기 주소를 조립합니다 |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | 변수는 있어야 함 | 파일과 이미지 업로드. 값이 없으면 업로드만 동작하지 않지만, **변수 자체는 있어야 기동합니다**(빈 값으로 둡니다) |
| `GEMINI_API_KEY` | 아니요 | 없으면 규정 도우미(RAG)만 동작하지 않습니다 |
| `SSCCOPS_PUSH_VAPID_PUBLIC_KEY`, `SSCCOPS_PUSH_VAPID_PRIVATE_KEY`, `SSCCOPS_PUSH_VAPID_SUBJECT` | 아니요 | 없으면 웹 푸시만 보내지 않습니다. 알림 목록은 그대로입니다 |

`.env.example`에는 이 밖에도 주석 처리된 선택 변수(`GEMINI_*` 모델 설정, `SSCCOPS_ASSISTANT_*`, `SSCCOPS_MEMBER_HARD_DELETE_ENABLED`, `SSCCOPS_PUSH_ENABLED`, `SSCCOPS_NOTIFICATION_DEADLINE_ENABLED` 등)가 있습니다. 처음에는 건드리지 않아도 됩니다.

`FRONTEND_URL`에는 로컬 웹 앱의 오리진을 넣어 둡니다. www의 신청서 작성 화면과 알림은 브라우저에서 서버를 직접 부르므로, 오리진이 빠져 있으면 응답을 받지 못하고 `CLIENT_NETWORK_ERROR`로 보입니다. 서버가 꺼진 것과 증상이 같으니 먼저 이 값을 의심합니다.

## 웹 띄우기

서버가 먼저 떠 있어야 화면에 데이터가 나옵니다.

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env.local   # www, lms도 같은 방식으로
pnpm dev                                           # 세 앱을 함께 띄웁니다 (turbo run dev)
```

앱 하나만 띄우려면 패키지 이름으로 거릅니다.

```bash
pnpm --filter @ssccops/www dev
```

| 앱 | 패키지 이름 | 개발 포트 | `dev` 스크립트 |
|---|---|---|---|
| admin | `@ssccops/admin` | 3000 | `next dev` (Next.js 기본 포트) |
| www | `@ssccops/www` | 3001 | `next dev -p 3001` |
| lms | `@ssccops/lms` | 3002 | `next dev -p 3002` |

`NEXT_PUBLIC_*` 값은 빌드 시점에 코드에 들어갑니다. **값을 바꾸면 개발 서버를 다시 띄웁니다.**

로그인은 Supabase의 Redirect URLs에 **각 앱의 오리진**이 등록되어 있어야 끝까지 갑니다(예: `http://localhost:3001/auth/callback`). 다른 앱의 오리진만 등록되어 있으면 로그인이 그 앱 도메인에서 끝나 실패합니다. 등록은 Supabase 프로젝트를 관리하는 운영진에게 요청합니다.

### 웹 환경 변수

앱마다 `.env.local`을 둡니다. 원본은 각 앱의 `.env.example`이고 변수마다 함정이 주석으로 적혀 있습니다: [admin](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/admin/.env.example), [www](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/.env.example), [lms](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/lms/.env.example).

| 이름 | admin | www | lms | 무엇 |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | O | O | O | 서버 주소. 비어 있으면 요청을 보내지 않고 `CLIENT_CONFIG_MISSING`으로 실패합니다 |
| `NEXT_PUBLIC_SUPABASE_URL` | O | O | O | Supabase 프로젝트. 세 앱이 같은 프로젝트여야 합니다 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | O | O | 같은 프로젝트의 anon 키 |
| `NEXT_PUBLIC_DEPLOY_ENV` | O | O | O | dev 배포 표식. 로컬에서는 비워 둡니다 |
| `NEXT_PUBLIC_PUBLIC_FORM_ORIGIN` | O | O | O | 공개 폼 링크(`/f/{formId}`)의 오리진. 공개 폼은 www가 서빙합니다 |
| `NEXT_PUBLIC_ADMIN_ORIGIN` |  | O | O | admin 오리진 |
| `NEXT_PUBLIC_LMS_ORIGIN` | O | O |  | lms 오리진 |
| `NEXT_PUBLIC_MEMBER_HARD_DELETE` | O |  |  | 회원 하드 삭제 화면 표시 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` |  | O |  | 검색 엔진 소유 확인 |

위 셋(`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)이 없으면 화면이 바로 막힙니다. 나머지는 `.env.example`의 설명을 보고 채웁니다. 값은 운영진에게 받습니다.

## 검사 명령

PR을 올리기 전에 CI와 같은 검사를 로컬에서 먼저 돌립니다. 자세한 것은 [CI가 검사하는 것](../contribute/ci.md)에서 다룹니다.

```bash
# 서버
./gradlew build          # compileJava → checkstyle → spotless → test → jacoco
./gradlew spotlessApply  # 포맷 자동 정렬

# 웹 (CI와 같은 순서)
pnpm typecheck           # 앱마다 next typegen 뒤 tsc
pnpm lint
pnpm build
```

웹에서 `pnpm lint`만 돌리면 타입 오류를 CI에서 처음 만납니다. ESLint는 타입 검사를 하지 않습니다. 앱 폴더에서 `tsc`만 따로 돌리지 말고 루트의 `pnpm typecheck`를 씁니다. `next typegen`을 먼저 돌리는 이유는 [ssccops-web AGENTS.md](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md)의 «검증» 절에 있습니다.

## 다음 읽을 것

- [요청 하나 따라가기](./request-flow.md): 띄운 서버와 www로 행사 신청 흐름을 직접 따라가 봅니다.
- [일하는 흐름: 이슈에서 머지까지](../contribute/workflow.md)
