import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Btn, MockFrame, Progress} from '../..';

/* ============ 업무 목록 ============ */

type WorkCard = {
  status: string;
  statusTone: 'blue' | 'amber';
  kind: string;
  subCount: number;
  title: string;
  owner: string;
  period: string;
  progress: number;
};

const WORK_CARDS: WorkCard[] = [
  {status: '진행', statusTone: 'blue', kind: '행사', subCount: 6, title: '2026 동아리 박람회', owner: '홍길동', period: '8/10 ~ 8/22', progress: 64},
  {status: '검토', statusTone: 'amber', kind: '상시', subCount: 3, title: '2026 상반기 회계 정산', owner: '이영희', period: '7/01 ~ 8/31', progress: 88},
];

/** 업무 목록 — /operations/works. 설명서 «카드를 누르면 해당 업무의 하위 업무를 확인할 수 있습니다»를 따른다 */
export function WorkListMock(): ReactNode {
  const [opened, setOpened] = useState<string>();

  return (
    <MockFrame
      caption="업무 목록 — /operations/works"
      hint="업무 카드를 눌러 보세요."
      feedback={
        opened
          ? `«${opened}» 업무 상세로 들어갑니다. 이 업무에 딸린 하위 업무 ${WORK_CARDS.find((c) => c.title === opened)?.subCount}건의 진행 현황을 볼 수 있습니다.`
          : undefined
      }
      onReset={() => setOpened(undefined)}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {WORK_CARDS.map((c) => (
          <button
            key={c.title}
            type="button"
            className="gm-plain mk-card"
            aria-pressed={opened === c.title}
            style={{
              display: 'block',
              width: '100%',
              padding: 16,
              background: 'var(--app-surface)',
              boxShadow: opened === c.title ? '0 0 0 2px var(--app-accent)' : undefined,
            }}
            onClick={() => setOpened(c.title)}>
            <span style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
              <span style={{display: 'flex', gap: 6}}>
                <Badge tone={c.statusTone}>{c.status}</Badge>
                <Badge tone="grey">{c.kind}</Badge>
              </span>
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>하위 업무 {c.subCount}건</span>
            </span>
            <span style={{display: 'block', fontSize: 17, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 4}}>{c.title}</span>
            <span style={{display: 'block', fontSize: 12.5, color: 'var(--app-n500)', marginBottom: 10}}>
              담당 {c.owner} · {c.period}
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <Progress value={c.progress} />
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{c.progress}%</span>
            </span>
          </button>
        ))}
      </div>
    </MockFrame>
  );
}

/* ============ 업무 상세 ============ */

const DETAIL_SUBS = [
  {name: '부스 배치도 기획', owner: '홍길동', tone: 'outline', status: '기획', progress: '0%'},
  {name: '홍보물 제작', owner: '김철수', tone: 'blue', status: '진행', progress: '40%'},
  {name: '부스 예산 신청', owner: '이영희', tone: 'amber', status: '승인 대기', progress: '100%'},
] as const;

/** 업무 상세 — /operations/works/{id}. «수정»을 누르면 설명서 «업무 수정에서 바꿀 수 있는 것» 표를 짚어 준다 */
export function WorkDetailMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  return (
    <MockFrame
      caption="업무 상세 — /operations/works/{id}"
      hint="오른쪽 위 «수정»을 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 14}}>
        <div className="mk-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
            <div style={{display: 'flex', gap: 6}}>
              <Badge tone="blue">진행</Badge>
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>행사</span>
            </div>
            <Btn
              variant="ghost"
              style={{padding: '5px 10px', fontSize: 12}}
              onClick={() =>
                setFeedback(
                  '업무 수정 화면으로 갑니다. 운영 제목·우선순위·기간, 업무 유형·총평, 담당자를 바꿀 수 있습니다. 선택 입력란도 비워 두면 지워진 것으로 저장되니 저장 전 채워진 값을 한 번 더 확인하세요.',
                )
              }>
              수정
            </Btn>
          </div>
          <div style={{fontSize: 19, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 8}}>2026 동아리 박람회</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14}}>
            <Progress value={64} />
            <span style={{fontSize: 12, color: 'var(--app-n500)'}}>64%</span>
          </div>
          <div className="mk-section-label">상위 속성 · oper</div>
          <dl className="mk-kv" style={{marginBottom: 14}}>
            <dt>유형</dt>
            <dd>행사</dd>
            <dt>담당자</dt>
            <dd>홍길동</dd>
            <dt>기간</dt>
            <dd>08.10 ~ 08.22</dd>
          </dl>
          <div className="mk-section-label">확장 속성 · work</div>
          <dl className="mk-kv">
            <dt>업무상태</dt>
            <dd>진행</dd>
            <dt>진행률</dt>
            <dd>64%</dd>
          </dl>
        </div>
        <div className="mk-card">
          <div className="mk-section-label">하위 업무 6건</div>
          {DETAIL_SUBS.map((r) => (
            <div key={r.name} className="mk-row" style={{gridTemplateColumns: '2fr 1fr 1fr 1fr'}}>
              <span style={{color: 'var(--app-ink)'}}>{r.name}</span>
              <span>{r.owner}</span>
              <span>
                <Badge tone={r.tone}>{r.status}</Badge>
              </span>
              <span>{r.progress}</span>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 담당자 선택 ============ */

type Candidate = {name: string; gen: string; role: string};

/** 지금 저장된 담당자. 데모 띠에서 «탈퇴함»을 누르면 후보에서 빠진다 */
const CURRENT: Candidate = {name: '이영희', gen: '15기', role: '부회장'};

/** 업무 담당자 후보. 업무는 업무 관리 권한이 있는 사람(국장 이상)만 오른다. 김철수 둘은 기수로 가리는 동명이인 예시 */
const CANDIDATES: Candidate[] = [
  {name: '홍길동', gen: '15기', role: '회장'},
  CURRENT,
  {name: '김철수', gen: '16기', role: '국장'},
  {name: '김철수', gen: '17기', role: '국장'},
  {name: '박민수', gen: '16기', role: '국장'},
];

const label = (c: Candidate) => `${c.name} · ${c.gen} · ${c.role}`;

const OPTION: CSSProperties = {display: 'block', width: '100%', padding: '7px 10px'};
/** gm-plain이 gm-selected의 바탕과 줄을 지우므로 고른 줄은 인라인으로 칠한다 */
const SELECTED: CSSProperties = {background: 'var(--app-accent-soft)', boxShadow: 'inset 2px 0 0 var(--app-accent)'};

/**
 * 담당자 선택 — 업무·하위 업무 수정 화면.
 * 설명서 «목록 아래 안내» 표의 세 문구(비움, 다른 회원 선택, 현재 담당자가 후보에서 빠짐)를 그대로 보여 준다.
 */
export function AssigneePickerMock(): ReactNode {
  // 옛 그림처럼 «홍길동 · 15기 · 회장»을 고른 상태에서 시작한다. null은 비운 상태
  const [picked, setPicked] = useState<Candidate | null>(CANDIDATES[0]);
  const [open, setOpen] = useState(false);
  const [left, setLeft] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();

  const options = left ? CANDIDATES.filter((c) => c !== CURRENT) : CANDIDATES;

  const message = picked
    ? '선택한 회원이 담당자로 저장됩니다'
    : left
      ? '현재 담당자는 이제 지정할 수 없는 회원입니다 — 다른 회원으로 바꿔주세요'
      : '비우면 현재 담당자 그대로입니다';

  const choose = (c: Candidate | null) => {
    setPicked(c);
    setOpen(false);
    if (c) {
      setFeedback(`«${label(c)}»을 골랐습니다. 저장하면 이 회원이 담당자가 됩니다.`);
    } else if (left) {
      setFeedback(`비웠습니다. 현재 담당자(${CURRENT.name})가 후보에서 빠졌으므로 다른 회원으로 바꿔야 저장됩니다.`);
    } else {
      setFeedback(`비웠습니다. 새 담당자를 고르지 않았으니 저장해도 담당자는 지금 그대로(${CURRENT.name})입니다.`);
    }
  };

  return (
    <MockFrame
      caption="담당자 선택 — 업무·하위 업무 수정 화면"
      hint="목록을 펼쳐 다른 회원을 고르거나 비워 보고, 아래 띠의 «탈퇴함»도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setPicked(CANDIDATES[0]);
        setOpen(false);
        setLeft(false);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          disabled={left}
          onClick={() => {
            setLeft(true);
            setPicked(null);
            setOpen(false);
            setFeedback(
              `현재 담당자(${CURRENT.name})가 탈퇴해 후보에서 빠졌습니다. 목록 맨 위에 «현재: ${CURRENT.name}»로 남아 누구였는지는 알 수 있지만, 다른 회원으로 바꿔야 저장됩니다.`,
            );
          }}>
          현재 담당자({CURRENT.name})가 탈퇴함
        </button>
      }
      innerStyle={{maxWidth: 420, minWidth: 'auto'}}>
      <div className="mk-card">
        <div className="mk-section-label">
          담당자 <span style={{color: 'var(--app-danger)'}}>*</span>
        </div>
        <button
          type="button"
          className="gm-plain"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            if (!open) {
              setFeedback(
                '펼쳐 고르는 목록입니다. 이름 옆의 기수와 역할로 동명이인을 가립니다. 업무는 업무 관리 권한이 있는 사람(국장 이상)만 후보에 오릅니다.',
              );
            }
          }}
          style={{
            width: '100%',
            border: '1px solid var(--app-line-strong)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 13,
            color: picked ? 'var(--app-ink)' : 'var(--app-n500)',
            background: 'var(--app-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <span>{picked ? label(picked) : left ? `현재: ${CURRENT.name}` : '—'}</span>
          <span style={{color: 'var(--app-n500)', fontSize: 11}}>▾</span>
        </button>
        {open && (
          <div
            role="listbox"
            style={{
              marginTop: 4,
              border: '1px solid var(--app-line-strong)',
              borderRadius: 8,
              background: 'var(--app-surface)',
              overflow: 'hidden',
              fontSize: 13,
            }}>
            {left && (
              <div style={{padding: '7px 10px', color: 'var(--app-n500)', borderBottom: '1px solid var(--app-line)'}}>
                현재: {CURRENT.name}
              </div>
            )}
            <button
              type="button"
              role="option"
              aria-selected={picked === null}
              className="gm-plain gm-pick"
              style={{...OPTION, color: 'var(--app-n500)', ...(picked === null ? SELECTED : undefined)}}
              onClick={() => choose(null)}>
              비우기
            </button>
            {options.map((c) => (
              <button
                key={label(c)}
                type="button"
                role="option"
                aria-selected={picked === c}
                className="gm-plain gm-pick"
                style={{...OPTION, color: 'var(--app-ink)', ...(picked === c ? SELECTED : undefined)}}
                onClick={() => choose(c)}>
                {label(c)}
              </button>
            ))}
          </div>
        )}
        <div
          style={{
            fontSize: 12,
            color: !picked && left ? 'var(--app-danger)' : 'var(--app-n500)',
            marginTop: 5,
          }}>
          {message}
        </div>
      </div>
    </MockFrame>
  );
}
