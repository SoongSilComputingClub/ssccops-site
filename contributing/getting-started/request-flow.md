---
title: 요청 하나 따라가기
description: 회원이 www에서 행사 참가를 신청할 때 화면에서 DB까지, 그리고 다시 화면까지 무엇이 지나가는지 실제 파일로 따라갑니다.
sidebar_position: 2
---

# 요청 하나 따라가기

서버와 웹을 따로 읽으면 둘이 어디서 만나는지 보이지 않습니다. 이 문서는 기능 하나, **회원이 www에서 행사 참가를 신청하는 흐름**을 처음부터 끝까지 따라가며 그 만나는 자리를 보여 줍니다. 각 단계마다 열어 볼 실제 파일을 링크했습니다.

## 먼저 알아 둘 것: 신청은 폼 응답입니다

행사에는 신청을 받는 전용 API가 없습니다. 운영진이 행사에 **폼을 하나 연결**해 두고, 회원이 그 폼에 응답을 내는 것이 곧 참가 신청입니다. 행사 도메인은 폼을 참조만 하고, 모집 중인지는 연결된 폼의 접수 판정(`FormReceiptPolicy`)이 정합니다.

그래서 이 문서가 따라가는 요청은 `POST /v1/forms/{formId}/responses`, 폼 응답 제출입니다. 참가자 명단에 오르는 것(확정, 대기)은 그 뒤에 운영진이 admin에서 따로 처리합니다. 이 부분은 끝의 [신청 뒤에 일어나는 일](#신청-뒤에-일어나는-일)에서 짧게 다룹니다.

## 전체 그림

```
 브라우저 (www 신청 화면 /events/{eventId}/apply)
    │
    │ ① 로그인 ──────────────▶ Supabase Auth (Google OAuth)
    │ ◀──── access token ─────┘
    │
    │ ② POST /v1/forms/{formId}/responses
    │    Authorization: Bearer <access token>
    ▼
 ssccops-server (Spring)
    │ ③ JWT 검증 → 회원 조회 → @CurrentMember
    │ ④ FormResponseService → 엔티티 → JPA
    ▼
 PostgreSQL (form_rspns_hstry 테이블)
    │
    │ ⑤ 응답 봉투 { success, code, message, data }
    ▼
 브라우저: apiFetch가 data만 꺼내거나 ApiError(code, status)로 바꿈 → 화면
```

---

## 1단계. 화면: 신청 페이지와 작성 훅

### 여기서 일어나는 일

회원이 행사 상세에서 신청 버튼을 누르면 `/events/{eventId}/apply`로 옵니다. 이 주소 하나가 **로그인 안내, 가입, 신청서 작성, 완료**를 모두 그립니다. 단계마다 화면을 나누면 리다이렉트 왕복과 이탈이 늘기 때문입니다.

1. 서버 컴포넌트 `EventApplyPage`가 행사를 익명 API(`GET /public/v1/events/{eventId}`)로 읽습니다. 모집 중이 아니거나 연결된 폼이 없으면 안내만 보여 주고 끝냅니다.
2. 세션 쿠키에 토큰이 없으면 «로그인하면 신청할 수 있습니다» 안내와 로그인 버튼을 그립니다. 로그인이 끝나면 같은 주소로 돌아옵니다.
3. 토큰이 있으면 `GET /v1/auth/session`으로 가입 여부(`signedUp`)를 묻습니다. 이 API는 미가입자에게도 200을 줍니다.
4. 클라이언트 컴포넌트 `ApplyFlow`가 미가입이면 가입 폼(`SignupStep`)을, 가입했으면 신청서(`FormStep`)를 그립니다.
5. `FormStep`은 문항 렌더링과 검증을 공용 패키지 `@ssccops/form-renderer`에 맡기고, 답과 자동 저장, 제출은 훅 `useApplyForm`이 쥡니다. 제출 버튼을 누르면 `useApplyForm`의 `submit()`이 불립니다.

### 열어 볼 파일

- 라우트: [`apps/www/src/app/events/[eventId]/apply/page.tsx`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/app/events/%5BeventId%5D/apply/page.tsx)
- 화면: [`views/event-apply/ui/event-apply-page.tsx`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/views/event-apply/ui/event-apply-page.tsx), [`apply-flow.tsx`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/views/event-apply/ui/apply-flow.tsx), [`form-step.tsx`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/views/event-apply/ui/form-step.tsx)
- 상태 훅: [`features/apply/model/use-apply-form.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/features/apply/model/use-apply-form.ts)

### 지키는 약속

- **FSD 계층을 한 방향으로만 내려갑니다.** `app`(라우트) → `views`(화면) → `features`(상태 훅) → `entities`(API 호출) → `shared`(공통 클라이언트). `app/` 아래 `page.tsx`는 `views`를 얇게 감싸기만 합니다.
- **www는 리다이렉트하지 않습니다.** 비로그인과 미가입은 이 화면 안에서 안내합니다. 401과 403에서 로그인 화면으로 밀어내는 앱은 admin 하나뿐입니다.
- **화면 주소는 문자열로 적지 않고** `shared/config/routes.ts`의 `ROUTES`(`ROUTES.eventApply(eventId)`)를 씁니다.

## 2단계. 요청: API 함수와 토큰 붙이기

### 여기서 일어나는 일

`useApplyForm`의 제출은 엔티티 슬라이스의 API 함수 `submitFormResponse(formId, rspnsCn)`를 부릅니다. 이 함수는 `apiFetchAuthedFromBrowser`로 `POST /v1/forms/{formId}/responses`를 보내고, 본문에는 답(`rspnsCn`)만 담습니다.

`apiFetchAuthedFromBrowser`는 Supabase 브라우저 클라이언트의 세션(`getSession()`)에서 access token을 꺼내 `Authorization: Bearer <토큰>` 헤더를 붙이고, 본문이 있으면 `Content-Type: application/json`도 붙입니다. 토큰이 없으면 서버에 보내지 않고 `CLIENT_UNAUTHENTICATED` 오류로 끊습니다. 그다음은 공통 `apiFetch`가 `NEXT_PUBLIC_API_BASE_URL` 앞에 경로를 붙여 요청을 보냅니다.

www는 거의 모든 화면이 서버 컴포넌트라 인증 호출도 서버에서 합니다(`authed-client.ts`, 쿠키에서 토큰을 꺼냄). **신청서 작성 화면은 예외입니다.** 답을 고칠 때마다 초안을 자동 저장하고 제출까지 해야 해서 브라우저에서 직접 부르고, 그래서 `browser-client.ts`가 따로 있습니다. 두 파일은 토큰을 어디서 꺼내는지만 다르고 봉투 처리는 같은 `apiFetch`를 지납니다.

### 열어 볼 파일

- API 함수: [`entities/form/api/public-form.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/entities/form/api/public-form.ts) (`submitFormResponse`, 폼 조회 `fetchPublicForm`, 초안 저장)
- 브라우저용 인증 호출: [`shared/api/browser-client.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/shared/api/browser-client.ts)
- 서버 컴포넌트용 인증 호출: [`shared/api/authed-client.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/shared/api/authed-client.ts)
- 공통 클라이언트: [`shared/api/client.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/shared/api/client.ts) (`apiFetch`, `ApiError`)

### 지키는 약속

- **`fetch`를 화면에서 직접 부르지 않습니다.** 서버 호출은 `entities/<slice>/api` 함수로만 하고, 응답 타입(`*Response`)과 도메인 타입으로 옮기는 매퍼도 그 파일에 손으로 씁니다. 코드 생성은 쓰지 않습니다.
- **POST는 재시도하지 않습니다.** `apiFetch`는 6초 타임아웃을 걸고 GET과 HEAD만 한 번 다시 보냅니다. POST는 서버에 닿았는지 모르는 채 다시 보내면 두 번 만들어질 수 있기 때문입니다.
- 브라우저에서 부르는 화면이 있으므로 **서버의 CORS 허용 오리진에 www 오리진이 있어야** 합니다. 없으면 `CLIENT_NETWORK_ERROR`로 보여서 서버가 꺼진 것과 증상이 같습니다.

## 3단계. 서버 입구: 인증과 컨트롤러

### 여기서 일어나는 일

요청은 Spring Security 필터를 먼저 지납니다. 서버는 Supabase가 발급한 JWT를 리소스 서버(`spring-boot-starter-oauth2-resource-server`)로 검증합니다. 서명과 만료 외에 `iss`와 `aud`도 봅니다. 검증이 끝나면 `SupabaseJwtAuthenticationConverter`가 토큰의 `sub`로 회원을 **조회만** 해서 principal(`AuthenticatedUser`)에 싣습니다. 인증 시점에 회원을 만들지 않으므로 «로그인은 했지만 아직 가입하지 않은» 상태가 존재합니다.

그다음 `PublicFormController.submitFormResponse`가 요청을 받습니다. 인자로 `@CurrentMember MemberEntity respondent`를 받는데, 이 애노테이션의 리졸버가 미가입 주체를 **403 `SIGNUP_REQUIRED`** 로 끊습니다. 그래서 컨트롤러에 들어온 회원은 언제나 non-null입니다. 본문은 `@Valid`로 검증합니다.

**이 핸들러에는 `@RequireAuthority`가 없습니다.** 일부러 뺀 것입니다. 권한은 운영자의 어휘라, 하나라도 걸면 신청자 전원이 응답을 낼 수 없게 됩니다. 등급 제한도 없어 가입 직후의 임시회원도 신청할 수 있습니다. 권한 검사가 붙는 쪽은 운영진이 신청을 보고 명단을 다루는 API입니다(아래 [신청 뒤에 일어나는 일](#신청-뒤에-일어나는-일)).

### 열어 볼 파일

- 컨트롤러: [`domain/form/controller/PublicFormController.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/controller/PublicFormController.java)
- 필터 체인과 `permitAll` 목록: [`global/security/config/SecurityConfig.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/global/security/config/SecurityConfig.java)
- JWT에서 회원 찾기: [`global/security/jwt/SupabaseJwtAuthenticationConverter.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/global/security/jwt/SupabaseJwtAuthenticationConverter.java)
- `@CurrentMember`: [`global/security/resolver/`](https://github.com/SoongSilComputingClub/ssccops-server/tree/develop/src/main/java/org/sscc/ssccopsserver/global/security/resolver)
- `@RequireAuthority`: [`global/security/authorization/`](https://github.com/SoongSilComputingClub/ssccops-server/tree/develop/src/main/java/org/sscc/ssccopsserver/global/security/authorization)

### 지키는 약속

- **주소가 인증을 가릅니다.** `/v1/**`는 로그인이 필요하고, 익명으로 열리는 것은 `/public/v1/**`(와 헬스 프로브, 비prod Swagger)뿐입니다. 폼 응답 제출은 «공개 폼»이라는 이름과 달리 `/v1` 아래에 있고 인증이 필요합니다.
- **회원이 필요한 핸들러는 principal을 캐스팅하지 않고 `@CurrentMember`로 받습니다.**
- **거절 순서가 정해져 있습니다.** 토큰이 없거나 무효면 401, 미가입이면 403 `SIGNUP_REQUIRED`, 권한이 모자라면 403 `FORBIDDEN`입니다. 권한 부족을 404로 감추지 않습니다.
- 응답자, 상태, 제출 일시는 **본문에서 받지 않습니다.** 응답자는 인증 주체에서, 나머지는 서버가 채웁니다.

## 4단계. 처리: 서비스, 엔티티, 리포지토리, 에러

### 여기서 일어나는 일

`FormResponseServiceImpl.submitResponse`가 한 트랜잭션(`@Transactional`) 안에서 다음 순서로 따집니다.

1. **폼**: 지워지지 않은 폼을 찾습니다. 없으면 `GeneralException(FormErrorCode.FORM_NOT_FOUND)`입니다.
2. **이어 쓸 응답**: 이 회원이 이 폼에 낸 응답을 조회해, 임시저장(DRAFT)이나 수정요청받은 응답이 있으면 새로 만들지 않고 그 행을 제출로 바꿉니다.
3. **접수 판정**: `FormReceiptPolicy`가 지금 응답을 받는 폼인지 판정합니다. 아니면 409 `FORM_NOT_ACCEPTING`입니다. 답을 검증하기 전에 먼저 봅니다. 받지도 않는 폼에 형식 오류를 알려 주면 고치면 될 것처럼 안내하게 되기 때문입니다.
4. **답 검증**: `ResponseAnswerValidator`가 저장된 문항 구성으로 필수, 형식, 최대 선택 수를 다시 검사합니다. 웹도 같은 검사를 하지만 요청은 직접 만들 수 있으므로 서버가 다시 봅니다.
5. **저장**: 새 응답이면 `FormResponseHistoryEntity.createSubmitted(...)`로 만들어 리포지토리로 저장하고, 이어 쓰는 응답이면 엔티티의 `submit(...)`을 부릅니다. 단일 응답 폼에 이미 심사 중이거나 승인된 응답이 있으면 엔티티가 409 `RESPONSE_ALREADY_SUBMITTED`를 던집니다.

응답 행은 `form_rspns_hstry` 테이블에 들어갑니다.

### 열어 볼 파일

- 서비스: [`domain/form/service/FormResponseServiceImpl.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/service/FormResponseServiceImpl.java)
- 접수 판정: [`domain/form/service/FormReceiptPolicy.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/service/FormReceiptPolicy.java)
- 엔티티: [`domain/form/entity/FormResponseHistoryEntity.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/entity/FormResponseHistoryEntity.java)
- 리포지토리: [`domain/form/repository/FormResponseHistoryRepository.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/repository/FormResponseHistoryRepository.java)
- 에러 코드: [`domain/form/code/error/FormErrorCode.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/code/error/FormErrorCode.java)
- 도메인 규칙: [`domain/form/AGENTS.md`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/form/AGENTS.md), [`domain/event/AGENTS.md`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/event/AGENTS.md)

### 지키는 약속

- **실패는 `GeneralException`으로 던집니다.** 이 예외는 `ErrorCode`(HTTP 상태, 코드 문자열, 메시지)를 감쌉니다. 도메인 전용 에러는 도메인 패키지의 `code/error` enum(여기서는 `FormErrorCode`)에 두고, 전역 에러는 `CommonErrorCode`에 둡니다.
- **컨트롤러에 try/catch를 두지 않습니다.** 예외를 응답으로 바꾸는 일은 `GlobalExceptionHandler` 한 곳이 합니다.
- **상태 전이와 그 검증은 엔티티가 합니다.** «지금 낼 수 있는 상태인가»를 서비스가 따지지 않고 엔티티의 `submit()`이 판정합니다. 상태 어휘가 늘 때 규칙이 두 벌이 되지 않게 하기 위해서입니다.
- **엔티티는 정적 팩터리로 만듭니다**(`createSubmitted`). 리포지토리는 엔티티마다 하나입니다.

## 5단계. 응답: 봉투에서 화면까지

### 여기서 일어나는 일

성공하면 컨트롤러가 `ApiResponse.created(response)`로 봉투를 만들어 201과 `Location` 헤더로 돌려줍니다. 본문은 이런 모양입니다.

```json
{ "success": true, "code": "COMMON201", "message": "리소스가 성공적으로 생성되었습니다.", "data": { "...": "..." } }
```

실패하면 `GlobalExceptionHandler`가 `GeneralException`의 `ErrorCode`를 꺼내 같은 봉투를 `success: false`로 돌려줍니다. 예를 들어 접수가 끝난 폼이면 409와 `"code": "FORM_NOT_ACCEPTING"`입니다.

웹의 `apiFetch`는 봉투를 벗깁니다. 성공이면 `data`만 돌려주고, 실패면 봉투의 `code`와 HTTP 상태로 `ApiError(code, message, status)`를 던집니다. 서버에 닿지 못했으면 `CLIENT_NETWORK_ERROR` 같은 클라이언트 코드를 씁니다.

`useApplyForm`은 `ApiError.code`로 갈립니다.

| 서버 코드 | 화면이 하는 일 |
|---|---|
| (성공) | 완료 화면(`ApplyDone`) «신청이 접수되었습니다»로 넘어가 내 활동과 행사 안내로 잇습니다 |
| `RESPONSE_ALREADY_SUBMITTED` | 이미 접수된 상태이므로 오류가 아니라 완료로 다룹니다 |
| `FORM_NOT_ACCEPTING` | 작성 화면을 닫고 «지금은 받지 않는다» 안내로 바꿉니다 |
| `REQUIRED_ANSWER_MISSING` 등 검증 코드 | 웹 검증을 다시 돌려 문항 옆에 표시하고 한 줄 안내를 띄웁니다 |
| 그 밖 | `submitErrorMessage`가 코드별 문구를 고릅니다 |

### 열어 볼 파일

- 서버 봉투: [`global/apipayload/ApiResponse.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/global/apipayload/ApiResponse.java)
- 서버 예외 변환: [`global/apipayload/handler/GlobalExceptionHandler.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/global/apipayload/handler/GlobalExceptionHandler.java), [`exception/GeneralException.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/global/apipayload/exception/GeneralException.java)
- 웹 봉투 벗기기: [`shared/api/client.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/shared/api/client.ts)
- 코드 → 문구: [`features/apply/model/apply-error.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/features/apply/model/apply-error.ts)
- 응답 → 도메인 타입 매퍼의 예: `public-form.ts`의 `fetchPublicForm`, [`entities/event/api/public-events.ts`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/src/entities/event/api/public-events.ts)의 `toDetail`

### 지키는 약속

- **모든 응답은 `{ success, code, message, data }` 봉투입니다**(목록이면 `page`가 더 붙습니다). `ApiResponse`는 생성자가 private이라 정적 팩터리(`success`, `successWithNoData`, `created`, `fail`)로만 만듭니다. 예외는 규정 도우미의 SSE 스트리밍 하나입니다.
- **웹은 `message`가 아니라 `code`로 분기합니다.** 문구는 서버에서 바뀌어도 코드는 계약입니다.
- **매퍼는 없는 값을 만들어 내지 않습니다.** 빈 이름을 `"-"`로 채우는 것 같은 표시 규칙은 그리는 쪽이 정합니다.
- 응답 필드를 지우거나 타입을 바꾸면 서버 CI의 OpenAPI 호환 검사(`api-compat`)가 PR을 막습니다.

---

## 신청 뒤에 일어나는 일

회원의 신청은 위에서 끝나고, 그다음은 운영진이 admin에서 진행합니다. 여기서부터는 `@RequireAuthority`가 붙은 API입니다.

1. **신청 목록 보기**: `GET /v1/events/{eventId}/applications`. 폼 응답 요약에 명단 등록 여부를 얹어 돌려줍니다. 컨트롤러 클래스에 `@RequireAuthority(AuthorityCode.EVENT_MANAGE)`가 걸려 있습니다.
2. **심사**: 수락과 거절은 폼 응답 검토 API `POST /v1/forms/{formId}/responses/{formRspnsId}/reviews`를 그대로 씁니다. 이쪽은 `RESPONSE_REVIEW` 권한입니다.
3. **명단 등록**: 수락된(ACCEPTED) 응답을 `POST /v1/events/{eventId}/participants`로 확정(CONFIRMED)이나 대기(WAITLISTED)로 올립니다. 이후 전이는 `PATCH /v1/events/{eventId}/participants/{eventPtcpId}`입니다.
4. **알림**: 참가 상태가 실제로 바뀌면 상태 이력이 한 줄 남고 `EventParticipantStatusChangedEvent`가 발행되어, 알림 도메인이 커밋 뒤에 받아 알림을 만듭니다. 회원은 www의 내 활동(`/me`)에서 결과를 봅니다.

열어 볼 파일은 [`domain/event/controller/EventParticipationController.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/event/controller/EventParticipationController.java)와 [`domain/event/service/EventParticipationServiceImpl.java`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/java/org/sscc/ssccopsserver/domain/event/service/EventParticipationServiceImpl.java)입니다. 권한 판정 규칙의 유일한 구현은 `domain/member/service/AuthorityPolicy`입니다.

## 여기서 더 읽기

- [서버 구조](../server/structure.md): 도메인 패키지와 계층, 도메인끼리 부르는 법
- [API 약속: 응답, 에러, 인증](../server/api-contract.md): 봉투, 에러 코드, 거절 순서, `@RequireAuthority`
- [FSD와 슬라이스](../web/fsd.md): `app`, `views`, `features`, `entities`, `shared`의 경계
- [서버와 이야기하는 법](../web/talking-to-server.md): `apiFetch`, `ApiError`, 매퍼, 새 도메인을 붙이는 순서
- 원본 규칙: [ssccops-server AGENTS.md](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/AGENTS.md)의 «전역» 절, [ssccops-web AGENTS.md](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md)의 «서버 연동 규약» 절, [apps/www/AGENTS.md](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/apps/www/AGENTS.md)
