import {useState, type ReactNode} from 'react';
import {Badge, MockFrame} from '../..';

type Item = {name: string; /** 권한이 없을 때 잠금으로 보이는 화면. 잠긴 이유 */ locked?: string};

const GROUPS: {label: string; items: Item[]}[] = [
  {label: '운영', items: [{name: '운영 대시보드'}, {name: '운영 통합'}, {name: '승인함'}, {name: '운영 등록'}]},
  {
    label: '설정',
    items: [
      {name: '역할 관리'},
      {name: '권한 관리', locked: '이 화면을 쓸 권한이 없습니다'},
      {name: 'RAG 설정'},
      {name: '알림 유형', locked: '최고관리자에게만 보이는 화면입니다'},
    ],
  },
];

/**
 * 전체 메뉴 — /sitemap.
 * 설명서 «전체 메뉴 — 이 앱의 모든 화면»(권한이 없는 화면도 잠금으로 보이고, 필요한 권한이 함께 적힘)을 따른다.
 */
export function SitemapMock(): ReactNode {
  const [granted, setGranted] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();

  const open = (item: Item) => {
    if (item.locked && !granted) {
      setFeedback(
        `«${item.name}» 화면은 잠금입니다. ${item.locked} — 사이드바에는 뜨지 않지만 전체 메뉴에는 잠금으로 보이고, 어떤 권한이 필요한지가 함께 적힙니다. «그런 화면이 있기는 한가»를 확인하는 자리입니다.`,
      );
      return;
    }
    setFeedback(`«${item.name}» 화면으로 갑니다.`);
  };

  return (
    <MockFrame
      caption="전체 메뉴 — /sitemap (권한이 없는 화면은 잠금으로 보입니다)"
      hint="화면 이름을 눌러 보세요. 잠금이 붙은 화면을 누르면 왜 잠겼는지 나옵니다."
      feedback={feedback}
      onReset={() => {
        setGranted(false);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() => {
            setGranted(!granted);
            setFeedback(
              granted
                ? '권한이 없는 사람으로 돌아왔습니다. 그 화면들이 다시 잠금으로 보입니다.'
                : '최고관리자로 봅니다. 잠금이 사라지고, 그 화면들이 사이드바에도 뜹니다.',
            );
          }}>
          {granted ? '권한이 없는 사람으로 보기' : '최고관리자로 보기'}
        </button>
      }>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        {GROUPS.map((g) => (
          <div key={g.label} className="mk-card">
            <div className="mk-section-label">{g.label}</div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', lineHeight: 2}}>
              {g.items.map((item) => (
                <div key={item.name}>
                  <button
                    type="button"
                    className="gm-plain"
                    title={item.locked && !granted ? item.locked : undefined}
                    onClick={() => open(item)}>
                    {item.name}
                    {item.locked && !granted && (
                      <>
                        {' '}
                        <Badge tone="grey">잠금</Badge>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}
