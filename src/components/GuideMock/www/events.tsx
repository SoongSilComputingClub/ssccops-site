import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame, Pill} from '..';

/* ============ 행사 목록 ============ */

type Category = '모집' | '세미나' | '프로젝트';

type EventCard = {
  title: string;
  category: Category;
  recruit: {label: string; tone: 'blue' | 'grey'};
  progress: {label: string; tone: 'outline-accent' | 'outline'};
  /** 일시와 장소. 없는 값은 «미정»으로 채우지 않고 빼고 쓴다 */
  when: string;
  /** 대표 이미지가 없으면 이미지 자리 자체를 그리지 않는다 */
  image: boolean;
};

const CARDS: EventCard[] = [
  {
    title: '2026 신입 부원 모집 설명회',
    category: '모집',
    recruit: {label: '모집 중', tone: 'blue'},
    progress: {label: '진행 중', tone: 'outline-accent'},
    when: '3월 4일 · 학생회관 302호',
    image: true,
  },
  {
    title: '알고리즘 스터디 오리엔테이션',
    category: '세미나',
    recruit: {label: '모집 마감', tone: 'grey'},
    progress: {label: '예정', tone: 'outline'},
    when: '3월 10일',
    image: false,
  },
];

const LIST_CHIPS = ['전체', '모집', '세미나', '프로젝트'] as const;

/**
 * 행사 목록 — 공개 웹사이트 첫 화면. 분류 칩으로 카드를 거른다.
 * 대표 이미지가 없는 카드는 글자만으로 짧아진다는 설명서 규칙을 따른다.
 */
export function EventListMock(): ReactNode {
  const [chip, setChip] = useState<(typeof LIST_CHIPS)[number]>('전체');
  const cards = CARDS.filter((c) => chip === '전체' || c.category === chip);

  const feedback = (() => {
    switch (chip) {
      case '전체':
        return undefined;
      case '세미나':
        return '«세미나» 칩을 켰습니다. 1건이 남습니다. 이 행사는 대표 이미지가 없어 이미지 자리 없이 글자만으로 짧고, 장소가 없어 일시만 나옵니다.';
      case '프로젝트':
        return '«프로젝트» 칩을 켰습니다. 이 예시에는 프로젝트 행사가 없어 남는 카드가 없습니다.';
      default:
        return `«${chip}» 칩을 켰습니다. ${cards.length}건이 남습니다.`;
    }
  })();

  return (
    <MockFrame
      caption="행사 목록 — 공개 웹사이트 첫 화면"
      hint="분류 칩을 눌러 행사를 걸러 보세요."
      feedback={feedback}
      onReset={() => setChip('전체')}
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div className="mk-topbar">
        <span className="brand">SSCC</span>
        <span className="on">행사</span>
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
        <div style={{fontSize: 20, fontWeight: 500, color: 'var(--app-ink)'}}>동아리 행사</div>
        <div style={{fontSize: 12.5, color: 'var(--app-n500)', marginTop: 2}}>
          숭실컴퓨팅클럽이 여는 모집 · 세미나 · 프로젝트 · 행사입니다
        </div>

        <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', margin: '14px 0 12px'}}>
          {LIST_CHIPS.map((c) => (
            <Chip key={c} active={chip === c} onClick={() => setChip(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          {cards.map((c) => (
            <div
              key={c.title}
              style={{
                borderRadius: 14,
                overflow: 'hidden',
                background: 'var(--app-surface)',
                boxShadow: '0 0 0 1px var(--app-line)',
              }}>
              {c.image && (
                <div
                  style={{
                    height: 76,
                    background: 'var(--app-bg)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    color: 'var(--app-n500)',
                  }}>
                  대표 이미지
                </div>
              )}
              <div style={{padding: 13}}>
                <div style={{display: 'flex', gap: 5, marginBottom: 6}}>
                  <Badge tone={c.recruit.tone}>{c.recruit.label}</Badge>
                  <Badge tone={c.progress.tone}>{c.progress.label}</Badge>
                </div>
                <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)', lineHeight: 1.35}}>{c.title}</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap'}}>
                  <Pill tone="outline">{c.category}</Pill>
                  <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{c.when}</span>
                </div>
              </div>
            </div>
          ))}
          {cards.length === 0 && (
            <div style={{gridColumn: '1 / -1', fontSize: 12.5, color: 'var(--app-n500)', padding: '8px 2px'}}>
              (예시) 이 분류의 행사가 없습니다.
            </div>
          )}
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 행사 상세 — 신청 패널 ============ */

type Recruit = '모집 준비 중' | '모집 예정' | '모집 중' | '모집 기간 종료' | '모집 마감';
type Progress = '예정' | '진행 중' | '종료';

// 설명서 «배지 두 줄의 뜻»의 두 표 그대로.
const RECRUIT_MEANING: Record<Recruit, string> = {
  '모집 준비 중': '운영진이 아직 신청서를 열지 않았습니다',
  '모집 예정': '모집 시작일이 아직 오지 않았습니다',
  '모집 중': '지금 신청할 수 있습니다',
  '모집 기간 종료': '모집 기간이 지났습니다',
  '모집 마감': '운영진이 모집을 닫았습니다',
};
const RECRUITS = Object.keys(RECRUIT_MEANING) as Recruit[];

const PROGRESS_MEANING: Record<Progress, string> = {
  예정: '행사일이 아직 오지 않았습니다',
  '진행 중': '행사 기간 안입니다',
  종료: '행사가 끝났습니다',
};
const PROGRESSES = Object.keys(PROGRESS_MEANING) as Progress[];

/** 모집 중이 아닐 때 «신청하기» 아래에 나오는 사유. 모집 전이면 따로 말한다 */
function lockedReason(r: Recruit): string {
  return r === '모집 예정' ? '아직 모집이 시작되지 않았습니다' : '지금은 신청을 받지 않습니다';
}

/**
 * 행사 상세 — /events/{eventId}. 모집 상태를 바꿔 «신청하기»가 잠기고 풀리는 것을 본다.
 * 설명서 «모집 중이 아니면 «신청하기»가 흐리게 잠깁니다»와 배지 두 줄이 각각 계산된다는 규칙을 따른다.
 */
export function EventDetailMock(): ReactNode {
  const [recruit, setRecruit] = useState<Recruit>('모집 중');
  const [progress, setProgress] = useState<Progress>('진행 중');
  const [feedback, setFeedback] = useState<ReactNode>();

  const open = recruit === '모집 중';

  const apply = () => {
    if (!open) {
      setFeedback(
        `잠겨 있습니다. 지금 모집 상태는 «${recruit}»입니다. «신청하기»는 모집 중일 때만 눌리고, 버튼은 사라지지 않고 남아 아래에 사유를 알려 줍니다.`,
      );
      return;
    }
    setFeedback(
      '신청 화면(/events/{eventId}/apply)으로 갑니다. 신청은 회원만 할 수 있지만, 아직 회원이 아니어도 신청 화면에서 가입까지 마칠 수 있습니다.',
    );
  };

  const changeRecruit = (r: Recruit) => {
    setRecruit(r);
    setFeedback(
      r === '모집 중'
        ? '지금 모집 상태는 «모집 중»입니다. 지금 신청할 수 있습니다. 이때만 «신청하기»가 눌립니다.'
        : `지금 모집 상태는 «${r}»입니다. ${RECRUIT_MEANING[r]}. «신청하기»가 흐리게 잠기고 버튼 아래에 «${lockedReason(r)}»가 나옵니다.`,
    );
  };

  const changeProgress = (p: Progress) => {
    setProgress(p);
    setFeedback(
      `지금 행사 진행은 «${p}»입니다. ${PROGRESS_MEANING[p]}. 두 배지는 각각 계산되므로 모집 상태와 따로 바뀝니다. «신청하기»는 모집 상태만 봅니다.`,
    );
  };

  return (
    <MockFrame
      caption="행사 상세 — /events/{eventId}"
      hint="아래 점선 띠에서 모집 상태를 바꾸고 «신청하기»를 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setRecruit('모집 중');
        setProgress('진행 중');
        setFeedback(undefined);
      }}
      demo={
        <>
          <span>모집 상태</span>
          {RECRUITS.map((r) => (
            <button key={r} type="button" disabled={r === recruit} onClick={() => changeRecruit(r)}>
              {r}
            </button>
          ))}
          <span style={{marginLeft: 6}}>행사 진행</span>
          {PROGRESSES.map((p) => (
            <button key={p} type="button" disabled={p === progress} onClick={() => changeProgress(p)}>
              {p}
            </button>
          ))}
        </>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div style={{fontSize: 12, color: 'var(--app-accent-strong)', marginBottom: 9}}>‹ 행사 목록</div>
      <div
        style={{
          height: 86,
          borderRadius: 14,
          background: 'var(--app-bg)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          color: 'var(--app-n500)',
          marginBottom: 12,
        }}>
        대표 이미지
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1.9fr 1fr', gap: 12, alignItems: 'start'}}>
        <div className="mk-card">
          <div style={{display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8}}>
            <Badge tone={open ? 'blue' : 'grey'}>{recruit}</Badge>
            <Badge tone={progress === '진행 중' ? 'outline-accent' : 'outline'}>{progress}</Badge>
            <Pill tone="outline">모집</Pill>
          </div>
          <div style={{fontSize: 19, fontWeight: 700, color: 'var(--app-ink)', lineHeight: 1.3, marginBottom: 10}}>
            2026 신입 부원 모집 설명회
          </div>
          <p style={{fontSize: 12.5, color: 'var(--app-n300)', lineHeight: 1.85, margin: 0}}>
            숭실컴퓨팅클럽이 어떤 동아리인지, 한 학기 동안 무엇을 하는지 소개하는 자리입니다. 스터디·프로젝트·트랙 운영 방식과 지원
            절차를 안내합니다.
          </p>
        </div>
        <div className="mk-card">
          <dl className="mk-kv" style={{gridTemplateColumns: '44px 1fr'}}>
            <dt>일시</dt>
            <dd>3월 4일 18:00</dd>
            <dt>장소</dt>
            <dd>학생회관 302호</dd>
            <dt>참가</dt>
            <dd>확정 24 / 40</dd>
            <dt>모집</dt>
            <dd>{recruit}</dd>
          </dl>
          <div style={{height: 1, background: 'var(--app-bg)', margin: '11px 0'}} />
          <Btn
            variant="primary"
            style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12}}
            locked={!open}
            title={open ? undefined : lockedReason(recruit)}
            onClick={apply}>
            신청하기
          </Btn>
          <p style={{fontSize: 11, color: 'var(--app-n500)', textAlign: 'center', lineHeight: 1.6, margin: '9px 0 0'}}>
            {open ? (
              <>
                신청은 회원만 할 수 있습니다 — 아직 회원이 아니어도
                <br />
                신청 화면에서 가입까지 마칠 수 있습니다
              </>
            ) : (
              lockedReason(recruit)
            )}
          </p>
        </div>
      </div>
    </MockFrame>
  );
}
