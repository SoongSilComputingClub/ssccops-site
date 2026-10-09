import {useState, type ReactNode} from 'react';
import {Badge, MockFrame, Pill} from '..';

const LOCKED_TITLE = '운영진만 변경할 수 있습니다';

/**
 * 내 계정 — /my. 본인이 고치는 정보와 운영진만 바꾸는 정보가 나뉘어 보인다.
 * 설명서 «학번·이메일·기수·등급·상태·역할은 본인이 직접 바꿀 수 없습니다»를 따른다.
 */
export function MyAccountMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  const locked = (label: string) =>
    setFeedback(`«${label}» 항목은 본인이 직접 바꿀 수 없습니다. 잘못 등록됐다면 운영진(회원 관리 권한자)에게 요청하세요.`);

  const field = (label: string, value: ReactNode) => (
    <button type="button" className="gm-plain" title={LOCKED_TITLE} onClick={() => locked(label)}>
      {value}
    </button>
  );

  return (
    <MockFrame
      caption="내 계정 — /my"
      hint="오른쪽 항목이나 «프로필 수정»을 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}>
      <div style={{display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14}}>
        <div className="mk-card">
          <div className="mk-section-label">회원 정보</div>
          <dl className="mk-kv" style={{gridTemplateColumns: '70px 1fr'}}>
            <dt>이름</dt>
            <dd>홍길동</dd>
            <dt>학번</dt>
            <dd>{field('학번', '20240001')}</dd>
            <dt>학과</dt>
            <dd>컴퓨터학부</dd>
            <dt>학년</dt>
            <dd>3학년</dd>
            <dt>전화번호</dt>
            <dd>010-****-0000</dd>
          </dl>
          <div style={{marginTop: 10, fontSize: 12, color: 'var(--app-accent)'}}>
            <button
              type="button"
              className="gm-plain"
              onClick={() =>
                setFeedback('본인이 직접 고칠 수 있는 정보를 고칩니다. 학번·이메일·기수·등급·상태·역할은 여기서도 바꿀 수 없습니다.')
              }>
              프로필 수정
            </button>
          </div>
        </div>
        <div className="mk-card">
          <div className="mk-section-label">운영진만 변경할 수 있는 항목</div>
          <dl className="mk-kv" style={{gridTemplateColumns: '70px 1fr'}}>
            <dt>기수</dt>
            <dd>{field('기수', '15기')}</dd>
            <dt>등급</dt>
            <dd>{field('등급', <Badge tone="blue">정회원</Badge>)}</dd>
            <dt>상태</dt>
            <dd>{field('상태', <Badge tone="grey">활동</Badge>)}</dd>
            <dt>현재역할</dt>
            <dd>
              {field(
                '현재역할',
                <>
                  <Badge tone="outline">회장</Badge>{' '}
                  <Pill tone="blue" style={{marginLeft: 2}}>
                    대표
                  </Pill>
                </>,
              )}
            </dd>
          </dl>
        </div>
      </div>
    </MockFrame>
  );
}
