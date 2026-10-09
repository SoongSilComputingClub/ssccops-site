import {useState, type ReactNode} from 'react';
import {Badge, MockFrame, Pill} from '..';

const LINK_STYLE = {fontSize: 12, color: 'var(--app-accent-strong)', marginTop: 8} as const;

/**
 * 내 활동 — /me. 신청한 행사와 낸 폼.
 * 설명서 «제출 내용 보기»와 수정 요청 카드의 «다시 제출하기 →»를 따른다.
 */
export function MeMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  return (
    <MockFrame
      caption="내 활동 — 신청한 행사와 낸 폼"
      hint="«제출 내용 보기»와 «다시 제출하기 →»를 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}
      innerStyle={{minWidth: 'auto', maxWidth: 520, margin: '0 auto'}}>
      <div style={{fontSize: 19, fontWeight: 600, color: 'var(--app-ink)'}}>내 활동</div>
      <div style={{fontSize: 12.5, color: 'var(--app-n500)', marginTop: 3}}>
        신청한 행사, 낸 폼, 내가 이끄는 스터디·프로젝트·트랙을 이 화면에서 확인할 수 있습니다
      </div>
      <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 8}}>홍길동 계정으로 보고 있습니다</div>

      <div className="mk-section-label" style={{marginTop: 16}}>
        신청한 행사
      </div>
      <div className="mk-card" style={{marginBottom: 8}}>
        <div style={{display: 'flex', gap: 5, marginBottom: 6}}>
          <Badge tone="blue">확정</Badge>
          <Pill tone="outline">모집</Pill>
        </div>
        <div style={{fontSize: 14.5, fontWeight: 600, color: 'var(--app-ink)'}}>2026 신입 부원 모집 설명회</div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 4}}>3월 4일 18:00 · 학생회관 302호</div>
        <div style={{fontSize: 12, color: 'var(--app-n300)', marginTop: 6}}>참가가 확정되었습니다</div>
        <div style={LINK_STYLE}>
          <button
            type="button"
            className="gm-plain"
            onClick={() =>
              setFeedback('«2026 신입 부원 모집 설명회»에 그때 무엇을 적어 냈는지 그대로 다시 봅니다.')
            }>
            제출 내용 보기
          </button>
        </div>
      </div>

      <div className="mk-section-label" style={{marginTop: 14}}>
        낸 폼
      </div>
      <div className="mk-card">
        <div style={{display: 'flex', gap: 5, marginBottom: 6}}>
          <Badge tone="amber">수정요청</Badge>
          <Pill tone="outline">기획안</Pill>
        </div>
        <div style={{fontSize: 14.5, fontWeight: 600, color: 'var(--app-ink)'}}>2026-1 스터디 기획안</div>
        <div
          style={{
            borderRadius: 10,
            background: 'var(--app-bg)',
            padding: '9px 11px',
            marginTop: 8,
            fontSize: 12,
            color: 'var(--app-n300)',
          }}>
          <b style={{color: 'var(--app-ink)'}}>수정 요청</b>
          <br />
          커리큘럼을 12주로 맞춰 다시 제출해주세요.
        </div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 8}}>제출 2026-03-02 14:10 · 2회차</div>
        <div style={LINK_STYLE}>
          <button
            type="button"
            className="gm-plain"
            onClick={() =>
              setFeedback(
                '«2026-1 스터디 기획안»을 고쳐 낼 자리로 바로 갑니다. 카드에 붙은 운영진의 사유를 보고 고쳐 다시 제출합니다. 수정 요청을 받은 것은 행사, 폼, 기획안을 가리지 않고 화면 맨 위 «다시 제출할 것»에도 모입니다.',
              )
            }>
            다시 제출하기 →
          </button>
        </div>
      </div>
    </MockFrame>
  );
}
