import type {ReactNode} from 'react';
import {MockFrame} from '../..';

/** 학술 대시보드 — /academic-programs/dashboard. 숫자 카드 넷을 그림으로만 보여 준다 */
export function AcademicDashboardMock(): ReactNode {
  return (
    <MockFrame caption="학술 대시보드 — /academic-programs/dashboard">
      <div className="mk-header">
        <div>
          <div className="title">학술 대시보드</div>
          <div className="sub">전체 활동 현황과 승인 대기</div>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 12}}>
        <div className="mk-stat">
          <div className="lb">진행 중 활동</div>
          <div className="vl">8</div>
          <div className="ht">전체 12건</div>
        </div>
        <div className="mk-stat">
          <div className="lb">승인 대기</div>
          <div className="vl" style={{color: 'var(--app-accent)'}}>
            4
          </div>
          <div className="ht">회차 기록</div>
        </div>
        <div className="mk-stat">
          <div className="lb">이번 주 회차</div>
          <div className="vl">6</div>
          <div className="ht">진행일 기준</div>
        </div>
        <div className="mk-stat">
          <div className="lb">진행 더딘 활동</div>
          <div className="vl" style={{color: 'var(--app-amber)'}}>
            2
          </div>
          <div className="ht">진행률 40% 미만</div>
        </div>
      </div>
    </MockFrame>
  );
}
