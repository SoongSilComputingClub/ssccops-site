# ssccops-site

**SSCCOps의 공개 사이트**입니다. 랜딩, 사용 설명서, 블로그를 싣습니다.

https://ssccops.sscc-ssu.com

SSCCOps는 숭실컴퓨팅클럽(SSCC)이 회원, 학술, 업무, 행사, 폼을 한 곳에서 다루려고 만든 시스템입니다.
이곳에는 그 사용 설명서와, 시스템을 만들고 운영하며 정한 것과 겪은 것을 적습니다.

## 로컬에서 보기

```bash
pnpm install
pnpm start      # http://localhost:3000
pnpm build      # 깨진 링크나 등록되지 않은 작성자가 있으면 여기서 실패합니다
```

Node 22, pnpm(버전은 `package.json`의 `packageManager`)을 씁니다.

## 글 쓰기

글은 `blog/`에 파일 하나로 씁니다. 파일 이름, frontmatter, 공개하면 안 되는 것 같은 규칙은
[`AGENTS.md`](AGENTS.md)에 있습니다. 작성자는 `blog/authors.yml`에 GitHub ID로 등록합니다.

## 만든 것

[Docusaurus](https://docusaurus.io/)로 만들고 Cloudflare Pages로 발행합니다.
