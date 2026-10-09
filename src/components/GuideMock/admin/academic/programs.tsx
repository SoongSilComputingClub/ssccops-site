import {useState, type ReactNode} from 'react';
import {Badge, MockFrame, Progress} from '../..';

type Program = {
  status: '승인' | '진행 중' | '수료';
  kind: '스터디' | '프로젝트' | '트랙';
  title: string;
  leader: string;
  members: number;
  period: string;
  progress: number;
};

const PROGRAMS: Program[] = [
  {status: '진행 중', kind: '스터디', title: '알고리즘 문제풀이 스터디', leader: '스터디장 홍길동', members: 7, period: '03.10 ~ 06.20', progress: 62},
  {status: '수료', kind: '프로젝트', title: '웹 서비스 사이드프로젝트', leader: '프로젝트장 김철수', members: 5, period: '01.05 ~ 02.28', progress: 100},
];

/**
 * 스터디 · 프로젝트 · 트랙 목록 — /academic-programs.
 * 설명서 «활동 상세에서 보는 것»을 따라, 카드를 누르면 상세에서 무엇을 보는지 알려 준다.
 */
export function ProgramListMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  return (
    <MockFrame
      caption="스터디 · 프로젝트 · 트랙 목록 — /academic-programs"
      hint="활동 카드를 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}>
      <div className="mk-header">
        <div>
          <div className="title">스터디 · 프로젝트 · 트랙</div>
          <div className="sub">전체 학술 프로그램 12건</div>
        </div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12}}>
        {PROGRAMS.map((p) => (
          <button
            key={p.title}
            type="button"
            className="gm-plain mk-card"
            style={{background: 'var(--app-surface)', padding: 16, width: '100%', textAlign: 'left'}}
            onClick={() =>
              setFeedback(
                `«${p.title}» 활동 상세로 갑니다. 커리큘럼 대비 진행 · 회차 이력 · 팀원 명단 · 평균 출석률을 봅니다. 회차 기록을 고치지는 않습니다 — 기록은 ${p.leader.split(' ')[0]}이 쓰고, 국장은 회차 · 출석 승인에서 처리합니다.`,
              )
            }>
            <div style={{display: 'flex', gap: 5, marginBottom: 8}}>
              <Badge tone={p.status === '진행 중' ? 'blue' : 'grey'}>{p.status}</Badge>
              <Badge tone="grey">{p.kind}</Badge>
            </div>
            <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 4}}>{p.title}</div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 10}}>
              {p.leader} · 팀원 {p.members}명 · {p.period}
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
              <Progress value={p.progress} />
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>{p.progress}%</span>
            </div>
          </button>
        ))}
      </div>
    </MockFrame>
  );
}
