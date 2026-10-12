import {useState, type ReactNode} from 'react';
import {MockFrame} from '../..';

type Stat = {label: string; value: number; hint: string; color?: string; meaning: string};

const STATS: Stat[] = [
  {
    label: '진행 중 프로그램',
    value: 8,
    hint: '스터디 5 · 프로젝트 2 · 트랙 1',
    meaning: '지금 진행 중인 프로그램 수입니다. 아래 작은 글씨가 유형별 수입니다.',
  },
  {
    label: '지연 프로그램',
    value: 2,
    hint: '운영 기간이 끝났는데 진행률 100% 미만',
    color: 'var(--app-amber)',
    meaning:
      '진행 중인데 예정된 운영 기간이 끝났고 진행률이 100% 미만인 프로그램입니다. 시스템이 판정해 이 칸의 수와 카드 배지가 같은 값을 봅니다. 누르면 지연된 프로그램만 모은 목록으로 갑니다.',
  },
  {
    label: '폐지 프로그램',
    value: 1,
    hint: '운영을 멈춘 프로그램',
    meaning: '프로그램 상세에서 폐지한 프로그램 수입니다.',
  },
  {
    label: '승인 대기',
    value: 4,
    hint: '제출된 회차 기록',
    color: 'var(--app-accent)',
    meaning: '스터디장이 제출해 승인을 기다리는 회차 기록 수입니다. 회차 · 출석 승인에서 처리합니다.',
  },
];

/** 학술 대시보드 — /academic-programs/dashboard. 숫자 칸 넷을 누르면 설명서의 뜻을 짚어 준다 */
export function AcademicDashboardMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  return (
    <MockFrame
      caption="학술 대시보드 — /academic-programs/dashboard"
      hint="숫자 칸을 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}>
      <div className="mk-header">
        <div>
          <div className="title">학술 대시보드</div>
          <div className="sub">이번 주 회차와 승인 대기</div>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 12}}>
        {STATS.map((s) => (
          <button
            key={s.label}
            type="button"
            className="gm-plain mk-stat"
            // gm-plain이 지우는 mk-stat의 테두리, 바탕, 여백을 되돌린다
            style={{textAlign: 'left', width: '100%', border: '1px solid var(--app-line)', background: 'var(--app-surface)', padding: 14}}
            onClick={() => setFeedback(`«${s.label}» 칸입니다. ${s.meaning}`)}>
            <div className="lb">{s.label}</div>
            <div className="vl" style={s.color ? {color: s.color} : undefined}>
              {s.value}
            </div>
            <div className="ht">{s.hint}</div>
          </button>
        ))}
      </div>
    </MockFrame>
  );
}
