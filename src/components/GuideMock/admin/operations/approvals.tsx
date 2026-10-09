import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame, Progress} from '../..';

type Tab = '대기' | '승인' | '반려';
type Vote = '동의' | '부동의';

type Request = {
  id: string;
  title: string;
  type: string;
  requested: string;
  meta: string;
  /** 정족수가 있는 유형만. need는 필요한 동의 수, others는 다른 사람이 이미 누른 동의 수 */
  quorum?: {need: number; others: number};
  lastReject?: string;
};

const TABS: Tab[] = ['대기', '승인', '반려'];

const REQUESTS: Request[] = [
  {
    id: 'booth-budget',
    title: '부스 예산 신청',
    type: '예산지출',
    requested: '08.16 요청',
    meta: '등록자 이영희 · 승인자 국장 · 마감 08.18(D-DAY)',
    quorum: {need: 3, others: 2},
  },
  {
    id: 'facility',
    title: '학교 시설팀 부스 설치 협조',
    type: '외부협조',
    requested: '08.15 요청',
    meta: '등록자 홍길동 · 승인자 부회장 · 마감 08.20(D-2)',
    lastReject: '직전 반려 사유: 설치 일정 재확인 필요',
  },
  // 옛 그림의 «4건»에 맞춰 더한 예시 카드 둘. 대시보드 예시의 승인 대기 행과 내 업무 행이다.
  {
    id: 'ot-budget',
    title: '2026 신입회원 OT 예산 집행',
    type: '예산지출',
    requested: '08.17 요청',
    meta: '등록자 박민수 · 승인자 국장 · 마감 08.18(D-DAY)',
    quorum: {need: 3, others: 2},
  },
  {
    id: 'report',
    title: '예산 집행 보고서 작성',
    type: '제작',
    requested: '08.17 요청',
    meta: '등록자 홍길동 · 승인자 부회장 · 마감 08.18(D-DAY)',
  },
];

type State = {
  tab: Tab;
  /** 카드마다 지금 어느 탭에 있는지 */
  place: Record<string, Tab>;
  /** 내가 누른 표. «2026 신입회원 OT 예산 집행»에는 이미 동의해 정족수를 채운 상태로 시작한다 */
  myVote: Record<string, Vote | undefined>;
  /** 다른 사람이 더 누른 동의 */
  extra: Record<string, number>;
  highlight?: string;
};

const INITIAL: State = {
  tab: '대기',
  place: Object.fromEntries(REQUESTS.map((r) => [r.id, '대기' as Tab])),
  myVote: {'ot-budget': '동의'},
  extra: {},
};

const STATUS_TONE: Record<Tab, 'amber' | 'blue' | 'red'> = {대기: 'amber', 승인: 'blue', 반려: 'red'};

const SMALL = {fontSize: 11.5, padding: 6};

/**
 * 승인함 — /approvals.
 * 설명서 «투표와 최종 완료 승인은 별개»와 상태 변화 기준 «정족수를 채워도 완료는 승인자가 누르고, 승인자라도 정족수 전에는 누를 수 없다»를 따른다.
 */
export function ApprovalsMock(): ReactNode {
  const [s, setS] = useState<State>(INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const votesOf = (r: Request) =>
    r.quorum ? Math.min(r.quorum.need, r.quorum.others + (s.extra[r.id] ?? 0) + (s.myVote[r.id] === '동의' ? 1 : 0)) : 0;

  const cards = REQUESTS.filter((r) => s.place[r.id] === s.tab);

  const vote = (r: Request, v: Vote) => {
    if (!r.quorum) return;
    if (s.myVote[r.id] === v) {
      setFeedback(`이미 «${v}»를 눌렀습니다. 정족수 ${votesOf(r)}/${r.quorum.need} 동의입니다.`);
      return;
    }
    const myVote = {...s.myVote, [r.id]: v};
    setS({...s, myVote});
    const votes = Math.min(r.quorum.need, r.quorum.others + (s.extra[r.id] ?? 0) + (v === '동의' ? 1 : 0));
    const met = votes >= r.quorum.need;
    setFeedback(
      v === '동의'
        ? met
          ? `«동의»를 눌러 정족수 ${votes}/${r.quorum.need}을 채웠습니다. 표는 승인자를 대신하지 않습니다. 이제 승인자가 «승인»을 눌러야 완료됩니다.`
          : `«동의»를 눌렀습니다. 정족수 ${votes}/${r.quorum.need} 동의입니다. 아직 «승인»은 잠겨 있습니다.`
        : `«부동의»를 눌렀습니다. 동의 수는 ${votes}/${r.quorum.need}입니다.${met ? '' : ' 정족수가 모자라 «승인»이 잠깁니다.'}`,
    );
  };

  const approve = (r: Request) => {
    if (r.quorum) {
      const votes = votesOf(r);
      if (votes < r.quorum.need) {
        setFeedback(`잠겨 있습니다. 정족수가 모자랍니다(${votes}/${r.quorum.need}). 승인자라도 정족수 전에는 누를 수 없습니다.`);
        return;
      }
    }
    setS({...s, place: {...s.place, [r.id]: '승인'}, highlight: undefined});
    setFeedback(
      `«${r.title}» 카드를 승인했습니다. 하위 업무가 완료되고 카드는 «승인» 탭으로 옮겨집니다. 완료는 마지막 단계입니다.` +
        (r.quorum ? ' 투표와 최종 승인은 별개라, 정족수를 채운 뒤에도 승인자가 직접 눌러야 합니다.' : ''),
    );
  };

  const reject = (r: Request) => {
    setS({...s, place: {...s.place, [r.id]: '반려'}, highlight: undefined});
    setFeedback(
      `«${r.title}» 카드를 반려했습니다. 카드는 «반려» 탭으로 옮겨지고, 하위 업무는 기획이 아니라 진행으로 돌아갑니다. 담당자가 지적된 부분만 고쳐 다시 완료 승인 요청을 하면 됩니다.`,
    );
  };

  const booth = REQUESTS[0];
  const boothVotes = votesOf(booth);

  return (
    <MockFrame
      caption="승인함 — /approvals (대기 탭)"
      hint="«부스 예산 신청»에서 «승인»을 먼저 눌러 보고, «동의»로 정족수를 채운 뒤 다시 눌러 보세요. «반려»와 위쪽 탭도 눌러 볼 수 있습니다."
      feedback={feedback}
      onReset={() => {
        setS(INITIAL);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            disabled={s.place[booth.id] !== '대기' || boothVotes >= (booth.quorum?.need ?? 0)}
            onClick={() => {
              setS({...s, extra: {...s.extra, [booth.id]: (s.extra[booth.id] ?? 0) + 1}});
              const votes = Math.min(3, boothVotes + 1);
              setFeedback(
                votes >= 3
                  ? `다른 국장이 «동의»를 눌러 «부스 예산 신청»의 정족수 ${votes}/3을 채웠습니다. 그래도 완료는 승인자가 «승인»을 눌러야 합니다.`
                  : `다른 국장이 «동의»를 눌렀습니다(${votes}/3).`,
              );
            }}>
            다른 국장이 «부스 예산 신청»에 동의를 누름
          </button>
          <button
            type="button"
            disabled={s.place['ot-budget'] !== '대기'}
            onClick={() => {
              setS({...s, tab: '대기', highlight: 'ot-budget'});
              setFeedback(
                '대시보드의 승인 대기 목록에서 «2026 신입회원 OT 예산 집행» 행을 누르고 들어왔습니다. 해당 카드가 파란 테두리로 강조됩니다(실제 화면은 그 카드까지 자동으로 스크롤합니다).',
              );
            }}>
            대시보드에서 «2026 신입회원 OT 예산 집행» 행을 누르고 들어옴
          </button>
        </>
      }>
      <div style={{display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center'}}>
        {TABS.map((t) => (
          <Chip
            key={t}
            active={s.tab === t}
            onClick={() => {
              setS({...s, tab: t, highlight: undefined});
              setFeedback(`«${t}» 탭입니다. ${REQUESTS.filter((r) => s.place[r.id] === t).length}건이 모여 있습니다.`);
            }}>
            {t}
          </Chip>
        ))}
        <span style={{fontSize: 12, color: 'var(--app-n500)', marginLeft: 'auto'}}>{cards.length}건</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {cards.map((r) => {
          const pending = s.place[r.id] === '대기';
          const votes = votesOf(r);
          const quorumMet = r.quorum ? votes >= r.quorum.need : true;
          const mine = s.myVote[r.id];
          return (
            <div
              key={r.id}
              className="mk-card"
              style={s.highlight === r.id ? {boxShadow: '0 0 0 2px var(--app-accent)'} : undefined}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                <div style={{display: 'flex', gap: 6}}>
                  <Badge tone={STATUS_TONE[s.place[r.id]]}>{s.place[r.id]}</Badge>
                  <Badge tone="grey">{r.type}</Badge>
                </div>
                <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>{r.requested}</span>
              </div>
              <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 4}}>{r.title}</div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 10}}>{r.meta}</div>
              {r.quorum && (
                <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: pending ? 10 : 0}}>
                  <Progress value={(votes / r.quorum.need) * 100} />
                  <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>
                    정족수 {votes}/{r.quorum.need} 동의
                  </span>
                </div>
              )}
              {pending && r.lastReject && (
                <div style={{fontSize: 12, color: 'var(--app-danger)', marginBottom: 10}}>{r.lastReject}</div>
              )}
              {pending && (
                <div style={{display: 'grid', gridTemplateColumns: r.quorum ? '1fr 1fr 1fr 1fr' : '1fr 1fr', gap: 6}}>
                  {r.quorum && (
                    <>
                      <Btn
                        variant="ghost"
                        style={mine === '동의' ? {...SMALL, background: 'var(--app-accent-soft)', color: 'var(--app-accent-strong)'} : SMALL}
                        onClick={() => vote(r, '동의')}>
                        동의
                      </Btn>
                      <Btn
                        variant="ghost-danger"
                        style={mine === '부동의' ? {...SMALL, background: 'color-mix(in srgb, var(--app-danger) 12%, transparent)'} : SMALL}
                        onClick={() => vote(r, '부동의')}>
                        부동의
                      </Btn>
                    </>
                  )}
                  <Btn variant="ghost-danger" style={SMALL} onClick={() => reject(r)}>
                    반려
                  </Btn>
                  <Btn
                    variant="primary"
                    style={SMALL}
                    locked={!quorumMet}
                    title={quorumMet ? undefined : '정족수를 채운 뒤에 가능합니다'}
                    onClick={() => approve(r)}>
                    승인
                  </Btn>
                </div>
              )}
            </div>
          );
        })}
        {cards.length === 0 && (
          <div className="mk-card" style={{gridColumn: '1 / -1', fontSize: 13, color: 'var(--app-n500)'}}>
            이 탭에 해당하는 카드가 없습니다.
          </div>
        )}
      </div>
    </MockFrame>
  );
}
