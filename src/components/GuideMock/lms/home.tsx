import {useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '..';

type SessionState = '승인' | '제출' | '미제출' | '수정요청';

type Activity = {
  name: string;
  kind: string;
  period: string;
  /** 계획일이 지났지만 아직 기록하지 않은 회차 */
  unrecorded: {session: number; date: string};
  sessions: SessionState[];
};

// 첫 활동은 옛 설명서의 그림 그대로다. 둘째 활동은 드롭다운으로 바꿔 보려고 더한 예시다.
const ACTIVITIES: Activity[] = [
  {
    name: '알고리즘 문제풀이 스터디',
    kind: '스터디',
    period: '2026-03-10 ~ 2026-06-20 · 스터디장 김철수',
    unrecorded: {session: 6, date: '04.02'},
    sessions: ['승인', '승인', '승인', '승인', '제출', '미제출', '수정요청', '미제출'],
  },
  {
    name: '웹 서비스 사이드프로젝트',
    kind: '프로젝트',
    period: '2026-03-11 ~ 2026-04-15 · 프로젝트장 김철수',
    unrecorded: {session: 4, date: '04.01'},
    sessions: ['승인', '승인', '제출', '미제출', '미제출', '미제출'],
  },
];

const CELL_STYLE: Record<SessionState, {background?: string; color: string; boxShadow?: string}> = {
  승인: {background: 'var(--app-bg)', color: 'var(--app-n300)'},
  제출: {background: 'var(--app-accent-soft)', color: 'var(--app-accent)'},
  미제출: {background: 'var(--app-amber-soft)', color: 'var(--app-amber)'},
  수정요청: {boxShadow: 'inset 0 0 0 1px var(--app-accent)', color: 'var(--app-accent)'},
};

const CELL_COLOR: Record<SessionState, string> = {
  승인: '회색',
  제출: '파랑',
  미제출: '주황',
  수정요청: '테두리',
};

/** 회차 칸을 눌렀을 때. 설명서 «회차 상태 넷»의 «쓸 수 있나»를 따른다 */
function cellFeedback(n: number, state: SessionState, activity: Activity): string {
  const head = `${n}회차는 ${CELL_COLOR[state]}, ${state === '제출' ? '제출(검토 중)' : state}입니다.`;
  switch (state) {
    case '승인':
      return `${head} 확정돼 기록을 쓸 수 없고 출석도 더는 고칠 수 없습니다.`;
    case '제출':
      return `${head} 국장이 검토 중이라 지금은 쓸 수 없습니다. 결과를 기다립니다.`;
    case '미제출':
      return (
        `${head} 지금 쓸 수 있는 회차라 누르면 회차 기록 작성(/studio/record)으로 갑니다.` +
        (n === activity.unrecorded.session ? ' 계획일이 지났는데 아직 기록하지 않아 «미기록 회차»에 셉니다.' : '')
      );
    case '수정요청':
      return `${head} 국장이 사유를 달아 돌려보낸 회차라, 누르면 회차 기록 작성으로 가서 사유를 먼저 보고 고쳐 다시 냅니다.`;
  }
}

type TopItem = {label: string; text: string};

// 상단 바 항목. 설명서 «상단 바가 두 단계입니다»의 묶음과 탭 줄을 따른다.
const TOP_ITEMS: TopItem[] = [
  {label: '학술 대시보드', text: '지금 보고 있는 학술 대시보드(/studio)입니다. 이 묶음은 항목이 하나뿐이라 탭 줄이 없습니다.'},
  {
    label: '내 활동',
    text: '«내 활동» 묶음을 누르면 메뉴가 펼쳐지지 않고 첫 항목인 내 활동(/studio/programs)으로 바로 갑니다. 도착하면 맨 위 탭 줄에 내 활동 · 회차 기록 · 출석부 · 팀원 관리가 보여 한 번 더 고를 필요가 없습니다.',
  },
  {label: '회차 기록', text: '회차 기록(/studio/record)으로 갑니다. «내 활동» 묶음의 항목입니다.'},
  {label: '출석부', text: '출석부(/studio/roster)로 갑니다. «내 활동» 묶음의 항목입니다.'},
  {label: '팀원 관리', text: '팀원 관리(/studio/members)로 갑니다. «내 활동» 묶음의 항목입니다.'},
];

/**
 * 스터디장 대시보드 — /studio.
 * 설명서의 활동 드롭다운, 회차 칸 색(회색 승인 · 파랑 제출 · 주황 미제출 · 테두리 수정요청), 묶음을 누르면 첫 항목으로 가는 상단 바를 따른다.
 */
export function StudioDashboardMock(): ReactNode {
  const [activityIndex, setActivityIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<number>();
  const [feedback, setFeedback] = useState<ReactNode>();

  const activity = ACTIVITIES[activityIndex];
  const total = activity.sessions.length;
  const recorded = activity.sessions.filter((s) => s === '승인' || s === '제출').length;
  const reviewing = activity.sessions.filter((s) => s === '제출').length;

  const pick = (i: number) => {
    setMenuOpen(false);
    setSelected(undefined);
    if (i === activityIndex) {
      setFeedback(`이미 «${ACTIVITIES[i].name}»를 보고 있습니다.`);
      return;
    }
    setActivityIndex(i);
    setFeedback(`«${ACTIVITIES[i].name}»로 바꿨습니다. 고른 활동은 주소에 남으므로, 그 주소를 북마크하면 다음에도 같은 활동으로 열립니다.`);
  };

  return (
    <MockFrame
      caption="스터디장 대시보드 — /studio"
      hint="활동 드롭다운, 회차 번호 칸, 상단 바 항목을 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setActivityIndex(0);
        setMenuOpen(false);
        setSelected(undefined);
        setFeedback(undefined);
      }}>
      <div className="mk-topbar">
        <span className="brand">SSCC 학술</span>
        {TOP_ITEMS.map((item, i) => (
          <button
            key={item.label}
            type="button"
            className={i === 0 ? 'gm-plain on' : 'gm-plain'}
            onClick={() => setFeedback(item.text)}>
            {item.label}
          </button>
        ))}
        <span style={{flex: 1}} />
        <span>로그아웃</span>
      </div>
      <div
        style={{
          border: '1px solid var(--app-line)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: 16,
          background: 'var(--app-bg)',
        }}>
        <div style={{position: 'relative', display: 'inline-block', marginBottom: 13}}>
          <button
            type="button"
            className="gm-plain"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              border: '1px solid var(--app-line-strong)',
              borderRadius: 10,
              padding: '7px 11px',
              background: 'var(--app-surface)',
              fontSize: 12.5,
              color: 'var(--app-ink)',
            }}>
            {activity.name} <span style={{color: 'var(--app-n500)'}}>▾</span>
          </button>
          {menuOpen && (
            <div
              role="listbox"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: 4,
                zIndex: 2,
                minWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 4,
                background: 'var(--app-surface)',
                border: '1px solid var(--app-line)',
                borderRadius: 10,
                boxShadow: '0 6px 18px rgba(0,0,0,.08)',
              }}>
              {ACTIVITIES.map((a, i) => (
                <button
                  key={a.name}
                  type="button"
                  role="option"
                  aria-selected={i === activityIndex}
                  className="gm-plain gm-pick"
                  onClick={() => pick(i)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    whiteSpace: 'nowrap',
                    color: i === activityIndex ? 'var(--app-accent)' : 'var(--app-ink)',
                    fontWeight: i === activityIndex ? 600 : 400,
                  }}>
                  {a.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, marginBottom: 13}}>
          <div className="mk-stat">
            <div className="lb">커리큘럼 진행률</div>
            <div className="vl">{Math.floor((recorded / total) * 100)}%</div>
            <div className="ht">
              {recorded} / {total}회차
            </div>
          </div>
          <div className="mk-stat">
            <div className="lb">미기록 회차</div>
            <div className="vl" style={{color: 'var(--app-amber)'}}>
              1
            </div>
            <div className="ht">
              {activity.unrecorded.session}회차 · {activity.unrecorded.date} 예정
            </div>
          </div>
          <div className="mk-stat">
            <div className="lb">검토 대기</div>
            <div className="vl" style={{color: 'var(--app-accent)'}}>
              {reviewing}
            </div>
            <div className="ht">국장 검토 중인 회차</div>
          </div>
          <div className="mk-stat">
            <div className="lb">이번 주 회차</div>
            <div className="vl">1</div>
            <div className="ht">계획일 기준</div>
          </div>
        </div>

        <div className="mk-card">
          <div style={{display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 10}}>
            <Badge tone="blue">진행 중</Badge>
            <Badge tone="grey">{activity.kind}</Badge>
            <span style={{flex: 1}} />
            <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}}>
              내 활동
            </Btn>
            <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}}>
              회차 기록
            </Btn>
            <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}}>
              출석부
            </Btn>
            <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}}>
              팀원 관리
            </Btn>
          </div>
          <div style={{fontSize: 20, fontWeight: 600, color: 'var(--app-ink)'}}>{activity.name}</div>
          <div style={{fontSize: 13, color: 'var(--app-n400)', marginTop: 4, marginBottom: 13}}>{activity.period}</div>

          <div className="mk-section-label">회차 진행</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {activity.sessions.map((state, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  className="gm-plain mk-cell"
                  aria-label={`${n}회차 · ${state}`}
                  onClick={() => {
                    setSelected(n);
                    setFeedback(cellFeedback(n, state, activity));
                  }}
                  style={{
                    ...CELL_STYLE[state],
                    padding: '0 6px',
                    fontSize: 12,
                    ...(selected === n ? {outline: '2px solid var(--app-accent-strong)', outlineOffset: 2} : {}),
                  }}>
                  {n}
                </button>
              );
            })}
          </div>
          <p style={{fontSize: 11.5, color: 'var(--app-n500)', margin: '9px 0 0', lineHeight: 1.7}}>
            회색 승인 · 파랑 제출(검토 중) · 주황 미제출 · 테두리 수정요청. 지금 쓸 수 있는 회차를 누르면 기록 작성으로 갑니다.
          </p>
        </div>
      </div>
    </MockFrame>
  );
}
