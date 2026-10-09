import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '..';

type Tab = '페이지' | '포스트';
type PublishState = '없음' | '초안' | '게시';

type Item = {
  id: string;
  kind: Tab;
  name: string;
  /** 페이지의 주소. 고칠 수 없다 */
  path?: string;
  /** 페이지 카드 둘째 줄의 설명 */
  note?: string;
  updated?: string;
  state: PublishState;
  /** 저장한 본문 */
  body: string;
  /** 공개 화면이 지금 보여 주는 본문. null이면 공개 화면에 없다 */
  live: string | null;
};

// 페이지 두 자리는 옛 설명서의 그림 그대로다. 포스트 탭에서 보일 예시 포스트 둘을 더했다.
const INITIAL_ITEMS: Item[] = [
  {
    id: 'home-banner',
    kind: '페이지',
    name: '홈 배너',
    path: '/',
    note: '게시 중일 때만 홈 맨 위 한 줄 — 모집 안내 자리',
    updated: '2026-03-15 10:22',
    state: '게시',
    body: '2026 신입 부원을 모집합니다.',
    live: '2026 신입 부원을 모집합니다.',
  },
  {id: 'history', kind: '페이지', name: '연혁', path: '/about/history', state: '없음', body: '', live: null},
  {
    id: 'post-hackathon',
    kind: '포스트',
    name: '2026 겨울 해커톤 후기',
    updated: '2026-01-20 21:05',
    state: '게시',
    body: '열두 팀이 이틀 동안 서비스를 만들었습니다.',
    live: '열두 팀이 이틀 동안 서비스를 만들었습니다.',
  },
  {
    id: 'post-algorithm',
    kind: '포스트',
    name: '알고리즘 스터디 오리엔테이션 안내',
    updated: '2026-02-27 16:40',
    state: '초안',
    body: '첫 모임은 3월 둘째 주에 엽니다.',
    live: null,
  },
];

const NEW_POST_TITLE = '2026 신입 부원 모집 설명회 후기';

const STATE_TONE: Record<PublishState, 'blue' | 'grey' | 'outline'> = {게시: 'blue', 없음: 'grey', 초안: 'outline'};

/** 공개 화면이 지금 무엇을 보여 주는지. 게시 · 게시 취소 · 저장은 최대 5분 뒤에 반영된다 */
function publicLine(item: Item): string {
  const wanted = item.state === '게시' ? item.body : null;
  if (item.live === null && wanted === null) return '공개 화면에 보이지 않습니다.';
  if (item.live === null) return '아직 보이지 않습니다. 최대 5분 뒤에 나타납니다.';
  if (wanted === null) return '아직 보입니다. 최대 5분 뒤에 내려갑니다.';
  if (item.live !== wanted) return '아직 고치기 전 내용이 보입니다. 최대 5분 뒤에 바뀝니다.';
  return '지금 저장된 내용이 보입니다.';
}

const isStale = (item: Item) => item.live !== (item.state === '게시' ? item.body : null);

/**
 * 콘텐츠 목록 — /content. 페이지 탭은 자리의 표라 만들기 버튼이 없고, 포스트는 «포스트 만들기»로 만든다.
 * 설명서 «저장과 게시는 다릅니다»를 따른다: 저장은 게시 상태를 바꾸지 않고, 버튼은 «게시»나 «게시 취소» 하나만 보이며, 공개 화면은 최대 5분 뒤에 바뀐다.
 */
export function ContentListMock(): ReactNode {
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [tab, setTab] = useState<Tab>('페이지');
  /** 열어 둔 글. 'new'면 포스트 만들기 화면 */
  const [openId, setOpenId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [newCount, setNewCount] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const open = openId === null || openId === 'new' ? null : items.find((i) => i.id === openId) ?? null;

  const update = (id: string, patch: Partial<Item>) => setItems(items.map((i) => (i.id === id ? {...i, ...patch} : i)));

  const pickTab = (t: Tab) => {
    setTab(t);
    setOpenId(null);
    setFeedback(
      t === '페이지'
        ? '페이지 탭에는 만들기 버튼이 없습니다. 이미 그려진 자리를 열어 처음 저장하면 그것이 «만들기»입니다.'
        : '포스트는 활동 후기와 소식처럼 날짜순으로 쌓입니다. «포스트 만들기»로 얼마든지 만듭니다.',
    );
  };

  const openItem = (item: Item) => {
    setOpenId(item.id);
    setDraftBody(item.body);
    setFeedback(
      item.state === '없음'
        ? `«${item.name}» 자리를 열었습니다. 아직 쓰지 않은 자리입니다. 주소(${item.path})는 고칠 수 없습니다.`
        : `«${item.name}» 글을 열었습니다. 맨 위 «게시 상태» 카드에는 지금 할 수 있는 버튼 하나만 보입니다.`,
    );
  };

  const startNewPost = () => {
    setOpenId('new');
    setDraftTitle(NEW_POST_TITLE);
    setDraftBody('');
    setFeedback('포스트 만들기 화면입니다. 새로 만든 글은 언제나 «초안»입니다. «초안으로 저장»을 눌러 보세요.');
  };

  const saveNewPost = () => {
    const id = `post-new-${newCount + 1}`;
    const post: Item = {
      id,
      kind: '포스트',
      name: draftTitle.trim() || '(제목 없음)',
      updated: '방금',
      state: '초안',
      body: draftBody,
      live: null,
    };
    setItems([...items.filter((i) => i.kind === '페이지'), post, ...items.filter((i) => i.kind === '포스트')]);
    setNewCount(newCount + 1);
    setOpenId(id);
    setFeedback('«초안으로 저장»을 눌렀습니다. 새로 만든 글은 언제나 «초안»이라 아직 공개되지 않습니다. 이제 «게시 상태» 카드에 «게시»가 보입니다.');
  };

  const save = (item: Item) => {
    update(item.id, {body: draftBody, updated: '방금', state: item.state === '없음' ? '초안' : item.state});
    if (item.state === '없음') {
      setFeedback('처음 저장했습니다. 자리를 열어 처음 저장하는 것이 페이지의 «만들기»입니다. 새로 만든 글은 언제나 «초안»이라 아직 공개되지 않습니다.');
    } else if (item.state === '초안') {
      setFeedback('저장했습니다. «저장»을 눌러도 게시 상태는 바뀌지 않습니다. 여전히 «초안»이라 공개되지 않습니다.');
    } else {
      setFeedback(
        '저장했습니다. 게시 상태는 그대로 «게시»라 고친 내용이 바로 공개됩니다(공개 화면에는 최대 5분 뒤). 내려놓고 손보려면 «게시 취소»를 먼저 누르세요.',
      );
    }
  };

  const publish = (item: Item) => {
    update(item.id, {state: '게시'});
    setFeedback(
      '«게시»를 눌렀습니다. 버튼이 «게시 취소»로 바뀌었습니다. 공개 화면은 5분간 이전 내용을 보여 주니 최대 5분 기다리세요. 바로 안 보인다고 다시 게시하지 마세요.',
    );
  };

  const unpublish = (item: Item) => {
    update(item.id, {state: '초안'});
    setFeedback('«게시 취소»를 눌렀습니다. 초안으로 돌아가 버튼이 «게시»로 바뀌었습니다. 공개하지 않는 방법은 이것 하나입니다. 공개 화면에서도 최대 5분 뒤에 내려갑니다.');
  };

  const fiveMinutes = () => {
    setItems(items.map((i) => ({...i, live: i.state === '게시' ? i.body : null})));
    setFeedback('5분이 지나 공개 화면이 지금의 게시 상태와 저장된 본문을 따라잡았습니다.');
  };

  const reset = () => {
    setItems(INITIAL_ITEMS);
    setTab('페이지');
    setOpenId(null);
    setDraftTitle('');
    setDraftBody('');
    setNewCount(0);
    setFeedback(undefined);
  };

  const card = (item: Item) => (
    <button
      key={item.id}
      type="button"
      className="gm-plain"
      style={{display: 'block', width: '100%', marginBottom: 8}}
      onClick={() => openItem(item)}>
      <div className="mk-card gm-pick">
        <div style={{display: 'flex', gap: 9, alignItems: 'baseline'}}>
          <Badge tone={STATE_TONE[item.state]}>{item.state}</Badge>
          <span style={{fontSize: 14, fontWeight: 600, color: 'var(--app-ink)'}}>{item.name}</span>
          {item.path && <span style={{fontSize: 11.5, color: 'var(--app-n500)'}}>{item.path}</span>}
        </div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 5}}>
          {item.state === '없음' ? '아직 쓰지 않았습니다' : [`수정 ${item.updated}`, item.note].filter(Boolean).join(' · ')}
        </div>
      </div>
    </button>
  );

  const backLink = (
    <button
      type="button"
      className="gm-plain"
      style={{fontSize: 12, color: 'var(--app-accent)', marginBottom: 10}}
      onClick={() => {
        setOpenId(null);
        setFeedback(undefined);
      }}>
      ← 목록
    </button>
  );

  const bodyBox = (
    <div className="mk-card" style={{marginBottom: 12}}>
      <div className="mk-section-label">본문</div>
      <textarea
        className="gm-input"
        aria-label="본문"
        rows={3}
        value={draftBody}
        onChange={(e) => setDraftBody(e.target.value)}
        style={{resize: 'vertical'}}
      />
    </div>
  );

  let view: ReactNode;
  if (openId === 'new') {
    view = (
      <>
        {backLink}
        <div className="mk-card" style={{marginBottom: 12}}>
          <div className="mk-section-label">제목</div>
          <input className="gm-input" aria-label="제목" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
        </div>
        {bodyBox}
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <Btn variant="primary" onClick={saveNewPost}>
            초안으로 저장
          </Btn>
        </div>
      </>
    );
  } else if (open) {
    view = (
      <>
        {backLink}
        <div style={{display: 'flex', gap: 9, alignItems: 'baseline', marginBottom: 10}}>
          <span style={{fontSize: 18, fontWeight: 600, color: 'var(--app-ink)'}}>{open.name}</span>
          {open.path && <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{open.path}</span>}
        </div>
        <div className="mk-card" style={{marginBottom: 12}}>
          <div className="mk-section-label">게시 상태</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Badge tone={STATE_TONE[open.state]}>{open.state}</Badge>
            <span style={{flex: 1}} />
            {open.state === '초안' && (
              <Btn variant="primary" style={{padding: '5px 10px', fontSize: 12}} onClick={() => publish(open)}>
                게시
              </Btn>
            )}
            {open.state === '게시' && (
              <Btn variant="ghost" style={{padding: '5px 10px', fontSize: 12}} onClick={() => unpublish(open)}>
                게시 취소
              </Btn>
            )}
          </div>
          <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 8}}>
            {open.state === '없음' ? '아직 쓰지 않았습니다' : '공개 화면은 5분간 이전 내용을 보여 줍니다.'}
          </div>
        </div>
        {bodyBox}
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 12}}>
          <Btn variant="ghost" onClick={() => save(open)}>
            저장
          </Btn>
        </div>
        <div
          style={{
            border: '1px dashed var(--app-line-strong)',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 12,
            color: isStale(open) ? 'var(--app-amber)' : 'var(--app-n500)',
          }}>
          (예시) 공개 웹사이트 — {publicLine(open)}
        </div>
      </>
    );
  } else {
    const list = items.filter((i) => i.kind === tab);
    view = (
      <>
        {tab === '페이지' ? (
          <div className="mk-section-label">홈</div>
        ) : (
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 10}}>
            <Btn variant="primary" style={{padding: '5px 10px', fontSize: 12}} onClick={startNewPost}>
              포스트 만들기
            </Btn>
          </div>
        )}
        {list.map(card)}
      </>
    );
  }

  return (
    <MockFrame
      caption="콘텐츠 목록 — 페이지 탭은 «자리»의 표입니다"
      hint="탭을 바꾸고 카드를 눌러 여세요. «저장»과 «게시» · «게시 취소»를 누른 뒤 점선 띠의 «5분이 지남»을 눌러 보세요."
      feedback={feedback}
      onReset={reset}
      demo={
        <button type="button" onClick={fiveMinutes} disabled={!items.some(isStale)}>
          5분이 지남
        </button>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div className="mk-header">
        <div>
          <div style={{fontSize: 18, fontWeight: 600, color: 'var(--app-ink)'}}>콘텐츠</div>
          <div style={{fontSize: 12.5, color: 'var(--app-n500)', marginTop: 2}}>공개 사이트의 페이지와 포스트</div>
        </div>
      </div>
      <div style={{display: 'flex', gap: 6, margin: '12px 0'}}>
        {(['페이지', '포스트'] as const).map((t) => (
          <Chip key={t} active={tab === t} onClick={() => pickTab(t)}>
            {t}
          </Chip>
        ))}
      </div>
      {view}
    </MockFrame>
  );
}
