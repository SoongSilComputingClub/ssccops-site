import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '../..';

type ParticipantStatus = '확정' | '대기' | '취소';
type Filter = '전체' | ParticipantStatus;

type Participant = {name: string; studentId: string; dept: string; status: ParticipantStatus};

// 옛 설명서의 그림 그대로다(이름과 학번만 예시 값으로 바꿨다).
const INITIAL_PEOPLE: Participant[] = [
  {name: '김철수', studentId: '20240001', dept: '컴퓨터학부', status: '확정'},
  {name: '박민수', studentId: '20250001', dept: '소프트웨어학부', status: '대기'},
  {name: '이영희', studentId: '20240002', dept: '전자정보공학부', status: '취소'},
];

/** 표에 그리지 않은 나머지 28명. 칩의 숫자(전체 31 · 확정 24 · 대기 5 · 취소 2)를 맞추려고 둔다 */
const OTHERS: Record<ParticipantStatus, number> = {확정: 23, 대기: 4, 취소: 1};
const TOTAL = INITIAL_PEOPLE.length + OTHERS.확정 + OTHERS.대기 + OTHERS.취소;

/** null이면 정원 «제한 없음» */
type Capacity = number | null;
const INITIAL_CAPACITY = 40;

const STATUS_TONE: Record<ParticipantStatus, 'blue' | 'amber' | 'outline'> = {확정: 'blue', 대기: 'amber', 취소: 'outline'};
const COLS = '1.2fr 1.4fr 1fr 1.4fr';
const SMALL = {padding: '4px 9px', fontSize: 11.5};

/**
 * 참가자 관리 — /events/{eventId}/participants. 행마다 처리 버튼으로 확정 · 대기 · 취소를 바꾼다.
 * 설명서 «정원을 넘어도 확정할 수 있습니다»와 «정원이 제한 없음이면 대기 버튼이 표시되지 않습니다»를 따른다.
 */
export function ParticipantsMock(): ReactNode {
  const [people, setPeople] = useState<Participant[]>(INITIAL_PEOPLE);
  const [filter, setFilter] = useState<Filter>('전체');
  const [capacity, setCapacity] = useState<Capacity>(INITIAL_CAPACITY);
  const [flash, setFlash] = useState<{name: string; n: number} | null>(null);
  const [feedback, setFeedback] = useState<ReactNode>();

  const count = (list: Participant[], s: ParticipantStatus) => OTHERS[s] + list.filter((p) => p.status === s).length;
  const confirmed = count(people, '확정');
  const over = capacity !== null && confirmed > capacity;
  const rows = filter === '전체' ? people : people.filter((p) => p.status === filter);
  const hidden = filter === '전체' ? TOTAL - people.length : OTHERS[filter];

  const change = (p: Participant, status: ParticipantStatus) => {
    const next = people.map((x) => (x.name === p.name ? {...x, status} : x));
    setPeople(next);
    setFlash({name: p.name, n: (flash?.n ?? 0) + 1});
    const c = count(next, '확정');
    const tally = capacity === null ? `확정 ${c}명` : `확정 ${c}명 / 정원 ${capacity}명`;
    if (status === '확정') {
      const overNow = capacity !== null && c > capacity;
      setFeedback(
        `${p.name}를 확정했습니다. 확정은 참가 인원으로 집계됩니다(${tally}).` +
          (overNow
            ? ' 정원을 넘었지만 확정 버튼은 잠기지 않습니다. 정원은 참고치라 경고만 보이고, 실제로 몇 명을 받을지는 운영진이 정합니다.'
            : ''),
      );
    } else if (status === '대기') {
      setFeedback(`${p.name}를 대기로 내렸습니다. 대기는 정원을 넘겼을 때 순번을 기다리는 상태라 참가 인원에 세지 않습니다(${tally}).`);
    } else {
      setFeedback(`${p.name}의 신청을 취소했습니다. 취소한 행에는 «확정» 버튼만 남습니다(${tally}).`);
    }
  };

  const buttons = (p: Participant) => {
    switch (p.status) {
      case '확정':
        return (
          <>
            {capacity !== null && (
              <Btn variant="ghost" style={SMALL} onClick={() => change(p, '대기')}>
                대기로
              </Btn>
            )}
            <Btn variant="ghost-danger" style={SMALL} onClick={() => change(p, '취소')}>
              취소
            </Btn>
          </>
        );
      case '대기':
        return (
          <>
            <Btn variant="primary" style={SMALL} onClick={() => change(p, '확정')}>
              확정
            </Btn>
            <Btn variant="ghost-danger" style={SMALL} onClick={() => change(p, '취소')}>
              취소
            </Btn>
          </>
        );
      default:
        return (
          <Btn variant="ghost" style={SMALL} onClick={() => change(p, '확정')}>
            확정
          </Btn>
        );
    }
  };

  const chips: [Filter, number][] = [
    ['전체', TOTAL],
    ['확정', confirmed],
    ['대기', count(people, '대기')],
    ['취소', count(people, '취소')],
  ];

  return (
    <MockFrame
      caption="참가자 관리 — /events/{eventId}/participants"
      hint="행마다 처리 버튼을 눌러 상태를 바꿔 보세요. 칩의 숫자와 «확정 N명 / 정원 40명»이 따라 바뀝니다."
      feedback={feedback}
      onReset={() => {
        setPeople(INITIAL_PEOPLE);
        setFilter('전체');
        setCapacity(INITIAL_CAPACITY);
        setFlash(null);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            disabled={capacity === 25}
            onClick={() => {
              setCapacity(25);
              setFeedback('행사 수정 화면에서 정원을 25명으로 줄였습니다. 이제 대기자와 취소자를 확정해 정원을 넘겨 보세요.');
            }}>
            행사 수정에서 정원을 25명으로 줄임
          </button>
          <button
            type="button"
            disabled={capacity === null}
            onClick={() => {
              setCapacity(null);
              setFeedback('정원이 «제한 없음»이면 «대기» 버튼이 표시되지 않습니다. 대기자를 확정으로 올리는 버튼은 그대로 있습니다.');
            }}>
            정원을 «제한 없음»으로 바꿈
          </button>
        </>
      }>
      <div className="mk-header">
        <div>
          <div className="title">2026 신입 부원 모집 설명회</div>
          <div className="sub">
            참가자 관리 ·{' '}
            <span style={over ? {color: 'var(--app-danger)', fontWeight: 600} : undefined}>
              {capacity === null ? `확정 ${confirmed}명 / 정원 제한 없음` : `확정 ${confirmed}명 / 정원 ${capacity}명`}
            </span>
          </div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 6, margin: '12px 0 6px', flexWrap: 'wrap'}}>
        {chips.map(([f, n]) => (
          <Chip
            key={f}
            active={filter === f}
            onClick={() => {
              setFilter(f);
              setFeedback(f === '전체' ? undefined : `«${f}» 칩으로 걸렀습니다. ${n}명입니다.`);
            }}>
            {f} {n}
          </Chip>
        ))}
      </div>
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div className="mk-row mk-th" style={{gridTemplateColumns: COLS}}>
          <span>신청자</span>
          <span>학번 · 학과</span>
          <span>상태</span>
          <span>처리</span>
        </div>
        {rows.map((p) => (
          // 바뀐 행은 key를 바꿔 다시 그려서 gm-flash가 매번 다시 켜지게 한다.
          <div
            key={flash?.name === p.name ? `${p.name}-${flash.n}` : p.name}
            className={flash?.name === p.name ? 'mk-row gm-flash' : 'mk-row'}
            style={{gridTemplateColumns: COLS}}>
            <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{p.name}</span>
            <span style={{fontSize: 12}}>
              {p.studentId} · {p.dept}
            </span>
            <span>
              <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
            </span>
            <span style={{display: 'flex', gap: 5}}>{buttons(p)}</span>
          </div>
        ))}
        <div className="mk-row" style={{fontSize: 12, color: 'var(--app-n500)'}}>
          (예시) 이 밖의 {hidden}명은 줄여서 그리지 않았습니다.
        </div>
      </div>
    </MockFrame>
  );
}
