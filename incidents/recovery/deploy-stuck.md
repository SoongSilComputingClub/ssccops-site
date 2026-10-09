---
title: 새 버전이 배포되지 않을 때
description: 머지나 릴리즈를 했는데 새 버전이 배포되지 않을 때 GitHub Actions, Coolify, Vercel 가운데 어디에서 멈췄는지 찾고 다시 실행하는 방법입니다.
sidebar_position: 4
---

# 새 버전이 배포되지 않을 때

:::note[비공개 자료]
- Coolify, Vercel 계정: 드라이브 «계정 대장» › Coolify, Vercel
- GHCR 로그인 토큰의 소유자와 만료일: 드라이브 «시스템 구성과 주소» › GHCR 패키지와 호스트 로그인
- 배포 시크릿을 저장한 곳: 드라이브 «시스템 구성과 주소» › 배포 시크릿 이름과 위치
:::

## 배포 흐름

| 대상 | 흐름 |
|---|---|
| 서버 dev | `develop` 머지 → CI → Actions **Deploy Dev** → Coolify가 이미지를 받아 실행 |
| 서버 prod | 릴리즈(`main` 머지) → CI → Actions **Deploy Prod** → Coolify가 이미지를 받아 실행 |
| 웹 dev | `develop` 머지 → CI → Actions **Deploy Dev**(앱마다 이미지 빌드) → Coolify가 이미지를 받아 실행 |
| 웹 prod | `main` 머지 → Vercel이 빌드하고 배포 |

머지 후 dev 서버가 새 커밋으로 응답하기까지 약 12분 걸립니다. 웹은 배포 호출까지 약 6분 반이 걸리고, 세 앱이 시작되는 시간이 더해집니다. 이 시간이 지나지 않았으면 조금 더 기다립니다. 새 버전이 실행 중인지는 [확인 주소](../check-status.md#확인-주소)의 커밋으로 판단합니다.

## 서버와 dev 웹: Actions부터 확인합니다

레포의 Actions에서 그 커밋의 Deploy Dev 또는 Deploy Prod 실행을 엽니다.

| 보이는 것 | 뜻 | 할 일 |
|---|---|---|
| Prepare가 회색(건너뜀) | CI를 통과하지 못해 배포를 건너뛰었습니다 | CI 실패를 고칩니다. [CI 검사](/contributing/contribute/ci) |
| Build Image 실패 | 이미지 빌드에 실패했습니다. 웹은 필수 빌드 변수가 비어 있을 수 있습니다 | 로그를 보고 고칩니다 |
| Deploy 실패, HTTP 401 | Coolify API 토큰이 만료되었거나 권한이 없습니다 | 시스템 담당자가 토큰을 새로 등록합니다 |
| Deploy 실패, curl 종료 코드 43 | 시크릿 값에 줄바꿈이 섞여 있습니다. 로그에 찍힌 시크릿의 길이와 줄바꿈 수로 어느 시크릿인지 알 수 있습니다 | 그 시크릿을 줄바꿈 없이 다시 등록합니다 |
| Deploy 성공 | Actions 단계는 정상입니다 | 아래 Coolify 단계를 확인합니다 |

일시적인 실패였다면 그 실행 화면에서 **Re-run failed jobs**로 다시 실행합니다.

## Deploy는 성공했는데 배포되지 않으면: Coolify

Coolify에서 그 리소스의 Deployments 탭을 엽니다.

| 보이는 것 | 뜻 | 할 일 |
|---|---|---|
| `Queued`, `Waiting` | 앞선 배포가 끝나기를 기다리는 중입니다. 서버와 세 웹 앱의 배포는 순서대로 진행됩니다 | 기다립니다 |
| 이미지 받기 실패(`denied`, `unauthorized`) | 서버 기기의 GHCR 로그인이 만료되었습니다. Actions는 성공했는데 이 단계에서만 실패합니다 | 시스템 담당자가 서버 기기에서 GHCR에 다시 로그인합니다 |
| 헬스체크가 healthy로 바뀌지 않음 | 새 버전이 시작되지 못했거나 헬스체크 주소가 바뀌었습니다. 이전 컨테이너가 계속 요청을 처리합니다 | 그 배포의 로그에서 시작 오류를 확인합니다 |

헬스체크가 사용하는 주소를 바꾸는 코드라면 Coolify의 헬스체크 설정을 먼저 바꾼 뒤 머지해야 합니다. [하면 안 되는 조치](../do-not.md#장애를-키우는-것)

## 운영 웹: Vercel

1. Vercel에서 그 앱 프로젝트의 Deployments를 엽니다.
2. 릴리즈 머지 커밋의 배포가 있는지, 빌드가 성공했는지 확인합니다.
3. 빌드가 실패했으면 빌드 로그를 확인합니다. dev(컨테이너)에서는 문제가 없던 설정이 Vercel 빌드에서 처음 실패한 적이 있습니다.
4. 배포가 아예 없으면 Production Branch가 `main`으로 설정되어 있는지 확인합니다. 설정을 고친 뒤 Redeploy하거나 Deploy Hook으로 다시 빌드합니다.
