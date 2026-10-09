---
title: 서버 로그에서 오류 찾기
description: 회원이 겪은 오류를 Kibana의 서버 로그에서 찾는 방법입니다. Kibana에 로그가 없을 때 확인할 곳도 함께 둡니다.
sidebar_position: 7
---

# 서버 로그에서 오류 찾기

:::note[비공개 자료]
- Kibana 주소와 계정: 드라이브 «계정 대장» › Kibana
- 로그 수집 경로: 드라이브 «시스템 구성과 주소» › 로그
:::

## 언제 쓰나

한 화면에서 같은 동작이 계속 실패하거나, 원인을 모르는 오류가 날 때 씁니다. 회원에게 다음 내용을 받아 둡니다.

- 오류를 겪은 시각(분 단위)
- 앱과 화면 주소
- 누른 버튼과 화면에 나온 문구

## Kibana에서 찾기

1. Kibana에 로그인합니다. 운영자는 `ssccops-operator` 계정으로 prod 일반 로그를 봅니다.
2. Discover를 열고 Data View를 «ssccops · application logs»로 고릅니다.
3. 시간 범위를 회원이 오류를 겪은 시각 앞뒤 5분으로 좁힙니다.
4. 검색 칸에 다음을 넣습니다.

   ```text
   service.environment : "prod" and log.level : "ERROR"
   ```

5. 로그 항목을 펼쳐 `message`, `error.type`, `error.message`를 확인합니다. `trace.id`가 있으면 그 값으로 다시 검색해 같은 요청의 로그를 모두 확인합니다.

   ```text
   trace.id : "<값>"
   ```

6. 권한 거절(401, 403)은 `log.level : "WARN"`으로 검색합니다. 요청 경로(`url.path`)가 함께 기록됩니다.

찾은 로그를 이슈에 붙일 때는 회원 정보나 토큰이 보이지 않게 지우고 붙입니다.

## 로그가 없을 때

- **Kibana에 그 시각의 로그가 아예 없음**: 서버가 Logstash로 로그를 보내지 못했을 수 있습니다. Coolify에서 prod api 리소스의 Logs 탭을 확인합니다. 서버는 Kibana와 별개로 이곳에도 로그를 남깁니다.
- **운영 웹 쪽 오류**: Vercel 프로젝트의 Logs를 확인합니다. Vercel 무료 플랜은 런타임 로그를 1시간만 보관하므로 바로 확인합니다.
- **감사 로그(누가 무엇을 했는지)**: «ssccops · audit logs»에서 봅니다. prod 감사 로그는 `ssccops-administer`(최고관리자) 계정만 볼 수 있습니다.
