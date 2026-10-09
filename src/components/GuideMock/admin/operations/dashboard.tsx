import {useState, type CSSProperties, type ReactNode} from 'react';
import {Badge, Chip, MockFrame, Progress} from '../..';

type Flag = '마감임박' | '지연';

type MyRow = {
  name: string;
  stage: '기획' | '진행' | '검토';
  due: string;
  flag: Flag;
  progress: number;
};

const MY_ROWS: MyRow[] = [
  {name: '예산 집행 보고서 작성', stage: '검토', due: '8월 18일', flag: '마감임박', progress: 100},
  {name: '부스 배치도 기획', stage: '기획', due: '8월 19일', flag: '마감임박', progress: 0},
  // «지연» 칩을 눌러 볼 수 있게 더한 예시 행. 옛 그림의 «3건»과 맞는다.
  {name: '현수막 주문', stage: '진행', due: '8월 12일', flag: '지연', progress: 60},
];

const MY_CHIPS = ['전체', '마감임박', '지연'] as const;

/** gm-plain이 지우는 mk-row의 줄, 여백, 글자를 버튼 행에 되돌린다 */
const ROW_BUTTON: CSSProperties = {
  width: '100%',
  padding: '9px 0',
  borderTop: '1px solid color-mix(in srgb, var(--app-ink) 5%, transparent)',
  fontSize: 13,
  color: 'var(--app-n300)',
};

/** 배지를 누르면 나오는 뜻. 설명서 «배지의 뜻» 표와 상태 변화 기준 그대로 */
const BADGE_MEANING: Record<Flag | 'D-DAY' | 'D-1', string> = {
  마감임박: '«마감임박»은 마감까지 3일 이내(오늘 포함)이고 아직 끝나지 않은 업무에 붙습니다. 담당자가 마무리합니다.',
  지연: '«지연»은 마감일이 이미 지났고 아직 끝나지 않은 업무에 붙습니다. 담당자가 마무리합니다.',
  'D-DAY': '«D-DAY»는 오늘이 마감일이라는 뜻입니다. 아직 지연은 아닙니다. 다가오는 마감은 마감이 임박한 순서대로 나열됩니다.',
  'D-1': '«D-1»은 마감까지 하루 남았다는 뜻입니다. 배지는 이렇게 남은 일수를 보여 줍니다.',
};

/**
 * 운영 대시보드 — /dashboard.
 * 설명서의 영역 표(칩으로 거르기, 승인 대기 행을 누르면 승인함, 승인 대기 카드는 WORK_MANAGE)와 «배지의 뜻» 표를 따른다.
 */
export function DashboardMock(): ReactNode {
  const [chip, setChip] = useState<(typeof MY_CHIPS)[number]>('전체');
  const [canManage, setCanManage] = useState(true);
  const [feedback, setFeedback] = useState<ReactNode>();

  const rows = MY_ROWS.filter((r) => chip === '전체' || r.flag === chip);
  const myCols = '2fr 1fr 1fr 1.2fr';
  const approvalCols = '2fr .8fr .8fr .8fr';

  const pickChip = (c: (typeof MY_CHIPS)[number]) => {
    setChip(c);
    const n = MY_ROWS.filter((r) => c === '전체' || r.flag === c).length;
    setFeedback(
      c === '전체'
        ? `«전체» 칩입니다. 담당자가 나인 하위 업무 ${n}건을 모두 보여 줍니다.`
        : `«${c}» 칩을 켰습니다. 담당자가 나인 하위 업무 가운데 ${n}건만 남습니다.`,
    );
  };

  const explain = (key: keyof typeof BADGE_MEANING) => setFeedback(BADGE_MEANING[key]);

  return (
    <MockFrame
      caption="운영 대시보드 — /dashboard"
      hint="«내 업무 목록»의 칩을 눌러 걸러 보고, 승인 대기 행과 배지도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setChip('전체');
        setCanManage(true);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() => {
            setCanManage(!canManage);
            setFeedback(
              canManage
                ? '업무 관리(WORK_MANAGE) 권한이 없는 회원의 대시보드입니다. 승인 대기 목록 카드는 이 권한이 있어야 보이므로 나오지 않습니다.'
                : '업무 관리(WORK_MANAGE) 권한이 있는 회원의 대시보드로 돌아왔습니다. 승인 대기 목록 카드가 다시 보입니다.',
            );
          }}>
          {canManage ? '업무 관리(WORK_MANAGE) 권한이 없는 회원으로 보기' : '권한이 있는 회원으로 돌아가기'}
        </button>
      }>
      <div style={{display: 'grid', gridTemplateColumns: canManage ? '1.7fr 1fr' : '1fr', gap: 14, marginBottom: 14}}>
        {canManage && (
          <div className="mk-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
              <span style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>승인 대기 목록</span>
              <span style={{fontSize: 12, color: 'var(--app-accent)'}}>전체보기</span>
            </div>
            <div className="mk-row mk-th" style={{gridTemplateColumns: approvalCols}}>
              <span>하위 업무명</span>
              <span>요청자</span>
              <span>마감_일시</span>
              <span>하위_업무_유형</span>
            </div>
            <button
              type="button"
              className="gm-plain mk-row gm-pick"
              style={{...ROW_BUTTON, gridTemplateColumns: approvalCols}}
              onClick={() =>
                setFeedback(
                  '승인함(/approvals)으로 넘어갑니다. 이 하위 업무의 카드가 파란 테두리로 강조되고 자동으로 스크롤됩니다.',
                )
              }>
              <span style={{color: 'var(--app-ink)', fontWeight: 500}}>2026 신입회원 OT 예산 집행</span>
              <span>박민수</span>
              <span>8월 18일</span>
              <span>
                <Badge tone="grey">예산지출</Badge>
              </span>
            </button>
          </div>
        )}
        <div className="mk-card">
          <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 12}}>다가오는 마감</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
            <div style={{display: 'flex', gap: 10}}>
              <span style={{width: 52, fontSize: 12, color: 'var(--app-n500)', paddingTop: 1}}>8월 18일</span>
              <div>
                <button type="button" className="gm-plain" onClick={() => explain('D-DAY')}>
                  <Badge tone="outline-red">D-DAY</Badge>
                </button>
                <div style={{fontSize: 13, marginTop: 5, color: 'var(--app-ink)'}}>신입회원 OT 예산 집행</div>
              </div>
            </div>
            <div style={{display: 'flex', gap: 10}}>
              <span style={{width: 52, fontSize: 12, color: 'var(--app-n500)', paddingTop: 1}}>8월 19일</span>
              <div>
                <button type="button" className="gm-plain" onClick={() => explain('D-1')}>
                  <Badge tone="outline-accent">D-1</Badge>
                </button>
                <div style={{fontSize: 13, marginTop: 5, color: 'var(--app-ink)'}}>동아리 박람회 부스 기획</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mk-card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>내 업무 목록</span>
            {MY_CHIPS.map((c) => (
              <Chip key={c} active={chip === c} onClick={() => pickChip(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{rows.length}건</span>
        </div>
        <div className="mk-row mk-th" style={{gridTemplateColumns: myCols}}>
          <span>하위 업무명</span>
          <span>업무_상태</span>
          <span>마감_일시</span>
          <span>진행률</span>
        </div>
        {rows.map((r) => (
          <div key={r.name} className="mk-row" style={{gridTemplateColumns: myCols}}>
            <span style={{color: 'var(--app-ink)'}}>{r.name}</span>
            <span>
              <Badge tone="outline">{r.stage}</Badge>
            </span>
            <span>
              {r.due}{' '}
              <button type="button" className="gm-plain" style={{marginLeft: 4}} onClick={() => explain(r.flag)}>
                <Badge tone={r.flag === '지연' ? 'outline-red' : 'outline-accent'}>{r.flag}</Badge>
              </button>
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <Progress value={r.progress} />
              {r.progress}%
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}
