import {useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '..';

type ProposalStatus = '수정요청' | '제출' | '승인' | '반려';

type HistoryRow = {status: ProposalStatus; date: string; who: string};

type ProposalState = {
  status: ProposalStatus;
  /** 몇 번째 제출인지 */
  round: number;
  submittedOn: string;
  /** 처리 이력. 최근 것이 위 */
  history: HistoryRow[];
};

const SUBMITTER = '김철수';
const REVIEWER = '학술국장 최지우';

// 옛 설명서의 그림 그대로, 첫 제출이 수정요청을 받은 상태에서 시작한다.
const INITIAL: ProposalState = {
  status: '수정요청',
  round: 1,
  submittedOn: '03.02',
  history: [
    {status: '수정요청', date: '03.03', who: REVIEWER},
    {status: '제출', date: '03.02', who: SUBMITTER},
  ],
};

const TONE: Record<ProposalStatus, 'amber' | 'blue' | 'grey' | 'red'> = {
  수정요청: 'amber',
  제출: 'blue',
  승인: 'grey',
  반려: 'red',
};

/** 이력이 하나 늘 때마다 하루씩 지난 날짜를 쓴다 */
function nextDate(s: ProposalState): string {
  return `03.${String(2 + s.history.length).padStart(2, '0')}`;
}

/**
 * 기획안 상세 — /my/applications/{formRspnsId}.
 * 설명서 «제출부터 결과 확인까지», 상태별 «내가 할 수 있는 일», «재제출에는 임시저장이 없습니다»를 따른다.
 */
export function ProposalDetailMock(): ReactNode {
  const [s, setS] = useState<ProposalState>(INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const resubmit = () => {
    const date = nextDate(s);
    setS({
      status: '제출',
      round: s.round + 1,
      submittedOn: date,
      history: [{status: '제출', date, who: SUBMITTER}, ...s.history],
    });
    setFeedback(
      '고쳐서 다시 냈습니다. 상태가 제출이 되고 처리 이력에 한 줄 더해집니다. 실제로는 지난번에 쓴 답이 채워진 양식을 고쳐 전체를 한 번에 보냅니다. 재제출에는 임시저장이 없어 도중에 창을 닫으면 고친 내용이 사라집니다.',
    );
  };

  const review = (status: ProposalStatus, text: string) => {
    setS({...s, status, history: [{status, date: nextDate(s), who: REVIEWER}, ...s.history]});
    setFeedback(text);
  };

  return (
    <MockFrame
      caption="기획안 상세 — /my/applications/{formRspnsId}"
      hint="«고쳐서 다시 제출»을 누른 뒤, 아래 점선 띠에서 국장의 처리를 골라 보세요."
      feedback={feedback}
      onReset={() => {
        setS(INITIAL);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            disabled={s.status !== '제출'}
            onClick={() =>
              review(
                '승인',
                '국장이 승인했습니다. 끝났습니다. 활동이 만들어지고 제출자가 스터디장이 됩니다. 다음에 학술 앱에 들어오면 첫 화면이 대시보드로 바뀌고 메뉴가 늘어나 있습니다.',
              )
            }>
            국장이 «승인»
          </button>
          <button
            type="button"
            disabled={s.status !== '제출'}
            onClick={() => review('반려', '국장이 반려했습니다. 끝났습니다. 이 기획안은 다시 낼 수 없습니다.')}>
            국장이 «반려»
          </button>
          <button
            type="button"
            disabled={s.status !== '제출'}
            onClick={() =>
              review(
                '수정요청',
                '국장이 다시 수정요청했습니다. 요청 사유가 화면 위에 먼저 나오고, 지난번에 쓴 답이 그대로 채워진 상태에서 다시 고쳐 냅니다.',
              )
            }>
            국장이 다시 «수정요청»
          </button>
        </>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 520, margin: '0 auto'}}>
      <div className="mk-card">
        <div style={{display: 'flex', gap: 6, alignItems: 'center', marginBottom: 9}}>
          <Badge tone={TONE[s.status]}>{s.status}</Badge>
          <span style={{fontSize: 12, color: 'var(--app-n500)'}}>
            {s.submittedOn} 제출 · {s.round}회차
          </span>
        </div>
        <div style={{fontSize: 17, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 12}}>알고리즘 문제풀이 스터디</div>

        {s.status === '수정요청' && (
          <div
            style={{
              borderLeft: '3px solid var(--app-amber)',
              background: 'var(--app-amber-soft)',
              borderRadius: '0 10px 10px 0',
              padding: '11px 13px',
              marginBottom: 14,
            }}>
            <div style={{fontSize: 11.5, fontWeight: 700, color: 'var(--app-amber)', marginBottom: 5}}>국장이 요청한 수정 사항</div>
            <div style={{fontSize: 12.5, color: 'var(--app-amber)', lineHeight: 1.75}}>
              커리큘럼을 «1회차: 제목» 형식으로 한 줄에 하나씩 적어주세요. 지금 형식으로는 회차를 나눠 등록할 수 없습니다.
            </div>
          </div>
        )}

        <div className="mk-section-label">처리 이력</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14}}>
          {s.history.map((h, i) => (
            <div
              key={`${h.status}-${h.date}`}
              className={i === 0 && s.history.length > INITIAL.history.length ? 'gm-flash' : undefined}
              style={{display: 'flex', gap: 8, alignItems: 'flex-start', borderRadius: 6}}>
              <Badge tone={TONE[h.status]}>{h.status}</Badge>
              <div style={{fontSize: 12, color: 'var(--app-n400)'}}>
                {h.date} · {h.who}
              </div>
            </div>
          ))}
        </div>

        {s.status === '수정요청' && (
          <Btn variant="primary" style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12}} onClick={resubmit}>
            고쳐서 다시 제출
          </Btn>
        )}
      </div>
    </MockFrame>
  );
}
