import {useState, type ReactNode} from 'react';
import {Btn, MockFrame, Progress} from '../..';

/* ============ 공개 폼 작성 화면 ============ */

type Step = 0 | 1 | 'done';

/** 응답자의 «S» 마크와 동아리 이름. 옛 설명서의 그림 그대로 */
function ClubMark(): ReactNode {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14}}>
      <div
        style={{
          width: 22,
          height: 22,
          border: '1px solid var(--app-accent)',
          borderRadius: 6,
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--app-accent)',
        }}>
        S
      </div>
      <span style={{fontSize: 12, color: 'var(--app-n500)'}}>SSCC</span>
    </div>
  );
}

const QUESTION_BOX = {border: '1px solid var(--app-line)', borderRadius: 14, padding: 12, marginBottom: 10};
const QUESTION_TITLE = {fontSize: 13.5, fontWeight: 500, color: 'var(--app-ink)'};

/**
 * 공개 폼 작성 화면 — /f/{키}. 페이지를 넘겨 제출하면 완료 화면으로 가고,
 * 그 뒤에는 같은 링크로 다시 들어가도 재작성할 수 없다(폼이 재제출을 허용하지 않는 한)는 설명서 문장을 따른다.
 */
export function PublicFormMock(): ReactNode {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [motive, setMotive] = useState('');
  const [flash, setFlash] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const next = () => {
    if (name.trim() === '') {
      setFeedback('이름은 필수 문항(*)입니다. 칸에 이름을 적고 «다음»을 눌러 보세요.');
      return;
    }
    setStep(1);
    setFeedback('다음 페이지로 넘어갔습니다. 진행 막대가 끝까지 찼습니다. 마지막 페이지라 «제출»을 누르면 됩니다.');
  };

  const submit = () => {
    if (motive.trim() === '') {
      setFeedback('지원 동기는 필수 문항(*)입니다. 칸을 채우고 «제출»을 눌러 보세요.');
      return;
    }
    setStep('done');
    setFeedback(
      '제출했습니다. 완료 화면으로 넘어갑니다. 이제 같은 링크로 다시 들어가도 재작성할 수 없습니다(폼이 재제출을 허용하지 않는 한).',
    );
  };

  const reenter = () => {
    setFlash(flash + 1);
    setFeedback(
      '같은 링크로 다시 들어왔지만 완료 화면 그대로입니다. 폼이 재제출을 허용하지 않는 한 다시 쓸 수 없습니다. 낸 응답은 «내 신청»의 «제출 내용 보기»로 읽을 수 있습니다.',
    );
  };

  return (
    <MockFrame
      caption="공개 폼 작성 화면 — /f/{키}"
      hint="이름을 적고 «다음», 지원 동기를 적고 «제출»을 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setStep(0);
        setName('');
        setMotive('');
        setFlash(0);
        setFeedback(undefined);
      }}
      demo={
        <button type="button" onClick={reenter} disabled={step !== 'done'}>
          응답자가 같은 링크로 다시 들어옴
        </button>
      }
      innerStyle={{maxWidth: 420, margin: '0 auto', minWidth: 'auto'}}>
      <div key={flash} className={flash > 0 ? 'mk-card gm-flash' : 'mk-card'}>
        <ClubMark />
        <div style={{fontSize: 19, fontWeight: 700, color: 'var(--app-ink)', marginBottom: 6}}>2026 신입회원 모집</div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 12}}>08.01 09:00 ~ 08.25 23:59</div>
        <Progress value={step === 0 ? 50 : 100} style={{display: 'block', flex: 'none', marginBottom: 16}} />

        {step === 0 && (
          <>
            <div style={QUESTION_BOX}>
              <div style={QUESTION_TITLE}>
                이름을 입력해 주세요 <span style={{color: 'var(--app-danger)'}}>*</span>
              </div>
              <input
                className="gm-input"
                aria-label="이름을 입력해 주세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{marginTop: 8, height: 32}}
              />
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Btn variant="primary" style={{padding: '8px 20px'}} onClick={next}>
                다음
              </Btn>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div style={QUESTION_BOX}>
              <div style={QUESTION_TITLE}>
                지원 동기를 적어 주세요 <span style={{color: 'var(--app-danger)'}}>*</span>
              </div>
              <textarea
                className="gm-input"
                aria-label="지원 동기를 적어 주세요"
                rows={3}
                value={motive}
                onChange={(e) => setMotive(e.target.value)}
                style={{marginTop: 8, resize: 'vertical'}}
              />
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Btn variant="primary" style={{padding: '8px 20px'}} onClick={submit}>
                제출
              </Btn>
            </div>
          </>
        )}

        {step === 'done' && (
          <div style={{...QUESTION_BOX, marginBottom: 0, textAlign: 'center', padding: '20px 12px'}}>
            <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>제출했습니다</div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', marginTop: 6}}>(예시) 완료 화면</div>
          </div>
        )}
      </div>
    </MockFrame>
  );
}

/* ============ 메신저 공유 카드 ============ */

const INITIAL_TITLE = '2026 신입회원 모집';
const INITIAL_INTRO = '숭실컴퓨팅클럽 2026학년도 신입회원을 모집합니다';
const FALLBACK_INTRO = '숭실컴퓨팅클럽(SSCC) 신청서입니다';
const LONG_TITLE = '2026 숭실컴퓨팅클럽 여름방학 알고리즘 집중 스터디 참가 신청서';
/** 카드에 들어가는 길이. 예시 화면의 값이고 실제 길이는 다를 수 있다 */
const TITLE_MAX = 28;
const INTRO_MAX = 60;

const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max)}…` : text);

/**
 * 메신저에 뜨는 공유 카드. 설명서 «카드에 담기는 것» 표를 따른다:
 * 제목은 너무 길면 «…»로 잘리고, 안내 문구가 비면 «숭실컴퓨팅클럽(SSCC) 신청서입니다»가 들어가며, 접수 상태와 마감일은 넣지 않는다.
 */
export function ShareCardMock(): ReactNode {
  const [title, setTitle] = useState(INITIAL_TITLE);
  const [intro, setIntro] = useState(INITIAL_INTRO);
  const [feedback, setFeedback] = useState<ReactNode>();

  const cardTitle = cut(title, TITLE_MAX);
  const cardIntro = intro.trim() === '' ? FALLBACK_INTRO : cut(intro, INTRO_MAX);

  const changeTitle = (value: string) => {
    setTitle(value);
    setFeedback(
      value.length > TITLE_MAX
        ? '제목이 길어 카드에서는 뒤가 «…»로 잘립니다. 새로 붙이는 링크부터 바뀐 제목으로 그려집니다.'
        : '카드 제목은 폼 제목 그대로입니다. 새로 붙이는 링크부터 바뀐 제목으로 그려집니다.',
    );
  };

  const changeIntro = (value: string) => {
    setIntro(value);
    setFeedback(
      value.trim() === ''
        ? '안내 문구가 비어 있어 «숭실컴퓨팅클럽(SSCC) 신청서입니다»가 대신 들어갑니다.'
        : value.length > INTRO_MAX
          ? '카드에는 안내 문구의 앞부분만 들어갑니다.'
          : '카드 아래 줄은 폼 편집기의 안내 문구입니다.',
    );
  };

  const linkStyle = {fontSize: 12, color: 'var(--app-accent)'};

  return (
    <MockFrame
      caption="메신저에 뜨는 공유 카드 — 링크를 붙이는 순간 그려집니다"
      hint="위쪽 칸에서 폼 제목과 안내 문구를 바꿔 보세요. 카드가 그 자리에서 다시 그려집니다."
      feedback={feedback}
      onReset={() => {
        setTitle(INITIAL_TITLE);
        setIntro(INITIAL_INTRO);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() =>
            setFeedback(
              '접수를 마감해도 카드는 그대로입니다. 접수 상태와 마감일은 카드에 넣지 않습니다. 메신저는 한 번 만든 카드 그림을 다시 그리지 않으니, 마감은 공지로 알려주세요.',
            )
          }>
          운영진이 접수를 마감함
        </button>
      }
      innerStyle={{maxWidth: 460, margin: '0 auto', minWidth: 'auto'}}>
      <div className="mk-card" style={{marginBottom: 12, padding: 14}}>
        <div className="mk-section-label">(예시) 폼 편집기</div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 4}}>폼 제목</div>
        <input className="gm-input" aria-label="폼 제목" value={title} onChange={(e) => changeTitle(e.target.value)} />
        <div style={{fontSize: 12, color: 'var(--app-n500)', margin: '10px 0 4px'}}>안내 문구</div>
        <textarea
          className="gm-input"
          aria-label="안내 문구"
          rows={2}
          value={intro}
          onChange={(e) => changeIntro(e.target.value)}
          style={{resize: 'vertical'}}
        />
        <div style={{display: 'flex', gap: 12, marginTop: 8}}>
          <button type="button" className="gm-plain" style={linkStyle} onClick={() => changeTitle(LONG_TITLE)}>
            긴 제목 넣어 보기
          </button>
          <button type="button" className="gm-plain" style={linkStyle} onClick={() => changeIntro('')}>
            안내 문구 비우기
          </button>
        </div>
      </div>
      <div style={{borderRadius: 14, overflow: 'hidden', border: '1px solid var(--app-line)'}}>
        <div
          style={{
            background: 'linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)',
            color: '#f8fafc',
            padding: '26px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            minHeight: 180,
            justifyContent: 'space-between',
          }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 9, fontSize: 11.5, opacity: 0.85}}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: '#38bdf8',
                color: '#0f172a',
                display: 'grid',
                placeItems: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}>
              S
            </div>
            <span>SSCC 숭실컴퓨팅클럽</span>
          </div>
          <div>
            <div style={{fontSize: 23, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.5, overflowWrap: 'anywhere'}}>
              {cardTitle}
            </div>
            <div style={{fontSize: 12.5, opacity: 0.8, marginTop: 8, lineHeight: 1.4, overflowWrap: 'anywhere'}}>{cardIntro}</div>
          </div>
          <div style={{fontSize: 10.5, opacity: 0.6}}>신청서 · 로그인하면 바로 작성할 수 있습니다</div>
        </div>
        <div style={{background: 'var(--app-surface)', padding: '9px 14px', fontSize: 11, color: 'var(--app-n500)'}}>
          sscc.example.com/f/3f9a…
        </div>
      </div>
    </MockFrame>
  );
}
