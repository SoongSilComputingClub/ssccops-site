import {useState, type ReactNode} from 'react';
import {MockFrame} from '../..';

type Persona = 'super' | 'staff';

type Item = {
  name: string;
  /** 권한이 일부인 운영진에게도 보이는가. 보이지 않는 화면은 전체 메뉴에도 없다 */
  staff: boolean;
};

const GROUPS: {label: string; items: Item[]}[] = [
  {
    label: '운영',
    items: [
      {name: '운영 대시보드', staff: true},
      {name: '운영 통합', staff: true},
      {name: '승인함', staff: true},
      {name: '운영 등록', staff: true},
    ],
  },
  {
    label: '설정',
    items: [
      {name: '태그 관리', staff: true},
      {name: '역할 관리', staff: false},
      {name: '권한 관리', staff: false},
      {name: 'RAG 설정', staff: false},
      {name: '알림 유형', staff: false},
    ],
  },
];

const ACCOUNT = ['내 정보', '알림'];

const PERSONA_NAME: Record<Persona, string> = {super: '최고관리자', staff: '권한이 일부인 운영진'};

/**
 * 전체 메뉴 — /sitemap.
 * 설명서 «전체 메뉴 — 열 수 있는 화면»(사이드바와 같은 목록이라 권한이 없는 화면은 없다, 주소를 쳐도 없는 주소)을 따른다.
 */
export function SitemapMock(): ReactNode {
  const [persona, setPersona] = useState<Persona>('super');
  const [feedback, setFeedback] = useState<ReactNode>();

  const groups = GROUPS.map((g) => ({...g, items: g.items.filter((i) => persona === 'super' || i.staff)})).filter(
    (g) => g.items.length > 0,
  );
  const canOpenNotificationTypes = persona === 'super';

  return (
    <MockFrame
      caption={`전체 메뉴 — /sitemap (${PERSONA_NAME[persona]}가 보는 모습)`}
      hint="화면 이름을 눌러 보고, 아래 점선 띠에서 보는 사람을 바꿔 보세요. 권한이 없는 화면은 목록에서 아예 빠집니다."
      feedback={feedback}
      onReset={() => {
        setPersona('super');
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            onClick={() => {
              const next: Persona = persona === 'super' ? 'staff' : 'super';
              setPersona(next);
              setFeedback(
                next === 'staff'
                  ? '권한이 일부인 운영진으로 봅니다. 권한이 없는 역할 관리, 권한 관리, RAG 설정, 알림 유형이 목록에서 사라졌습니다. 잠금 표시나 필요한 권한도 적히지 않습니다.'
                  : '최고관리자로 봅니다. 모든 화면이 보이고, 사이드바에도 같은 화면이 뜹니다.',
              );
            }}>
            {persona === 'super' ? '권한이 일부인 운영진으로 보기' : '최고관리자로 보기'}
          </button>
          <button
            type="button"
            onClick={() =>
              setFeedback(
                canOpenNotificationTypes
                  ? '«알림 유형» 주소로 들어갑니다. 권한이 있으니 화면이 열립니다.'
                  : '«알림 유형» 주소를 직접 쳤지만 권한이 없어 «없는 주소입니다»와 «전체 메뉴에서 다시 찾아주세요.»가 뜹니다. 정말 없는 주소일 때와 같은 화면입니다.',
              )
            }>
            «알림 유형» 주소를 직접 쳐 봄
          </button>
        </>
      }>
      <div style={{marginBottom: 10}}>
        <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)'}}>전체 메뉴</div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 2}}>열 수 있는 화면</div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14}}>
        {groups.map((g) => (
          <div key={g.label} className="mk-card">
            <div className="mk-section-label">{g.label}</div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', lineHeight: 2}}>
              {g.items.map((item) => (
                <div key={item.name}>
                  <button type="button" className="gm-plain" onClick={() => setFeedback(`«${item.name}» 화면으로 갑니다.`)}>
                    {item.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="mk-card">
          <div className="mk-section-label">계정</div>
          <div style={{fontSize: 12, color: 'var(--app-n500)', lineHeight: 2}}>
            {ACCOUNT.map((name) => (
              <div key={name}>
                <button
                  type="button"
                  className="gm-plain"
                  onClick={() => setFeedback(`«${name}» 화면으로 갑니다. 계정 화면은 권한과 상관없이 열립니다.`)}>
                  {name}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
