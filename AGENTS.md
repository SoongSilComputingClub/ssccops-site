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
guide/                사용 설명서 (/guide). index.md가 첫 페이지
sidebars.ts           사용 설명서 목차 (폴더와 sidebar_position으로 자동)
contributing/         개발 참여 (/contributing). 두 번째 문서 묶음
sidebarsContributing.ts  개발 참여 목차
blog/                 글 (파일 하나가 글 하나), authors.yml
releases/             릴리즈 노트 (/releases). 두 번째 블로그, _template.md가 틀
src/pages/index.tsx   랜딩
src/theme/BlogPostItem/  블로그 글 아래 giscus 댓글
src/css/custom.css    전역 스타일 (사이트 색, Pretendard 글꼴, 한국어 어절 단위 줄바꿈)
plugins/og-image/     링크 공유 카드(OG 이미지)를 빌드 때 굽는다. fonts/에 Pretendard OTF 두 벌과 OFL
i18n/ko/code.json     화면 문구 번역 (검색 플러그인에 한국어가 없어 여기서 채운다)
static/               파비콘, 아이콘
docusaurus.config.ts  사이트 설정
```

**사용 설명서는 `/guide`에 새로 쓰는 중이다**(ssccops ADR-0061). 운영진이 지금 쓰는 설명서는 메타 레포
`docs/user-guide/`의 HTML 한 장이고 `guide.sscc-ssu.com`으로 나간다. 그 HTML은 옮기지 않고 재료로만 쓴다.
새 설명서는 역할별 할 일 기준으로 한 페이지에 할 일 하나를 쓰고, 버전 딱지(`v0.2.x`에서 생김)는 본문에 두지 않는다.
**옛 주소는 `guide/index.md` 한 곳에서만 안내한다.** 메뉴, 랜딩, 푸터는 `/guide`를 가리킨다. 새 설명서가 옛 내용을
다 덮으면 `guide.sscc-ssu.com`을 `/guide`로 리다이렉트하고, 메타 쪽 HTML과 `guide/index.md`의 안내를 지운다.

**개발 참여(`/contributing`)는 처음 온 개발자가 읽는 순서로 풀어 쓴 안내다**(ssccops ADR-0061). 로컬 실행 방법과 개발 규칙의
원본은 server와 web의 README와 `AGENTS.md`이니 옮겨 적지 않고 링크한다. 서버 구성, 내부 주소, 배포, 장애 대응 같은 운영 내용은
공개하지 않고 «운영진에게 받는다»라고만 쓴다.

**흐름과 구조 그림은 Mermaid로 그린다**(```mermaid 코드 블록, `@docusaurus/theme-mermaid`). 폴더 구조는 그림이 아니라 코드 블록으로 둔다.
블로그 글에는 쓰지 않는다. 동아리 블로그(AstroPaper)로 옮길 때 그대로 그려지지 않는다.

**사이트 색은 임시다.** SSCCOps 제품(ssccops-web)이 쓰는 파랑을 따르는데, 제품의 디자인 토큰이 아직 확정되지 않았다.
동아리 디자인 시스템이 정해지면 `src/css/custom.css` 맨 위의 색 블록(라이트, 다크 둘)만 바꾼다. 링크 글자는 흰 바탕 대비
4.5:1을 넘는 값을 고른다.

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

링크를 공유할 때 보이는 카드(OG 이미지)는 제목, 날짜, 작성자로 빌드 때 저절로 만들어진다(`img/og/<글 주소>.png`,
`plugins/og-image/`). 직접 만든 그림을 쓰려면 frontmatter에 `image`를 적는다.

## 릴리즈 노트

`/releases`는 운영진과 회원이 읽는 버전별 안내다(ssccops ADR-0061). 기술 블로그와 목록, RSS가 따로 있고 댓글은 없다.

- **릴리즈마다 글 하나.** `releases/_template.md`를 복사해 `v0-2-18.md`처럼 버전의 점을 하이픈으로 바꾼 이름으로 쓴다
- **`date`는 릴리즈한 날이다.** 태그를 찍기 전에는 `draft: true`로 두고, 태그를 찍은 뒤 지운다. develop 머지가 곧 발행이다
- **기술 용어 없이 «달라진 것»과 «해 주실 일»만 쓴다.** 자세한 사용법은 사용 설명서 페이지로 링크한다
- 카카오톡 공지는 요약 몇 줄과 이 글의 링크로 줄인다. 같은 내용을 두 벌 쓰지 않는다
- 작성자는 적지 않아도 된다. 적으면 `blog/authors.yml`에 있는 GitHub ID만 받는다

## 댓글

블로그 글 상세에만 giscus 댓글이 붙는다. 설명서와 글 목록에는 없다. 댓글은 이 레포의 Discussions `Blog Comments`
카테고리에 글 경로(pathname)로 쌓인다. 그래서 게시한 글의 파일 이름을 바꾸면 댓글이 떨어진다.
`docusaurus.config.ts`의 `customFields.giscus`에 있는 `repoId`와 `categoryId`는 비밀값이 아니고 페이지에 그대로 실린다.
값이 비면 댓글 영역을 그리지 않는다. giscus 앱은 조직에 «선택한 레포만»으로 설치되어 있어, 레포를 새로 만들면
앱 권한에 다시 넣어야 한다.

## 배포

Cloudflare Pages가 `develop`을 빌드해 `https://ssccops.sscc-ssu.com`에 발행하고, PR마다 미리보기 주소를 붙인다.
이 레포에 `main`은 없다. 빌드 설정은 명령 `pnpm build`, 출력 `build`, Node는 `.nvmrc`를 따른다.
develop 커밋에 붙는 «Cloudflare Pages» 상태가 발행 결과다.

## 커밋, 브랜치, PR 컨벤션

server, web과 같다. 워크플로(`issue-branch-creator`, `issue-labeler`, `pr-labeler`, `pr-guard`)를 web에서 그대로
옮겨 왔으니, 규칙을 바꿀 때는 세 레포를 함께 고친다. 다른 점은 아래 «글 작업» 하나다.

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
- **사이트 기능과 구조 작업**(문서 묶음 열기, 댓글, 검색, 설정)은 상위 이슈(Story, Task)를 메타 레포에 두고 Parent로 잇는다
- **글 작업(`[DOCS]`)은 이 레포 안에서 끝난다**(ssccops ADR-0061). 메타 레포의 부모 이슈를 잇지 않고, PR 본문의
  «근거»도 비워 둔다. `pr-guard`가 이슈 제목이 `[DOCS]`로 시작하면 근거를 보지 않는다
- **리뷰는 `.github/CODEOWNERS`의 두 사람(@swthewhite, @bell-person-ii)에게 자동으로 요청된다.** 머지 조건으로 강제하지는 않는다
- **PR 제목은 `[#이슈번호] 총 작업 내용`이고 develop에 squash merge한다.** 이 제목이 그대로 커밋 제목이 된다.
  글 작업이 아니면 본문에 근거(`SoongSilComputingClub/ssccops#N` 또는 `ADR-NNNN`)가 있어야 하고, 없으면 `pr-guard`가 막는다
- **커밋은 `type(scope): 설명`으로 쓴다.** 타입은 `feat`, `fix`, `refactor`, `design`, `style`, `docs`, `test`, `chore`,
  `init`, `rename`, `remove`, `cicd`이다. 글이면 `docs(blog): …`처럼 쓴다
- **설명은 평범한 문장 한 줄로 쓴다.** 긴 대시(—)로 부제를 달거나 가운뎃점(·)으로 명사를 늘어놓지 않고, 쉼표와 조사로 잇는다.
  예: `chore(config): 사이트 이름, 주소, 언어와 블로그 규칙을 설정한다`

## 하지 말 것

- 계획을 여기서 하지 않는다. Epic, Story, ADR, 런북은 메타 레포에 있고 여기는 발행물만 둔다
- 공개 경계 목록에 있는 것을 커밋하지 않는다. 이력은 지워지지 않는다
- 게시한 글의 파일 이름을 리다이렉트 없이 바꾸지 않는다
