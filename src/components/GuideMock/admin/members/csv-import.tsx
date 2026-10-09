import {useState, type CSSProperties, type ReactNode} from 'react';
import {Btn, Check, Chip, MockFrame} from '../..';

const STEPS = ['파일 선택', '컬럼 매핑', '사전 검증', '결과'] as const;

/** 단계 표시. 옛 그림은 1단계가 현재인 모습이고, 지난 단계는 ✓로 바꿔 그린다 */
function Stepper({current}: {current: number}): ReactNode {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 0, marginBottom: 18}}>
      {STEPS.map((label, i) => {
        const passed = i < current;
        const now = i === current;
        return (
          <span key={label} style={{display: 'contents'}}>
            {i > 0 && (
              <span
                style={{
                  flex: 1,
                  height: 1,
                  margin: '0 8px',
                  background: i <= current ? 'var(--app-accent-strong)' : i === current + 1 ? 'var(--app-line-strong)' : 'var(--app-line)',
                }}
              />
            )}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: now || passed ? 'var(--app-accent-strong)' : 'var(--app-n500)',
                fontWeight: now ? 600 : undefined,
              }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 10,
                  ...(now || passed
                    ? {background: 'var(--app-accent-strong)', color: '#fff'}
                    : {border: '1px solid var(--app-line-strong)'}),
                }}>
                {passed ? '✓' : i + 1}
              </span>
              {label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/** 3단계 사전 검증의 카드 넷. 옛 그림의 숫자 그대로 */
function PrecheckCards(): ReactNode {
  const cards = [
    {label: '전체 행', value: 86, color: 'var(--app-ink)'},
    {label: '정상 후보', value: 79, color: 'var(--app-accent)'},
    {label: '오류', value: 3, color: 'var(--app-danger)'},
    {label: '중복 후보', value: 4, color: 'var(--app-danger)'},
  ];
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10}}>
      {cards.map((c) => (
        <div key={c.label} className="mk-card" style={{padding: 12}}>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)'}}>{c.label}</div>
          <div style={{fontSize: 22, fontWeight: 600, color: c.color}}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

type JoinTarget = '동아리 가입 시기' | '전산 가입일';

/** 내 파일의 헤더 → 시스템 필드. 헤더명이 달라도 직접 잇는다는 것을 보이려고 «이름», «연락처»를 넣었다 */
const FIXED_MAPPINGS: [string, string][] = [
  ['이름', '회원명'],
  ['학번', '학번'],
  ['연락처', '전화번호'],
  ['기수', '기수'],
];

const CELL: CSSProperties = {
  border: '1px solid var(--app-line-strong)',
  borderRadius: 8,
  padding: '6px 9px',
  fontSize: 12.5,
  color: 'var(--app-ink)',
  background: 'var(--app-surface)',
};

type ImportState = {step: number; join: JoinTarget; confirmed: boolean; done: boolean};

const IMPORT_INITIAL: ImportState = {step: 0, join: '동아리 가입 시기', confirmed: false, done: false};

/**
 * CSV 회원 이관 — /members/csv-import.
 * 설명서의 4단계 절차와 주의 상자(«가입일»은 «동아리 가입 시기»로, 실행은 확인 체크 뒤, 정상 후보만 등록)를 따라간다.
 */
export function CsvImportMock(): ReactNode {
  const [s, setS] = useState<ImportState>(IMPORT_INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const go = (step: number, message: ReactNode) => {
    setS({...s, step});
    setFeedback(message);
  };

  const smallBtn: CSSProperties = {fontSize: 12.5, padding: '6px 12px'};

  return (
    <MockFrame
      caption={`CSV 회원 이관 — ${s.step + 1}단계 ${STEPS[s.step]}`}
      hint="«CSV 파일 선택»부터 눌러 네 단계를 따라가 보세요. 2단계에서 «가입일»을 어디에 잇는지도 바꿔 보세요."
      feedback={feedback}
      onReset={() => {
        setS(IMPORT_INITIAL);
        setFeedback(undefined);
      }}>
      <Stepper current={s.step} />

      {s.step === 0 && (
        <div className="mk-card" style={{textAlign: 'center', padding: '34px 20px', border: '1.5px dashed var(--app-line-strong)', boxShadow: 'none'}}>
          <div style={{fontSize: 13.5, color: 'var(--app-n400)', marginBottom: 10}}>CSV 파일을 여기로 끌어오거나</div>
          <Btn
            variant="primary"
            style={{fontSize: 13}}
            onClick={() =>
              go(
                1,
                '파일을 골랐습니다. 양식 CSV를 먼저 내려받아 형식을 맞춰 두면 좋습니다. 이제 내 파일의 헤더를 시스템 필드에 연결합니다.',
              )
            }>
            CSV 파일 선택
          </Btn>
        </div>
      )}

      {s.step === 1 && (
        <div className="mk-card">
          <div className="mk-section-label">내 파일 헤더 → 시스템 필드</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {FIXED_MAPPINGS.map(([from, to]) => (
              <div key={from} style={{display: 'grid', gridTemplateColumns: '1fr 20px 1.6fr', alignItems: 'center', gap: 8}}>
                <span style={{...CELL, color: 'var(--app-n300)'}}>{from}</span>
                <span style={{color: 'var(--app-n500)', textAlign: 'center'}}>→</span>
                <span style={CELL}>{to}</span>
              </div>
            ))}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 20px 1.6fr', alignItems: 'center', gap: 8}}>
              <span style={{...CELL, color: 'var(--app-n300)'}}>가입일</span>
              <span style={{color: 'var(--app-n500)', textAlign: 'center'}}>→</span>
              <span style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
                {(['동아리 가입 시기', '전산 가입일'] as JoinTarget[]).map((t) => (
                  <Chip
                    key={t}
                    active={s.join === t}
                    onClick={() => {
                      setS({...s, join: t});
                      setFeedback(
                        t === '전산 가입일'
                          ? '«전산 가입일»은 이관을 실행한 날로 시스템이 적는 값이라 과거 날짜를 넣는 자리가 아닙니다. 두 열을 바꿔 넣으면 모든 회원의 동아리 가입 시기가 이관일로 들어갑니다.'
                          : '맞습니다. 명부의 «가입일»은 «동아리 가입 시기» 열에 넣습니다.',
                      );
                    }}>
                    {t}
                  </Chip>
                ))}
              </span>
            </div>
          </div>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 10}}>
            기수: 학번으로도 동아리 가입 시기로도 자동 채우지 않습니다
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14}}>
            <Btn variant="ghost" style={smallBtn} onClick={() => go(0, '1단계로 돌아왔습니다.')}>
              이전
            </Btn>
            <Btn
              variant="primary"
              style={smallBtn}
              onClick={() =>
                go(
                  2,
                  '사전 검증 결과입니다. 이 숫자를 반드시 확인하세요. 오류 3행과 중복 후보 4행은 이관되지 않고 건너뜁니다(중복으로 보이는 행은 자동으로 병합하지 않습니다). 실행 전 사유를 꼭 읽어보세요.',
                )
              }>
              다음
            </Btn>
          </div>
        </div>
      )}

      {s.step === 2 && (
        <>
          <PrecheckCards />
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14}}>
            <Btn variant="ghost" style={smallBtn} onClick={() => go(1, '2단계로 돌아왔습니다.')}>
              이전
            </Btn>
            <Btn
              variant="primary"
              style={smallBtn}
              onClick={() =>
                go(3, '마지막 단계입니다. «되돌릴 수 없다는 것을 확인했습니다»에 체크해야 실행할 수 있습니다.')
              }>
              다음
            </Btn>
          </div>
        </>
      )}

      {s.step === 3 && !s.done && (
        <div className="mk-card">
          <div style={{fontSize: 13, color: 'var(--app-ink)', marginBottom: 12}}>
            정상 후보 79명을 새 회원으로 등록합니다. 오류 3행과 중복 후보 4행은 건너뜁니다.
          </div>
          <div style={{fontSize: 13, color: 'var(--app-ink)'}}>
            <Check
              on={s.confirmed}
              label="되돌릴 수 없다는 것을 확인했습니다"
              onToggle={() => {
                setS({...s, confirmed: !s.confirmed});
                setFeedback(s.confirmed ? '체크를 풀었습니다. «실행»이 다시 잠깁니다.' : '체크했습니다. 이제 «실행»을 누를 수 있습니다.');
              }}
            />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14}}>
            <Btn variant="ghost" style={smallBtn} onClick={() => go(2, '3단계로 돌아왔습니다.')}>
              이전
            </Btn>
            <Btn
              variant="primary"
              style={smallBtn}
              locked={!s.confirmed}
              title={s.confirmed ? undefined : '«되돌릴 수 없다는 것을 확인했습니다»에 체크해야 합니다'}
              onClick={() => {
                if (!s.confirmed) {
                  setFeedback('잠겨 있습니다. 실행 결과는 되돌릴 수 없으므로 «되돌릴 수 없다는 것을 확인했습니다»에 먼저 체크해야 합니다.');
                  return;
                }
                setS({...s, done: true});
                setFeedback(
                  '실행했습니다. 정상 후보 79명만 새 회원으로 등록되고 오류·중복 행은 건너뜁니다. 실제 화면에서는 되돌릴 수 없습니다. ' +
                    '이관된 회원은 이름 옆에 «이관» 표시가 붙고, 본인이 Google로 가입해야 로그인 계정과 연결됩니다.',
                );
              }}>
              실행
            </Btn>
          </div>
        </div>
      )}

      {s.step === 3 && s.done && (
        <div className="mk-card">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10}}>
            <div className="mk-stat">
              <div className="lb">새 회원 등록</div>
              <div className="vl" style={{color: 'var(--app-accent)'}}>
                79
              </div>
            </div>
            <div className="mk-stat">
              <div className="lb">건너뜀</div>
              <div className="vl">7</div>
              <div className="ht">오류 3 · 중복 후보 4</div>
            </div>
          </div>
        </div>
      )}
    </MockFrame>
  );
}

/** 3단계 사전 검증 — 설명서가 «이 숫자를 반드시 확인하라»고 짚는 카드 넷. 그림으로만 둔다 */
export function CsvPrecheckMock(): ReactNode {
  return (
    <MockFrame caption="3단계 사전 검증 — 이 숫자를 반드시 확인하고 다음으로">
      <PrecheckCards />
    </MockFrame>
  );
}
