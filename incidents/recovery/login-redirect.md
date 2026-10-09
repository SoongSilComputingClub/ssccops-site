---
title: 로그인 주소 고치기
description: 로그인 후 다른 주소로 이동하거나 로그인이 끝나지 않을 때 Supabase의 로그인 주소 설정을 고치는 방법입니다.
sidebar_position: 5
---

# 로그인 주소 고치기

:::note[비공개 자료]
- Supabase 계정과 조직: 드라이브 «계정 대장» › Supabase
- prod 프로젝트 이름과 지금 등록된 주소: 드라이브 «시스템 구성과 주소» › Supabase 프로젝트
:::

## 언제 쓰나

- 로그인이 끝난 뒤 다른 주소로 이동할 때
- 새 도메인이나 새 배포 환경으로 옮긴 뒤 그 앱에서만 로그인이 끝나지 않을 때

## 원인

로그인은 Supabase를 거쳐 각 앱의 콜백 주소로 돌아옵니다. 콜백 주소가 Supabase의 Redirect URLs 목록에 없으면 Supabase는 **오류 없이** 기본 주소(Site URL)로 보냅니다. 그래서 로그인 후 다른 앱으로 이동한 것처럼 보입니다. 운영 프로젝트의 Site URL은 어드민 주소입니다.

## 순서

1. https://supabase.com/dashboard 에서 그 환경(dev 또는 prod)의 프로젝트를 엽니다.
2. Authentication › URL Configuration을 엽니다.
3. Redirect URLs에 지금 쓰는 앱의 콜백 주소(`https://<앱 주소>/auth/callback`)가 있는지 확인합니다. 세 앱의 주소가 모두 있어야 합니다.
4. 빠진 주소를 추가하고 저장합니다. Site URL은 바꾸지 않습니다.
5. 그 앱에서 로그아웃한 뒤 다시 로그인해 봅니다.

로그인할 때 앱이 Supabase에 전달하는 콜백 주소에 쿼리(`?`)가 붙으면 등록된 주소와 일치하지 않습니다. 코드가 그렇게 바뀌었다면 웹 쪽 `[FIX]` 이슈로 엽니다.

## 아무도 로그인하지 못할 때

모든 앱에서 Google 로그인 화면에 같은 오류가 나면 Supabase가 아니라 Google 로그인 설정에 문제가 있을 수 있습니다. 드라이브 «계정 대장» › Google 로그인 설정의 계정으로 Google Cloud에 로그인해 OAuth 클라이언트가 유효한지 확인합니다.
