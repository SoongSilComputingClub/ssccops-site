---
title: 개발 참여
description: SSCCOps 개발에 처음 참여하는 사람을 위한 안내입니다.
slug: /
sidebar_position: 1
---

# 개발 참여

SSCCOps는 레포 셋으로 나뉘어 있고, 코드는 모두 공개입니다.

| 레포 | 무엇 | 기술 |
|---|---|---|
| [ssccops-server](https://github.com/SoongSilComputingClub/ssccops-server) | API 서버. 업무, 회원과 권한, 폼, 학술 프로그램, 행사, 콘텐츠, 알림을 맡습니다 | Spring Boot 3.5, Java 17, PostgreSQL |
| [ssccops-web](https://github.com/SoongSilComputingClub/ssccops-web) | 웹 앱 셋. 운영진용 어드민(admin), 공개 사이트(www), 학술 앱(lms) | Next.js 16, React 19, pnpm 모노레포 |
| [ssccops-site](https://github.com/SoongSilComputingClub/ssccops-site) | 이 사이트. 사용 설명서와 블로그 | Docusaurus |

## 처음 읽는 순서

1. **서버를 띄웁니다.** [ssccops-server README](https://github.com/SoongSilComputingClub/ssccops-server#readme)의 «빠른 시작»을 따릅니다.
2. **웹을 띄웁니다.** [ssccops-web README](https://github.com/SoongSilComputingClub/ssccops-web#readme)의 «빠른 시작»을 따릅니다. 웹은 서버가 떠 있어야 화면에 데이터가 나옵니다.
3. **고치려는 레포의 `AGENTS.md`를 읽습니다.** 개발 규칙의 원본이고, 서버는 도메인마다, 웹은 앱과 패키지마다 따로 있습니다.

로컬 실행에 필요한 접속 정보(Supabase 프로젝트 값 같은 것)는 운영진에게 받습니다. 이 사이트와 레포에는 적지 않습니다.

## 작업 흐름

세 레포가 같은 흐름을 씁니다.

1. **이슈를 엽니다.** 제목 앞의 `[FEAT]`, `[FIX]`, `[REFACTOR]`, `[CHORE]`에 따라 봇이 `feat/#번호` 같은 브랜치를 만들어 줍니다.
2. **그 브랜치에서 작업하고 PR을 엽니다.** PR 제목은 `[#번호] 무엇을 했는지`로 씁니다.
3. **`develop`에 squash merge합니다.** `main`은 릴리즈에만 씁니다.

커밋 형식과 PR 검사 같은 세부 규칙은 각 레포의 `AGENTS.md`에 있습니다.
