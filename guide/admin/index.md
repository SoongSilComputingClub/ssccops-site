---
title: 운영관리
description: 운영진이 쓰는 앱입니다. 업무와 승인, 회원 명부와 권한, 폼 제작과 응답, 행사, 공개 웹사이트에 실을 글, 학술 프로그램 감독이 여기 있습니다.
---

# 운영관리 (admin)

운영진이 쓰는 앱입니다. **전 화면 로그인이 필요하고, 권한이 하나라도 있어야 운영 화면이 열립니다.** 업무와 승인, 회원 명부와 권한, 폼 제작과 응답, 행사, 공개 웹사이트에 실을 글, 학술 프로그램 감독이 여기 있습니다.

여기서 연 것을 받는 자리 → [공개 웹사이트](../www/index.md)(행사·폼·콘텐츠) · [학술 앱](../lms/index.md)(기획안·회차) · [앱을 넘나드는 흐름](../flows.md)

| 묶음 | 페이지 |
|---|---|
| 홈 · 업무 | [운영 대시보드](operations/dashboard.mdx) · [운영 통합 · 등록](operations/overview.mdx) · [업무](operations/works.mdx) · [하위 업무](operations/sub-works.mdx) · [승인함](operations/approvals.mdx) |
| 회원 | [회원 명부 · 상세](members/roster.mdx) · [CSV 회원 이관](members/csv-import.mdx) · [회원명부 내보내기](members/roster-export.mdx) · [역할 · 권한](members/roles.mdx) |
| 폼 | [폼 관리 · 편집기](forms/manage.mdx) · [시스템 폼 목록](forms/system-forms.mdx) · [응답 확인](forms/responses.mdx) · [공개 폼(응답자 화면)](forms/public-form.mdx) |
| 행사 | [행사 관리](events/manage.mdx) · [신청 심사 · 참가자](events/participants.mdx) |
| 콘텐츠 | [페이지 · 포스트](content.mdx) |
| 학술 감독 | [기획안 접수 열기](academic/proposal-intake.mdx) · [기획안 검토](academic/proposal-review.mdx) · [모집 관리 · 일정 수정](academic/recruitment.mdx) · [스터디 · 프로젝트 · 트랙](academic/programs.mdx) · [회차 · 출석 승인](academic/session-review.mdx) · [학술 대시보드 · 통계](academic/dashboard.mdx) |
| 규정 도우미 | [RAG 설정](rag-settings.mdx) |
| 메뉴 · 설정 | [사이드바 · 전체 메뉴](settings/navigation.mdx) · [알림 유형](settings/notification-types.mdx) |

## 권한이 없으면 운영 화면이 열리지 않습니다

권한이 하나도 없는 회원이 운영관리 앱에 들어오면 본문 대신 **«이 앱에서 볼 수 있는 화면이 없습니다»**와 «학술 활동은 학술 LMS에서 합니다.»가 뜹니다. 아래 버튼으로 **홍보 사이트**(공개 웹사이트), **학술 LMS**(학술 앱), **내 정보**로 갈 수 있습니다. 사이드바 목차와 «전체 메뉴»도 없고, 열리는 것은 [내 정보](../account/my-account.mdx)와 [알림](../account/notifications.md) 둘뿐입니다.

**스터디장 · 프로젝트장 · 트랙장도 여기에 듭니다.** 리더 역할은 운영진 역할이 아니어서 권한이 없습니다([역할 · 권한](members/roles.mdx#리더-역할에는-권한을-줄-수-없습니다)). 자기 프로그램은 [학술 앱](../lms/index.md)에서 다룹니다. 운영 일을 맡은 회원이 이 화면을 본다면 역할과 권한을 맡은 운영진에게 권한을 요청하세요.

**국원은 «학술 감독» 묶음을 보기만 합니다.** 국원 역할에 학술 프로그램 조회 권한이 붙어 있어 메뉴가 보이고 내용을 읽을 수 있지만, 승인이나 모집 시작 같은 버튼은 잠겨 있습니다([권한 안내](../reference/permissions.mdx#국원은-학술-감독-화면을-보기만-합니다)).

권한이 있는 운영진도 **자기 권한 밖의 화면은 목차에 없고, 주소를 직접 쳐도 «없는 주소입니다»가 뜹니다**([사이드바 · 전체 메뉴](settings/navigation.mdx#전체-메뉴--열-수-있는-화면)). 운영 대시보드를 열 권한이 없으면 들어올 때 열 수 있는 첫 화면으로 바로 갑니다.
