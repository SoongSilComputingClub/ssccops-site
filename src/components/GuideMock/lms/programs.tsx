import type {ReactNode} from 'react';
import {Badge, MockFrame} from '..';

const MEMBERS: {name: string; leader?: boolean}[] = [{name: '김철수', leader: true}, {name: '이영희'}, {name: '박민수'}];

/**
 * 팀원 관리 — /studio/members.
 * 확정된 명단을 확인하는 화면이라 그림으로만 둔다. 팀원은 학술국장이 모집 관리에서 선발한다(설명서 참고 상자).
 */
export function MembersMock(): ReactNode {
  return (
    <MockFrame caption="팀원 관리 — /studio/members">
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div style={{padding: '13px 15px', borderBottom: '1px solid var(--app-line)'}}>
          <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>팀원 7명</div>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 3}}>알고리즘 문제풀이 스터디</div>
        </div>
        {MEMBERS.map((m) => (
          <div key={m.name} className="mk-row" style={{gridTemplateColumns: '1.4fr 1fr'}}>
            <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{m.name}</span>
            <span style={{textAlign: 'right'}}>
              <Badge tone={m.leader ? 'blue' : 'grey'}>{m.leader ? '스터디장' : '팀원'}</Badge>
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}
