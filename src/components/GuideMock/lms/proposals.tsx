import {useState, type ReactNode} from 'react';
import {Badge, Btn, FileRow, formatFileSize, MockFrame} from '..';

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

/* ============ 첨부 자료 ============ */

type Attachment = {id: number; name: string; size: number; uploadedAt: string};
type Stage = '작성 중' | '제출' | '수정요청';

const MB = 1024 * 1024;
const MAX_COUNT = 5;
const MAX_TOTAL = 20 * MB;

const PRIVACY_NOTE = '승인되면 이 프로그램에 지원하는 회원 누구나 내려받을 수 있습니다. 연락처·학번 같은 개인정보는 넣지 마세요.';

const FIRST: Attachment[] = [{id: 1, name: '커리큘럼_상세.pdf', size: Math.round(1.2 * MB), uploadedAt: '2026-03-02 14:05'}];

// «+ 파일 올리기»를 누를 때마다 차례로 고르는 예시 파일. 셋째에서 합계 상한에, 다 올린 뒤에는 개수 상한에 걸리도록 크기를 골랐다.
const PICKS: {name: string; size: number}[] = [
  {name: '발표자료_1주차.pdf', size: Math.round(3.4 * MB)},
  {name: '예제_데이터셋.pdf', size: Math.round(9.8 * MB)},
  {name: '부록_실습자료.pdf', size: Math.round(7.5 * MB)},
  {name: '참고문헌.md', size: 12 * 1024},
  {name: '스터디_규칙.txt', size: 4 * 1024},
];

/** 서버 문장의 «남은 용량» 표기. 0.1MB 단위에서 내린다 — 부풀려 말하면 그 크기로 다시 골라도 막힌다 */
function floorMb(bytes: number): string {
  const tenths = Math.floor((bytes * 10) / MB);
  const whole = Math.floor(tenths / 10);
  return tenths % 10 === 0 ? `${whole}MB` : `${whole}.${tenths % 10}MB`;
}

/**
 * 첨부 자료 카드 — 기획안 작성 마지막 페이지, 제출 뒤 상세, 수정요청 뒤 재제출 양식.
 * 설명서 «첨부 자료 붙이기»(형식과 상한, 올리고 지울 수 있는 때, 지우면 바로 사라짐, 막히는 경우의 문구)를 따른다.
 */
export function ProposalAttachmentsMock(): ReactNode {
  const [stage, setStage] = useState<Stage>('작성 중');
  const [files, setFiles] = useState<Attachment[]>(FIRST);
  const [pick, setPick] = useState(0);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<ReactNode>();

  const editable = stage !== '제출';
  const total = files.reduce((sum, f) => sum + f.size, 0);

  const upload = () => {
    if (files.length >= MAX_COUNT) {
      setError(`첨부 자료는 ${MAX_COUNT}개까지 올릴 수 있습니다.`);
      setFeedback('개수 상한에 걸렸습니다. 문구는 서버가 정한 그대로 카드 아래에 뜹니다. 하나를 지우면 다시 올릴 수 있습니다.');
      return;
    }
    const next = PICKS[pick % PICKS.length];
    setPick(pick + 1);
    const remaining = MAX_TOTAL - total;
    if (next.size > remaining) {
      setError(`첨부 자료는 합계 20MB까지 올릴 수 있습니다. 남은 용량은 ${floorMb(remaining)}입니다.`);
      setFeedback(`«${next.name}»(${formatFileSize(next.size)})는 남은 용량보다 커서 올라가지 않았습니다. 문구에 남은 용량이 함께 적히므로 무엇을 지울지 고를 수 있습니다.`);
      return;
    }
    setFiles([...files, {id: Date.now(), name: next.name, size: next.size, uploadedAt: '2026-03-02 14:20'}]);
    setError('');
    setFeedback(`«${next.name}»를 올렸습니다. «제출하기»를 누르지 않아도 올린 순간 저장됩니다.`);
  };

  const remove = (f: Attachment) => {
    setFiles(files.filter((x) => x.id !== f.id));
    setError('');
    setFeedback(`«${f.name}»를 지웠습니다. 확인 창 없이 바로 사라지고, 되살리려면 다시 올려야 합니다.`);
  };

  const download = (f: Attachment) =>
    setFeedback(`«${f.name}»를 내려받습니다. 화면 안에서 열어 보는 미리보기는 없습니다.`);

  return (
    <MockFrame
      caption={
        stage === '제출'
          ? '첨부 자료 — 제출한 기획안 상세 /my/applications/{formRspnsId} (읽기 전용)'
          : stage === '수정요청'
            ? '첨부 자료 — 수정요청을 받은 기획안의 재제출 양식, 마지막 페이지'
            : '첨부 자료 — 기획안 제출 /proposals/new, 마지막 페이지'
      }
      hint="«+ 파일 올리기»를 여러 번 눌러 상한에 걸려 보고, «지우기»와 «제출하기»도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setStage('작성 중');
        setFiles(FIRST);
        setPick(0);
        setError('');
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          disabled={stage !== '제출'}
          onClick={() => {
            setStage('수정요청');
            setError('');
            setFeedback('국장이 수정요청했습니다. 재제출 양식 마지막 페이지의 같은 카드에서 다시 올리고 지울 수 있습니다. 상세 화면의 읽기 전용 목록은 이때 사라집니다.');
          }}>
          국장이 «수정요청»
        </button>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 520, margin: '0 auto'}}>
      <div className="mk-card">
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8}}>
          <div style={{fontSize: 12.5, color: 'var(--app-n400)'}}>첨부 자료</div>
          <div style={{flex: 1}} />
          {editable && (
            <div style={{fontSize: 12, color: 'var(--app-n500)'}}>
              사용 {formatFileSize(total)} / 20MB
            </div>
          )}
        </div>

        {editable && (
          <>
            <p style={{fontSize: 12.5, color: 'var(--app-n500)', margin: '0 0 6px'}}>pdf·txt·md 파일을 5개까지, 합계 20MB까지 올릴 수 있습니다.</p>
            <p
              style={{
                fontSize: 12.5,
                lineHeight: 1.7,
                margin: '0 0 8px',
                padding: '7px 11px',
                borderRadius: 10,
                background: 'var(--app-amber-soft)',
                color: 'var(--app-amber)',
              }}>
              {PRIVACY_NOTE}
            </p>
          </>
        )}

        {files.length === 0 && (
          <div style={{fontSize: 13, color: 'var(--app-n500)', padding: '6px 0'}}>{editable ? '아직 올린 파일이 없습니다.' : '첨부 자료 없음'}</div>
        )}
        {files.map((f) => (
          <FileRow
            key={f.id}
            name={f.name}
            size={f.size}
            uploadedAt={f.uploadedAt}
            onDownload={() => download(f)}
            onRemove={editable ? () => remove(f) : undefined}
          />
        ))}

        {editable && (
          <Btn variant="ghost" style={{marginTop: 10, fontSize: 13}} onClick={upload}>
            + 파일 올리기
          </Btn>
        )}
        {error && <p style={{fontSize: 12, color: 'var(--app-danger)', margin: '8px 0 0'}}>{error}</p>}
      </div>

      {editable && (
        <Btn
          variant="primary"
          style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12, marginTop: 12}}
          onClick={() => {
            setStage('제출');
            setError('');
            setFeedback(
              stage === '수정요청'
                ? '다시 냈습니다. 첨부 자료는 다시 읽기 전용이 되고, 상세 화면에서 내려받기만 됩니다.'
                : '제출했습니다. 이제 첨부 자료는 읽기 전용입니다. 상세 화면에서 내려받기만 되고, 국장이 수정요청을 보내야 다시 고칠 수 있습니다. 아래 띠를 눌러 보세요.',
            );
          }}>
          {stage === '수정요청' ? '다시 제출하기' : '제출하기'}
        </Btn>
      )}
    </MockFrame>
  );
}
