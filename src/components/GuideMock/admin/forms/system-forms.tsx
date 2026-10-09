import type {ReactNode} from 'react';
import {Badge, MockFrame} from '../..';

/** 시스템 폼 목록 — /forms/system. 카드에 복제 · 삭제 버튼이 없다는 것을 보여 주는 그림이다 */
export function SystemFormListMock(): ReactNode {
  return (
    <MockFrame caption="시스템 폼 목록 — 카드에 복제·삭제 버튼이 없습니다" innerStyle={{minWidth: 'auto', maxWidth: 560}}>
      <div style={{fontSize: 18, fontWeight: 600, color: 'var(--app-ink)'}}>시스템 폼</div>
      <div style={{fontSize: 12.5, color: 'var(--app-n500)', marginTop: 2}}>응답을 LMS에서 받는 폼</div>
      <div
        style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 12,
          background: 'var(--app-bg)',
          fontSize: 11.5,
          color: 'var(--app-n400)',
          lineHeight: 1.7,
        }}>
        시스템 폼은 코드가 가리키는 폼이라 폼 목록에서 빠져 있고, 공개 링크가 없습니다. 응답은 LMS에서 받습니다.
        제목·접수 기간·라벨·접수 상태는 그대로 바꿀 수 있습니다.
      </div>
      <div className="mk-card" style={{marginTop: 12, padding: 14}}>
        <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
          <Badge tone="blue">접수중</Badge>
          <Badge tone="outline-accent">시스템 폼</Badge>
          <span style={{flex: 1}} />
          <span style={{fontSize: 12, color: 'var(--app-n500)'}}>응답 12</span>
        </div>
        <div style={{marginTop: 8, fontSize: 16, fontWeight: 600, color: 'var(--app-ink)'}}>2026-2 기획안 접수</div>
        <div style={{marginTop: 3, fontSize: 12.5, color: 'var(--app-n500)'}}>2026-09-01 09:00 ~ 2026-09-14 23:59</div>
        <div
          style={{
            marginTop: 10,
            borderTop: '1px solid var(--app-line)',
            paddingTop: 10,
            fontSize: 12.5,
            color: 'var(--app-accent)',
          }}>
          상세
        </div>
      </div>
    </MockFrame>
  );
}
