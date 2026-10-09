import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '..';

type RecruitStatus = '모집 시작 전' | '접수중' | '접수 종료';

type Program = {
  name: string;
  kind: string;
  approved: string;
  start: string;
  end: string;
  quota: string;
  /** 접수가 열린 뒤의 지원 건수. 모집 시작 전에는 «-»로 보인다 */
  applicants: number;
  version: string;
  status: RecruitStatus;
};

// 첫 카드는 옛 설명서의 그림 그대로다. 접수중 두 장은 칩으로 걸러 보려고 더한 예시다(칩 숫자 «접수중 2»에 맞춘다).
const PROGRAMS: Program[] = [
  {
    name: '알고리즘 스터디',
    kind: '스터디',
    approved: '기획안 승인 2026.02.20 · 홍길동',
    start: '3월 2일 09:00',
    end: '3월 9일 18:00',
    quota: '4 ~ 8명',
    applicants: 0,
    version: 'v2',
    status: '모집 시작 전',
  },
  {
    name: '웹 서비스 사이드프로젝트',
    kind: '프로젝트',
    approved: '기획안 승인 2026.02.13 · 홍길동',
    start: '2월 23일 09:00',
    end: '3월 2일 18:00',
    quota: '3 ~ 5명',
    applicants: 4,
    version: 'v1',
    status: '접수중',
  },
  {
    name: '데이터 분석 트랙',
    kind: '트랙',
    approved: '기획안 승인 2026.02.16 · 홍길동',
    start: '2월 24일 09:00',
    end: '3월 3일 18:00',
    quota: '5 ~ 10명',
    applicants: 6,
    version: 'v3',
    status: '접수중',
  },
];

const CHIPS = ['전체', '모집 시작 전', '접수중', '접수 종료'] as const;
type ChipName = (typeof CHIPS)[number];

const STATUS_TONE: Record<RecruitStatus, 'amber' | 'blue' | 'grey'> = {
  '모집 시작 전': 'amber',
  접수중: 'blue',
  '접수 종료': 'grey',
};

/**
 * 모집 관리 — /studio/recruitment.
 * 설명서 «접수 상태 네 칩»(숫자는 거르기 전 기준), «지원 건수는 모집 시작 전에 -», «고칠 수 있는 때가 정해져 있습니다»를 따른다.
 */
export function RecruitmentMock(): ReactNode {
  const [chip, setChip] = useState<ChipName>('전체');
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();

  const programs = PROGRAMS.map((p, i) => (i === 0 && started ? {...p, status: '접수중' as const} : p));
  const count = (c: ChipName) => (c === '전체' ? programs.length : programs.filter((p) => p.status === c).length);
  const shown = chip === '전체' ? programs : programs.filter((p) => p.status === chip);

  const pickChip = (c: ChipName) => {
    setChip(c);
    setFeedback(
      `«${c}» 칩을 켰습니다. ${count(c)}건이 남습니다. 칩의 숫자는 거르기 전 전체 기준이라 그대로입니다.` +
        (c === '모집 시작 전' ? ' 일정이 미정인 것과 이미 정해진 것이 이 칩에 함께 들어갑니다.' : '') +
        ' 칩을 누르면 주소가 바뀌므로 보던 상태 그대로 북마크할 수 있습니다.',
    );
  };

  return (
    <MockFrame
      caption="모집 관리 — 칩의 숫자는 거르기 전 전체 기준입니다"
      hint="칩을 눌러 걸러 보고, 아래 점선 띠에서 접수 시작 일시를 지나게 해 보세요."
      feedback={feedback}
      onReset={() => {
        setChip('전체');
        setStarted(false);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          disabled={started}
          onClick={() => {
            setStarted(true);
            setFeedback(
              '접수 시작 일시(3월 2일 09:00)가 지났습니다. «알고리즘 스터디»가 접수중이 되고 버튼이 «지원서 문항 보기»로 바뀝니다. 이제 문항을 고칠 수 없고, 지원 건수가 «-» 대신 숫자로 나옵니다.',
            );
          }}>
          «알고리즘 스터디»의 접수 시작 일시가 지남
        </button>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 540, margin: '0 auto'}}>
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12}}>
        {CHIPS.map((c) => (
          <Chip key={c} active={chip === c} onClick={() => pickChip(c)}>
            {c} {count(c)}
          </Chip>
        ))}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {shown.map((p) => {
          const open = p.status !== '모집 시작 전';
          return (
            <div key={p.name} className={p.name === PROGRAMS[0].name && started ? 'mk-card gm-flash' : 'mk-card'}>
              <div style={{display: 'flex', gap: 5, alignItems: 'center', marginBottom: 7}}>
                <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                <Badge tone="outline">{p.kind}</Badge>
                <span style={{flex: 1}} />
                <Btn
                  style={{background: 'transparent', color: 'inherit'}}
                  onClick={() =>
                    setFeedback(
                      open
                        ? '접수가 시작돼도 버튼은 사라지지 않고 «지원서 문항 보기»로 바뀝니다. 무엇을 물었는지 읽기 전용으로 확인할 수 있습니다.'
                        : '지원서 문항 편집(/studio/programs/{활동번호}/form)으로 갑니다. 접수가 열리기 전까지만 문항을 고칠 수 있습니다.',
                    )
                  }>
                  {open ? '지원서 문항 보기' : '지원서 문항 편집'}
                </Btn>
              </div>
              <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>{p.name}</div>
              <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 4}}>{p.approved}</div>
              <dl className="mk-kv" style={{gridTemplateColumns: '64px 1fr', marginTop: 10}}>
                <dt>접수 시작</dt>
                <dd>{p.start}</dd>
                <dt>접수 종료</dt>
                <dd>{p.end}</dd>
                <dt>모집 정원</dt>
                <dd>{p.quota}</dd>
                <dt>지원</dt>
                <dd>{open ? `${p.applicants}건` : '-'}</dd>
              </dl>
              <div
                style={{
                  borderRadius: 10,
                  background: 'var(--app-bg)',
                  padding: '9px 11px',
                  marginTop: 10,
                  fontSize: 12,
                  color: 'var(--app-n300)',
                }}>
                {open
                  ? '접수가 시작돼 문항을 고칠 수 없습니다. 고쳐야 하면 학술국장에게 문의해주세요'
                  : `접수가 열리기 전까지만 문항을 고칠 수 있습니다 · ${p.start}부터 접수 · 문항 버전 ${p.version}`}
              </div>
            </div>
          );
        })}
        {shown.length === 0 && (
          <div className="mk-card" style={{fontSize: 12.5, color: 'var(--app-n500)'}}>
            해당하는 활동이 없습니다.
          </div>
        )}
      </div>
    </MockFrame>
  );
}
