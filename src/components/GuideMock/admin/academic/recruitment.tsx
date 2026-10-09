import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '../..';

type Pick = '확정' | '대기' | '미선택';
const PICKS: Pick[] = ['확정', '대기', '미선택'];

type Applicant = {name: string; at: string};

type Activity = {
  id: 'algo' | 'web';
  title: string;
  leader: string;
  min: number;
  max: number;
  /** 모집을 시작했는가(신청서가 열려 있는가) */
  started: boolean;
  /** 신청서에 문항이 있는가. 기획안 승인이 만들어 준 폼은 비어 있다 */
  hasQuestions: boolean;
  applicants: Applicant[];
  /** 선발 저장으로 반영된 선발 */
  saved: Pick[];
  /** 칩으로 고르는 중인 선발. «선발 저장»을 눌러야 saved로 간다 */
  draft: Pick[];
};

const ALGO_APPLICANTS: [string, string, Pick][] = [
  ['이영희', '03.05 14:22', '확정'],
  ['박민수', '03.05 18:40', '대기'],
  ['최지우', '03.06 09:15', '확정'],
  ['정다은', '03.06 12:30', '확정'],
  ['윤서준', '03.06 21:05', '확정'],
  ['한도윤', '03.07 10:48', '확정'],
  ['오세린', '03.07 16:20', '확정'],
  ['강예준', '03.08 11:02', '확정'],
  ['김철수', '03.08 19:37', '미선택'],
];

const INITIAL: Activity[] = [
  {
    id: 'algo',
    title: '알고리즘 문제풀이 스터디',
    leader: '홍길동',
    min: 6,
    max: 10,
    started: true,
    hasQuestions: true,
    applicants: ALGO_APPLICANTS.map(([name, at]) => ({name, at})),
    saved: ALGO_APPLICANTS.map(([, , pick]) => pick),
    draft: ALGO_APPLICANTS.map(([, , pick]) => pick),
  },
  {
    id: 'web',
    title: '웹 서비스 사이드프로젝트',
    leader: '김철수',
    min: 2,
    max: 4,
    started: false,
    hasQuestions: false,
    applicants: [],
    saved: [],
    draft: [],
  },
];

/** 모집을 시작한 뒤 «회원이 신청서를 냄»으로 차례로 들어오는 신청자 */
const APPLY_POOL = ['이영희', '박민수', '최지우', '정다은', '윤서준', '한도윤', '오세린', '강예준', '홍길동'];

const NO_QUESTIONS = '폼 편집 화면에서 문항을 먼저 등록하세요';

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

const confirmed = (picks: Pick[]) => picks.filter((p) => p === '확정').length;

/**
 * 모집 관리 — /academic-programs/recruitment.
 * 설명서 «모집을 시작하는 순서»(문항이 없으면 모집 시작이 잠김, 확정 · 대기 · 미선택 후 선발 저장)와 «정원을 넘겨도 선발 저장은 잠기지 않습니다»를 따른다.
 */
export function RecruitmentMock(): ReactNode {
  const [acts, setActs] = useState<Activity[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<Activity['id']>('algo');
  const [feedback, setFeedback] = useState<ReactNode>();

  const sel = acts.find((a) => a.id === selectedId) ?? acts[0];
  const web = acts.find((a) => a.id === 'web') ?? acts[1];
  const savedCount = confirmed(sel.saved);
  const draftCount = confirmed(sel.draft);
  const nextApplicant = APPLY_POOL.find((n) => n !== sel.leader && !sel.applicants.some((a) => a.name === n));

  const update = (id: Activity['id'], patch: Partial<Activity>) => setActs(acts.map((a) => (a.id === id ? {...a, ...patch} : a)));

  const select = (a: Activity) => {
    setSelectedId(a.id);
    if (!a.started && !a.hasQuestions) {
      setFeedback('모집 시작 전인 활동입니다. 기획안 승인이 만들어 준 신청서는 문항이 비어 있어 «모집 시작»이 잠겨 있습니다.');
    } else if (!a.started) {
      setFeedback('문항이 채워졌습니다. 이제 «모집 시작»을 누를 수 있습니다.');
    } else {
      setFeedback(`«${a.title}»의 모집 현황입니다.`);
    }
  };

  const editQuestions = () => {
    if (!sel.hasQuestions) {
      setFeedback(
        '폼 편집 화면으로 갑니다. 기획안 승인이 만들어 준 폼은 문항이 비어 있습니다. 아래 띠의 «스터디장이 문항을 채움»으로 문항이 채워진 뒤를 볼 수 있습니다.',
      );
      return;
    }
    setFeedback('폼 편집 화면으로 갑니다. 접수 기간은 폼 편집 화면이 아니라 이 모집 관리 화면에서만 설정합니다.');
  };

  const start = () => {
    if (!sel.hasQuestions) {
      setFeedback(`잠겨 있습니다. 문항이 없는 신청서로는 모집을 시작할 수 없어 «${NO_QUESTIONS}»가 표시됩니다. «신청서 문항 편집»으로 문항을 채운 뒤 다시 시작하세요.`);
      return;
    }
    update(sel.id, {started: true});
    setFeedback('«모집 시작»을 눌렀습니다. 활동이 «진행 중»이 되고 신청서가 열립니다. 이때부터 회원이 신청할 수 있습니다. 아래 띠에서 신청서가 들어오게 해 보세요.');
  };

  const fillQuestions = () => {
    update('web', {hasQuestions: true});
    setFeedback(
      selectedId === 'web'
        ? '신청서에 문항이 채워졌습니다. «모집 시작» 잠금이 풀렸습니다.'
        : '«웹 서비스 사이드프로젝트»의 신청서에 문항이 채워졌습니다. 왼쪽에서 그 활동을 골라 «모집 시작»을 눌러 보세요.',
    );
  };

  const apply = () => {
    if (!nextApplicant) return;
    update(sel.id, {
      applicants: [...sel.applicants, {name: nextApplicant, at: '방금'}],
      saved: [...sel.saved, '미선택'],
      draft: [...sel.draft, '미선택'],
    });
    setFeedback(`${nextApplicant} 님이 신청서를 냈습니다. 신청자 ${sel.applicants.length + 1}명. 선발 칸에서 확정 · 대기 · 미선택을 골라 보세요.`);
  };

  const choose = (i: number, pick: Pick) => {
    const draft = sel.draft.map((p, j) => (j === i ? pick : p));
    update(sel.id, {draft});
    const n = confirmed(draft);
    setFeedback(
      `${sel.applicants[i].name} 님의 «${pick}» 칩을 켰습니다. 지금 고른 확정 ${n}명. «선발 저장»을 눌러야 반영됩니다.` +
        (n > sel.max ? ` 모집 정원 상한(${sel.max}명)을 넘었지만 «선발 저장»은 잠기지 않습니다.` : ''),
    );
  };

  const save = () => {
    update(sel.id, {saved: sel.draft});
    setFeedback(
      `선발을 저장했습니다. 확정 인원 ${draftCount}명 — 확정한 사람이 팀원 명단에 들어갑니다. 언제든 다시 고쳐 저장할 수 있습니다.` +
        (draftCount > sel.max ? ` 모집 정원 상한(${sel.max}명)을 넘었지만 저장은 막히지 않고 경고 문구만 뜹니다.` : ''),
    );
  };

  // 옛 그림은 1.2fr 1.6fr 1.5fr였는데, 문서 폭에서는 칩 셋이 선발 칸을 넘쳐 선발 칸을 넓혔다.
  const cols = '1fr 1.1fr 2.1fr';
  const smallBtn = {padding: '5px 10px', fontSize: 12};

  return (
    <MockFrame
      caption="모집 관리 — /academic-programs/recruitment"
      hint="신청자마다 «확정 · 대기 · 미선택»을 고르고 «선발 저장»을 눌러 보세요. «웹 서비스 사이드프로젝트»는 아래 띠로 문항을 채우고 모집을 시작해 신청자를 받아 볼 수 있습니다."
      feedback={feedback}
      onReset={() => {
        setActs(INITIAL);
        setSelectedId('algo');
        setFeedback(undefined);
      }}
      demo={
        <>
          <button type="button" onClick={fillQuestions} disabled={web.hasQuestions}>
            스터디장이 문항을 채움
          </button>
          <button type="button" onClick={apply} disabled={!sel.started || !nextApplicant}>
            회원이 신청서를 냄
          </button>
        </>
      }>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 14}}>
        <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 14px', borderBottom: '1px solid var(--app-line)'}}>
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)'}}>모집 관리</div>
            <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 2}}>승인된 활동의 모집을 시작하고 신청자를 선발합니다</div>
          </div>
          {acts.map((a) => (
            <button
              key={a.id}
              type="button"
              className="gm-plain gm-pick mk-row"
              aria-pressed={a.id === sel.id}
              style={rowStyle(a.id === sel.id)}
              onClick={() => select(a)}>
              <div>
                {a.started && (
                  <div style={{display: 'flex', gap: 5, marginBottom: 5}}>
                    <Badge tone="blue">모집 중</Badge>
                  </div>
                )}
                <div style={{fontSize: 13.5, fontWeight: 600, color: 'var(--app-ink)'}}>{a.title}</div>
                <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 3}}>
                  스터디장 {a.leader}
                  {!a.started && ' · 모집 시작 전'}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mk-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10}}>
            <div>
              <div style={{fontSize: 17, fontWeight: 600, color: 'var(--app-ink)'}}>{sel.title}</div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 3}}>
                모집 정원 {sel.min} ~ {sel.max}명 · 확정 인원 {savedCount}명
              </div>
            </div>
            <div style={{display: 'flex', gap: 6}}>
              <Btn variant="ghost" style={smallBtn} onClick={editQuestions}>
                신청서 문항 편집
              </Btn>
              {!sel.started && (
                <Btn variant="primary" style={smallBtn} locked={!sel.hasQuestions} title={sel.hasQuestions ? undefined : NO_QUESTIONS} onClick={start}>
                  모집 시작
                </Btn>
              )}
            </div>
          </div>

          {!sel.started && !sel.hasQuestions && (
            <div
              style={{
                borderRadius: 10,
                background: 'var(--app-amber-soft)',
                color: 'var(--app-amber)',
                fontSize: 12,
                padding: '8px 11px',
                marginBottom: 12,
              }}>
              {NO_QUESTIONS}
            </div>
          )}

          <div className="mk-section-label">신청자 {sel.applicants.length}명</div>
          {sel.started ? (
            <>
              <div className="mk-row mk-th" style={{gridTemplateColumns: cols}}>
                <span>신청자</span>
                <span>제출</span>
                <span>선발</span>
              </div>
              {sel.applicants.map((a, i) => (
                <div key={a.name} className="mk-row" style={{gridTemplateColumns: cols}}>
                  <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{a.name}</span>
                  <span style={{fontSize: 12}}>{a.at}</span>
                  <span style={{display: 'flex', gap: 4}}>
                    {PICKS.map((p) => (
                      <Chip key={p} active={sel.draft[i] === p} onClick={() => choose(i, p)}>
                        {p}
                      </Chip>
                    ))}
                  </span>
                </div>
              ))}
              {sel.applicants.length === 0 && (
                <div className="mk-row" style={{gridTemplateColumns: '1fr', fontSize: 12.5, color: 'var(--app-n500)'}}>
                  아직 신청자가 없습니다.
                </div>
              )}
              <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginTop: 12}}>
                {draftCount > sel.max && (
                  <span style={{fontSize: 12, color: 'var(--app-amber)'}}>
                    확정 {draftCount}명 — 모집 정원 상한({sel.max}명)을 넘습니다
                  </span>
                )}
                <Btn variant="primary" onClick={save}>
                  선발 저장
                </Btn>
              </div>
            </>
          ) : (
            <div style={{fontSize: 12.5, color: 'var(--app-n500)'}}>모집을 시작하면 회원이 신청할 수 있습니다.</div>
          )}
        </div>
      </div>
    </MockFrame>
  );
}
