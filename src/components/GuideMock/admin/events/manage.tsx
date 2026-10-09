import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame, Pill} from '../..';

type EventStatus = '작성 중' | '게시' | '보관';
type Category = '세미나' | '모집' | '프로젝트';
/** «보관 제외»는 처음 들어갔을 때의 거르기다. 이때는 네 상태 칩이 모두 꺼져 있다 */
type StatusFilter = '보관 제외' | '전체' | EventStatus;

type EventRow = {name: string; category: Category; status: EventStatus; when?: string; applied?: string};

// 앞의 세 줄은 옛 설명서의 그림 그대로다. 거르기를 보여 주려고 게시 · 보관 행사를 하나씩 더했다.
const EVENTS: EventRow[] = [
  {name: '2026 신입 부원 모집 설명회', category: '모집', status: '게시', when: '03.04 18:00', applied: '24 / 40'},
  {name: '알고리즘 스터디 오리엔테이션', category: '세미나', status: '작성 중'},
  {name: '2026 겨울 해커톤', category: '프로젝트', status: '보관', when: '01.15 10:00', applied: '31 / 30'},
  {name: '웹 개발 입문 세미나', category: '세미나', status: '게시', when: '03.18 19:00', applied: '18 / 30'},
  {name: '2025 가을 신입 부원 모집 설명회', category: '모집', status: '보관', when: '09.03 18:00', applied: '38 / 40'},
];

const STATUS_CHIPS: ('전체' | EventStatus)[] = ['전체', '작성 중', '게시', '보관'];
const CATEGORY_CHIPS: Category[] = ['세미나', '모집', '프로젝트'];

const STATUS_TONE: Record<EventStatus, 'blue' | 'grey' | 'outline'> = {
  게시: 'blue',
  '작성 중': 'grey',
  보관: 'outline',
};

const STATUS_NOTE: Record<StatusFilter, string> = {
  '보관 제외': '처음에는 «보관 제외»가 걸려 있어 네 상태 칩이 모두 꺼져 있고, 보관한 행사는 보이지 않습니다.',
  전체: '«전체»를 눌렀습니다. «보관 제외»가 풀려 보관한 옛 행사까지 모두 보입니다.',
  '작성 중': '작성 중인 행사만 봅니다. 작성 중일 때는 공개 웹사이트에 보이지 않습니다.',
  게시: '게시한 행사만 봅니다. 게시한 행사는 공개 웹사이트 행사 목록에 나타납니다.',
  보관: '보관한 행사만 봅니다. 보관해도 참가자 명단과 신청 기록은 그대로 남습니다.',
};

const COLS = '2.4fr 1fr 1fr 1.1fr 0.9fr';

/**
 * 행사 목록 — /events. 상태 칩과 분류 칩으로 거른다.
 * 설명서 «처음 들어가면 보관 제외가 걸려 있습니다»를 따라, 처음에는 보관한 행사가 숨어 있다.
 */
export function EventListMock(): ReactNode {
  const [status, setStatus] = useState<StatusFilter>('보관 제외');
  const [category, setCategory] = useState<Category | null>(null);
  const [feedback, setFeedback] = useState<ReactNode>(STATUS_NOTE['보관 제외']);

  const filter = (s: StatusFilter, c: Category | null) =>
    EVENTS.filter((e) => {
      if (s === '보관 제외' && e.status === '보관') return false;
      if (s !== '보관 제외' && s !== '전체' && e.status !== s) return false;
      return c === null || e.category === c;
    });
  const rows = filter(status, category);

  const pickStatus = (s: '전체' | EventStatus) => {
    setStatus(s);
    const n = filter(s, category).length;
    const overCapacity = s === '전체' || s === '보관' ? ' «2026 겨울 해커톤»의 31 / 30처럼 정원을 넘겨 확정한 행사도 있습니다.' : '';
    setFeedback(`${STATUS_NOTE[s]} ${n}건입니다.${overCapacity}`);
  };

  const pickCategory = (c: Category) => {
    const next = category === c ? null : c;
    setCategory(next);
    const n = filter(status, next).length;
    setFeedback(next ? `«${c}» 분류만 남깁니다. ${n}건입니다. 한 번 더 누르면 분류 거르기가 풀립니다.` : `분류 거르기를 풀었습니다. ${n}건입니다.`);
  };

  return (
    <MockFrame
      caption="행사 목록 — /events"
      hint="처음에는 «보관 제외»라 보관한 행사가 숨어 있습니다. «전체»나 «보관», 분류 칩을 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setStatus('보관 제외');
        setCategory(null);
        setFeedback(STATUS_NOTE['보관 제외']);
      }}>
      <div className="mk-header">
        <div>
          <div className="title">행사 관리</div>
          <div className="sub">작성 · 게시 · 보관과 분류 관리</div>
        </div>
        <Btn variant="primary">+ 새 행사</Btn>
      </div>
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 6px', alignItems: 'center'}}>
        {STATUS_CHIPS.map((s) => (
          <Chip key={s} active={status === s} onClick={() => pickStatus(s)}>
            {s}
          </Chip>
        ))}
        <span style={{width: 1, height: 18, background: 'var(--app-line)', margin: '0 4px'}} />
        {CATEGORY_CHIPS.map((c) => (
          <Chip key={c} active={category === c} onClick={() => pickCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div className="mk-row mk-th" style={{gridTemplateColumns: COLS}}>
          <span>행사명</span>
          <span>분류</span>
          <span>상태</span>
          <span>일시</span>
          <span>신청 · 참가자</span>
        </div>
        {rows.map((e) => (
          <div key={e.name} className="mk-row" style={{gridTemplateColumns: COLS}}>
            <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{e.name}</span>
            <span>
              <Pill tone="outline">{e.category}</Pill>
            </span>
            <span>
              <Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge>
            </span>
            <span style={{fontSize: 12, color: e.when ? undefined : 'var(--app-n500)'}}>{e.when ?? '일시 미설정'}</span>
            <span style={{fontSize: 12, color: e.applied ? undefined : 'var(--app-n500)'}}>{e.applied ?? '—'}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="mk-row">해당하는 행사가 없습니다.</div>}
      </div>
    </MockFrame>
  );
}
