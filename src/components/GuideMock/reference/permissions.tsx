import type {ReactNode} from 'react';
import {MockFrame} from '..';

/** 권한 오류 문구 — 화면이 쓰는 한 가지 형식 «무엇이 안 되나 — 어떤 권한이 필요한가». 그림으로만 둔다 */
export function PermissionErrorMock(): ReactNode {
  return (
    <MockFrame caption="권한 오류 문구 — 화면이 쓰는 한 가지 형식" innerStyle={{maxWidth: 620}}>
      <div className="mk-card" style={{fontSize: 13, color: 'var(--app-ink)', lineHeight: 1.9}}>
        업무를 등록할 권한이 없습니다 — 업무 관리(WORK_MANAGE) 권한이 필요합니다
        <br />
        라벨을 관리할 권한이 없습니다 — 폼 라벨 관리(FORM_LABEL_MANAGE) 권한이 필요합니다
        <br />
        규정 문서를 관리할 권한이 없습니다 — 규정 문서 관리(RAG_DOCUMENT_MANAGE) 권한이 필요합니다
      </div>
    </MockFrame>
  );
}
