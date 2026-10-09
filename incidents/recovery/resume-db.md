---
title: DB 일시정지 풀기
description: Supabase 무료 플랜이 DB를 일시정지해 API 전체가 멈췄을 때 DB를 다시 켜는 방법입니다.
sidebar_position: 2
---

# DB 일시정지 풀기

:::note[비공개 자료]
- Supabase 계정과 조직: 드라이브 «계정 대장» › Supabase
- dev, prod 프로젝트 이름: 드라이브 «시스템 구성과 주소» › Supabase 프로젝트
:::

## 언제 쓰나

- readiness가 DOWN(503)이고 세 앱 모두 데이터가 표시되지 않을 때
- DB 상태를 매일 확인하는 GitHub Actions 작업(Supabase keepalive)이 실패했다는 알림 메일을 받았을 때

앱 DB와 로그인은 Supabase 무료 플랜의 한 프로젝트에 있고, 무료 플랜은 7일 동안 DB 쿼리가 적으면 프로젝트를 일시정지합니다. 자세한 배경은 [증상별 첫 확인](../symptoms.md#db가-멈췄을-때)에 있습니다.

## 순서

1. https://supabase.com/dashboard 에 로그인해 조직을 고릅니다.
2. 일시정지(Paused)로 표시된 프로젝트를 열고 **Resume project**를 누릅니다. 몇 분 걸립니다.
3. DB 복구 후 서버가 자동으로 정상화되는지 먼저 확인합니다. DB가 다시 켜지면 서버의 readiness 검사가 통과하므로 대개 서버에는 따로 조치하지 않아도 됩니다. [확인 주소](../check-status.md#확인-주소)에서 readiness가 UP인지 봅니다.
4. 몇 분이 지나도 readiness가 DOWN이면 서버 컨테이너가 재시작을 반복하다 멈췄을 수 있습니다. [API 서버 다시 시작하기](restart-api.md)대로 Redeploy합니다.
5. 일시정지된 원인을 확인합니다. DB가 일시정지됐다는 것은 서버의 하루 한 번 쿼리와 GitHub Actions 확인 작업이 일주일 동안 모두 멈췄다는 뜻입니다. 서버가 오래 꺼져 있었는지, GitHub Actions 예약 실행이 꺼졌는지 확인합니다.

## 바로 복구합니다

Supabase 문서(2026년 10월 확인)에는 일시정지 후 1년까지 복구할 수 있다고 되어 있습니다. 하지만 일시정지된 동안에는 API 전체가 멈추고, 기간이 지나면 백업 파일 내려받기만 가능합니다.

## 하지 않는 것

- 프로젝트를 지우거나 새로 만들어 바꾸지 않습니다. DB와 로그인 계정이 모두 그 프로젝트에 있습니다.
- 서버 재시작만 반복하지 않습니다.
