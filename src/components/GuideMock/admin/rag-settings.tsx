import {Fragment, useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '..';

type IndexState = '대기' | '색인 중' | '색인 완료' | '실패';
type Use = '미사용' | '답변에 사용 중' | '제외됨';

type Doc = {
  id: number;
  name: string;
  kind: string;
  size: string;
  /** 색인이 끝났을 때의 청크 수 */
  chunks: number;
  date: string;
  index: IndexState;
  use: Use;
};

// 앞의 둘은 옛 설명서의 그림 그대로다. 카드의 «등록 문서 4 · 색인 완료 3 · 총 청크 128»에 맞춰 뒤의 둘을 더했다.
const INITIAL: Doc[] = [
  {id: 1, name: 'SSCC 회칙', kind: '회칙', size: '82 KB', chunks: 64, date: '2026-03-24', index: '색인 완료', use: '답변에 사용 중'},
  {id: 2, name: '2026 지원금 집행 지침', kind: '일반 문서', size: '1.2 MB', chunks: 37, date: '2026-09-16', index: '색인 중', use: '미사용'},
  {id: 3, name: '동아리방 이용 수칙', kind: '일반 문서', size: '24 KB', chunks: 18, date: '2026-03-24', index: '색인 완료', use: '답변에 사용 중'},
  {id: 4, name: '회계 운영 세칙', kind: '일반 문서', size: '56 KB', chunks: 46, date: '2026-04-02', index: '색인 완료', use: '미사용'},
];

/** «+ 문서 업로드»를 누를 때마다 차례로 고르는 예시 파일 */
const UPLOADS: {file: string; ok: boolean; why?: string; doc?: Omit<Doc, 'id' | 'index' | 'use'>}[] = [
  {
    file: '동아리방_이용_수칙_2026_개정.pdf',
    ok: true,
    doc: {name: '동아리방 이용 수칙 (2026 개정)', kind: '일반 문서', size: '31 KB', chunks: 21, date: '2026-10-09'},
  },
  {file: '정기총회_녹음.m4a', ok: false, why: '형식이 맞지 않습니다'},
  {file: '행사_자료집.pdf', ok: false, why: '24MB라 크기를 넘습니다'},
];

const INDEX_TONE: Record<IndexState, 'grey' | 'amber' | 'blue' | 'red'> = {
  대기: 'grey',
  '색인 중': 'amber',
  '색인 완료': 'blue',
  실패: 'red',
};

const USE_TONE: Record<Use, 'outline' | 'outline-accent' | 'outline-red'> = {
  미사용: 'outline',
  '답변에 사용 중': 'outline-accent',
  제외됨: 'outline-red',
};

type Confirm = {id: number; action: '사용' | '제외' | '삭제'};

const CONFIRM_LABEL: Record<Confirm['action'], string> = {사용: '답변에 사용', 제외: '답변에서 영구 제외', 삭제: '삭제'};

const cols = '2.2fr .7fr .8fr 1fr 1fr 1fr 1.3fr';

/**
 * RAG 설정 — /ragsettings.
 * 설명서의 색인 상태 · 적용 상태 표, «세 가지 조작»(답변에 사용은 색인 완료 뒤에, 영구 제외는 되돌릴 수 없음, 재색인은 확인 없이),
 * «문서를 올리는 순서», «위 카드 셋과 표의 숫자가 다를 때»를 따른다.
 */
export function RagSettingsMock(): ReactNode {
  const [docs, setDocs] = useState<Doc[]>(INITIAL);
  const [query, setQuery] = useState('');
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [uploadIndex, setUploadIndex] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  // 카드는 언제나 전체 문서를 센다. 검색어는 표의 행만 줄인다.
  const done = docs.filter((d) => d.index === '색인 완료');
  const totalChunks = done.reduce((sum, d) => sum + d.chunks, 0);
  const rows = docs.filter((d) => d.name.includes(query.trim()));

  const patch = (id: number, p: Partial<Doc>) => setDocs(docs.map((d) => (d.id === id ? {...d, ...p} : d)));
  const firstWith = (states: IndexState[]) => docs.find((d) => states.includes(d.index));

  const upload = () => {
    const sample = UPLOADS[uploadIndex];
    if (!sample) {
      setFeedback('예시로 올릴 파일을 다 써 봤습니다. «처음으로»를 누르면 다시 해 볼 수 있습니다.');
      return;
    }
    setUploadIndex(uploadIndex + 1);
    if (!sample.ok || !sample.doc) {
      setFeedback(`«규정 문서 올리기» 창에서 «${sample.file}» 파일을 골랐습니다. ${sample.why}. .md · .pdf · .docx, 최대 10MB이고 그 밖의 파일은 고르는 순간 막힙니다.`);
      return;
    }
    const id = Math.max(0, ...docs.map((d) => d.id)) + 1;
    setDocs([...docs, {...sample.doc, id, index: '대기', use: '미사용'}]);
    setQuery('');
    setFeedback(
      `«규정 문서 올리기» 창에서 «${sample.file}» 파일을 고르고 표시명을 적어 올렸습니다. «미사용 · 대기»로 들어옵니다. 개정판이니 옛 «동아리방 이용 수칙»을 지우거나 «답변에서 영구 제외»하세요 — 남겨 두면 옛 조항과 새 조항이 섞여 답합니다.`,
    );
  };

  const useInAnswers = (d: Doc) => {
    if (d.index !== '색인 완료') {
      setFeedback(`잠겨 있습니다. «답변에 사용»은 색인이 끝나야 누를 수 있습니다. 지금은 «${d.index}»입니다.`);
      return;
    }
    setConfirm({id: d.id, action: '사용'});
    setFeedback('«답변에 사용»은 확인을 한 번 받습니다.');
  };

  const reindex = (d: Doc) => {
    setConfirm(null);
    patch(d.id, {index: '색인 중'});
    setFeedback(`«${d.name}»을 다시 읽습니다. 되돌릴 것이 없어 확인 없이 바로 실행되고, 끝날 때까지 «색인 중»입니다. 아래 띠에서 색인을 끝내 보세요.`);
  };

  const runConfirm = () => {
    if (!confirm) return;
    const d = docs.find((x) => x.id === confirm.id);
    setConfirm(null);
    if (!d) return;
    if (confirm.action === '사용') {
      patch(d.id, {use: '답변에 사용 중'});
      setFeedback(`«${d.name}»을 답변에 사용합니다. 이제 도우미가 이 문서로 답합니다.`);
    } else if (confirm.action === '제외') {
      patch(d.id, {use: '제외됨'});
      setFeedback(
        `«${d.name}»을 답변에서 영구 제외했습니다. 답변 근거에서 빠지고 색인된 내용도 지워집니다. 실제 화면에서는 되돌릴 수 없습니다 — 다시 쓰려면 같은 파일을 새로 올려야 합니다.`,
      );
    } else {
      setDocs(docs.filter((x) => x.id !== d.id));
      setFeedback(`«${d.name}»을 삭제했습니다. 문서 · 색인 · 원본 파일이 함께 사라지고, 위 카드 숫자도 함께 줄어듭니다. 되살리려면 같은 파일을 다시 올려야 합니다.`);
    }
  };

  const confirmText = (d: Doc, action: Confirm['action']): ReactNode => {
    if (action === '사용') return '이 문서로 답하기 시작합니다.';
    if (action === '제외') return '답변 근거에서 빼고 색인된 내용도 지웁니다. 되돌릴 수 없습니다.';
    return (
      <>
        {d.use === '답변에 사용 중' && <b>지금 답변에 쓰이는 문서입니다. </b>}
        문서 · 색인 · 원본 파일이 함께 사라집니다. 되살리려면 같은 파일을 다시 올려야 합니다.
      </>
    );
  };

  const actions = (d: Doc): ReactNode => {
    const busy = d.index === '대기' || d.index === '색인 중';
    const list: {label: string; onClick: () => void; color: string; locked?: boolean}[] = [];
    if (d.use === '답변에 사용 중') {
      list.push({
        label: '답변에서 영구 제외',
        color: 'var(--app-accent)',
        onClick: () => {
          setConfirm({id: d.id, action: '제외'});
          setFeedback('«답변에서 영구 제외»는 되돌릴 수 없어 확인을 받습니다.');
        },
      });
    }
    if (d.use === '미사용') {
      const locked = d.index !== '색인 완료';
      list.push({label: '답변에 사용', color: locked ? 'var(--app-n500)' : 'var(--app-accent)', locked, onClick: () => useInAnswers(d)});
    }
    if (d.use !== '제외됨') list.push({label: '재색인', color: 'var(--app-accent)', onClick: () => reindex(d)});
    list.push({
      label: '삭제',
      color: 'var(--app-n400)',
      onClick: () => {
        setConfirm({id: d.id, action: '삭제'});
        setFeedback(d.use === '답변에 사용 중' ? '지금 답변에 쓰이는 문서라 경고 문구가 달라집니다.' : '«삭제»는 확인을 받습니다.');
      },
    });
    return list.map((a, i) => (
      <Fragment key={a.label}>
        {i > 0 && ' · '}
        <button
          type="button"
          className="gm-plain"
          aria-disabled={a.locked || undefined}
          title={a.locked ? '색인이 끝나야 누를 수 있습니다' : undefined}
          style={{color: busy ? 'var(--app-n500)' : a.color, cursor: a.locked ? 'not-allowed' : undefined}}
          onClick={a.onClick}>
          {a.label}
        </button>
      </Fragment>
    ));
  };

  const finish = (to: '색인 완료' | '실패') => {
    const d = firstWith(['색인 중']);
    if (!d) return;
    patch(d.id, {index: to});
    setFeedback(
      to === '색인 완료'
        ? `«${d.name}»의 색인이 끝났습니다. 위 카드의 색인 완료와 총 청크가 늘었습니다.` +
            (d.use === '미사용' ? ' 이제 «답변에 사용»을 누를 수 있습니다.' : '')
        : `«${d.name}»의 색인이 실패했습니다. 실제 화면에서는 ⓘ에 마우스를 올리면 이유가 나옵니다 — 대개 파일이 깨졌거나 형식이 맞지 않습니다.`,
    );
  };

  return (
    <MockFrame
      caption="RAG 설정 — /ragsettings"
      hint="«+ 문서 업로드»와 줄 오른쪽 조작을 눌러 보세요. «문서명 검색»에 글자를 넣으면 표만 줄고 카드 숫자는 그대로입니다."
      feedback={feedback}
      onReset={() => {
        setDocs(INITIAL);
        setQuery('');
        setConfirm(null);
        setUploadIndex(0);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            disabled={!firstWith(['대기'])}
            onClick={() => {
              const d = firstWith(['대기']);
              if (!d) return;
              patch(d.id, {index: '색인 중'});
              setFeedback(`«${d.name}»의 차례가 와서 색인이 시작됐습니다. 진행 중인 문서가 있으면 화면이 몇 초마다 상태를 자동으로 확인합니다.`);
            }}>
            색인이 시작됨
          </button>
          <button type="button" disabled={!firstWith(['색인 중'])} onClick={() => finish('색인 완료')}>
            색인이 끝남
          </button>
          <button type="button" disabled={!firstWith(['색인 중'])} onClick={() => finish('실패')}>
            색인이 실패함
          </button>
        </>
      }>
      <div className="mk-header">
        <div>
          <div className="title">RAG 설정</div>
          <div className="sub">규정 도우미가 참조할 문서를 등록하고 색인 상태를 관리합니다</div>
        </div>
        <Btn variant="primary" onClick={upload}>
          + 문서 업로드
        </Btn>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, margin: '12px 0'}}>
        <div className="mk-stat">
          <div className="lb">등록 문서</div>
          <div className="vl">{docs.length}</div>
        </div>
        <div className="mk-stat">
          <div className="lb">색인 완료</div>
          <div className="vl" style={{color: 'var(--app-accent)'}}>
            {done.length}
          </div>
        </div>
        <div className="mk-stat">
          <div className="lb">총 청크</div>
          <div className="vl">{totalChunks}</div>
        </div>
      </div>
      <div className="mk-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
          <span style={{fontSize: 16, fontWeight: 500, color: 'var(--app-ink)'}}>지식 문서</span>
          <input
            aria-label="문서명 검색"
            placeholder="문서명 검색"
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              const n = docs.filter((d) => d.name.includes(q.trim())).length;
              setFeedback(
                q.trim()
                  ? `표에는 ${n}건만 남았지만 위 카드 숫자는 그대로입니다. 카드는 언제나 전체 문서를 셉니다. 잘못 센 것이 아닙니다.`
                  : undefined,
              );
            }}
            style={{
              border: '1px solid var(--app-line-strong)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 12,
              color: 'var(--app-ink)',
              background: 'transparent',
              fontFamily: 'inherit',
              width: 150,
            }}
          />
        </div>
        <div className="mk-row mk-th" style={{gridTemplateColumns: cols}}>
          <span>문서명</span>
          <span>크기</span>
          <span>청크</span>
          <span>등록일</span>
          <span>상태</span>
          <span>적용</span>
          <span style={{textAlign: 'right'}}>조작</span>
        </div>
        {rows.map((d) => (
          <Fragment key={d.id}>
            <div className="mk-row" style={{gridTemplateColumns: cols, alignItems: 'center'}}>
              <span>
                <span style={{color: 'var(--app-ink)'}}>{d.name}</span>
                <br />
                <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>{d.kind}</span>
              </span>
              <span>{d.size}</span>
              <span>{d.index === '색인 완료' ? `${d.chunks}개 청크` : '—'}</span>
              <span>{d.date}</span>
              <span>
                {d.index === '실패' ? (
                  <Badge tone="red">
                    실패{' '}
                    <button
                      type="button"
                      className="gm-plain"
                      title="읽지 못했습니다. 대개 파일이 깨졌거나 형식이 맞지 않습니다"
                      aria-label="실패 이유"
                      onClick={() => setFeedback('실제 화면에서는 ⓘ에 마우스를 올리면 이유가 나옵니다. 대개 파일이 깨졌거나 형식이 맞지 않습니다.')}>
                      ⓘ
                    </button>
                  </Badge>
                ) : (
                  <Badge tone={INDEX_TONE[d.index]}>{d.index}</Badge>
                )}
              </span>
              <span>
                <Badge tone={USE_TONE[d.use]}>{d.use}</Badge>
              </span>
              <span style={{textAlign: 'right', fontSize: 12}}>{actions(d)}</span>
            </div>
            {confirm?.id === d.id && (
              <div
                style={{
                  margin: '0 0 9px',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'var(--app-bg)',
                  fontSize: 12.5,
                  color: 'var(--app-n300)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}>
                <span style={{flex: 1, minWidth: '16em'}}>
                  <b style={{color: 'var(--app-ink)'}}>{CONFIRM_LABEL[confirm.action]}</b> — {confirmText(d, confirm.action)}
                </span>
                <Btn
                  variant="ghost"
                  style={{padding: '5px 10px', fontSize: 12}}
                  onClick={() => {
                    setConfirm(null);
                    setFeedback('취소했습니다. 아무것도 바뀌지 않습니다.');
                  }}>
                  취소
                </Btn>
                <Btn variant={confirm.action === '사용' ? 'primary' : 'ghost-danger'} style={{padding: '5px 10px', fontSize: 12}} onClick={runConfirm}>
                  {CONFIRM_LABEL[confirm.action]}
                </Btn>
              </div>
            )}
          </Fragment>
        ))}
        {rows.length === 0 && (
          <div className="mk-row" style={{gridTemplateColumns: '1fr', fontSize: 12.5, color: 'var(--app-n500)'}}>
            찾는 문서가 없습니다.
          </div>
        )}
      </div>
      <p style={{fontSize: 12.5, color: 'var(--app-n500)', margin: '10px 0 0', lineHeight: 1.75}}>
        올린 문서는 «미사용»으로 등록됩니다. «답변에 사용»을 눌러야 도우미가 그 문서로 답합니다. 개정된 규정을 올릴 때는 옛 문서를 지워주세요. 남겨 두면 옛
        조항과 새 조항이 섞여 답합니다.
      </p>
    </MockFrame>
  );
}
