import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '../..';

type Session = {
  id: string;
  program: string;
  kind: '스터디' | '프로젝트';
  round: number;
  date: string;
  title: string;
  content: string;
  attendance: [string, boolean][];
  photo: boolean;
  /** 화면 밖에서 다른 사람이 먼저 처리한 회차. 이 화면은 아직 모른다 */
  stale?: boolean;
};

// 앞의 둘은 옛 설명서의 그림 그대로다. «승인 대기 4건»에 맞춰 뒤의 둘을 더했다.
const INITIAL: Session[] = [
  {
    id: 'algo-5',
    program: '알고리즘 문제풀이 스터디',
    kind: '스터디',
    round: 5,
    date: '03.28',
    title: '그래프 탐색 — BFS · DFS',
    content: '백준 1926, 2178 풀이 후 코드 리뷰. 다음 주까지 4문제 과제로 냈습니다.',
    attendance: [
      ['홍길동', true],
      ['이영희', true],
      ['박민수', true],
      ['최지우', true],
      ['정다은', true],
      ['윤서준', true],
      ['한도윤', false],
    ],
    photo: true,
  },
  {
    id: 'web-3',
    program: '웹 서비스 사이드프로젝트',
    kind: '프로젝트',
    round: 3,
    date: '03.27',
    title: '로그인 화면 구현',
    content: '맡은 화면을 시연하고 코드 리뷰를 했습니다. 다음 주까지 회원가입 화면을 마무리합니다.',
    attendance: [
      ['김철수', true],
      ['오세린', true],
      ['강예준', true],
      ['이영희', true],
      ['박민수', true],
    ],
    photo: false,
  },
  {
    id: 'algo-4',
    program: '알고리즘 문제풀이 스터디',
    kind: '스터디',
    round: 4,
    date: '03.21',
    title: '이분 탐색',
    content: '백준 1920, 2805 풀이 후 코드 리뷰.',
    attendance: [
      ['홍길동', true],
      ['이영희', true],
      ['박민수', true],
      ['최지우', true],
      ['정다은', true],
      ['윤서준', true],
      ['한도윤', true],
    ],
    photo: true,
  },
  {
    id: 'web-2',
    program: '웹 서비스 사이드프로젝트',
    kind: '프로젝트',
    round: 2,
    date: '03.20',
    title: '화면 설계',
    content: '화면 흐름을 그리고 맡을 부분을 나눴습니다.',
    attendance: [
      ['김철수', true],
      ['오세린', true],
      ['강예준', true],
      ['이영희', true],
      ['박민수', false],
    ],
    photo: true,
  },
];

const ROW_LINE = '1px solid color-mix(in srgb, var(--app-ink) 5%, transparent)';

function rowStyle(selected: boolean): CSSProperties {
  return {
    gridTemplateColumns: '1fr',
    width: '100%',
    padding: '9px 0',
    borderTop: ROW_LINE,
    fontSize: 13,
    color: 'var(--app-n300)',
    textAlign: 'left',
    ...(selected ? {borderLeft: '2px solid var(--app-accent)', background: 'var(--app-accent-soft)'} : {}),
  };
}

const present = (s: Session) => s.attendance.filter(([, p]) => p).length;
const label = (s: Session) => `${s.program} · ${s.round}회차`;

/**
 * 회차 · 출석 승인 — /academic-programs/reviews/sessions.
 * 설명서의 처리 표(승인은 되돌릴 수 없음, 수정요청은 사유 필수)와 «일괄 승인은 없습니다», «이미 처리됨» 안내를 따른다.
 */
export function SessionReviewMock(): ReactNode {
  const [queue, setQueue] = useState<Session[]>(INITIAL);
  const [selectedId, setSelectedId] = useState('algo-5');
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<ReactNode>();

  const sel: Session | undefined = queue.find((s) => s.id === selectedId) ?? queue[0];

  const closeAsk = () => {
    setAsking(false);
    setReason('');
  };

  const select = (s: Session) => {
    setSelectedId(s.id);
    closeAsk();
    setFeedback(`«${label(s)}»를 골랐습니다. 진행 내용과 출석을 확인하고 하나씩 처리합니다.`);
  };

  /** 처리한 회차를 목록에서 빼고 다음 회차를 고른다 */
  const removeSelected = () => {
    if (!sel) return;
    const rest = queue.filter((s) => s.id !== sel.id);
    setQueue(rest);
    if (rest.length > 0) setSelectedId(rest[0].id);
    closeAsk();
  };

  const alreadyDone = () => {
    setFeedback('«이미 처리됨» 안내가 뜹니다. 다른 사람이 먼저 처리한 회차입니다. 목록을 새로고침하세요.');
    closeAsk();
  };

  const approve = () => {
    if (!sel) return;
    if (sel.stale) {
      alreadyDone();
      return;
    }
    removeSelected();
    setFeedback(
      `«${label(sel)}»를 승인했습니다. 회차가 «승인»으로 확정되고 승인 대기 목록에서 빠집니다. 실제 화면에서는 되돌릴 수 없고, 승인된 회차는 출석도 고칠 수 없습니다.`,
    );
  };

  const askReason = () => {
    if (sel?.stale) {
      alreadyDone();
      return;
    }
    setAsking(true);
    setFeedback('수정요청은 사유가 필수입니다. 사유를 적어야 보낼 수 있습니다.');
  };

  const sendRequest = () => {
    if (!sel) return;
    if (sel.stale) {
      alreadyDone();
      return;
    }
    if (!reason.trim()) {
      setFeedback('잠겨 있습니다. 수정요청은 사유가 필수입니다.');
      return;
    }
    removeSelected();
    setFeedback(`«${label(sel)}»에 수정요청을 보냈습니다. 회차가 «수정요청»이 되고 스터디장이 고쳐서 다시 냅니다.`);
  };

  const takenElsewhere = () => {
    if (!sel) return;
    setQueue(queue.map((s) => (s.id === sel.id ? {...s, stale: true} : s)));
    setFeedback('다른 사람이 이 회차를 먼저 처리했습니다. 이 화면은 아직 모릅니다. 이 상태에서 «승인»이나 «수정요청»을 눌러 보세요.');
  };

  return (
    <MockFrame
      caption="회차 · 출석 승인 — /academic-programs/reviews/sessions"
      hint="왼쪽에서 회차를 골라 «승인»이나 «수정요청»을 눌러 보세요. 일괄 승인은 없어 하나씩 처리합니다."
      feedback={feedback}
      onReset={() => {
        setQueue(INITIAL);
        setSelectedId('algo-5');
        closeAsk();
        setFeedback(undefined);
      }}
      demo={
        <button type="button" onClick={takenElsewhere} disabled={!sel || sel.stale}>
          다른 국장이 고른 회차를 먼저 처리함
        </button>
      }>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14}}>
        <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 14px', borderBottom: '1px solid var(--app-line)'}}>
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)'}}>승인 대기 {queue.length}건</div>
          </div>
          {queue.map((s) => (
            <button
              key={s.id}
              type="button"
              className="gm-plain gm-pick mk-row"
              aria-pressed={s.id === sel?.id}
              style={rowStyle(s.id === sel?.id)}
              onClick={() => select(s)}>
              <div>
                <div style={{display: 'flex', gap: 5, marginBottom: 5}}>
                  <Badge tone="blue">제출</Badge>
                  <Badge tone="grey">{s.kind}</Badge>
                </div>
                <div style={{fontSize: 13.5, fontWeight: 600, color: 'var(--app-ink)'}}>{s.program}</div>
                <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 3}}>
                  {s.round}회차 · {s.date} 진행 · 출석 {present(s)}/{s.attendance.length}
                  {s.photo && ' · 사진 있음'}
                </div>
              </div>
            </button>
          ))}
          {queue.length === 0 && (
            <div className="mk-row" style={{gridTemplateColumns: '1fr', fontSize: 12.5, color: 'var(--app-n500)'}}>
              승인 대기 중인 회차가 없습니다.
            </div>
          )}
        </div>

        {sel ? (
          <div className="mk-card">
            <div style={{display: 'flex', gap: 5, alignItems: 'center', marginBottom: 8}}>
              <Badge tone="blue">제출</Badge>
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{label(sel)}</span>
            </div>
            <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 12}}>{sel.title}</div>

            <div className="mk-section-label">진행 내용</div>
            <p style={{fontSize: 12.5, color: 'var(--app-n300)', lineHeight: 1.8, margin: '0 0 14px'}}>{sel.content}</p>

            <div className="mk-section-label">
              출석 {present(sel)} / {sel.attendance.length}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14}}>
              {sel.attendance.map(([name, p]) => (
                <Badge key={name} tone={p ? 'blue' : 'outline'}>
                  {name}
                </Badge>
              ))}
            </div>

            {sel.photo && (
              <>
                <div className="mk-section-label">인증 사진</div>
                <div
                  style={{
                    height: 74,
                    borderRadius: 10,
                    background: 'var(--app-bg)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11.5,
                    color: 'var(--app-n500)',
                    marginBottom: 14,
                  }}>
                  {sel.kind} 인증 사진
                </div>
              </>
            )}

            <div style={{display: 'flex', gap: 6}}>
              <Btn variant="primary" onClick={approve}>
                승인
              </Btn>
              <Btn variant="ghost" onClick={askReason}>
                수정요청
              </Btn>
            </div>

            {asking && (
              <div style={{marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--app-bg)'}}>
                <div className="mk-section-label">수정요청 사유 (필수)</div>
                <input className="gm-input" aria-label="수정요청 사유" value={reason} onChange={(e) => setReason(e.target.value)} />
                <div style={{display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8}}>
                  <Btn
                    variant="ghost"
                    style={{padding: '5px 10px', fontSize: 12}}
                    onClick={() => {
                      closeAsk();
                      setFeedback('수정요청을 취소했습니다.');
                    }}>
                    취소
                  </Btn>
                  <Btn
                    variant="primary"
                    style={{padding: '5px 10px', fontSize: 12}}
                    locked={!reason.trim()}
                    title={reason.trim() ? undefined : '사유를 적어야 보낼 수 있습니다'}
                    onClick={sendRequest}>
                    수정요청 보내기
                  </Btn>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mk-card" style={{display: 'grid', placeItems: 'center', fontSize: 12.5, color: 'var(--app-n500)'}}>
            처리할 회차를 모두 처리했습니다.
          </div>
        )}
      </div>
    </MockFrame>
  );
}
