import {useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '..';

/* ============ 참가 신청 ============ */

type Step = 'signup' | 'form' | 'done';
type Dot = 'current' | 'done' | 'todo';

function StepDot({n, state}: {n: number; state: Dot}): ReactNode {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: 11,
        fontWeight: 700,
        ...(state === 'todo'
          ? {background: 'var(--app-bg)', color: 'var(--app-n500)'}
          : state === 'current'
            ? {background: 'var(--app-accent)', color: '#fff'}
            : {background: 'var(--app-accent-strong)', color: '#fff'}),
      }}>
      {state === 'done' ? '✓' : n}
    </span>
  );
}

function StepLabel({state, children}: {state: Dot; children: ReactNode}): ReactNode {
  return (
    <span
      style={
        state === 'current'
          ? {fontSize: 13, fontWeight: 600, color: 'var(--app-ink)'}
          : {fontSize: 13, color: 'var(--app-n500)'}
      }>
      {children}
    </span>
  );
}

/** 단계 표시: 1 회원 가입 · 2 신청서 작성 */
function Steps({step}: {step: Step}): ReactNode {
  const first: Dot = step === 'signup' ? 'current' : 'done';
  const second: Dot = step === 'signup' ? 'todo' : step === 'form' ? 'current' : 'done';
  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14}}>
      <StepDot n={1} state={first} />
      <StepLabel state={first}>회원 가입</StepLabel>
      <span style={{flex: 1, height: 1, background: 'var(--app-line)'}} />
      <StepDot n={2} state={second} />
      <StepLabel state={second}>신청서 작성</StepLabel>
    </div>
  );
}

const FIELD_LABEL = {fontSize: 11.5, color: 'var(--app-n500)', marginBottom: 4} as const;
const FIELD_BOX = {border: '1px solid var(--app-line-strong)', borderRadius: 10, padding: '9px 11px', fontSize: 13} as const;

/**
 * 참가 신청 — /events/{eventId}/apply. 간편 가입에서 신청서 작성, 제출까지 따라가 본다.
 * 설명서 «신청하는 순서» 네 단계(이미 회원이면 가입 단계를 건너뜀, 쓰는 도중 임시저장)를 따른다.
 */
export function ApplyMock(): ReactNode {
  const [step, setStep] = useState<Step>('signup');
  const [skipped, setSkipped] = useState(false);
  const [draft, setDraft] = useState('');
  const [flash, setFlash] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const reset = () => {
    setStep('signup');
    setSkipped(false);
    setDraft('');
    setFlash(0);
    setFeedback(undefined);
  };

  const signUp = () => {
    setStep('form');
    setFeedback(
      '가입을 마쳤습니다. 화면을 떠나지 않고 같은 화면에 신청서가 열립니다. 쓰는 도중 자동으로 임시저장되므로 창을 닫았다 다시 와도 이어서 쓸 수 있습니다.',
    );
  };

  const submit = () => {
    setStep('done');
    setFeedback(
      '제출했습니다. 완료 화면이 나옵니다. 이후 운영진이 확정·대기를 정하고, 결과는 «내 신청»에서 확인합니다. 행사 상세의 버튼은 이제 «제출 완료»이고, 누르면 그때 낸 내용을 그대로 볼 수 있습니다.',
    );
  };

  const asMember = () => {
    setStep('form');
    setSkipped(true);
    setDraft('');
    setFeedback('이미 회원인 계정입니다. 간편 가입 단계는 나오지 않고 곧바로 신청서가 열립니다.');
  };

  const reopen = () => {
    setFlash(flash + 1);
    setFeedback(
      draft.trim()
        ? '창을 닫았다 다시 열었습니다. 쓰는 도중 자동으로 임시저장되어 적던 내용이 그대로 남아 있습니다. 다만 임시저장만 해 둔 것은 낸 것으로 치지 않습니다 — 행사 상세의 버튼은 «신청하기» 그대로입니다.'
        : '창을 닫았다 다시 열었습니다. 입력칸에 무언가 적은 뒤 다시 눌러 보면, 임시저장된 내용이 그대로 남는 것을 볼 수 있습니다.',
    );
  };

  return (
    <MockFrame
      caption="참가 신청 1단계 — 가입 (이미 회원이면 건너뜁니다)"
      hint="«가입하고 신청 이어가기»를 눌러 신청서 작성과 제출까지 따라가 보세요."
      feedback={feedback}
      onReset={reset}
      demo={
        <>
          <button type="button" onClick={asMember} disabled={skipped}>
            이미 회원인 계정으로 신청하기
          </button>
          <button type="button" onClick={reopen} disabled={step !== 'form'}>
            쓰던 창을 닫았다 다시 옴
          </button>
        </>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 480, margin: '0 auto'}}>
      <div className="mk-card">
        {!skipped && <Steps step={step} />}

        {step === 'signup' && (
          <>
            <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 6}}>간편 가입</div>
            <p style={{fontSize: 12, color: 'var(--app-n400)', lineHeight: 1.7, margin: '0 0 14px'}}>
              신청하려면 회원 정보가 필요합니다. 아래 정보만 채우면 바로 이어서 신청할 수 있습니다.
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
              <div>
                <div style={FIELD_LABEL}>이름</div>
                <div style={{...FIELD_BOX, color: 'var(--app-ink)'}}>김철수</div>
              </div>
              <div>
                <div style={FIELD_LABEL}>학번</div>
                <div style={{...FIELD_BOX, color: 'var(--app-n500)'}}>20240001</div>
              </div>
              <div>
                <div style={FIELD_LABEL}>학과</div>
                <div style={{...FIELD_BOX, color: 'var(--app-n500)'}}>컴퓨터학부</div>
              </div>
            </div>
            <Btn
              variant="primary"
              style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12, marginTop: 14}}
              onClick={signUp}>
              가입하고 신청 이어가기
            </Btn>
          </>
        )}

        {step === 'form' && (
          <>
            <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 12}}>신청서 작성</div>
            <div>
              <div style={FIELD_LABEL}>(예시) 신청서 문항</div>
              <input
                key={flash}
                className={flash ? 'gm-input gm-flash' : 'gm-input'}
                style={{borderRadius: 10, padding: '9px 11px'}}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="여기에 적어 보세요"
                aria-label="신청서 문항 예시"
              />
            </div>
            <Btn
              variant="primary"
              style={{width: '100%', justifyContent: 'center', padding: 11, borderRadius: 12, marginTop: 14}}
              onClick={submit}>
              제출
            </Btn>
          </>
        )}

        {step === 'done' && (
          <div style={{textAlign: 'center', padding: '10px 0 4px'}}>
            <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginBottom: 6}}>(예시) 완료 화면</div>
            <p style={{fontSize: 12.5, color: 'var(--app-n300)', lineHeight: 1.7, margin: 0}}>
              운영진이 확정·대기를 정하면
              <br />
              결과는 «내 신청»에서 확인합니다.
            </p>
          </div>
        )}
      </div>
    </MockFrame>
  );
}

/* ============ 내 신청 ============ */

type Applied = {title: string; when: string; status: '확정' | '대기'};

const APPLIED: Applied[] = [
  {title: '2026 신입 부원 모집 설명회', when: '3월 4일 18:00 · 03.02 신청', status: '확정'},
  {title: '2026 겨울 해커톤', when: '1월 15일 10:00 · 01.03 신청', status: '대기'},
];

/** 신청한 행사 — /me «내 활동». 카드 본문을 누르면 행사 상세로 간다는 설명서 규칙을 따른다 */
export function MyApplicationsMock(): ReactNode {
  const [feedback, setFeedback] = useState<ReactNode>();

  return (
    <MockFrame
      caption="신청한 행사 — /me «내 활동»"
      hint="카드를 눌러 보세요."
      feedback={feedback}
      onReset={() => setFeedback(undefined)}
      innerStyle={{minWidth: 'auto', maxWidth: 480, margin: '0 auto'}}>
      <div style={{fontSize: 18, fontWeight: 500, color: 'var(--app-ink)', marginBottom: 12}}>내 활동</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {APPLIED.map((a) => (
          <button
            key={a.title}
            type="button"
            className="gm-plain mk-card"
            style={{padding: 16, background: 'var(--app-surface)', display: 'block', width: '100%'}}
            onClick={() =>
              setFeedback(
                `카드 본문을 눌렀습니다. «${a.title}» 행사 상세로 갑니다. 그때 낸 내용은 카드 아래 «제출 내용 보기»로 다시 봅니다.`,
              )
            }>
            <span style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <span>
                <span style={{display: 'block', fontSize: 14.5, fontWeight: 600, color: 'var(--app-ink)'}}>{a.title}</span>
                <span style={{display: 'block', fontSize: 12, color: 'var(--app-n500)', marginTop: 4}}>{a.when}</span>
              </span>
              <Badge tone={a.status === '확정' ? 'blue' : 'amber'}>{a.status}</Badge>
            </span>
          </button>
        ))}
      </div>
    </MockFrame>
  );
}
