import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '../..';

type Status = '제출' | '수정요청' | '승인' | '반려';
type Kind = '스터디' | '프로젝트' | '트랙';

type Proposal = {
  id: string;
  title: string;
  kind: Kind;
  submitter: string;
  date: string;
  /** 제출 회차. 수정요청을 받아 다시 낼 때마다 하나씩 는다 */
  round: number;
  seq: number;
  status: Status;
  capacity: string;
  plan: string;
  /** 커리큘럼 회차 수. null이면 형식이 어긋나 읽지 못한 기획안이다 */
  curriculum: number | null;
};

const LEADER: Record<Kind, string> = {스터디: '스터디장', 프로젝트: '프로젝트장', 트랙: '트랙장'};

const STATUS_TONE: Record<Status, 'blue' | 'amber' | 'outline-accent' | 'red'> = {
  제출: 'blue',
  수정요청: 'amber',
  승인: 'outline-accent',
  반려: 'red',
};

// 앞의 둘은 옛 설명서의 그림 그대로다. 셋째는 «커리큘럼을 못 읽으면 승인이 잠깁니다»를 보여 주려고 더했다.
const INITIAL: Proposal[] = [
  {
    id: 'algo',
    title: '알고리즘 문제풀이 스터디',
    kind: '스터디',
    submitter: '홍길동',
    date: '03.02',
    round: 1,
    seq: 12,
    status: '제출',
    capacity: '6 ~ 10명',
    plan: '매주 화 19:00, 백준 골드 난이도',
    curriculum: 8,
  },
  {
    id: 'web',
    title: '웹 서비스 사이드프로젝트',
    kind: '프로젝트',
    submitter: '김철수',
    date: '03.01',
    round: 2,
    seq: 9,
    status: '수정요청',
    capacity: '2 ~ 4명',
    plan: '매주 토 14:00, 온라인 회의',
    curriculum: 10,
  },
  {
    id: 'cloud',
    title: '클라우드 인프라 트랙',
    kind: '트랙',
    submitter: '이영희',
    date: '03.03',
    round: 1,
    seq: 14,
    status: '제출',
    capacity: '4 ~ 8명',
    plan: '격주 목 19:00, 실습 위주',
    curriculum: null,
  },
];

const CHIPS = ['전체', '제출', '수정요청'] as const;
type ChipName = (typeof CHIPS)[number];

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

/**
 * 기획안 검토 — /proposals/review.
 * 설명서 «세 가지 처리»(승인은 되돌릴 수 없음, 수정요청은 사유 필수, 반려는 끝), «재제출된 기획안», «커리큘럼을 못 읽으면 승인이 잠깁니다»를 따른다.
 */
export function ProposalReviewMock(): ReactNode {
  const [list, setList] = useState<Proposal[]>(INITIAL);
  const [chip, setChip] = useState<ChipName>('전체');
  const [selectedId, setSelectedId] = useState('algo');
  const [asking, setAsking] = useState(false);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<ReactNode>();

  const visible = list.filter((p) => chip === '전체' || p.status === chip);
  const sel = list.find((p) => p.id === selectedId) ?? list[0];
  const readable = sel.curriculum !== null;

  const update = (id: string, patch: Partial<Proposal>) => setList(list.map((p) => (p.id === id ? {...p, ...patch} : p)));

  const closeAsk = () => {
    setAsking(false);
    setReason('');
  };

  const select = (p: Proposal) => {
    setSelectedId(p.id);
    closeAsk();
    if (p.status === '수정요청') {
      setFeedback('수정요청 상태입니다. 제출자가 고쳐서 다시 낼 때까지 기다립니다. 아래 띠의 «제출자가 고쳐서 다시 냄»을 눌러 보세요.');
    } else if (p.status === '제출' && p.curriculum === null) {
      setFeedback('커리큘럼 형식이 어긋난 기획안입니다. 승인이 잠기고 사유가 함께 표시됩니다. 제출자에게 수정요청을 보내 형식을 맞추게 해야 합니다.');
    } else if (p.status === '제출' && p.round >= 2) {
      setFeedback(`제출 회차가 ${p.round}인 재제출 기획안입니다. 처리 이력에서 이전 요청 내용을 확인한 뒤 처리하세요.`);
    } else {
      setFeedback(`«${p.title}» 기획안을 골랐습니다.`);
    }
  };

  const pickChip = (c: ChipName) => {
    setChip(c);
    const next = list.filter((p) => c === '전체' || p.status === c);
    if (next.length > 0 && !next.some((p) => p.id === selectedId)) {
      setSelectedId(next[0].id);
      closeAsk();
    }
    setFeedback(c === '전체' ? undefined : `«${c}» 칩을 켰습니다. ${next.length}건이 남습니다.`);
  };

  const approve = () => {
    if (!readable) {
      setFeedback(
        '잠겨 있습니다. 커리큘럼 형식이 어긋나 «이 기획안은 지금 학술 프로그램으로 옮길 수 없습니다»가 떴습니다. 제출자에게 수정요청을 보내 형식을 맞추게 해야 합니다.',
      );
      return;
    }
    update(sel.id, {status: '승인'});
    closeAsk();
    setFeedback(
      `«승인»을 눌렀습니다. «${sel.title}» 학술 프로그램이 만들어지고, ${sel.submitter}에게 ${LEADER[sel.kind]} 역할이 부여되고, 커리큘럼 ${sel.curriculum}회차가 등록되고, 비어 있는 모집 폼이 생겼습니다. 다음은 모집 관리에서 문항을 채우고 모집을 시작합니다. 실제 화면에서는 되돌릴 수 없습니다.`,
    );
  };

  const askReason = () => {
    setAsking(true);
    setFeedback('수정요청은 사유가 필수입니다. 사유를 적어야 보낼 수 있습니다.');
  };

  const sendRequest = () => {
    if (!reason.trim()) {
      setFeedback('잠겨 있습니다. 수정요청은 사유가 필수입니다. 제출자는 이 사유를 먼저 보고 고칩니다.');
      return;
    }
    update(sel.id, {status: '수정요청'});
    closeAsk();
    setFeedback(
      '수정요청을 보냈습니다. 제출자는 이 사유를 먼저 보고, 이전 답이 채워진 상태에서 고쳐 다시 냅니다. 아래 띠의 «제출자가 고쳐서 다시 냄»을 눌러 보세요.',
    );
  };

  const reject = () => {
    update(sel.id, {status: '반려'});
    closeAsk();
    setFeedback('«반려»를 눌렀습니다. 여기서 끝입니다 — 제출자는 이 기획안을 다시 낼 수 없습니다. 실제 화면에서는 되돌릴 수 없습니다.');
  };

  const resubmit = () => {
    const fixed = sel.curriculum === null;
    const round = sel.round + 1;
    update(sel.id, {status: '제출', round, curriculum: sel.curriculum ?? 6});
    setFeedback(
      `제출자가 고쳐서 다시 냈습니다. 제출 회차가 하나 늘어 ${round}회차가 되고 «수정요청을 받아 다시 낸 기획안입니다» 안내가 붙습니다.` +
        (fixed ? ' 커리큘럼 형식을 맞춰 승인 잠금도 풀렸습니다.' : ' 처리 이력에서 이전 요청 내용을 확인한 뒤 처리하세요.'),
    );
  };

  return (
    <MockFrame
      caption="기획안 검토 — /proposals/review"
      hint="왼쪽 칩으로 거르고 기획안을 골라 보세요. «승인» · «수정요청» · «반려»를 눌러 볼 수 있고, 수정요청은 사유를 적어야 보내집니다."
      feedback={feedback}
      onReset={() => {
        setList(INITIAL);
        setChip('전체');
        setSelectedId('algo');
        closeAsk();
        setFeedback(undefined);
      }}
      demo={
        <button type="button" onClick={resubmit} disabled={sel.status !== '수정요청'}>
          제출자가 고쳐서 다시 냄
        </button>
      }>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14}}>
        <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{padding: '12px 14px', borderBottom: '1px solid var(--app-line)'}}>
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)'}}>기획안 검토</div>
            <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 2}}>제출된 기획안을 확인하고 처리합니다</div>
            <div style={{display: 'flex', gap: 5, marginTop: 9}}>
              {CHIPS.map((c) => (
                <Chip key={c} active={chip === c} onClick={() => pickChip(c)}>
                  {c}
                </Chip>
              ))}
            </div>
          </div>
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              className="gm-plain gm-pick mk-row"
              aria-pressed={p.id === sel.id}
              style={rowStyle(p.id === sel.id)}
              onClick={() => select(p)}>
              <div>
                <div style={{display: 'flex', gap: 5, marginBottom: 5}}>
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  <Badge tone="grey">{p.kind}</Badge>
                </div>
                <div style={{fontSize: 13.5, fontWeight: 600, color: 'var(--app-ink)'}}>{p.title}</div>
                <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 3}}>
                  {p.submitter} · {p.date} 제출 · {p.round}회차
                </div>
              </div>
            </button>
          ))}
          {visible.length === 0 && (
            <div className="mk-row" style={{gridTemplateColumns: '1fr', fontSize: 12.5, color: 'var(--app-n500)'}}>
              해당하는 기획안이 없습니다.
            </div>
          )}
        </div>

        <div className="mk-card">
          <div style={{display: 'flex', gap: 5, alignItems: 'center', marginBottom: 8}}>
            <Badge tone={STATUS_TONE[sel.status]}>{sel.status}</Badge>
            <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>
              제출 회차 {sel.round} · 응답 순번 {sel.seq}
            </span>
          </div>
          <div style={{fontSize: 17, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 12}}>{sel.title}</div>

          {sel.status === '제출' && sel.round >= 2 && (
            <div
              style={{
                borderRadius: 10,
                background: 'var(--app-amber-soft)',
                color: 'var(--app-amber)',
                fontSize: 12,
                padding: '8px 11px',
                marginBottom: 12,
              }}>
              수정요청을 받아 다시 낸 기획안입니다
            </div>
          )}

          <div className="mk-section-label">기획안 내용</div>
          <dl className="mk-kv" style={{marginBottom: 14, gridTemplateColumns: '88px 1fr'}}>
            <dt>제출자</dt>
            <dd>{sel.submitter}</dd>
            <dt>유형</dt>
            <dd>{sel.kind}</dd>
            <dt>모집 정원</dt>
            <dd>{sel.capacity}</dd>
            <dt>운영 계획</dt>
            <dd>{sel.plan}</dd>
          </dl>

          {readable ? (
            <>
              <div className="mk-section-label">커리큘럼 미리보기 · {sel.curriculum}회차</div>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14}}>
                {Array.from({length: sel.curriculum ?? 0}, (_, i) => (
                  <span key={i} className="mk-cell" style={{background: 'var(--app-bg)', color: 'var(--app-n300)'}}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mk-section-label">커리큘럼 미리보기</div>
              <div
                style={{
                  border: '1px solid color-mix(in srgb, var(--app-danger) 45%, transparent)',
                  background: 'color-mix(in srgb, var(--app-danger) 8%, transparent)',
                  borderRadius: 12,
                  padding: '11px 13px',
                  marginBottom: 12,
                  fontSize: 12,
                  color: 'var(--app-danger)',
                  lineHeight: 1.75,
                }}>
                <div style={{fontWeight: 700}}>이 기획안은 지금 학술 프로그램으로 옮길 수 없습니다</div>
                <div>커리큘럼 형식이 어긋나 회차를 나눠 등록할 수 없습니다</div>
              </div>
            </>
          )}

          {readable && (sel.status === '제출' || sel.status === '승인') && (
            <div
              style={{
                border: '1px solid var(--app-accent)',
                background: 'var(--app-accent-soft)',
                borderRadius: 12,
                padding: '11px 13px',
                marginBottom: 12,
              }}>
              <div style={{fontSize: 11.5, fontWeight: 700, color: 'var(--app-accent-strong)', marginBottom: 6}}>승인하면 이렇게 됩니다</div>
              <div style={{fontSize: 12, color: 'var(--app-accent-strong)', lineHeight: 1.75}}>
                {sel.status === '승인' ? '✓' : '·'} 학술 프로그램 «{sel.title}» 생성
                <br />
                {sel.status === '승인' ? '✓' : '·'} {sel.submitter}에게 <b>{LEADER[sel.kind]}</b> 역할 부여
                <br />
                {sel.status === '승인' ? '✓' : '·'} 커리큘럼 {sel.curriculum}회차 등록
                <br />
                {sel.status === '승인' ? '✓' : '·'} 비어 있는 모집 폼 생성 (문항은 직접 채워야 합니다)
              </div>
            </div>
          )}

          {sel.status === '제출' && (
            <div style={{display: 'flex', gap: 6}}>
              <Btn
                variant="primary"
                locked={!readable}
                title={readable ? undefined : '이 기획안은 지금 학술 프로그램으로 옮길 수 없습니다'}
                onClick={approve}>
                승인
              </Btn>
              <Btn variant="ghost" onClick={askReason}>
                수정요청
              </Btn>
              <Btn variant="ghost-danger" onClick={reject}>
                반려
              </Btn>
            </div>
          )}

          {sel.status === '제출' && asking && (
            <div style={{marginTop: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--app-bg)'}}>
              <div className="mk-section-label">수정요청 사유 (필수)</div>
              <input
                className="gm-input"
                aria-label="수정요청 사유"
                value={reason}
                placeholder="예: 커리큘럼을 «1회차: 제목» 형식으로 한 줄에 하나씩 적어주세요"
                onChange={(e) => setReason(e.target.value)}
              />
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
      </div>
    </MockFrame>
  );
}
