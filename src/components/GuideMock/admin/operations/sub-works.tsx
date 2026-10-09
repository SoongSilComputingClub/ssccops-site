import {useState, type ReactNode} from 'react';
import {Badge, Btn, Check, Chip, MockFrame, Progress} from '../..';

/* ============ 하위 업무 목록 ============ */

type ListRow = {
  name: string;
  parent: string;
  type: string;
  owner: string;
  due: string;
  status: '진행' | '승인대기' | '완료';
  progress: number;
  /** 마감 칩으로 거를 때 쓴다 */
  dueFlag?: '마감임박' | '지연';
};

const LIST_ROWS: ListRow[] = [
  {name: '부스 예산 신청', parent: '박람회', type: '예산지출', owner: '홍길동', due: '8/18', status: '승인대기', progress: 100, dueFlag: '마감임박'},
  {name: '홍보물 제작', parent: '박람회', type: '제작', owner: '김철수', due: '8/20', status: '진행', progress: 40, dueFlag: '마감임박'},
  {name: '현수막 주문', parent: '박람회', type: '외부협조', owner: '이영희', due: '8/12', status: '진행', progress: 60, dueFlag: '지연'},
  {name: '부스 배치도 기획', parent: '박람회', type: '기획', owner: '홍길동', due: '8/10', status: '완료', progress: 100},
];

const LIST_CHIPS = ['전체', '진행', '승인대기', '마감임박', '지연', '완료'] as const;

/** 하위 업무 목록 — /operations/sub-works. 칩을 눌러 상태별로 걸러 본다 */
export function SubWorkListMock(): ReactNode {
  const [chip, setChip] = useState<(typeof LIST_CHIPS)[number]>('전체');
  const rows = LIST_ROWS.filter((r) => {
    if (chip === '전체') return true;
    if (chip === '마감임박' || chip === '지연') return r.dueFlag === chip && r.status !== '완료';
    return r.status === chip;
  });
  const cols = '1.4fr .9fr .8fr .9fr .8fr .8fr 1fr';

  return (
    <MockFrame
      caption="하위 업무 목록 — /operations/sub-works"
      hint="위쪽 칩을 눌러 상태별로 걸러 보세요."
      feedback={chip === '전체' ? undefined : `«${chip}» 칩을 켰습니다. ${rows.length}건이 남습니다.`}
      onReset={() => setChip('전체')}>
      <div className="mk-card">
        <div style={{display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap'}}>
          {LIST_CHIPS.map((c) => (
            <Chip key={c} active={chip === c} onClick={() => setChip(c)}>
              {c}
            </Chip>
          ))}
        </div>
        <div className="mk-row mk-th" style={{gridTemplateColumns: cols}}>
          <span>하위 업무</span>
          <span>상위 업무</span>
          <span>유형</span>
          <span>담당자</span>
          <span>마감</span>
          <span>상태</span>
          <span>진행률</span>
        </div>
        {rows.map((r) => (
          <div key={r.name} className="mk-row" style={{gridTemplateColumns: cols}}>
            <span style={{color: 'var(--app-ink)'}}>{r.name}</span>
            <span>
              <Badge tone="grey">{r.parent}</Badge>
            </span>
            <span>
              <Badge tone="blue">{r.type}</Badge>
            </span>
            <span>{r.owner}</span>
            <span>
              {r.due}
              {r.dueFlag === '지연' && r.status !== '완료' && (
                <Badge tone="red" style={{marginLeft: 4}}>
                  지연
                </Badge>
              )}
            </span>
            <span>
              <Badge tone={r.status === '승인대기' ? 'amber' : r.status === '완료' ? 'grey' : 'blue'}>{r.status}</Badge>
            </span>
            <span style={{display: 'flex', gap: 6, alignItems: 'center'}}>
              <Progress value={r.progress} />
              {r.progress}%
            </span>
          </div>
        ))}
        {rows.length === 0 && <div className="mk-row">해당하는 하위 업무가 없습니다.</div>}
      </div>
    </MockFrame>
  );
}

/* ============ 하위 업무 상세 — 단계 진행 ============ */

type Stage = '기획' | '진행' | '검토' | '완료';
type Approval = '—' | '대기' | '승인' | '반려';

const STAGES: Stage[] = ['기획', '진행', '검토', '완료'];
const CHECK_ITEMS = ['견적서 첨부', '승인권자 서명', '정산 영수증 제출'];
const QUORUM = 3;

type DetailState = {
  stage: Stage;
  approval: Approval;
  checks: boolean[];
  votes: number;
};

// 옛 설명서의 그림과 같은 상태(검토 단계 · 정족수 대기)에서 시작한다.
const DETAIL_INITIAL: DetailState = {stage: '검토', approval: '대기', checks: [true, true, false], votes: 2};
const FROM_PLANNING: DetailState = {stage: '기획', approval: '—', checks: [false, false, false], votes: 0};

const STAGE_BADGE: Record<Stage, {tone: 'outline' | 'blue' | 'amber' | 'grey'; label: string}> = {
  기획: {tone: 'outline', label: '기획'},
  진행: {tone: 'blue', label: '진행'},
  검토: {tone: 'amber', label: '승인 대기'},
  완료: {tone: 'grey', label: '완료'},
};

/**
 * 하위 업무 상세 — /operations/sub-works/{id}.
 * 설명서 «단계별 버튼», «승인 버튼과 완료 점검은 서로 다른 조건», 상태 변화 기준의 «완료 승인 버튼이 잠기는 이유»를 따른다.
 */
export function SubWorkDetailMock(): ReactNode {
  const [s, setS] = useState<DetailState>(DETAIL_INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const done = s.checks.filter(Boolean).length;
  const allChecked = done === CHECK_ITEMS.length;
  const quorumMet = s.votes >= QUORUM;
  const stageIndex = STAGES.indexOf(s.stage);

  const toggleCheck = (i: number) => {
    if (s.stage === '완료') {
      setFeedback('완료된 하위 업무입니다. 마지막 단계라 더 바꿀 것이 없습니다.');
      return;
    }
    const checks = s.checks.map((c, j) => (j === i ? !c : c));
    setS({...s, checks});
    const n = checks.filter(Boolean).length;
    setFeedback(`«${CHECK_ITEMS[i]}»을 ${checks[i] ? '체크했습니다' : '체크 해제했습니다'}. 완료 점검 ${n}/${CHECK_ITEMS.length}.`);
  };

  const start = () => {
    setS({...s, stage: '진행'});
    setFeedback('«착수»를 눌렀습니다. 진행 단계가 되고, 이제 «완료 승인 요청» 버튼만 보입니다.');
  };

  const requestApproval = () => {
    if (!allChecked) {
      setFeedback(`잠겨 있습니다. 완료 점검을 전부 체크해야 누를 수 있습니다(지금 ${done}/${CHECK_ITEMS.length}).`);
      return;
    }
    setS({...s, stage: '검토', approval: '대기'});
    setFeedback('«완료 승인 요청»을 눌렀습니다. 검토 단계가 되고 승인_상태가 대기입니다. 승인자에게 승인 요청 알림이 갑니다.');
  };

  const approve = () => {
    if (!allChecked) {
      setFeedback(`잠겨 있습니다. 권한 문제가 아니라 완료 점검이 덜 됐습니다(${done}/${CHECK_ITEMS.length}). 목록을 전부 체크해야 합니다.`);
      return;
    }
    if (!quorumMet) {
      setFeedback(`잠겨 있습니다. 정족수가 모자랍니다(${s.votes}/${QUORUM}). 승인자라도 정족수 전에는 누를 수 없습니다.`);
      return;
    }
    setS({...s, stage: '완료', approval: '승인'});
    setFeedback('«완료 승인»을 눌렀습니다. 완료는 마지막 단계입니다. 정족수를 채워도 완료는 승인자가 누릅니다.');
  };

  const reject = () => {
    setS({...s, stage: '진행', approval: '반려'});
    setFeedback('«반려»를 눌렀습니다. 기획이 아니라 진행으로 돌아갑니다. 담당자가 지적된 부분만 고쳐 다시 완료 승인 요청을 하면 됩니다.');
  };

  const edit = () =>
    setFeedback('수정 화면에서는 하위 업무 유형과 상위 업무를 바꿀 수 없습니다. 등록 시점에 고정됩니다.');

  const vote = () => {
    const votes = Math.min(QUORUM, s.votes + 1);
    setS({...s, votes});
    setFeedback(
      votes >= QUORUM
        ? `정족수 ${votes}/${QUORUM}을 채웠습니다. 완료 점검까지 끝났다면 승인자가 «완료 승인»을 누를 수 있습니다.`
        : `동의 한 표가 늘었습니다(${votes}/${QUORUM}).`,
    );
  };

  const stageButtons = (() => {
    switch (s.stage) {
      case '기획':
        return (
          <Btn variant="primary" style={{padding: '5px 10px', fontSize: 12}} onClick={start}>
            착수
          </Btn>
        );
      case '진행':
        return (
          <Btn
            variant="primary"
            style={{padding: '5px 10px', fontSize: 12}}
            locked={!allChecked}
            title={allChecked ? undefined : '완료 점검을 전부 체크해야 누를 수 있습니다'}
            onClick={requestApproval}>
            완료 승인 요청
          </Btn>
        );
      case '검토':
        return (
          <>
            <Btn variant="ghost-danger" style={{padding: '5px 10px', fontSize: 12}} onClick={reject}>
              반려
            </Btn>
            <Btn
              variant="primary"
              style={{padding: '5px 10px', fontSize: 12}}
              locked={!allChecked || !quorumMet}
              title={!allChecked ? '완료 점검이 덜 됐습니다' : !quorumMet ? '정족수를 채운 뒤에 가능합니다' : undefined}
              onClick={approve}>
              완료 승인
            </Btn>
          </>
        );
      default:
        return null;
    }
  })();

  const badge = STAGE_BADGE[s.stage];

  return (
    <MockFrame
      caption="하위 업무 상세 — /operations/sub-works/{id} (검토 단계 · 정족수 대기 예시)"
      hint="완료 점검을 체크하고, 단계 버튼을 눌러 보세요. 잠긴 버튼을 누르면 이유가 나옵니다."
      feedback={feedback}
      onReset={() => {
        setS(DETAIL_INITIAL);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button type="button" onClick={vote} disabled={s.stage !== '검토' || quorumMet}>
            승인함에서 다른 사람이 «동의»를 누름
          </button>
          <button
            type="button"
            onClick={() => {
              setS(FROM_PLANNING);
              setFeedback('기획 단계에서 다시 시작합니다. 등록하면 여기서 시작하고, 보이는 버튼은 «착수» 하나입니다.');
            }}>
            기획 단계부터 다시 보기
          </button>
        </>
      }
      innerStyle={{maxWidth: 720}}>
      <div className="mk-card" style={{marginBottom: 12}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap'}}>
          <div style={{display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6}}>
            <span style={{fontSize: 20, fontWeight: 600, color: 'var(--app-ink)'}}>부스 예산 신청</span>
            <Badge tone="outline">예산지출</Badge>
            <Badge tone={badge.tone}>{badge.label}</Badge>
          </div>
          <div style={{display: 'flex', gap: 6}}>
            <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}} onClick={edit}>
              수정
            </Btn>
            {stageButtons}
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 6, margin: '14px 0'}}>
          {STAGES.map((st, i) => {
            const passed = i < stageIndex || s.stage === '완료';
            const current = i === stageIndex && s.stage !== '완료';
            return (
              <span key={st} style={{display: 'contents'}}>
                {i > 0 && (
                  <span style={{height: 1, flex: 1, background: i <= stageIndex ? 'var(--app-accent-strong)' : 'var(--app-line)'}} />
                )}
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    ...(passed
                      ? {background: 'var(--app-accent-strong)', color: '#fff'}
                      : current
                        ? {background: 'var(--app-accent)', color: '#fff', fontWeight: 600}
                        : {border: '1px solid var(--app-line-strong)', color: 'var(--app-n500)'}),
                  }}>
                  {passed ? '✓' : i + 1}
                </span>
              </span>
            );
          })}
        </div>
        <div style={{fontSize: 12.5, color: 'var(--app-n500)'}}>
          {STAGES.map((st, i) => (
            <span key={st}>
              {i > 0 && ' → '}
              {st === s.stage ? <b style={{color: 'var(--app-ink)'}}>{st}</b> : st}
            </span>
          ))}
        </div>
        {s.stage === '검토' && (
          <div
            style={{
              marginTop: 10,
              padding: '9px 12px',
              background: quorumMet ? 'var(--app-accent-soft)' : 'var(--app-amber-soft)',
              borderRadius: 8,
              fontSize: 12.5,
              color: quorumMet ? 'var(--app-accent-strong)' : 'var(--app-amber)',
            }}>
            {quorumMet
              ? `정족수 ${s.votes}/${QUORUM} 동의`
              : `정족수 ${s.votes}/${QUORUM} 동의 — 완료 승인은 정족수를 채운 뒤에 가능합니다`}
          </div>
        )}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        <div className="mk-card">
          <div className="mk-section-label">확장 속성 · sub_work</div>
          <dl className="mk-kv">
            <dt>유형</dt>
            <dd>예산지출</dd>
            <dt>마감_일시</dt>
            <dd>
              08.18{' '}
              {s.stage !== '완료' && (
                <Badge tone="outline-red" style={{marginLeft: 4}}>
                  D-DAY
                </Badge>
              )}
            </dd>
            <dt>업무_상태</dt>
            <dd>{s.stage}</dd>
            <dt>승인_상태</dt>
            <dd>{s.approval}</dd>
          </dl>
        </div>
        <div className="mk-card">
          <div className="mk-section-label">
            완료 점검 목록 · {done}/{CHECK_ITEMS.length} 완료
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--app-ink)'}}>
            {CHECK_ITEMS.map((item, i) => (
              <Check key={item} on={s.checks[i]} label={item} onToggle={() => toggleCheck(i)} />
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 첨부 절 ============ */

type Attachment = {name: string; meta: string};

const INITIAL_FILES: Attachment[] = [
  {name: '2026-2_예산_견적서.xlsx', meta: '86KB · 홍길동 · 2026-09-18 14:20'},
  {name: '부스_배치도.png', meta: '1.2MB · 홍길동 · 2026-09-18 14:22'},
];

const SAMPLE_UPLOADS: {name: string; ok: boolean; reason?: string; meta?: string}[] = [
  {name: '발표자료.pptx', ok: true, meta: '3.4MB · 홍길동 · 방금'},
  {name: '행사_영상.mp4', ok: false, reason: '첨부할 수 없는 형식입니다'},
  {name: '사진_원본.zip', ok: false, reason: '파일이 25MB를 넘습니다'},
];

/** 첨부 절 — 업무·하위 업무·회의 상세. 올리기, 내려받기, 지우기 */
export function AttachmentMock(): ReactNode {
  const [files, setFiles] = useState<Attachment[]>(INITIAL_FILES);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const upload = () => {
    const sample = SAMPLE_UPLOADS[uploadIndex % SAMPLE_UPLOADS.length];
    setUploadIndex(uploadIndex + 1);
    if (!sample.ok) {
      setFeedback(`«${sample.name}»을 골랐습니다. «${sample.reason}»가 뜨고 올라가지 않습니다. 결과물 링크는 «외부 URL»에 적습니다.`);
      return;
    }
    if (files.some((f) => f.name === sample.name)) {
      setFeedback('한 번에 한 개씩 올립니다. 다른 파일을 올려 보려면 한 번 더 누르세요.');
      return;
    }
    setFiles([...files, {name: sample.name, meta: sample.meta ?? ''}]);
    setFeedback(`«${sample.name}»을 올렸습니다. 한 번에 한 개씩입니다.`);
  };

  return (
    <MockFrame
      caption="첨부 절 — 파일 이름을 누르면 내려받습니다"
      hint="«+ 파일 올리기»를 여러 번 눌러 보고, 파일 이름과 «지우기»도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setFiles(INITIAL_FILES);
        setUploadIndex(0);
        setFeedback(undefined);
      }}
      innerStyle={{minWidth: 'auto', maxWidth: 560}}>
      <div className="mk-card">
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div className="mk-section-label" style={{margin: 0}}>
            첨부
          </div>
          <span style={{flex: 1}} />
          <button type="button" className="gm-plain" style={{fontSize: 12, color: 'var(--app-accent)'}} onClick={upload}>
            + 파일 올리기
          </button>
        </div>
        <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 4}}>
          문서·표·발표·압축·이미지, 25MB까지. 결과물 링크는 위 외부 URL에 적습니다.
        </div>
        <div style={{marginTop: 12, display: 'flex', flexDirection: 'column'}}>
          {files.map((f) => (
            <div
              key={f.name}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '9px 0',
                borderTop: '1px solid var(--app-line)',
                fontSize: 13,
              }}>
              <button
                type="button"
                className="gm-plain"
                style={{flex: 1, color: 'var(--app-ink)'}}
                onClick={() => setFeedback(`«${f.name}»을 내려받습니다. 화면을 벗어나지 않고 저장 창만 뜹니다.`)}>
                {f.name}
              </button>
              <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>{f.meta}</span>
              <button
                type="button"
                className="gm-plain"
                style={{fontSize: 11.5, color: 'var(--app-danger)'}}
                onClick={() => {
                  setFiles(files.filter((x) => x.name !== f.name));
                  setFeedback(`«${f.name}»을 지웠습니다. 실제 화면에서는 되돌릴 수 없습니다.`);
                }}>
                지우기
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div style={{padding: '9px 0', borderTop: '1px solid var(--app-line)', fontSize: 12.5, color: 'var(--app-n500)'}}>
              올린 파일이 없습니다.
            </div>
          )}
        </div>
      </div>
    </MockFrame>
  );
}
