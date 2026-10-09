import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '../..';

/* ============ 운영 통합 ============ */

type Kind = '업무' | '하위업무' | '회의';

type OperRow = {kind: Kind; title: string; due: string; owner: string};

const OPER_ROWS: OperRow[] = [
  {kind: '업무', title: '2026 동아리 박람회', due: '8/22 마감', owner: '홍길동'},
  {kind: '하위업무', title: '부스 배치도 기획', due: '8/19 마감', owner: '홍길동'},
  // 칩으로 거르기를 보여 주려고 더한 예시 행
  {kind: '하위업무', title: '홍보물 제작', due: '8/20 마감', owner: '김철수'},
  {kind: '회의', title: '박람회 준비 국장단 회의', due: '8/14', owner: '이영희'},
];

const KIND_TONE: Record<Kind, 'blue' | 'grey' | 'amber'> = {업무: 'blue', 하위업무: 'grey', 회의: 'amber'};

const OPER_CHIPS = ['전체', '업무', '하위업무', '회의'] as const;

const SUMMARY_CARDS = [
  {badge: 'WORK', tone: 'blue', table: 'work', count: '12건'},
  {badge: 'SUB_WORK', tone: 'grey', table: 'sub_work', count: '37건'},
  {badge: 'MEETING', tone: 'amber', table: 'mtg', count: '4건'},
] as const;

/** 운영 통합 — /operations. 업무, 하위 업무, 회의를 한 목록에서 보고 유형 칩으로 거른다 */
export function OperationsOverviewMock(): ReactNode {
  const [chip, setChip] = useState<(typeof OPER_CHIPS)[number]>('전체');
  const rows = OPER_ROWS.filter((r) => chip === '전체' || r.kind === chip);

  return (
    <MockFrame
      caption="운영 통합 — /operations"
      hint="왼쪽 목록 위의 칩을 눌러 유형별로 걸러 보세요."
      feedback={chip === '전체' ? undefined : `«${chip}» 칩을 켰습니다. ${chip} ${rows.length}건만 남습니다.`}
      onReset={() => setChip('전체')}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14}}>
        {SUMMARY_CARDS.map((c) => (
          <div key={c.badge} className="mk-card" style={{padding: 14}}>
            <Badge tone={c.tone}>{c.badge}</Badge>
            <div
              style={{
                fontFamily: 'var(--ifm-font-family-monospace)',
                fontSize: 11,
                color: 'var(--app-n500)',
                margin: '8px 0 4px',
              }}>
              {c.table}
            </div>
            <div style={{fontSize: 20, fontWeight: 600, color: 'var(--app-accent)'}}>{c.count}</div>
          </div>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14}}>
        <div className="mk-card">
          <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
            {OPER_CHIPS.map((c) => (
              <Chip key={c} active={chip === c} onClick={() => setChip(c)}>
                {c}
              </Chip>
            ))}
          </div>
          {rows.map((r) => (
            <div key={r.title} className="mk-row" style={{gridTemplateColumns: 'auto 1fr auto auto', gap: 10}}>
              <Badge tone={KIND_TONE[r.kind]}>{r.kind}</Badge>
              <span style={{color: 'var(--app-ink)'}}>{r.title}</span>
              <span style={{color: 'var(--app-n500)'}}>{r.due}</span>
              <span style={{color: 'var(--app-n500)'}}>{r.owner}</span>
            </div>
          ))}
        </div>
        <div className="mk-card">
          <div className="mk-section-label">상속 구조</div>
          <div style={{fontSize: 13}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <Badge tone="blue" style={{fontSize: 10}}>
                업무
              </Badge>
              <span style={{color: 'var(--app-ink)'}}>동아리 박람회</span>
            </div>
            <div style={{paddingLeft: 16, marginTop: 6, color: 'var(--app-n400)', borderLeft: '1px solid var(--app-line)'}}>
              └ 부스 배치도 기획
            </div>
            <div style={{paddingLeft: 16, color: 'var(--app-n400)', borderLeft: '1px solid var(--app-line)'}}>└ 홍보물 제작</div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 하위 업무 등록 ============ */

type SubWorkType = '기획' | '예산지출' | '외부협조';
type Priority = '낮음' | '보통' | '높음';

const TYPES: SubWorkType[] = ['기획', '예산지출', '외부협조'];
const PRIORITIES: Priority[] = ['낮음', '보통', '높음'];

/**
 * 유형을 고르면 뜨는 규칙 요약. 유형에서 그대로 복사되는 값이다.
 * «기획»은 옛 설명서 그림 그대로이고, «예산지출»과 «외부협조»는 요약이 유형마다 달라지는 것을 보여 주려는 예시 값이다
 * (승인함 예시의 정족수 3인 카드, 정족수 없는 카드에 맞췄다).
 */
const TYPE_RULES: Record<SubWorkType, string> = {
  기획: '승인 필요 · 최소 동의 2인 · 완료 점검 3항목',
  예산지출: '승인 필요 · 최소 동의 3인 · 완료 점검 3항목',
  외부협조: '승인 필요 · 완료 점검 2항목',
};

/**
 * 하위 업무 등록 — 업무 상세의 [+ 하위 업무]에서만 진입.
 * 설명서 참고 상자 «유형을 고르면 규칙 요약이 뜨고, 등록 후에는 유형을 바꿀 수 없다»를 따른다.
 */
export function SubWorkCreateMock(): ReactNode {
  const [type, setType] = useState<SubWorkType>('기획');
  const [priority, setPriority] = useState<Priority>('보통');
  const [registered, setRegistered] = useState(false);
  const [touched, setTouched] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();

  const pickType = (t: SubWorkType) => {
    if (registered) {
      setFeedback('등록한 뒤에는 하위 업무 유형을 바꿀 수 없습니다. 유형을 잘못 골랐다면 해당 하위 업무를 마감하고 새로 등록해야 합니다.');
      return;
    }
    setType(t);
    setTouched(true);
    setFeedback(
      `«${t}» 유형을 골랐습니다. 규칙 요약은 «${TYPE_RULES[t]}»입니다. 승인이 필요한지, 누가 승인하는지, 완료 전 체크할 항목이 몇 개인지가 이 유형에서 그대로 복사됩니다.`,
    );
  };

  const register = () => {
    if (registered) {
      setFeedback('이미 등록했습니다. 다시 해 보려면 «처음으로»를 누르세요.');
      return;
    }
    setRegistered(true);
    setFeedback(
      `«하위 업무 등록»을 눌렀습니다. «${type}» 유형의 규칙이 이 하위 업무에 복사되고 기획 단계에서 시작합니다. 이제 유형은 바꿀 수 없습니다.`,
    );
  };

  return (
    <MockFrame
      caption="하위 업무 등록 — 업무 상세의 [+ 하위 업무]에서만 진입"
      hint="하위_업무_유형 칩을 바꿔 규칙 요약을 비교하고, «하위 업무 등록»을 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setType('기획');
        setPriority('보통');
        setRegistered(false);
        setTouched(false);
        setFeedback(undefined);
      }}
      innerStyle={{maxWidth: 640}}>
      <div className="mk-header">
        <div>
          <div className="title">하위 업무 등록</div>
          <div className="sub">상위 업무: 2026 동아리 박람회</div>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        <div>
          <div className="mk-section-label">상위 속성 · oper</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 4}}>운영 제목</div>
              <div
                style={{
                  border: '1px solid var(--app-line-strong)',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 13,
                  color: 'var(--app-ink)',
                }}>
                부스 배치도 기획
              </div>
            </div>
            <div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 4}}>우선순위</div>
              <div style={{display: 'flex', gap: 6}}>
                {PRIORITIES.map((p) => (
                  <Chip
                    key={p}
                    active={priority === p}
                    onClick={() => {
                      setPriority(p);
                      setFeedback(`우선순위를 «${p}»으로 골랐습니다.`);
                    }}>
                    {p}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="mk-section-label">확장 속성 · sub_work</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 4}}>하위_업무_유형</div>
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                {TYPES.map((t) => (
                  <Chip
                    key={t}
                    active={type === t}
                    onClick={() => pickType(t)}
                    title={registered ? '등록한 뒤에는 유형을 바꿀 수 없습니다' : undefined}
                    style={registered && type !== t ? {opacity: 0.45, cursor: 'not-allowed'} : undefined}>
                    {t}
                  </Chip>
                ))}
              </div>
            </div>
            <div
              key={type}
              className={touched ? 'gm-flash' : undefined}
              style={{
                background: 'var(--app-bg)',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 11.5,
                color: 'var(--app-n400)',
              }}>
              {TYPE_RULES[type]}
            </div>
          </div>
        </div>
      </div>
      <div style={{marginTop: 16}}>
        <Btn
          variant="primary"
          locked={registered}
          title={registered ? '이미 등록했습니다' : undefined}
          onClick={register}>
          하위 업무 등록
        </Btn>
      </div>
    </MockFrame>
  );
}
