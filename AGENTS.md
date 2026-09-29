# AGENTS.md

SSCCOps의 공개 사이트다. 랜딩, 사용 설명서, 블로그를 `https://ssccops.sscc-ssu.com`에 싣는다.
이렇게 정한 이유는 메타 레포의 [ADR-0054](https://github.com/SoongSilComputingClub/ssccops/blob/develop/docs/decisions/0054-ssccops-site-separate-public-repo-docusaurus.md)에 있다.
메타 레포는 비공개라 이 링크는 조직 구성원만 열 수 있다.

| 레포 | 무엇 |
|---|---|
| `ssccops` (비공개) | 원본. 이슈, ADR, 런북, 기획이 있고 계획은 언제나 거기서 한다 |
| `ssccops-server`, `ssccops-web` | 제품 코드 |
| **`ssccops-site`** (공개, 여기) | 발행물. 원본을 풀어 쓴 글과 설명서 |

## 이름

제품의 정식 이름은 **SSCCOps**다. 화면과 글에는 SSCCOps로 쓰고, 레포 이름, 도메인, 패키지 이름 같은 식별자만
소문자 `ssccops`로 쓴다. 저작권 줄은 `© {연도} SSCC 숭실컴퓨팅클럽`이다.

## 공개 경계

이 레포는 누구나 읽고, git 이력은 지워지지 않는다. 사이트에 실리는 글, 페이지, 이미지에 다음을 넣지 않는다.

- 내부 IP, 열린 포트, 서버 구성, 관리 대시보드 주소
- 메타 레포(`ssccops`) 이슈나 문서 링크. 독자는 열 수 없으니 필요한 내용은 요지를 풀어 쓴다
- 회원 정보(실명, 학번, 연락처)와 비밀값(토큰, 키, 비밀번호). 스크린샷도 같다

PR 템플릿과 📝 Docs 이슈 템플릿의 «공개 경계» 체크박스가 같은 목록이다.

## 구조

```
blog/                 글 (파일 하나가 글 하나), authors.yml
src/pages/index.tsx   랜딩
src/css/custom.css    전역 스타일 (한국어 어절 단위 줄바꿈)
static/               파비콘, 아이콘
docusaurus.config.ts  사이트 설정
```

**사용 설명서는 아직 이 레포에 없다.** 원본은 메타 레포 `docs/user-guide/`의 HTML 한 장이고 `guide.sscc-ssu.com`으로
나간다. 이 사이트는 그 주소로 링크만 건다(`docusaurus.config.ts`의 `GUIDE_URL`). HTML을 통째로 복사하지 않는다.
그 파일은 그대로 쓸 것이 아니라 한 절씩 해체해 문서 페이지로 옮길 재료이고, 사본을 두면 원본과 두 벌이 된다.
옮기기 시작할 때 docs 플러그인을 켜고 `routeBasePath: 'guide'`로 둔다. 다 옮기면 `guide.sscc-ssu.com`을 `/guide/`로
리다이렉트하고 메타 쪽을 지운다(ADR-0054 추신). 지금 초점은 블로그다.

## 명령

```bash
pnpm install
pnpm start       # 로컬 미리보기 (http://localhost:3000)
pnpm typecheck
pnpm build       # CI와 같은 검사. 깨진 링크와 등록되지 않은 작성자는 여기서 실패한다
```

Node 버전은 `.nvmrc`(22), pnpm 버전은 `package.json`의 `packageManager`가 정한다.

## 글 작성 규칙

나중에 동아리 블로그(AstroPaper 잠정)로 옮기거나 같이 실을 때 스크립트 하나로 끝나게 쓴다(ADR-0054).

1. **본문은 순수 GFM으로 쓴다.** `.md`는 CommonMark로 읽도록 설정해 두어(`markdown.format: 'detect'`) 본문의 `{`나
   `<`가 빌드를 깨지 않는다. `.mdx`와 컴포넌트는 꼭 필요할 때만 쓴다. 안내 상자는 `:::note` 한 가지만 쓴다
2. **frontmatter는 다섯 칸이다.** `description`을 비우지 않는다

   ```yaml
   ---
   title: 행사 신청을 받고 심사하기까지
   description: 목록과 링크 카드에 나오는 한두 문장 요약
   date: 2026-09-27
   authors: [swthewhite]
   tags: [event, guide]
   ---
   ```

3. **파일 이름이 곧 주소다.** 영문 소문자와 하이픈으로 쓴다(`event-application.md`는 `/blog/event-application`).
   날짜는 파일 이름이 아니라 `date`에 쓰고, 분류는 폴더가 아니라 태그로 한다. `_`로 시작하는 파일과 폴더는 빌드에서 빠진다
4. **게시한 뒤에는 파일 이름을 바꾸지 않는다.** 퍼진 링크가 깨지고 댓글이 떨어진다.
   꼭 바꿔야 하면 `static/_redirects`에 `/blog/옛이름 /blog/새이름 301`을 적는다
5. **작성자는 GitHub ID로 적는다.** `blog/authors.yml`에 키와 이름 모두 GitHub ID로 등록하고 실명은 적지 않는다.
   등록되지 않은 작성자를 글에 쓰면 빌드가 멈춘다
6. 요약 뒤에 `<!-- truncate -->`를 둔다. 목록에는 그 위까지만 나온다
7. **아직 공개하면 안 되는 글은 `draft: true`로 둔다.** develop 머지가 곧 발행이고, 초안은 프로덕션 빌드에서 빠진다

## 배포

Cloudflare Pages가 `develop`을 빌드해 `https://ssccops.sscc-ssu.com`에 발행하고, PR마다 미리보기 주소를 붙인다.
이 레포에 `main`은 없다. 빌드 설정은 명령 `pnpm build`, 출력 `build`, Node는 `.nvmrc`를 따른다.
develop 커밋에 붙는 «Cloudflare Pages» 상태가 발행 결과다.

## 커밋, 브랜치, PR 컨벤션

server, web과 같다. 워크플로(`issue-branch-creator`, `issue-labeler`, `pr-labeler`, `pr-guard`)를 web에서 그대로
옮겨 왔으니, 규칙을 바꿀 때는 세 레포를 함께 고친다.

- **이슈는 Sub-task 템플릿 다섯 가지로 연다.**

  | 템플릿 | 쓰는 경우 | 라벨, 브랜치 |
  |---|---|---|
  | `[FEAT]` | 새 페이지, 새 기능 | `feat`, `feat/#N` |
  | `[FIX]` | 깨진 링크, 잘못된 화면이나 동작 | `fix`, `fix/#N` |
  | `[REFACTOR]` | 주소와 화면은 그대로 두고 구조만 바꾸기 | `refactor`, `refactor/#N` |
  | `[CHORE]` | 설정, 빌드, 의존성, CI, 작업 규칙 | `chore`, `chore/#N` |
  | `[DOCS]` | 블로그 글과 설명서 쓰기, 고치기 | `chore`, `chore/#N` |

  이슈 유형은 세 레포 모두 feat, fix, refactor, chore 넷뿐이라 글 작업도 `chore`로 묶인다. 이 레포만 `docs` 유형이나
  라벨을 따로 두지 않는다. 글 작업만 보고 싶으면 제목으로 거른다(`is:issue "[DOCS]" in:title`).
  상위 이슈(Story, Task)는 메타 레포에 두고 Parent로 잇는다
- **PR 제목은 `[#이슈번호] 총 작업 내용`이고 develop에 squash merge한다.** 이 제목이 그대로 커밋 제목이 된다.
  본문에 근거(`SoongSilComputingClub/ssccops#N` 또는 `ADR-NNNN`)가 없으면 `pr-guard`가 막는다
- **커밋은 `type(scope): 설명`으로 쓴다.** 타입은 `feat`, `fix`, `refactor`, `design`, `style`, `docs`, `test`, `chore`,
  `init`, `rename`, `remove`, `cicd`이다. 글이면 `docs(blog): …`처럼 쓴다
- **설명은 평범한 문장 한 줄로 쓴다.** 긴 대시(—)로 부제를 달거나 가운뎃점(·)으로 명사를 늘어놓지 않고, 쉼표와 조사로 잇는다.
  예: `chore(config): 사이트 이름, 주소, 언어와 블로그 규칙을 설정한다`

## 하지 말 것

- 계획을 여기서 하지 않는다. Epic, Story, ADR, 런북은 메타 레포에 있고 여기는 발행물만 둔다
- 공개 경계 목록에 있는 것을 커밋하지 않는다. 이력은 지워지지 않는다
- 게시한 글의 파일 이름을 리다이렉트 없이 바꾸지 않는다
