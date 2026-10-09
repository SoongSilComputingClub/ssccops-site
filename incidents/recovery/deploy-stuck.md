---
title: 새 버전이 뜨지 않을 때
description: 머지나 릴리즈를 했는데 새 버전이 뜨지 않을 때 GitHub Actions, Coolify, Vercel 가운데 어디서 멈췄는지 찾고 다시 돌리는 방법입니다.
sidebar_position: 4
---

# 새 버전이 뜨지 않을 때

:::note[비공개 자료]
- Coolify, Vercel 계정: 드라이브 «계정 대장» › Coolify, Vercel
- GHCR 로그인 토큰의 주인과 만료일: 드라이브 «시스템 구성과 주소» › GHCR 패키지와 호스트 로그인
- 배포 시크릿이 있는 자리: 드라이브 «시스템 구성과 주소» › 배포 시크릿 이름과 자리
:::

## 배포 흐름

| 무엇 | 흐름 |
|---|---|
| 서버 dev | `develop` 머지 → CI → Actions **Deploy Dev** → Coolify가 이미지를 받아 띄움 |
| 서버 prod | 릴리즈(`main` 머지) → CI → Actions **Deploy Prod** → Coolify |
| 웹 dev | `develop` 머지 → CI → Actions **Deploy Dev**(앱마다 이미지) → Coolify |
| 웹 prod | `main` 머지 → Vercel이 빌드 |

머지 뒤 dev 서버가 새 커밋으로 답하기까지 약 12분, 웹은 약 6분 반에 세 앱이 뜨는 시간이 더해집니다. 그보다 짧으면 아직 기다립니다. 새 버전이 떴는지는 [확인 주소](../check-status.md#확인-주소)의 커밋으로만 판단합니다.

## 서버와 dev 웹: Actions부터 봅니다

레포의 Actions에서 Deploy Dev 또는 Deploy Prod의 그 커밋 실행을 엽니다.

| 보이는 것 | 뜻 | 할 일 |
|---|---|---|
| Prepare가 회색 | CI가 통과하지 못해 배포를 건너뛰었습니다 | CI를 고칩니다. [CI 검사](/contributing/contribute/ci) |
| Build Image가 빨강 | 이미지 빌드 실패. 웹은 필수 빌드 변수가 비었을 수 있습니다 | 로그를 보고 고칩니다 |
| Deploy가 빨강, HTTP 401 | Coolify API 토큰이 만료되었거나 권한이 없습니다 | 시스템 담당자가 토큰을 새로 넣습니다 |
| Deploy가 빨강, curl 종료 코드 43 | 시크릿 값에 줄바꿈이 섞였습니다. 로그의 «모양» 줄(길이, 줄바꿈 수)이 어느 시크릿인지 알려 줍니다 | 시크릿을 줄바꿈 없이 다시 넣습니다 |
| Deploy가 초록 | Actions는 할 일을 다 했습니다 | 아래 Coolify를 봅니다 |

일시적인 실패였다면 그 실행에서 **Re-run failed jobs**로 다시 돌립니다.

## Deploy가 초록인데 뜨지 않으면: Coolify

Coolify에서 그 리소스의 Deployments를 엽니다.

| 보이는 것 | 뜻 | 할 일 |
|---|---|---|
| `Queued`, `Waiting` | 앞의 배포를 기다리는 중입니다. 서버와 웹 세 앱이 한 줄로 섭니다 | 기다립니다 |
| 이미지 받기 실패(`denied`, `unauthorized`) | 서버 기기의 GHCR 로그인이 만료되었습니다. Actions는 초록인데 여기서만 실패합니다 | 시스템 담당자가 기기에서 GHCR에 다시 로그인합니다 |
| 헬스체크가 healthy가 되지 못함 | 새 버전이 시작하지 못했거나 헬스체크 주소가 바뀌었습니다. 옛 컨테이너가 계속 응답합니다 | 그 배포의 로그에서 시작 오류를 봅니다 |

헬스체크가 보는 주소를 바꾸는 코드라면 Coolify의 헬스체크 설정을 먼저 옮기고 머지해야 합니다. [하면 안 되는 조치](../do-not.md#장애를-키우는-것)

## 운영 웹: Vercel

1. Vercel에서 그 앱 프로젝트의 Deployments를 엽니다.
2. 릴리즈 머지 커밋의 배포가 있는지, 빌드가 성공했는지 봅니다.
3. 빌드가 실패했으면 빌드 로그를 봅니다. dev(컨테이너)에서는 멀쩡하던 설정이 Vercel에서 처음 깨지는 일이 있었습니다.
4. 배포가 아예 없으면 Production Branch가 `main`인지 봅니다. 고친 뒤 Redeploy하거나 Deploy Hook으로 다시 빌드합니다.
