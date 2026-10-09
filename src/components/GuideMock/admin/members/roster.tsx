import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame, Pill} from '../..';

type Grade = '정회원' | '준회원' | '임시회원';
type Status = '활동' | '휴학' | '군휴학';

const GRADES: Grade[] = ['정회원', '준회원', '임시회원'];
const STATUSES: Status[] = ['활동', '휴학', '군휴학'];
const GRADE_CHIPS = ['전체', ...GRADES] as const;
type GradeChip = (typeof GRADE_CHIPS)[number];

const gradeTone = (g: Grade) => (g === '임시회원' ? 'outline' : 'blue');

/** gm-plain이 지우는 mk-row의 줄, 여백, 글자를 버튼 행에 되돌린다 */
const ROW_BUTTON: CSSProperties = {
  width: '100%',
  padding: '9px 0',
  borderTop: '1px solid color-mix(in srgb, var(--app-ink) 5%, transparent)',
  fontSize: 13,
  color: 'var(--app-n300)',
};

/* ============ 회원 명부 ============ */

type RosterRow = {
  name: string;
  migrated?: boolean;
  id: string;
  gen: string;
  dept: string;
  grade: Grade;
  status: Status;
  roles: string;
};

const ROSTER_ROWS: RosterRow[] = [
  {name: '홍길동', id: '20240001', gen: '15기', dept: '컴퓨터학부 · 3학년', grade: '정회원', status: '활동', roles: '회장, 박람회 총괄'},
  {name: '김철수', migrated: true, id: '20250001', gen: '16기', dept: '소프트웨어학부 · 2학년', grade: '준회원', status: '활동', roles: '—'},
  // 등급 칩으로 거르기를 보여 주려고 더한 예시 행
  {name: '이영희', id: '20240002', gen: '15기', dept: '컴퓨터학부 · 3학년', grade: '정회원', status: '활동', roles: '부회장'},
  {name: '박민수', id: '20250002', gen: '—', dept: '소프트웨어학부 · 1학년', grade: '임시회원', status: '활동', roles: '—'},
];

/** 회원 명부 — /members. 등급 칩으로 거르고, CSV로 이관한 회원의 «이관» 표시를 짚어 본다 */
export function RosterMock(): ReactNode {
  const [chip, setChip] = useState<GradeChip>('전체');
  const [feedback, setFeedback] = useState<ReactNode>();
  const rows = ROSTER_ROWS.filter((r) => chip === '전체' || r.grade === chip);
  const cols = '1.2fr .8fr .6fr 1fr .8fr .8fr 1.2fr';

  return (
    <MockFrame
      caption="회원 명부 — /members"
      hint="오른쪽 위 칩으로 등급별로 걸러 보고, 이름 옆 «이관» 표시도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setChip('전체');
        setFeedback(undefined);
      }}>
      <div className="mk-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <div style={{fontSize: 13, color: 'var(--app-n500)'}}>회원 128명</div>
          <div style={{display: 'flex', gap: 8}}>
            {GRADE_CHIPS.map((c) => (
              <Chip
                key={c}
                active={chip === c}
                onClick={() => {
                  setChip(c);
                  setFeedback(c === '전체' ? '«전체» 칩입니다. 모든 등급을 보여 줍니다.' : `«${c}» 칩을 켰습니다. ${c}만 남습니다.`);
                }}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
        <div className="mk-row mk-th" style={{gridTemplateColumns: cols}}>
          <span>이름</span>
          <span>학번</span>
          <span>기수</span>
          <span>학과·학년</span>
          <span>등급</span>
          <span>상태</span>
          <span>현재 역할</span>
        </div>
        {rows.map((r) => (
          <div key={r.id} className="mk-row" style={{gridTemplateColumns: cols}}>
            <span style={{color: 'var(--app-ink)'}}>
              {r.name}
              {r.migrated && (
                <button
                  type="button"
                  className="gm-plain"
                  style={{marginLeft: 4}}
                  onClick={() =>
                    setFeedback(
                      'CSV로 이관한 회원입니다. 아직 로그인 계정과 연결되지 않은 상태라 이름 옆에 «이관»이 붙습니다. 본인이 Google로 가입하면 그때 실제 계정과 연결됩니다.',
                    )
                  }>
                  <Pill tone="outline">이관</Pill>
                </button>
              )}
            </span>
            <span>{r.id}</span>
            <span>{r.gen}</span>
            <span>{r.dept}</span>
            <span>
              <Badge tone={gradeTone(r.grade)}>{r.grade}</Badge>
            </span>
            <span>
              <Badge tone="grey">{r.status}</Badge>
            </span>
            <span>{r.roles}</span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* ============ 회원 상세 ============ */

/** 회원 상세 — /members/{id}. 본문이 동작을 말하지 않아 그림으로만 둔다 */
export function MemberDetailMock(): ReactNode {
  return (
    <MockFrame caption="회원 상세 — /members/{id}">
      <div style={{display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="mk-card">
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4}}>
              <span style={{fontSize: 21, fontWeight: 600, color: 'var(--app-ink)'}}>홍길동</span>
              <Badge tone="blue">정회원</Badge>
              <Badge tone="grey">활동</Badge>
            </div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 12}}>회원 #14 · 가입 2023.03.02</div>
            <dl className="mk-kv" style={{gridTemplateColumns: '70px 1fr 70px 1fr', columnGap: 16}}>
              <dt>학번</dt>
              <dd>20240001</dd>
              <dt>기수</dt>
              <dd>15기</dd>
              <dt>학과</dt>
              <dd>컴퓨터학부</dd>
              <dt>학년</dt>
              <dd>3학년</dd>
            </dl>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
            <div className="mk-card">
              <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 8}}>회원등급</div>
              <Badge tone="blue">정회원</Badge>
              <div style={{marginTop: 10}}>
                <Btn variant="ghost" style={{fontSize: 12, padding: '5px 10px'}}>
                  등급 변경
                </Btn>
              </div>
            </div>
            <div className="mk-card">
              <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 8}}>회원상태</div>
              <Badge tone="grey">활동</Badge>
              <div style={{marginTop: 10}}>
                <Btn variant="ghost" style={{fontSize: 12, padding: '5px 10px'}}>
                  상태 변경
                </Btn>
              </div>
            </div>
          </div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div className="mk-card">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 10}}>
              <span style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)'}}>역할</span>
              <Btn variant="ghost" style={{fontSize: 11.5, padding: '4px 9px'}}>
                역할 부여
              </Btn>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  border: '1px solid var(--app-line)',
                  borderRadius: 8,
                }}>
                <span style={{color: 'var(--app-ink)'}}>
                  회장{' '}
                  <Pill tone="blue" style={{marginLeft: 4}}>
                    대표
                  </Pill>
                </span>
                <span style={{color: 'var(--app-n500)', fontSize: 11.5}}>종료</span>
              </div>
            </div>
          </div>
          <div className="mk-card">
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 10}}>최근 변경이력</div>
            <div style={{fontSize: 12.5, color: 'var(--app-n400)'}}>등급 · 준회원 → 정회원 · 2026.03.02</div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 일괄 변경 ============ */

type Member = {id: number; name: string; grade: Grade; status: Status};
type Kind = '등급' | '상태';
/** snapshot은 옛 설명서 그림 그대로의 처음 모습(15명을 바꾼 결과) */
type Mode = 'snapshot' | 'list' | 'input' | 'preview' | 'result';
type Outcome = {name: string; changed: boolean};

const BULK_MEMBERS: Member[] = [
  {id: 1, name: '홍길동', grade: '정회원', status: '활동'},
  {id: 2, name: '김철수', grade: '준회원', status: '활동'},
  {id: 3, name: '이영희', grade: '정회원', status: '활동'},
  {id: 4, name: '박민수', grade: '임시회원', status: '활동'},
  {id: 5, name: '최지우', grade: '준회원', status: '활동'},
  {id: 6, name: '정다은', grade: '준회원', status: '휴학'},
  {id: 7, name: '윤서준', grade: '정회원', status: '활동'},
  {id: 8, name: '한도윤', grade: '임시회원', status: '활동'},
  {id: 9, name: '오세린', grade: '준회원', status: '활동'},
  {id: 10, name: '강예준', grade: '준회원', status: '군휴학'},
];

const PAGE_SIZE = 5;
const LIMIT = 100;

type BulkState = {
  mode: Mode;
  members: Member[];
  filter: GradeChip;
  page: number;
  selected: number[];
  kind: Kind;
  value?: Grade | Status;
  date: string;
  endDate: string;
  reason: string;
  outcome: Outcome[];
};

const BULK_INITIAL: BulkState = {
  mode: 'snapshot',
  members: BULK_MEMBERS,
  filter: '전체',
  page: 0,
  selected: [],
  kind: '등급',
  date: '',
  endDate: '',
  reason: '',
  outcome: [],
};

function ResultStats({total, changed, skipped, failed}: {total: number; changed: number; skipped: number; failed: number}): ReactNode {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10}}>
      <div className="mk-stat">
        <div className="lb">전체</div>
        <div className="vl" style={{fontSize: 18}}>
          {total}
        </div>
      </div>
      <div className="mk-stat">
        <div className="lb">변경</div>
        <div className="vl" style={{fontSize: 18, color: 'var(--app-accent)'}}>
          {changed}
        </div>
      </div>
      <div className="mk-stat">
        <div className="lb">건너뜀</div>
        <div className="vl" style={{fontSize: 18}}>
          {skipped}
        </div>
      </div>
      <div className="mk-stat">
        <div className="lb">실패</div>
        <div className="vl" style={{fontSize: 18, color: 'var(--app-danger)'}}>
          {failed}
        </div>
      </div>
    </div>
  );
}

const FIELD_LABEL: CSSProperties = {display: 'block', fontSize: 12, color: 'var(--app-n500)', marginBottom: 4};

/**
 * 일괄 변경 — 선택 막대와 세 단계.
 * 설명서 «여러 명의 등급·상태를 한 번에»의 규칙(체크하면 막대, 쪽을 넘겨도 선택 유지, 필터를 바꾸면 선택 해제,
 * 1 입력 → 2 미리보기 «{N}명 변경» → 3 결과, 건너뜀은 이미 같은 값)을 따른다.
 */
export function BulkChangeMock(): ReactNode {
  const [s, setS] = useState<BulkState>(BULK_INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const visible = s.members.filter((m) => s.filter === '전체' || m.grade === s.filter);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(s.page * PAGE_SIZE, (s.page + 1) * PAGE_SIZE);
  const picked = s.members.filter((m) => s.selected.includes(m.id));
  const n = s.selected.length;
  const options: (Grade | Status)[] = s.kind === '등급' ? GRADES : STATUSES;
  const needsEndDate = s.kind === '상태' && (s.value === '휴학' || s.value === '군휴학');

  const toList = (message: ReactNode) => {
    setS({...s, mode: 'list', selected: [], value: undefined});
    setFeedback(message);
  };

  const start = (kind: Kind) => {
    if (s.mode === 'snapshot') {
      toList(`위 결과는 예시입니다. 아래 목록에서 바꿀 회원을 체크한 뒤 «${kind} 변경»을 다시 눌러 1단계부터 따라가 보세요.`);
      return;
    }
    setS({...s, mode: 'input', kind, value: undefined, date: '', endDate: '', reason: ''});
    setFeedback(
      kind === '등급'
        ? '1단계 입력입니다. 바꿀 등급을 고르고 적용 일자와 변경 사유를 적습니다. 적용 일자를 비우면 오늘 날짜로 기록되고, 대상 전원에게 같은 날짜가 들어갑니다.'
        : '1단계 입력입니다. 바꿀 상태를 고르고 적용 일자와 변경 사유를 적습니다. 휴학·군휴학을 고르면 종료 예정일 칸이 함께 나타납니다.',
    );
  };

  const toggle = (id: number) => {
    if (s.selected.includes(id)) {
      const selected = s.selected.filter((x) => x !== id);
      setS({...s, selected});
      setFeedback(selected.length === 0 ? '선택한 회원이 없어 동작 막대가 사라졌습니다.' : `${selected.length}명 선택.`);
      return;
    }
    if (n >= LIMIT) {
      setFeedback('한 번에 100명까지 고를 수 있습니다.');
      return;
    }
    const selected = [...s.selected, id];
    setS({...s, selected});
    setFeedback(
      n === 0
        ? '회원을 체크하자 위에 동작 막대가 나타났습니다. 한 번에 100명까지 고를 수 있습니다.'
        : `${selected.length}명 선택. 쪽을 넘겨 다른 회원을 더 골라도 선택은 유지됩니다.`,
    );
  };

  const changeFilter = (filter: GradeChip) => {
    setS({...s, filter, page: 0, selected: []});
    setFeedback(n > 0 ? `«${filter}» 칩을 켜자 선택이 풀렸습니다. 검색어나 필터를 바꾸면 선택이 풀립니다.` : `«${filter}» 칩을 켰습니다.`);
  };

  const changePage = (page: number) => {
    setS({...s, page});
    setFeedback(n > 0 ? `${page + 1}쪽으로 넘겼습니다. 쪽을 넘겨도 선택은 유지됩니다(지금 ${n}명).` : `${page + 1}쪽입니다.`);
  };

  const pickValue = (value: Grade | Status) => {
    setS({...s, value});
    setFeedback(
      value === '휴학' || value === '군휴학'
        ? `«${value}»을 골랐습니다. 휴학·군휴학을 고르면 종료 예정일 칸이 함께 나타납니다.`
        : `«${value}»을 골랐습니다.`,
    );
  };

  const toPreview = () => {
    if (!s.value) {
      setFeedback(s.kind === '등급' ? '바꿀 등급을 먼저 고르세요.' : '바꿀 상태를 먼저 고르세요.');
      return;
    }
    setS({...s, mode: 'preview'});
    setFeedback(
      `2단계 미리보기입니다. 아직 저장되지 않았습니다. «${n}명 변경»을 눌러야 실제로 저장됩니다. 되돌리는 일괄 기능은 없으니 대상 이름을 꼭 확인하세요.`,
    );
  };

  const apply = () => {
    const value = s.value;
    if (!value) return;
    const current = (m: Member) => (s.kind === '등급' ? m.grade : m.status);
    const outcome = picked.map((m) => ({name: m.name, changed: current(m) !== value}));
    const members = s.members.map((m) => {
      if (!s.selected.includes(m.id)) return m;
      return s.kind === '등급' ? {...m, grade: value as Grade} : {...m, status: value as Status};
    });
    setS({...s, mode: 'result', members, outcome});
    const changed = outcome.filter((o) => o.changed).length;
    const skipped = outcome.length - changed;
    setFeedback(
      (skipped > 0
        ? `${changed}명을 바꾸고, 이미 ${value}이던 ${skipped}명은 건너뛰었습니다. 건너뜀은 실패가 아니며 이력도 남기지 않습니다. `
        : `${changed}명을 바꿨습니다. 이미 같은 값인 회원이 없어 건너뜀은 0입니다. `) +
        '실제 화면에서는 되돌리는 일괄 기능이 없어, 잘못 바꿨다면 한 명씩 다시 바꿔야 합니다.',
    );
  };

  const smallBtn: CSSProperties = {fontSize: 12, padding: '5px 10px'};
  const showBar = s.mode === 'snapshot' || n > 0;
  const changedCount = s.outcome.filter((o) => o.changed).length;

  return (
    <MockFrame
      caption="일괄 변경 — 선택 막대와 결과 단계"
      hint="«선택 해제»를 누른 뒤 회원을 체크하고, «등급 변경»(또는 «상태 변경»)으로 1 입력 → 2 미리보기 → 3 결과를 따라가 보세요."
      feedback={feedback}
      onReset={() => {
        setS(BULK_INITIAL);
        setFeedback(undefined);
      }}
      innerStyle={{maxWidth: 640}}>
      {showBar && (
        <div
          style={{
            background: 'var(--app-accent-soft)',
            borderRadius: 10,
            padding: '9px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}>
          <span style={{fontSize: 13, fontWeight: 600, color: 'var(--app-accent-strong)', flex: 1}}>
            {s.mode === 'snapshot' ? 15 : n}명 선택
          </span>
          <Btn variant="ghost" style={smallBtn} onClick={() => start('등급')}>
            등급 변경
          </Btn>
          <Btn variant="ghost" style={smallBtn} onClick={() => start('상태')}>
            상태 변경
          </Btn>
          <button
            type="button"
            className="gm-plain"
            style={{fontSize: 12, color: 'var(--app-n500)'}}
            onClick={() => toList('선택을 풀었습니다. 동작 막대가 사라집니다. 목록에서 회원을 체크하면 다시 나타납니다.')}>
            선택 해제
          </button>
        </div>
      )}

      {s.mode === 'snapshot' && (
        <div className="mk-card">
          <div className="mk-section-label">3단계 — 결과</div>
          <ResultStats total={15} changed={12} skipped={3} failed={0} />
          <div style={{fontSize: 12, color: 'var(--app-n500)'}}>건너뛴 회원은 이미 같은 값입니다. 실패가 아닙니다.</div>
        </div>
      )}

      {s.mode === 'list' && (
        <div className="mk-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8, flexWrap: 'wrap'}}>
            <div style={{fontSize: 13, color: 'var(--app-n500)'}}>회원 목록</div>
            <div style={{display: 'flex', gap: 8}}>
              {GRADE_CHIPS.map((c) => (
                <Chip key={c} active={s.filter === c} onClick={() => changeFilter(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          <div className="mk-row mk-th" style={{gridTemplateColumns: '28px 1.4fr 1fr 1fr'}}>
            <span />
            <span>이름</span>
            <span>등급</span>
            <span>상태</span>
          </div>
          {pageRows.map((m) => {
            const on = s.selected.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                role="checkbox"
                aria-checked={on}
                className="gm-plain mk-row gm-pick"
                style={{...ROW_BUTTON, gridTemplateColumns: '28px 1.4fr 1fr 1fr'}}
                onClick={() => toggle(m.id)}>
                <span className={on ? 'gm-check on' : 'gm-check'}>{on ? '✓' : ''}</span>
                <span style={{color: 'var(--app-ink)'}}>{m.name}</span>
                <span>
                  <Badge tone={gradeTone(m.grade)}>{m.grade}</Badge>
                </span>
                <span>
                  <Badge tone="grey">{m.status}</Badge>
                </span>
              </button>
            );
          })}
          {pageRows.length === 0 && <div className="mk-row">해당하는 회원이 없습니다.</div>}
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--app-n500)'}}>
            <button type="button" className="gm-plain" disabled={s.page === 0} onClick={() => changePage(s.page - 1)}>
              ◀ 이전
            </button>
            <span>
              {visible.length === 0 ? 0 : s.page * PAGE_SIZE + 1}–{Math.min(visible.length, (s.page + 1) * PAGE_SIZE)} / 전체 {visible.length}명
            </span>
            <button type="button" className="gm-plain" disabled={s.page >= pageCount - 1} onClick={() => changePage(s.page + 1)}>
              다음 ▶
            </button>
          </div>
        </div>
      )}

      {s.mode === 'input' && (
        <div className="mk-card">
          <div className="mk-section-label">1단계 — 입력</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            <div>
              <span style={FIELD_LABEL}>바꿀 {s.kind}</span>
              <div style={{display: 'flex', gap: 6}}>
                {options.map((o) => (
                  <Chip key={o} active={s.value === o} onClick={() => pickValue(o)}>
                    {o}
                  </Chip>
                ))}
              </div>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: needsEndDate ? '1fr 1fr' : '1fr', gap: 10}}>
              <label>
                <span style={FIELD_LABEL}>적용 일자</span>
                <input className="gm-input" type="date" value={s.date} onChange={(e) => setS({...s, date: e.target.value})} />
              </label>
              {needsEndDate && (
                <label>
                  <span style={FIELD_LABEL}>종료 예정일</span>
                  <input className="gm-input" type="date" value={s.endDate} onChange={(e) => setS({...s, endDate: e.target.value})} />
                </label>
              )}
            </div>
            <label>
              <span style={FIELD_LABEL}>변경 사유</span>
              <input
                className="gm-input"
                type="text"
                placeholder="예: 개강총회 승급"
                value={s.reason}
                onChange={(e) => setS({...s, reason: e.target.value})}
              />
            </label>
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14}}>
            <Btn variant="ghost" style={smallBtn} onClick={() => toList('입력을 취소했습니다. 목록으로 돌아갑니다.')}>
              취소
            </Btn>
            <Btn
              variant="primary"
              style={smallBtn}
              locked={!s.value}
              title={s.value ? undefined : s.kind === '등급' ? '바꿀 등급을 먼저 고르세요' : '바꿀 상태를 먼저 고르세요'}
              onClick={toPreview}>
              다음
            </Btn>
          </div>
        </div>
      )}

      {s.mode === 'preview' && (
        <div className="mk-card">
          <div className="mk-section-label">2단계 — 미리보기</div>
          <dl className="mk-kv" style={{marginBottom: 12}}>
            <dt>바꿀 값</dt>
            <dd>
              {s.kind} → <b style={{color: 'var(--app-ink)'}}>{s.value}</b>
            </dd>
            <dt>적용 일자</dt>
            <dd>{s.date || '오늘 (비워 둠)'}</dd>
            {needsEndDate && (
              <>
                <dt>종료 예정일</dt>
                <dd>{s.endDate || '—'}</dd>
              </>
            )}
            <dt>변경 사유</dt>
            <dd>{s.reason || '—'}</dd>
          </dl>
          <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 6}}>대상 {n}명</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
            {picked.map((m) => (
              <Badge key={m.id} tone="outline">
                {m.name}
              </Badge>
            ))}
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14}}>
            <Btn
              variant="ghost"
              style={smallBtn}
              onClick={() => {
                setS({...s, mode: 'input'});
                setFeedback('1단계로 돌아왔습니다. 고른 값은 그대로입니다.');
              }}>
              이전
            </Btn>
            <Btn variant="primary" style={smallBtn} onClick={apply}>
              {n}명 변경
            </Btn>
          </div>
        </div>
      )}

      {s.mode === 'result' && (
        <div className="mk-card">
          <div className="mk-section-label">3단계 — 결과</div>
          <ResultStats total={s.outcome.length} changed={changedCount} skipped={s.outcome.length - changedCount} failed={0} />
          <div style={{fontSize: 12, color: 'var(--app-n500)'}}>건너뛴 회원은 이미 같은 값입니다. 실패가 아닙니다.</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 10, fontSize: 12.5, color: 'var(--app-ink)'}}>
            {s.outcome.map((o) => (
              <span key={o.name} style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
                {o.name}
                <Badge tone={o.changed ? 'blue' : 'grey'}>{o.changed ? '변경' : '건너뜀'}</Badge>
              </span>
            ))}
          </div>
        </div>
      )}
    </MockFrame>
  );
}
