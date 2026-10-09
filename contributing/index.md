---
title: 개발 참여
description: SSCCOps 개발에 처음 참여하는 사람을 위한 안내입니다.
slug: /
sidebar_position: 0
---

# 개발 참여

SSCCOps에 처음 참여하는 개발자를 위한 문서입니다. 코드를 열기 전에 전체 그림을 잡고, 첫 PR을 낼 때까지 막히지 않게 돕는 것이 목적입니다.

세부 규칙의 원본은 각 레포의 `AGENTS.md`와 `README.md`입니다. 이 문서들은 규칙을 다시 옮겨 적지 않고, 읽는 순서와 이유를 풀어 준 뒤 원본으로 안내합니다.

## 처음 읽는 순서

| 차례 | 읽을 것 | 언제 |
|---|---|---|
| 1 | [한눈에 보기](getting-started/overview.md), [로컬 개발 환경](getting-started/local-setup.md) | 가장 먼저 |
| 2 | [요청 하나 따라가기](getting-started/request-flow.md) | 서버와 웹이 어디서 만나는지 볼 때 |
| 3 | [이슈에서 머지까지](contribute/workflow.md), [커밋, 브랜치, PR 규칙](contribute/commit-branch-pr.md), [CI 검사](contribute/ci.md) | 첫 PR을 내기 전 |
| 4 | 서버: [서버 구조](server/structure.md), [API 약속](server/api-contract.md), [데이터베이스와 스키마 변경](server/database.md) | 서버 코드를 고칠 때 |
| 4 | 웹: [웹 구조](web/structure.md), [FSD와 슬라이스](web/fsd.md), [서버 API 부르기](web/talking-to-server.md) | 웹 코드를 고칠 때 |

«작성 필요» 표시가 있는 문서는 아직 쓰지 않은 자리입니다. 담을 내용만 정해 두었습니다.

## 공개하지 않는 것

이 사이트는 누구나 읽습니다. 서버 구성, 배포 설정, 비밀값 같은 운영 내용은 여기 쓰지 않습니다. 로컬 실행에 필요한 접속 정보는 운영진에게 받습니다. 무언가 멈췄을 때의 확인과 복구 절차는 [장애 대응](/incidents)에 있습니다.
