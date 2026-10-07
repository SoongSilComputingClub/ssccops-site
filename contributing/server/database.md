---
title: 데이터베이스와 스키마 변경
sidebar_label: 스키마 변경
description: Flyway로 스키마를 바꾸는 방법, 시드 데이터를 넣는 규칙, 프로필별 차이와 테이블 이름 규칙을 정리합니다.
sidebar_position: 3
---

# 데이터베이스와 스키마 변경

엔티티를 고치거나 테이블을 더할 때 알아야 할 것을 모았습니다. 스키마 변경 절차, 시드 데이터 규칙, 프로필별 차이, 이름 규칙을 다룹니다.

규칙의 원본은 서버 [`AGENTS.md`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/AGENTS.md)의 «스키마 변경, Flyway가 한다» 절이고, 각 마이그레이션 파일이 무엇을 하는지도 그 절의 표에 있습니다.

## Flyway가 스키마를 관리합니다

DB는 PostgreSQL이고 스키마는 Flyway 마이그레이션 파일이 만듭니다. 파일은 [`src/main/resources/db/migration/`](https://github.com/SoongSilComputingClub/ssccops-server/tree/develop/src/main/resources/db/migration)에 있고, 지금은 `V1__baseline.sql`부터 `V31__move_tag_to_operation.sql`까지 있습니다.

`V1__baseline.sql`은 운영 DB의 당시 스키마를 덤프해 옮긴 것입니다. 엔티티에서 생성한 스키마가 아닙니다.

이미 테이블이 있는 DB에 Flyway를 처음 붙이기 위해 `baseline-on-migrate: true`, `baseline-version: 1`을 씁니다. 빈 DB에서는 V1부터 차례로 모두 적용됩니다.

### 이렇게 바꾸게 된 이유

예전에는 Hibernate의 `ddl-auto: update`가 새 테이블과 컬럼을 자동으로 만들고, 컬럼 이름 변경이나 삭제는 사람이 직접 `ALTER`를 실행했습니다.

그런데 `update`는 컬럼 이름 변경을 새 컬럼 추가로 처리합니다. 값이 든 옛 컬럼 옆에 빈 새 컬럼이 생기고, 앱은 빈 새 컬럼을 읽으면서도 정상으로 뜹니다. 이 문제가 실제로 세 번 일어났고, 리뷰가 아니라 배포 뒤에야 드러났습니다.

그래서 스키마 변경을 버전이 붙은 파일로 남기고, 배포 환경에서는 엔티티와 스키마가 어긋나면 부팅이 실패하도록 바꿨습니다.

## 스키마를 바꾸는 법

1. 엔티티를 고칩니다.
2. 같은 PR에 새 마이그레이션 파일을 더합니다. 이름은 `V{다음 번호}__{무엇을 하는지}.sql`입니다. 예: `V32__add_something.sql`
3. 테스트를 돌려 `FlywayMigrationValidateTest`가 통과하는지 봅니다(아래).

파일 하나가 PR에서 dev 서버까지 가는 길은 다음과 같습니다.

```mermaid
flowchart LR
  A["엔티티 수정과 V32 파일"] --> B["PR"]
  B --> C["CI: FlywayMigrationValidateTest"]
  C --> D["develop 머지"]
  D --> E["dev 자동 배포"]
  E --> F["부팅 때 Flyway가 새 파일 적용"]
  F --> G["ddl-auto: validate로 엔티티와 대조"]
```

지켜야 할 규칙은 둘입니다.

- **이미 적용된 마이그레이션 파일은 고치지 않습니다.** Flyway가 파일의 체크섬을 검사하므로, 고치면 이미 그 파일을 적용한 DB에서 부팅이 실패합니다. 잘못된 것이 있으면 새 파일로 되돌립니다.
- **엔티티만 고치고 파일을 빠뜨리지 않습니다.** dev는 `ddl-auto: validate`라 배포에서 막힙니다. 이것이 의도한 동작입니다.

:::warning[머지는 곧 dev 배포입니다]

develop에 머지되면 dev에 자동으로 배포됩니다. 마이그레이션이 깨지면 dev 서버가 뜨지 못하므로, 머지 전에 `FlywayMigrationValidateTest`를 통과시킵니다. 이 테스트는 CI에서도 돌기 때문에 실패하면 배포 이미지가 만들어지지 않습니다.

:::

### 마이그레이션 검증 테스트

[`FlywayMigrationValidateTest`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/test/java/org/sscc/ssccopsserver/global/config/FlywayMigrationValidateTest.java)는 Testcontainers로 PostgreSQL 컨테이너(`pgvector/pgvector:pg17` 이미지)를 띄웁니다. 빈 DB에 V1부터 모든 파일을 적용한 뒤 엔티티와 스키마가 맞는지(`validate`) 봅니다. enum 컬럼의 CHECK 제약이 enum 값과 맞는지도 검사합니다.

이 테스트 때문에 로컬에서 `./gradlew test`를 돌리려면 **Docker가 필요합니다.**

## 시드 데이터도 마이그레이션 파일로 넣습니다

기준 코드나 기본 권한 같은 시드 데이터도 마이그레이션 파일로 넣습니다. `V3__seed_reference_data.sql`이 기본 시드이고, 그 뒤로 더한 시드도 모두 새 파일입니다. 예를 들면 `V11__seed_rag_document_manage_authority.sql`, `V16__seed_content_manage_authority.sql`, `V19__seed_track_program_type.sql`이 있습니다.

- **`INSERT`마다 `WHERE NOT EXISTS`로 막습니다.** baseline이 이미 시드가 들어 있는 운영 DB의 덤프라서, 시드 파일이 처음 도는 DB에도 행이 이미 있을 수 있습니다. 가드가 없으면 중복 키로 깨집니다.
- **이미 있는 값을 `UPDATE`로 덮어쓰지 않습니다.** 운영진이 화면에서 고친 값을 배포가 되돌리지 않게 하기 위해서입니다.
- **시드를 더할 때도 새 파일입니다.** 기존 시드 파일에 줄을 더하지 않습니다.

:::warning[새 시드 파일은 테스트 목록 두 곳에도]

test 프로필은 Flyway가 꺼져 있어서, 시드 파일을 `application-test.yaml`의 `spring.sql.init.data-locations`와 테스트 지원 클래스 `SeedScript`의 목록으로 직접 읽습니다. 새 시드 파일을 만들면 이 두 목록에 같은 순서로 더합니다.

빠뜨리면 그 행이 테스트 DB에만 없어서, 새 권한을 요구하는 API의 테스트가 실패합니다. 자세한 경우(시드가 적는 컬럼을 지울 때 등)는 서버 `AGENTS.md`의 시드 절을 봅니다.

:::

## 프로필별 차이

| 프로필 | DB | Flyway | `ddl-auto` | 이유 |
|---|---|---|---|---|
| `local` | PostgreSQL | 켜짐 | `update` | 개발 편의. 대신 로컬 DB가 배포본과 다르게 자랄 수 있어 마이그레이션을 빠뜨리면 dev에서 걸립니다 |
| `dev` | PostgreSQL | 켜짐 | `validate` | 엔티티와 스키마가 어긋나면 부팅을 실패시킵니다 |
| `prod` | PostgreSQL | 켜짐 | `validate` | dev와 같습니다 |
| `test` | H2 인메모리 | 꺼짐 | `create` | baseline이 PostgreSQL 덤프라 H2에서 실행되지 않습니다. 마이그레이션 검증은 위의 Testcontainers 테스트가 맡습니다 |

설정은 [`application.yaml`](https://github.com/SoongSilComputingClub/ssccops-server/blob/develop/src/main/resources/application.yaml)(Flyway 공통), `application-{local,dev,prod}.yaml`, 그리고 테스트용 `src/test/resources/application-test.yaml`에 있습니다. test가 `create-drop`이 아니라 `create`인 이유는 그 파일의 주석에 있습니다.

로컬 DB를 띄우는 방법은 [로컬 개발 환경](../getting-started/local-setup.md)에서 다룹니다. dev와 prod DB의 접속 정보는 이 사이트에 적지 않습니다.

## 이름은 데이터 사전을 따릅니다

테이블과 컬럼 이름은 동아리의 데이터 사전을 따릅니다. 데이터 사전은 공공 표준 단어를 바탕으로 한 약어를 씁니다. 그래서 `member` 대신 `mbr`, `approval` 대신 `aprv`, `status` 대신 `stts`처럼 쓰고, 테이블 이름도 `sub_work_aprv`, `acdm_actv`(학술 활동) 같은 모양입니다.

데이터 사전 원본은 공개 레포에 없습니다. 새 이름이 필요하면 같은 뜻의 단어를 쓰는 기존 테이블과 컬럼 이름을 따릅니다.

이 이름은 웹까지 이어집니다. 웹의 필드 이름은 DB 컬럼 이름을 lowerCamelCase로 바꾼 것(`mbr_id`는 `mbrId`)이고, 타입 이름은 테이블 이름을 PascalCase로 바꾼 것(`sub_work_aprv`는 `SubWorkAprv`)입니다. 불리언은 `*Yn`으로 끝납니다. 웹 쪽 규칙은 [ssccops-web `AGENTS.md`](https://github.com/SoongSilComputingClub/ssccops-web/blob/develop/AGENTS.md)의 «데이터 표기» 절에 있습니다.

## 다음 읽을 것

- [서버 구조](./structure.md): 도메인별 테이블 규칙을 담은 각 도메인 `AGENTS.md`의 목록
- [테스트](./testing.md): 이 문서에 나온 H2와 Testcontainers를 포함한 테스트 환경 전반
- [로컬 개발 환경](../getting-started/local-setup.md): 로컬 PostgreSQL을 띄우는 방법
