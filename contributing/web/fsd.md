---
title: FSD와 슬라이스
description: 세 앱이 공통으로 쓰는 Feature-Sliced Design 계층과 의존 방향, 슬라이스를 나누는 기준을 실제 경로로 설명합니다.
sidebar_position: 2
---

# FSD와 슬라이스

이 문서는 ssccops-web의 각 앱이 `src` 안을 어떻게 나누는지 다룹니다. 세 앱 모두 Feature-Sliced Design(FSD)을 따르고, 규칙의 원본은 레포 [`AGENTS.md`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md)의 «아키텍처» 절입니다.

## 계층 다섯 개와 한 방향 의존

admin, www, lms의 `src` 아래에는 같은 이름의 폴더 다섯 개가 있습니다.

```
src/
├── app/         # 라우팅 전용 (Next.js App Router)
├── views/       # 화면 하나를 조립 (FSD의 pages)
├── features/    # 사용자 동작과 상태 (훅, 오류 문구, 동작 UI)
├── entities/    # 도메인 하나의 서버 호출과 타입
├── shared/      # 도메인을 모르는 공용 코드 (API 클라이언트, 설정, UI 조각)
└── middleware.ts
```

의존은 위에서 아래로만 흐릅니다.

```
app → views → features → entities → shared
```

위 계층은 아래 계층을 가져다 쓸 수 있지만, 아래 계층이 위 계층을 가져오지는 않습니다. `entities`가 `features`를 import하거나 `shared`가 `entities`를 import하면 방향이 틀린 것입니다.

FSD의 `widgets` 계층은 쓰지 않습니다. 화면 조각은 `features`나 `views` 안에 둡니다.

### 계층별로 두는 것

| 계층 | 두는 것 | admin의 예 |
|---|---|---|
| `app` | 라우트와 레이아웃. 각 `page.tsx`는 `views`를 얇게 감쌉니다 | `app/(admin)/academic-programs/page.tsx` |
| `views` | 화면 하나. 여러 feature와 entity를 조립합니다 | `views/academic-program-list/ui/academic-program-list-page.tsx` |
| `features` | 로딩, 오류, 재조회 상태를 쥐는 훅과 오류 문구 매핑, 동작 UI | `features/academic-program/model/use-academic-program-list.ts` |
| `entities` | 서버 호출, 응답 타입, 도메인 타입 | `entities/academic-program/api/academic-programs.ts` |
| `shared` | API 클라이언트, 라우트 목록, 코드 표, 공용 UI | `shared/lib/api/client.ts`, `shared/config/routes.ts` |

`app`의 `page.tsx`는 정말 얇습니다. 위 표의 학술 프로그램 목록 라우트는 `views`에서 화면 컴포넌트를 가져와 그대로 돌려줄 뿐입니다.

```tsx
import { AcademicProgramListPage } from "@/views/academic-program-list";

export default function Page() {
  return <AcademicProgramListPage />;
}
```

세 앱 모두 `app/version/`(배포 확인용 `GET /version`)과 `app/auth/`(OAuth 콜백)를 가집니다. 라우트 그룹과 공개 경로는 앱마다 다르니 각 앱의 `AGENTS.md`를 봅니다. 화면 경로는 문자열로 적지 않고 `shared/config/routes.ts`의 `ROUTES`를 씁니다.

### 왜 `pages`가 아니라 `views`인가

FSD 원래 이름으로는 이 계층이 `pages`입니다. 그런데 Next.js에서 `pages`는 Pages Router가 쓰는 예약된 폴더 이름이라 충돌합니다. 그래서 이 레포는 같은 역할의 계층을 `views`라고 부릅니다.

## 슬라이스

슬라이스는 **한 계층 안에서 도메인별로 나눈 폴더**입니다. `entities/academic-program`, `entities/curriculum-item`, `features/work`가 각각 슬라이스 하나입니다. admin에는 `entities` 슬라이스가 28개 있습니다.

슬라이스 안의 모양은 계층마다 정해져 있습니다.

```
entities/<slice>/{api, model}
features/<slice>/{model, ui}
views/<slice>/ui
```

각 슬라이스는 `index.ts`로 바깥에 내보낼 것만 내보냅니다. 다른 계층에서는 `@/entities/curriculum-item`처럼 슬라이스 이름까지만 적어 가져옵니다.

`entities/academic-program`을 열어 보면 이렇게 생겼습니다.

```
entities/academic-program/
├── api/
│   ├── academic-programs.ts
│   ├── academic-program-types.ts
│   ├── members.ts
│   └── recruitment.ts
├── model/
│   ├── display.ts
│   └── types.ts
└── index.ts
```

### 같은 계층의 슬라이스끼리는 참조하지 않습니다

`entities/event`가 `entities/response`를 가져오거나, `features/a`가 `features/b`를 가져오면 안 됩니다. 의존은 언제나 아래 계층으로만 갑니다.

그래서 비슷한 타입이 두 슬라이스에 한 벌씩 있는 것이 정상인 경우가 있습니다. admin의 `entities/notification`(내 알림)과 `entities/notification-type`(알림 수신 정책)은 같은 앱 어휘를 각자 들고 있고, `entities/event`의 참가자 명단 변환기도 `entities/response`의 비슷한 타입을 가져오지 않습니다.

여러 엔티티를 함께 바꾸거나 엮는 로직은 **`features`에 둡니다.** features는 entities보다 위에 있어 여러 엔티티를 함께 가져올 수 있습니다.

:::note

이 규칙은 린트가 막아 주지 않습니다. 앱의 ESLint 설정은 `eslint-config-next`를 그대로 쓰고, 계층이나 슬라이스 경계를 검사하는 규칙은 없습니다. 리뷰에서 사람이 봅니다.

:::

### 엔티티 슬라이스를 나누는 기준

엔티티 슬라이스는 대체로 **서버 테이블 하나**를 단위로 둡니다. 예를 들어 `entities/curriculum-item`은 커리큘럼 항목 테이블(`crclm_artcl`)을 맡습니다. 타입 이름도 테이블 ID를 따릅니다(데이터 표기 규칙은 [서버와 이야기하는 법](./talking-to-server.md#데이터-표기)에 있습니다).

다만 모든 슬라이스가 테이블과 1:1은 아닙니다. admin의 `entities/dashboard`는 대시보드 화면이 받는 묶음 응답을, `entities/session`은 로그인한 사람의 세션과 권한을 맡습니다. 새 슬라이스를 만들 때는 «서버 응답의 모양을 아는 곳이 한 군데인가»를 기준으로 봅니다.

## 실제로 고친 사례: 커리큘럼 조회를 자기 슬라이스로

[ssccops-web#702](https://github.com/SoongSilComputingClub/ssccops-web/pull/702)(이슈 #701)는 같은 계층 참조를 바로잡은 PR입니다.

**문제.** admin에서 커리큘럼 항목의 도메인 타입은 `entities/curriculum-item/model`에 있었는데, 그것을 조회하는 함수와 응답 타입, 변환 함수는 `entities/academic-program/api`에 있었습니다. 그래서 `academic-program`이 `curriculum-item`의 타입을 가져다 쓰고 있었습니다. 같은 계층 슬라이스끼리 참조한 것입니다.

**고칠 수 있는 길은 두 가지였습니다.**

1. 타입을 `academic-program` 쪽으로 옮겨 방향을 뒤집는다.
2. 조회 함수를 타입이 있는 `curriculum-item` 쪽으로 데려온다.

**2번을 골랐습니다.** 그러면 `curriculum-item`도 다른 모든 슬라이스와 같은 `entities/<slice>/{api,model}` 모양이 되고, 슬라이스 사이 참조가 사라집니다. 요청 URL이 `/v1/academic-programs/{id}/curriculum-items`로 학술 프로그램 아래에 있는 것은 서버가 하위 자원으로 둔 것이라 그대로 두었습니다. URL 모양이 슬라이스 소유를 정하지는 않습니다.

결과로 생긴 파일이 [`apps/admin/src/entities/curriculum-item/api/curriculum-items.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/admin/src/entities/curriculum-item/api/curriculum-items.ts)입니다. 응답 타입, `toCurriculumItem` 변환 함수, `fetchCurriculumItems` 조회 함수가 한 파일에 있고, 머리 주석에 위 판단이 적혀 있습니다.

## 다음에 읽을 것

- [웹 구조: 모노레포와 앱 셋](./structure.md): 앱 사이에서 코드를 나누는 «둘 이상» 규칙
- [서버와 이야기하는 법](./talking-to-server.md): `entities/<slice>/api`에 무엇을 쓰는지
