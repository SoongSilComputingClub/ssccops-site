import {useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '..';

/* ============ 회차 기록 작성 ============ */

type RecordStatus = '미제출' | '제출' | '수정요청' | '승인';

/** 회차 기록과 출석부가 같은 팀원을 쓴다. 확정 팀원 7명 가운데 셋만 그린다(옛 설명서 그대로) */
const MEMBERS: {name: string; leader?: boolean}[] = [{name: '김철수', leader: true}, {name: '이영희'}, {name: '박민수'}];

const STATUS_BADGE: Record<RecordStatus, 'amber' | 'blue' | 'outline-accent' | 'grey'> = {
  미제출: 'amber',
  제출: 'blue',
  수정요청: 'outline-accent',
  승인: 'grey',
};

type RecordState = {status: RecordStatus; attendance: boolean[]};

// 옛 설명서의 그림 그대로, 박민수의 체크를 푼 미제출 상태에서 시작한다.
const RECORD_INITIAL: RecordState = {status: '미제출', attendance: [true, true, false]};

const fieldLabel = {fontSize: 11.5, color: 'var(--app-n500)', marginBottom: 4} as const;

/**
 * 회차 기록 작성 — /studio/record.
 * 설명서의 «새 회차는 전원 출석으로 시작», «임시저장이 없습니다», «회차 상태 넷»(미제출 · 제출 · 수정요청 · 승인)을 따른다.
 */
export function SessionRecordMock(): ReactNode {
  const [s, setS] = useState<RecordState>(RECORD_INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const editable = s.status === '미제출' || s.status === '수정요청';

  const lockedReason = (): string =>
    s.status === '제출'
      ? '제출한 회차는 국장이 검토 중이라 여기서 고칠 수 없습니다. 결과를 기다립니다. 출석만 정정하려면 출석부에서 칸을 누르면 됩니다.'
      : '승인된 회차입니다. 확정돼 더는 쓸 수 없고, 출석도 고칠 수 없습니다.';

  const toggle = (i: number) => {
    if (!editable) {
      setFeedback(lockedReason());
      return;
    }
    const attendance = s.attendance.map((a, j) => (j === i ? !a : a));
    setS({...s, attendance});
    setFeedback(
      `«${MEMBERS[i].name}»의 출석 체크를 ${attendance[i] ? '했습니다' : '풀었습니다'}. 새 회차는 전원 출석으로 시작하므로 안 나온 사람만 체크를 풀면 됩니다.`,
    );
  };

  const submit = () => {
    if (!editable) {
      setFeedback(lockedReason());
      return;
    }
    const again = s.status === '수정요청';
    setS({...s, status: '제출'});
    setFeedback(
      again
        ? '고쳐서 다시 냈습니다. 상태가 수정요청에서 제출로 바뀌고, 다시 국장의 검토를 기다립니다.'
        : '«회차 기록 제출»을 눌렀습니다. 상태가 미제출에서 제출로 바뀌고, 국장이 검토하는 동안에는 고칠 수 없습니다. 임시저장이 없으니 실제로는 제출 전에 창을 닫으면 쓴 내용이 사라집니다.',
    );
  };

  return (
    <MockFrame
      caption="회차 기록 작성 — /studio/record"
      hint="출석 체크칸을 눌러 보고 «회차 기록 제출»을 누른 뒤, 아래 점선 띠에서 국장의 처리를 골라 보세요."
      feedback={feedback}
      onReset={() => {
        setS(RECORD_INITIAL);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            disabled={s.status !== '제출'}
            onClick={() => {
              setS({...s, status: '수정요청'});
              setFeedback(
                '국장이 사유를 달아 돌려보냈습니다. 사유가 화면 위에 먼저 보이고, 지난번에 체크한 출석이 그대로 채워져 있습니다. 고쳐서 다시 내면 됩니다.',
              );
            }}>
            국장이 «수정요청»을 누름
          </button>
          <button
            type="button"
            disabled={s.status !== '제출'}
            onClick={() => {
              setS({...s, status: '승인'});
              setFeedback('국장이 승인했습니다. 회차가 확정돼 더는 쓸 수 없고, 출석도 고칠 수 없습니다. 실제 화면에서는 되돌릴 수 없습니다.');
            }}>
            국장이 «승인»을 누름
          </button>
        </>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 520, margin: '0 auto'}}>
      <div className="mk-card">
        {s.status === '수정요청' && (
          <div
            style={{
              borderLeft: '3px solid var(--app-amber)',
              background: 'var(--app-amber-soft)',
              borderRadius: '0 10px 10px 0',
              padding: '11px 13px',
              marginBottom: 14,
            }}>
            <div style={{fontSize: 11.5, fontWeight: 700, color: 'var(--app-amber)', marginBottom: 5}}>수정요청 사유</div>
            <div style={{fontSize: 12.5, color: 'var(--app-amber)', lineHeight: 1.75}}>(예시) 국장이 돌려보내며 적은 사유가 여기에 먼저 보입니다.</div>
          </div>
        )}
        <div style={{display: 'flex', gap: 6, alignItems: 'center', marginBottom: 10}}>
          <Badge tone={STATUS_BADGE[s.status]}>{s.status}</Badge>
          <span style={{fontSize: 12, color: 'var(--app-n500)'}}>5회차 · 계획일 03.28</span>
        </div>
        <div style={{fontSize: 17, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 14}}>그래프 탐색 — BFS · DFS</div>

        <div style={fieldLabel}>진행 날짜</div>
        <div
          style={{
            border: '1px solid var(--app-line-strong)',
            borderRadius: 10,
            padding: '9px 11px',
            fontSize: 13,
            color: 'var(--app-ink)',
            marginBottom: 12,
          }}>
          2026-03-28
        </div>

        <div style={fieldLabel}>진행 내용</div>
        <div
          style={{
            border: '1px solid var(--app-line-strong)',
            borderRadius: 10,
            padding: '10px 11px',
            fontSize: 12.5,
            color: 'var(--app-n300)',
            lineHeight: 1.75,
            minHeight: 52,
            marginBottom: 12,
          }}>
          백준 1926, 2178 풀이 후 코드 리뷰. 다음 주까지 4문제 과제로 냈습니다.
        </div>

        <div style={{...fieldLabel, marginBottom: 6}}>출석 체크 · 확정 팀원 7명</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12}}>
          {MEMBERS.map((m, i) => {
            const on = s.attendance[i];
            return (
              <button
                key={m.name}
                type="button"
                className="gm-plain"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  border: '1px solid var(--app-line)',
                  borderRadius: 10,
                  padding: '8px 11px',
                  cursor: editable ? 'pointer' : 'not-allowed',
                }}>
                <span
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 4,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 10,
                    flex: 'none',
                    ...(on ? {background: 'var(--app-accent)', color: '#fff'} : {border: '1px solid var(--app-line-strong)'}),
                  }}>
                  {on ? '✓' : ''}
                </span>
                <span style={{fontSize: 13, color: on ? 'var(--app-ink)' : 'var(--app-n400)'}}>{m.name}</span>
                {m.leader && <span style={{fontSize: 11, color: 'var(--app-n500)'}}>스터디장</span>}
              </button>
            );
          })}
        </div>

        <div style={{...fieldLabel, marginBottom: 6}}>인증 사진</div>
        <div
          style={{
            height: 60,
            border: '1px dashed var(--app-line-strong)',
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            fontSize: 11.5,
            color: 'var(--app-n500)',
            marginBottom: 14,
          }}>
          사진 선택
        </div>

        <Btn
          variant="primary"
          style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12}}
          locked={!editable}
          title={s.status === '제출' ? '국장이 검토 중입니다' : s.status === '승인' ? '승인된 회차입니다' : undefined}
          onClick={submit}>
          회차 기록 제출
        </Btn>
      </div>
    </MockFrame>
  );
}

/* ============ 출석부 ============ */

/** o 출석 · x 결석 · - 이 회차 출석부에 없음 */
type Mark = 'o' | 'x' | '-';

const ROSTER_INITIAL: Mark[][] = [
  ['o', 'o', 'o', 'o', 'o'],
  ['o', 'x', 'o', 'o', 'o'],
  ['x', 'x', 'o', '-', 'x'],
];
const SESSION_COUNT = 5;
// 표에 그리지 않은 팀원 넷(모두 출석)이 기간 평균에 들어간다. 팀원 7명, 처음 기간 평균 88%가 이렇게 맞는다.
const HIDDEN_ATTENDED = 20;
const HIDDEN_SLOTS = 20;
const LOW_RATE = 70;

function rateOf(row: Mark[]): number {
  const slots = row.filter((m) => m !== '-').length;
  return slots === 0 ? 0 : Math.round((row.filter((m) => m === 'o').length / slots) * 100);
}

const COLS = '1.3fr repeat(5,0.5fr) 0.8fr';

/**
 * 출석부 — /studio/roster.
 * 설명서 «이미 제출한 회차의 출석을 칸을 눌러 고칠 수 있습니다», «승인된 회차의 칸은 잠깁니다», 출석률 70% 미만 빨간색을 따른다.
 */
export function RosterMock(): ReactNode {
  const [cells, setCells] = useState<Mark[][]>(ROSTER_INITIAL);
  /** 앞에서부터 승인된 회차 수 */
  const [approved, setApproved] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const attended = cells.flat().filter((m) => m === 'o').length + HIDDEN_ATTENDED;
  const slots = cells.flat().filter((m) => m !== '-').length + HIDDEN_SLOTS;
  const average = Math.round((attended / slots) * 100);

  const toggle = (r: number, c: number) => {
    const name = MEMBERS[r].name;
    if (c < approved) {
      setFeedback(`«승인 완료 — 출석을 고칠 수 없습니다»가 뜹니다. ${c + 1}회차는 승인돼 칸이 잠겼습니다. 출석은 승인 전에 정정하세요.`);
      return;
    }
    const before = rateOf(cells[r]);
    const next = cells.map((row, i) => (i === r ? row.map((m, j) => (j === c ? (m === 'o' ? 'x' : 'o') : m)) : row));
    const after = rateOf(next[r]);
    setCells(next);
    setFeedback(
      `«${name}»의 ${c + 1}회차를 ${next[r][c] === 'o' ? '○ 결석에서 ● 출석' : '● 출석에서 ○ 결석'}으로 고쳤습니다. 출석률이 ${before}%에서 ${after}%가 됩니다` +
        (after < LOW_RATE ? '. 70% 미만이라 빨간색으로 표시됩니다. ' : '. ') +
        '회차 기록을 다시 제출하지 않고 출석만 정정됩니다.',
    );
  };

  return (
    <MockFrame
      caption="출석부 — /studio/roster"
      hint="● · ○ 칸을 눌러 출석을 고쳐 보고, 아래 점선 띠에서 회차를 승인한 뒤 그 회차 칸도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setCells(ROSTER_INITIAL);
        setApproved(0);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          disabled={approved >= SESSION_COUNT}
          onClick={() => {
            const n = approved + 1;
            setApproved(n);
            setFeedback(`국장이 ${n}회차를 승인했습니다. 이제 ${n}회차 칸은 잠겨 눌러도 바뀌지 않습니다. 실제 화면에서는 되돌릴 수 없습니다.`);
          }}>
          국장이 {Math.min(approved + 1, SESSION_COUNT)}회차를 승인함
        </button>
      }>
      <div style={{fontSize: 14, fontWeight: 500, color: 'var(--app-ink)', marginBottom: 9}}>
        회차별 참석 현황
        <span style={{float: 'right', fontSize: 12, color: 'var(--app-n500)', fontWeight: 400}}>기간 평균 {average}%</span>
      </div>
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div className="mk-row mk-th" style={{gridTemplateColumns: COLS}}>
          <span>팀원</span>
          {Array.from({length: SESSION_COUNT}, (_, c) => (
            <span key={c} style={{textAlign: 'center'}}>
              {c + 1}
              {c < approved && <span style={{display: 'block', fontSize: 9.5, lineHeight: 1.2}}>승인</span>}
            </span>
          ))}
          <span style={{textAlign: 'right'}}>출석률</span>
        </div>
        {MEMBERS.map((m, r) => {
          const rate = rateOf(cells[r]);
          return (
            <div key={m.name} className="mk-row" style={{gridTemplateColumns: COLS}}>
              <span style={{color: 'var(--app-ink)', fontWeight: 500}}>
                {m.name}
                {m.leader && (
                  <>
                    {' '}
                    <span style={{fontSize: 11, color: 'var(--app-n500)', fontWeight: 400}}>스터디장</span>
                  </>
                )}
              </span>
              {cells[r].map((mark, c) => {
                if (mark === '-') {
                  return (
                    <span key={c} style={{textAlign: 'center', color: 'var(--app-n500)'}} title="이 회차 출석부에 없음">
                      ·
                    </span>
                  );
                }
                const locked = c < approved;
                return (
                  <button
                    key={c}
                    type="button"
                    className="gm-plain"
                    aria-label={`${m.name} ${c + 1}회차 ${mark === 'o' ? '출석' : '결석'}`}
                    aria-disabled={locked || undefined}
                    title={locked ? '승인 완료 — 출석을 고칠 수 없습니다' : undefined}
                    onClick={() => toggle(r, c)}
                    style={{
                      textAlign: 'center',
                      color: mark === 'o' ? 'var(--app-accent)' : 'var(--app-n500)',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      opacity: locked ? 0.45 : 1,
                    }}>
                    {mark === 'o' ? '●' : '○'}
                  </button>
                );
              })}
              <span style={{textAlign: 'right', ...(rate < LOW_RATE ? {color: 'var(--app-danger)', fontWeight: 600} : {color: 'var(--app-ink)'})}}>
                {rate}%
              </span>
            </div>
          );
        })}
      </div>
      <p style={{fontSize: 11.5, color: 'var(--app-n500)', margin: '9px 0 0', lineHeight: 1.7}}>
        <span style={{color: 'var(--app-accent)'}}>●</span> 출석 · ○ 결석 · · 이 회차 출석부에 없음. 출석률이 70% 미만이면 빨간색으로 표시됩니다.
      </p>
    </MockFrame>
  );
}
