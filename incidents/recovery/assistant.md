---
title: 규정 도우미 끄고 켜기
description: 규정 도우미가 계속 답하지 못하거나 Gemini 사용량을 아껴야 할 때 기능을 끄고 켜는 방법과 API 키를 바꾸는 방법입니다.
sidebar_position: 6
---

# 규정 도우미 끄고 켜기

:::note[비공개 자료]
- Coolify 주소와 계정: 드라이브 «계정 대장» › Coolify
- Gemini 키를 발급한 계정: 드라이브 «계정 대장» › Gemini
:::

## 언제 쓰나

- «지금은 답할 수 없습니다»가 오래 이어질 때. Gemini 무료 사용량을 다 썼을 수 있습니다
- Gemini API 키를 바꿔야 할 때

화면 문구별 뜻은 [증상별 첫 확인](../symptoms.md#규정-도우미가-답하지-않을-때)에 있습니다.

## 끄기

1. Coolify에서 prod api 리소스의 Environment Variables 화면을 엽니다.
2. `SSCCOPS_ASSISTANT_ENABLED`를 `false`로 바꿔 저장합니다.
3. [API 서버 다시 시작하기](restart-api.md)대로 Redeploy합니다. 환경변수는 Redeploy해야 적용됩니다.
4. 어드민의 규정 도우미에 «규정 도우미를 지금 사용할 수 없습니다»가 표시되는지 확인합니다.

끄면 질문 응답과 문서 색인 작업이 함께 멈춥니다. 다른 기능에는 영향이 없습니다.

## 켜기

같은 Environment Variables 화면에서 `SSCCOPS_ASSISTANT_ENABLED`를 `true`로 바꾸고 Redeploy합니다.

## Gemini API 키 바꾸기

1. 드라이브에 적힌 계정으로 Google AI Studio에 로그인해 새 키를 발급합니다.
2. Coolify의 prod api 리소스에서 `GEMINI_API_KEY`를 새 값으로 바꿔 저장하고 Redeploy합니다.
3. 규정 도우미에 질문을 하나 해 봅니다.
4. AI Studio에서 이전 키를 삭제합니다.

키 값은 이슈, 채팅, 스크린샷에 남기지 않습니다.
