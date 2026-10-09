import {useState, type ReactNode} from 'react';
import {Btn, MockFrame} from '..';

type Scope = {code: string; desc?: string};
type App = {name: string; returnTo: string; scopes: Scope[]};

const KNOWN_SCOPES: Scope[] = [
  {code: 'openid', desc: '로그인한 계정을 식별합니다'},
  {code: 'email', desc: '계정의 이메일 주소를 봅니다'},
  {code: 'profile', desc: '계정의 이름·프로필 사진을 봅니다'},
  {code: 'offline_access', desc: '로그인하지 않아도 연결을 유지합니다'},
];

const EXPECTED: App = {name: 'Claude', returnTo: 'claude.ai', scopes: KNOWN_SCOPES};

// 기대하지 않은 앱의 예시. 주소는 예시용 도메인(example.com)이다. 설명이 없는 범위도 원문 그대로 보인다.
const UNEXPECTED: App = {
  name: 'AI Helper',
  returnTo: 'ai-helper.example.com',
  scopes: [...KNOWN_SCOPES, {code: 'files.read'}],
};

const CODE_STYLE = {
  background: 'var(--app-bg)',
  borderRadius: 6,
  padding: '1px 6px',
  fontSize: 11.5,
  color: 'var(--app-n300)',
} as const;

const NOT_MEMBER = '회원 가입 뒤에 사용할 수 있습니다';

/**
 * 접근 요청 확인 — /oauth/consent. 거절하면 아무것도 바뀌지 않고, 허용하면 그 앱이 내 권한 안에서 시스템을 쓴다.
 * 설명서 «기대한 앱이 아니면 거절하세요»와 «아직 가입 전이면 허용할 수 없습니다»를 따른다.
 */
export function OAuthConsentMock(): ReactNode {
  const [app, setApp] = useState<App>(EXPECTED);
  const [member, setMember] = useState(true);
  const [decision, setDecision] = useState<'allow' | 'deny'>();
  const [feedback, setFeedback] = useState<ReactNode>();

  const unexpected = app === UNEXPECTED;

  const deny = () => {
    setDecision('deny');
    setFeedback(
      unexpected
        ? '거절했습니다. 기대한 앱이 아니면 거절하는 것이 맞습니다. 계정에는 아무 변화가 없고, 나중에 그 앱에서 다시 요청하면 이 화면이 또 열립니다.'
        : '거절했습니다. 계정에는 아무 변화가 없습니다. 나중에 그 앱에서 다시 요청하면 이 화면이 또 열립니다.',
    );
  };

  const allow = () => {
    if (!member) {
      setFeedback(`잠겨 있습니다. 아직 가입 전이면 허용할 수 없습니다(«${NOT_MEMBER}»). 먼저 가입을 마치고 다시 시도하세요.`);
      return;
    }
    setDecision('allow');
    setFeedback(
      unexpected
        ? `허용했습니다. 이제 ${app.name}가 내 계정으로 시스템을 쓰기 시작합니다. 앱 이름도 돌아갈 곳(${app.returnTo})도 기대한 것과 달랐으니 거절했어야 합니다. 허용하기 전에 앱 이름과 돌아갈 곳을 먼저 확인하세요.`
        : `허용했습니다. 이제 ${app.name}가 내 SSCC 계정으로 운영 시스템을 씁니다. 내가 가진 권한 범위에서만 접근하고, 새로운 권한이 생기지는 않습니다.`,
    );
  };

  return (
    <MockFrame
      caption="접근 요청 확인 — /oauth/consent"
      hint="«거절»과 «허용»을 눌러 보세요. 아래 점선 띠에서 낯선 앱의 요청으로 바꿔 볼 수 있습니다."
      feedback={feedback}
      onReset={() => {
        setApp(EXPECTED);
        setMember(true);
        setDecision(undefined);
        setFeedback(undefined);
      }}
      demo={
        <>
          <button
            type="button"
            onClick={() => {
              const next = unexpected ? EXPECTED : UNEXPECTED;
              setApp(next);
              setDecision(undefined);
              setFeedback(
                next === UNEXPECTED
                  ? '기대하지 않은 앱이 연결을 요청했습니다. 앱 이름과 돌아갈 곳이 기대한 것과 다르고, 설명이 없는 요청 범위(files.read)도 숨기지 않고 원문 그대로 보입니다. 모르는 주소라면 거절하세요.'
                  : 'Claude의 요청으로 돌아왔습니다.',
              );
            }}>
            {unexpected ? 'Claude가 연결을 요청함' : '기대하지 않은 앱이 연결을 요청함'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMember(!member);
              setDecision(undefined);
              setFeedback(
                member
                  ? `아직 가입 전인 계정으로 열었습니다. 화면에 «${NOT_MEMBER}»가 뜨고 «허용»이 잠깁니다.`
                  : '가입한 계정으로 열었습니다. 이제 «허용»을 누를 수 있습니다.',
              );
            }}>
            {member ? '가입 전인 계정으로 열림' : '가입한 계정으로 열림'}
          </button>
        </>
      }
      innerStyle={{maxWidth: 420, margin: '0 auto'}}>
      <div className="mk-card" style={{textAlign: 'left'}}>
        <div
          style={{
            width: 34,
            height: 34,
            border: '1px solid var(--app-line)',
            borderRadius: 12,
            background: 'var(--app-accent-soft)',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 700,
            color: 'var(--app-accent)',
            fontSize: 14,
            marginBottom: 18,
          }}>
          SC
        </div>
        <div style={{fontSize: 22, fontWeight: 600, color: 'var(--app-ink)', lineHeight: 1.3, marginBottom: 10}}>
          {app.name}
          <br />
          접근 요청
        </div>
        <p style={{fontSize: 13, color: 'var(--app-n400)', margin: '0 0 18px', lineHeight: 1.6}}>
          이 앱이 내 SSCC 계정으로 운영 시스템을 쓰려고 합니다. 허용해도 현재 권한 안에서만 접근할 수 있습니다.
        </p>
        <dl className="mk-kv" style={{gridTemplateColumns: '76px 1fr'}}>
          <dt>앱 이름</dt>
          <dd>{app.name}</dd>
          <dt>돌아갈 곳</dt>
          <dd>{app.returnTo}</dd>
          <dt>요청 범위</dt>
          <dd>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
              {app.scopes.map((s) => (
                <div key={s.code}>
                  <code style={CODE_STYLE}>{s.code}</code>
                  {s.desc && (
                    <>
                      {' '}
                      <span style={{color: 'var(--app-n400)', fontSize: 12}}>{s.desc}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </dd>
        </dl>
        <div style={{height: 1, background: 'linear-gradient(90deg,transparent,var(--app-line),transparent)', margin: '18px 0'}} />
        {decision ? (
          <div
            style={{
              borderRadius: 10,
              background: 'var(--app-bg)',
              padding: '9px 11px',
              fontSize: 12.5,
              color: 'var(--app-n300)',
            }}>
            {decision === 'allow'
              ? `(예시) 허용했습니다 — 돌아갈 곳(${app.returnTo})으로 갑니다`
              : '(예시) 거절했습니다 — 계정에는 아무 변화가 없습니다'}
          </div>
        ) : (
          <>
            <div style={{display: 'flex', gap: 8}}>
              <Btn variant="ghost" style={{flex: 1, justifyContent: 'center'}} onClick={deny}>
                거절
              </Btn>
              <Btn
                variant="primary"
                style={{flex: 1, justifyContent: 'center'}}
                locked={!member}
                title={member ? undefined : NOT_MEMBER}
                onClick={allow}>
                허용
              </Btn>
            </div>
            {!member && <p style={{fontSize: 12, color: 'var(--app-amber)', margin: '10px 0 0'}}>{NOT_MEMBER}</p>}
          </>
        )}
        <p style={{fontSize: 11.5, color: 'var(--app-n500)', margin: '16px 0 0', lineHeight: 1.6}}>
          앱 이름과 돌아갈 곳이 기대한 것과 다르면 거절해주세요. 거절해도 계정에는 아무 변화가 없습니다.
        </p>
      </div>
    </MockFrame>
  );
}
