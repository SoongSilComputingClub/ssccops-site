import {useState, type ReactNode} from 'react';
import {Btn, Chip, MockFrame} from '..';

type Axis = '소개' | '기록' | '행사' | '학술' | '모집';

type AxisInfo = {
  path: string;
  /** 하위 페이지. 있으면 축 이름 옆에 ▾가 붙고, 하위 페이지에서는 같은 목록이 탭 줄로 선다 */
  subs: string[];
  /** 하위 메뉴는 없지만 제목 아래에 서는 분류 탭(기록) */
  tabs?: string[];
};

// 설명서 «상단 바 다섯 축 · 하위 메뉴»의 표를 따른다.
const AXES: Record<Axis, AxisInfo> = {
  소개: {path: '/about', subs: ['소개', '연혁', '핵심 가치', '운영진', '문의']},
  기록: {path: '/records', subs: [], tabs: ['전체', '학술', '행사', '뉴스']},
  행사: {path: '/events', subs: []},
  학술: {path: '/academic', subs: []},
  모집: {path: '/join', subs: ['안내', 'FAQ', '지난 모집']},
};

const ORDER: Axis[] = ['소개', '기록', '행사', '학술', '모집'];

/** 하위 페이지 가운데 주소가 따로 있는 것. 그 화면에서도 상단 바는 «소개»가 켜진다 */
const SUB_PATH: Record<string, string> = {운영진: '/operators', 문의: '/contact'};

function axisFeedback(a: Axis): string {
  const {path, subs} = AXES[a];
  switch (a) {
    case '행사':
      return `«행사»를 눌렀습니다(${path}). 하위 메뉴가 없고 행사 목록이 열립니다.`;
    case '학술':
      return `«학술»을 눌렀습니다(${path}). 하위 메뉴가 없습니다. 모집 중인 프로그램 목록과, 학술 앱으로 가는 «LMS로 가기», «기획안 제출하기»가 있습니다. 폐지한 프로그램은 모집 폼이 마감되어 목록에서 빠집니다.`;
    case '기록':
      return `«기록»을 눌렀습니다(${path}). 하위 메뉴는 없고, 제목 아래 분류 탭으로 전체, 학술, 행사, 뉴스를 고릅니다.`;
    default:
      return `«${a}» 축 이름을 눌렀습니다. 그 축의 첫 페이지인 «${subs[0]}»(${path})로 갑니다. 제목 아래에 하위 메뉴와 같은 목록이 탭 줄로 서서 옆 페이지로 바로 갑니다.`;
  }
}

/**
 * 상단 바 다섯 축 — 공개 웹사이트. 축 이름을 누르면 첫 페이지로 가고, ▾를 누르면 하위 메뉴가 열린다.
 * 설명서의 축별 하위 메뉴 표와 «운영진, 문의는 소개 안에 있다»를 따른다.
 */
export function SiteTopBarMock(): ReactNode {
  const [axis, setAxis] = useState<Axis>('소개');
  const [page, setPage] = useState('소개');
  const [menu, setMenu] = useState<Axis | null>('소개');
  const [feedback, setFeedback] = useState<ReactNode>();

  const info = AXES[axis];
  const tabs = info.subs.length > 0 ? info.subs : (info.tabs ?? []);

  const pickAxis = (a: Axis) => {
    setAxis(a);
    setPage(AXES[a].subs[0] ?? AXES[a].tabs?.[0] ?? '');
    setMenu(null);
    setFeedback(axisFeedback(a));
  };

  const toggleMenu = (a: Axis) => {
    const open = menu === a ? null : a;
    setMenu(open);
    setFeedback(
      open
        ? `«${a} ▾»를 눌러 하위 메뉴를 열었습니다. 데스크톱에서는 ▾를 눌러야 열리고, 마우스를 올리기만 해서는 열리지 않습니다.`
        : '하위 메뉴를 닫았습니다.',
    );
  };

  const pickSub = (a: Axis, s: string) => {
    setAxis(a);
    setPage(s);
    setMenu(null);
    const path = SUB_PATH[s];
    setFeedback(
      path
        ? `«${s}»로 갑니다(${path}). 주소는 그대로이고, 이 화면에서도 상단 바는 «소개»가 켜집니다.${
            s === '운영진' ? ' 역대 운영진은 탭이 아니라 운영진 글 아래 목록으로 서고, 대수를 누르면 그 대의 운영진 페이지가 열립니다.' : ''
          }`
        : `«${s}» 페이지로 갑니다. 제목 아래 탭 줄에서 옆 페이지로 바로 갈 수 있습니다.`,
    );
  };

  const toAcademicApp = (label: string) =>
    setFeedback(`«${label}»를 눌렀습니다. 신청과 기획안 제출은 학술 앱에서 하므로 여기서 학술 앱으로 넘어갑니다.`);

  return (
    <MockFrame
      caption="상단 바 다섯 축 — «소개 ▾»를 눌러 하위 메뉴를 연 모습"
      hint="축 이름과 ▾를 따로 눌러 보세요. ▾는 하위 메뉴를 열고, 축 이름은 그 축의 첫 페이지로 갑니다."
      feedback={feedback}
      onReset={() => {
        setAxis('소개');
        setPage('소개');
        setMenu('소개');
        setFeedback(undefined);
      }}
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div className="mk-topbar">
        <span className="brand">SSCC</span>
        {ORDER.map((a) => (
          <span key={a} style={{display: 'inline-flex', gap: 3}}>
            <button
              type="button"
              className={a === axis ? 'gm-plain on' : 'gm-plain'}
              aria-current={a === axis ? 'page' : undefined}
              onClick={() => pickAxis(a)}>
              {a}
            </button>
            {AXES[a].subs.length > 0 && (
              <button
                type="button"
                className={a === axis ? 'gm-plain on' : 'gm-plain'}
                aria-expanded={menu === a}
                aria-label={`${a} 하위 메뉴`}
                onClick={() => toggleMenu(a)}>
                ▾
              </button>
            )}
          </span>
        ))}
        <span style={{flex: 1}} />
        <span>로그인</span>
      </div>
      <div
        style={{
          border: '1px solid var(--app-line)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: '12px 16px',
          background: 'var(--app-bg)',
        }}>
        {menu ? (
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              gap: 6,
              padding: '10px 14px',
              border: '1px solid var(--app-line)',
              borderRadius: 10,
              background: 'var(--app-surface)',
              fontSize: 12.5,
              color: 'var(--app-n400)',
            }}>
            {AXES[menu].subs.map((s, i) => (
              <button
                key={s}
                type="button"
                className="gm-plain"
                style={i === 0 ? {color: 'var(--app-accent)', fontWeight: 600} : undefined}
                onClick={() => pickSub(menu, s)}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div style={{fontSize: 20, fontWeight: 500, color: 'var(--app-ink)'}}>
              {info.subs.length > 0 ? page : axis === '행사' ? '동아리 행사' : axis}
            </div>
            {tabs.length > 0 && (
              <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 0'}}>
                {tabs.map((t) => (
                  <Chip
                    key={t}
                    active={t === page}
                    onClick={() => (info.subs.length > 0 ? pickSub(axis, t) : (setPage(t), setFeedback(`«${t}» 분류 탭을 켰습니다.`)))}>
                    {t}
                  </Chip>
                ))}
              </div>
            )}
            {axis === '학술' && (
              <div className="mk-card" style={{marginTop: 12}}>
                <div className="mk-section-label">참여하기</div>
                <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                  <Btn variant="primary" onClick={() => toAcademicApp('LMS로 가기')}>
                    LMS로 가기
                  </Btn>
                  <Btn variant="ghost" onClick={() => toAcademicApp('기획안 제출하기')}>
                    기획안 제출하기
                  </Btn>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MockFrame>
  );
}
