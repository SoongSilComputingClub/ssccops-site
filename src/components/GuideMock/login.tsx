import {useState, type ReactNode} from 'react';
import {Btn, MockFrame} from '.';

type Step = 'login' | 'choose' | 'new' | 'existing';

/** 로그인 화면 — /login. 설명서 «로그인하는 순서» 세 단계를 따라가 본다 */
export function LoginMock(): ReactNode {
  const [step, setStep] = useState<Step>('login');
  const [feedback, setFeedback] = useState<ReactNode>();

  const reset = () => {
    setStep('login');
    setFeedback(undefined);
  };

  return (
    <MockFrame
      caption="로그인 화면 — /login"
      hint="«Google로 계속하기»를 눌러 로그인 순서를 따라가 보세요."
      feedback={feedback}
      onReset={reset}
      innerStyle={{maxWidth: 420, margin: '0 auto', minWidth: 'auto'}}>
      <div className="mk-card" style={{textAlign: 'left'}}>
        <div
          style={{
            width: 34,
            height: 34,
            border: '1px solid var(--app-line)',
            borderRadius: 12,
            background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 18,
          }}>
          S
        </div>
        <div style={{fontSize: 22, fontWeight: 600, color: 'var(--app-ink)', lineHeight: 1.3, marginBottom: 10}}>
          SSCC
          <br />
          운영관리시스템
        </div>

        {step === 'login' && (
          <>
            <p style={{fontSize: 12.5, color: 'var(--app-n400)', margin: '0 0 18px'}}>
              Google 계정으로 로그인합니다. 로그인한 계정은
              <br />
              등록된 회원 정보와 연결됩니다.
            </p>
            <div style={{height: 1, background: 'linear-gradient(90deg,var(--app-line),transparent)', marginBottom: 18}} />
            <Btn
              variant="primary"
              style={{width: '100%', flexDirection: 'column', alignItems: 'flex-start', gap: 1, padding: '12px 16px', borderRadius: 14}}
              onClick={() => {
                setStep('choose');
                setFeedback('Google 로그인 창으로 이동합니다. 이제 소속 Google 계정을 고릅니다.');
              }}>
              <span>Google로 계속하기</span>
              <span style={{fontSize: 11, fontWeight: 400, opacity: 0.85}}>Google 계정으로 로그인 또는 회원가입</span>
            </Btn>
            <p style={{fontSize: 11.5, color: 'var(--app-n500)', margin: '16px 0 0'}}>
              처음 가입하면 임시회원 등급으로 바로 시작할 수 있습니다. 졸업생도 동일하게 가입할 수 있습니다.
            </p>
          </>
        )}

        {step === 'choose' && (
          <>
            <p style={{fontSize: 12.5, color: 'var(--app-n400)', margin: '0 0 12px'}}>(예시) Google 계정 선택</p>
            <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
              <Btn
                variant="ghost"
                style={{justifyContent: 'flex-start'}}
                onClick={() => {
                  setStep('new');
                  setFeedback('처음 로그인이면 임시회원으로 등록됩니다. 이후 운영진이 등급을 조정합니다.');
                }}>
                동아리 활동에 쓰는 계정 · 처음 로그인
              </Btn>
              <Btn
                variant="ghost"
                style={{justifyContent: 'flex-start'}}
                onClick={() => {
                  setStep('existing');
                  setFeedback('이미 등록된 사람이면 권한 동의 후 바로 대시보드로 이동합니다.');
                }}>
                동아리 활동에 쓰는 계정 · 이미 등록됨
              </Btn>
              <Btn
                variant="ghost"
                style={{justifyContent: 'flex-start'}}
                onClick={() =>
                  setFeedback('개인 계정이 아니라 동아리 활동에 쓰는 계정으로 로그인해야 회원 정보와 연결됩니다.')
                }>
                개인 계정
              </Btn>
            </div>
          </>
        )}

        {step === 'new' && (
          <p style={{fontSize: 13, color: 'var(--app-n300)', margin: 0}}>
            운영관리시스템으로 돌아왔습니다. 등급: <span className="mk-badge mk-b-outline">임시회원</span>
          </p>
        )}

        {step === 'existing' && (
          <p style={{fontSize: 13, color: 'var(--app-n300)', margin: 0}}>운영관리시스템으로 돌아왔습니다. 운영 대시보드로 이동합니다.</p>
        )}
      </div>
    </MockFrame>
  );
}
