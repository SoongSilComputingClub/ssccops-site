import {useState, type ReactNode} from 'react';
import {Btn, Chip, MockFrame} from '..';

type Axis = 'SSCC' | '운영진' | '활동' | '행사' | '학술' | '모집' | '문의';

type AxisInfo = {
  path: string;
  /** 제목 아래 탭 줄. 비어 있으면 탭이 없다 */
  tabs: string[];
};

// 설명서 «상단 바 일곱 항목»의 표를 따른다. «활동»은 표의 기록 축(/records), «행사»는 축이 아니라 따로 세운 항목이다.
const AXES: Record<Axis, AxisInfo> = {
  SSCC: {path: '/about', tabs: ['소개', '연혁', '핵심 가치']},
  운영진: {path: '/operators', tabs: ['지금', '역대']},
  활동: {path: '/records', tabs: ['전체', '학술', '행사', '뉴스']},
  행사: {path: '/events', tabs: ['전체', '모집', '세미나', '프로젝트']},
  학술: {path: '/academic', tabs: []},
  모집: {path: '/join', tabs: ['안내', 'FAQ', '지난 모집']},
  문의: {path: '/contact', tabs: []},
};

const ORDER: Axis[] = ['SSCC', '운영진', '활동', '행사', '학술', '모집', '문의'];

function axisFeedback(a: Axis): string {
  const {path} = AXES[a];
  switch (a) {
    case '행사':
      return `«행사» 항목을 눌렀습니다(${path}). «행사»는 축이 아니라 따로 세운 항목이라 행사 목록이 열리고, 상단 바에서 «행사»가 켜집니다.`;
    case '학술':
      return `«학술» 항목을 눌렀습니다(${path}). 상단 바에서 바로 학술 앱으로 나가지 않고 이 설명 페이지가 먼저 열립니다. 탭 줄은 없고, 학술 앱으로 가는 것은 아래 «참여하기» 상자의 버튼입니다.`;
    case '문의':
      return `«문의» 항목을 눌렀습니다(${path}). 문의는 탭 줄이 없습니다.`;
    case 'SSCC':
      return `«SSCC» 항목을 눌렀습니다(${path}). 그 항목이 굵게 켜지고, 제목 아래 탭 줄도 이 축의 것으로 바뀝니다. 지금 화면에서는 이 항목의 글자가 «소개»입니다. 가는 곳은 그대로입니다.`;
    default:
      return `«${a}» 항목을 눌렀습니다(${path}). 그 항목이 굵게 켜지고, 제목 아래 탭 줄도 이 축의 것으로 바뀝니다.`;
  }
}

/**
 * 상단 바 일곱 항목 — 공개 웹사이트. 항목을 누르면 그 축이 굵게 켜지고 제목과 탭 줄이 바뀐다.
 * 설명서의 축별 탭 줄 표와 «학술»의 «참여하기» 상자를 따른다.
 */
export function SiteTopBarMock(): ReactNode {
  const [axis, setAxis] = useState<Axis>('활동');
  const [tab, setTab] = useState('전체');
  const [feedback, setFeedback] = useState<ReactNode>();

  const {tabs} = AXES[axis];

  const pickAxis = (a: Axis) => {
    setAxis(a);
    setTab(AXES[a].tabs[0] ?? '');
    setFeedback(axisFeedback(a));
  };

  const pickTab = (t: string) => {
    setTab(t);
    setFeedback(
      axis === '행사'
        ? `«${t}» 분류 칩을 켰습니다.`
        : `«${t}» 탭을 눌렀습니다. 하위 페이지로 가는 길은 상단 바가 아니라 제목 아래 탭 줄입니다.`,
    );
  };

  const toAcademicApp = (label: string) =>
    setFeedback(
      `«${label}»를 눌렀습니다. 신청과 기획안 제출은 학술 앱에서 하므로 여기서 학술 앱으로 넘어갑니다. 이 «참여하기» 상자는 글이 아니라 시스템이 붙이는 것이라 콘텐츠에서 쓰지 않아도 나옵니다.`,
    );

  return (
    <MockFrame
      caption="상단 바 일곱 항목 — 지금 보는 축이 굵게 표시됩니다"
      hint="상단 바의 항목을 눌러 보세요. 켜진 항목이 굵어지고 제목과 탭 줄이 바뀝니다."
      feedback={feedback}
      onReset={() => {
        setAxis('활동');
        setTab('전체');
        setFeedback(undefined);
      }}
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div className="mk-topbar">
        <span className="brand">SSCC</span>
        {ORDER.map((a) => (
          <button
            key={a}
            type="button"
            className={a === axis ? 'gm-plain on' : 'gm-plain'}
            aria-current={a === axis ? 'page' : undefined}
            onClick={() => pickAxis(a)}>
            {a}
          </button>
        ))}
        <span style={{flex: 1}} />
        <span>로그인</span>
      </div>
      <div
        style={{
          border: '1px solid var(--app-line)',
          borderTop: 'none',
          borderRadius: '0 0 12px 12px',
          padding: 16,
          background: 'var(--app-bg)',
        }}>
        <div style={{fontSize: 20, fontWeight: 500, color: 'var(--app-ink)'}}>{axis === '행사' ? '동아리 행사' : axis}</div>
        {axis === '행사' && (
          <div style={{fontSize: 12.5, color: 'var(--app-n500)', marginTop: 2}}>
            숭실컴퓨팅클럽이 여는 모집 · 세미나 · 프로젝트 · 행사입니다
          </div>
        )}
        {tabs.length > 0 && (
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 0'}}>
            {tabs.map((t) => (
              <Chip key={t} active={t === tab} onClick={() => pickTab(t)}>
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
      </div>
    </MockFrame>
  );
}
