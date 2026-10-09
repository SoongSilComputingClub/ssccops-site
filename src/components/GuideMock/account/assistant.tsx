import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Btn, MockFrame} from '..';

const EXAMPLE_QUESTION = '회원 자격은 어떻게 나뉘나요?';
const NOT_FOUND = '질문에 답할 근거를 찾지 못했습니다';

type Turn = {
  id: number;
  question: string;
  /** 규정에서 근거를 찾았는가. 예시 화면의 규정은 제7조 하나뿐이다 */
  found: boolean;
  /** 답변 근거 보기를 펼쳤는가 */
  open: boolean;
  /** 답변을 작성 중이다(▍) */
  pending: boolean;
};

const INITIAL_TURNS: Turn[] = [{id: 0, question: EXAMPLE_QUESTION, found: true, open: true, pending: false}];

/** 예시 화면에 있는 규정(제7조 회원의 구분)으로 답할 수 있는 질문인가 */
function inRules(q: string): boolean {
  return /회원/.test(q) && /(자격|구분|나뉘|나누|나눠|정회원|준회원)/.test(q);
}

const ICON_BTN = {
  width: 24,
  height: 24,
  border: '1px solid var(--app-line-strong)',
  borderRadius: 6,
  display: 'grid',
  placeItems: 'center',
  fontSize: 12,
  color: 'var(--app-n400)',
} as const;

function Answer({turn, onToggle}: {turn: Turn; onToggle: () => void}): ReactNode {
  const bubble = {
    border: '1px solid var(--app-line)',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    padding: '10px 12px',
    fontSize: 13,
    color: 'var(--app-ink)',
    lineHeight: 1.65,
  } as const;

  if (turn.pending) {
    return <div style={bubble}>▍</div>;
  }
  if (!turn.found) {
    return <div style={bubble}>{NOT_FOUND}</div>;
  }
  return (
    <>
      <div
        style={{
          display: 'inline-block',
          border: '1px solid var(--app-line-strong)',
          borderRadius: 999,
          padding: '2px 8px',
          fontSize: 11,
          color: 'var(--app-n400)',
          marginBottom: 5,
        }}>
        2026-03-24부터 쓰이는 회칙 기준
      </div>
      <div style={bubble}>
        회원은 정회원과 준회원으로 나뉩니다<span style={{color: 'var(--app-accent)'}}>[제7조]</span>. 정회원은 총회 의결권을 가집니다.
      </div>
      <div style={{marginTop: 8, fontSize: 12.5, color: 'var(--app-n400)'}}>
        <button type="button" className="gm-plain" aria-expanded={turn.open} onClick={onToggle}>
          ▶ 답변 근거 보기 (1)
        </button>
      </div>
      {turn.open && (
        <div
          style={{
            marginTop: 8,
            border: '1px solid var(--app-line)',
            background: 'var(--app-bg)',
            borderRadius: 12,
            padding: '9px 11px',
          }}>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid var(--app-line-strong)',
              borderRadius: 999,
              padding: '1px 7px',
              fontSize: 11,
              color: 'var(--app-n500)',
            }}>
            제7조
          </span>
          <div style={{fontSize: 12.5, fontWeight: 500, color: 'var(--app-n300)', marginTop: 5}}>제2장 회원 · 제7조 (회원의 구분)</div>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 2}}>SSCC 회칙</div>
          <div
            style={{
              fontSize: 11.5,
              color: 'var(--app-n400)',
              marginTop: 5,
              borderLeft: '2px solid var(--app-line-strong)',
              paddingLeft: 7,
              lineHeight: 1.6,
            }}>
            회원은 정회원과 준회원으로 구분한다.
          </div>
        </div>
      )}
    </>
  );
}

/**
 * 규정 도우미 — 오른쪽 아래 버튼으로 연다. 미리 짜 둔 대화로 근거 보기, 근거를 못 찾은 답, 대화 지우기를 흉내 낸다.
 * 설명서 «답을 읽는 법», «근거를 못 찾으면 답하지 않습니다», «대화 지우기»를 따른다. 예시 규정은 제7조 하나뿐이다.
 */
export function AssistantMock(): ReactNode {
  const [turns, setTurns] = useState<Turn[]>(INITIAL_TURNS);
  const [input, setInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [closed, setClosed] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  // 답변 작성 중(▍)을 잠깐 보여 준 뒤 답을 채운다.
  useEffect(() => {
    if (!turns.some((t) => t.pending)) return;
    const timer = setTimeout(() => {
      setTurns((ts) => ts.map((t) => (t.pending ? {...t, pending: false} : t)));
    }, 700);
    return () => clearTimeout(timer);
  }, [turns]);

  // 새 질문을 보내면 대화 끝으로 내린다. 페이지는 움직이지 않고 대화 칸만 내린다.
  const turnCount = turns.length;
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turnCount]);

  const reset = () => {
    setTurns(INITIAL_TURNS);
    setInput('');
    setConfirming(false);
    setClosed(false);
    setFeedback(undefined);
  };

  const ask = (raw: string) => {
    const question = raw.trim();
    if (!question) {
      setFeedback('입력칸에 질문을 적고 «전송»을 누르세요.');
      return;
    }
    const found = inRules(question);
    setTurns((ts) => [...ts, {id: nextId.current++, question, found, open: false, pending: true}]);
    setInput('');
    setConfirming(false);
    setFeedback(
      found
        ? '규정에서 근거를 찾아 답합니다. 답변 위 배지는 무엇을 근거로 답했는지, 본문의 [제7조]는 그 문장이 어느 조항에서 나왔는지 가리킵니다. «답변 근거 보기»를 펼치면 같은 표시가 붙은 카드가 나옵니다.'
        : `규정에 없는 것을 물었습니다. 도우미는 지어내지 않고 «${NOT_FOUND}»로 끝내며, 인용 카드도 붙지 않습니다. 이때는 운영진에게 문의하세요.`,
    );
  };

  const toggle = (id: number) => {
    const turn = turns.find((t) => t.id === id);
    if (!turn) return;
    setTurns(turns.map((t) => (t.id === id ? {...t, open: !t.open} : t)));
    setFeedback(
      turn.open
        ? '답변 근거를 접었습니다. 괄호 안 숫자가 인용 개수입니다.'
        : '답변 근거를 펼쳤습니다. 답변의 [제7조]와 같은 표시가 붙은 카드에 조항 제목과 원문 발췌가 나옵니다.',
    );
  };

  const clearAsk = () => {
    setConfirming(true);
    setFeedback('대화를 지우기 전에 확인을 한 번 받습니다. 되살릴 수 없으니 남겨야 할 조항은 먼저 옮겨 적어두세요.');
  };

  const clear = () => {
    setTurns([]);
    setConfirming(false);
    setFeedback('대화를 지웠습니다. 실제 화면에서도 되살릴 수 없습니다. 주고받은 것이 없으니 ↺ 버튼이 보이지 않습니다.');
  };

  if (closed) {
    return (
      <MockFrame
        caption="규정 도우미 — 오른쪽 아래 버튼으로 열립니다"
        hint="오른쪽 아래 동그란 버튼을 눌러 다시 열어 보세요."
        feedback={feedback}
        onReset={reset}
        innerStyle={{maxWidth: 400, margin: '0 auto', minWidth: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'flex-end', padding: '40px 0 0'}}>
          <button
            type="button"
            className="gm-plain"
            aria-label="규정 도우미 열기"
            onClick={() => {
              setClosed(false);
              setFeedback(
                turns.length > 0
                  ? '다시 열었습니다. 주고받던 대화가 그대로 남아 있습니다. 화면을 옮겨 다녀도 마찬가지입니다.'
                  : '다시 열었습니다.',
              );
            }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--app-accent)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            }}>
            ⚖
          </button>
        </div>
      </MockFrame>
    );
  }

  return (
    <MockFrame
      caption="규정 도우미 — 오른쪽 아래 버튼으로 열립니다"
      hint="«▶ 답변 근거 보기»를 접었다 펴 보고, 질문을 보내 보세요. 예시 규정은 제7조 하나뿐이라 다른 질문에는 근거를 찾지 못합니다."
      feedback={feedback}
      onReset={reset}
      innerStyle={{maxWidth: 400, margin: '0 auto', minWidth: 'auto'}}>
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderBottom: '1px solid var(--app-line)'}}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'var(--app-accent-soft)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 13,
            }}>
            ⚖
          </span>
          <span style={{fontSize: 15, fontWeight: 500, color: 'var(--app-ink)', flex: 1}}>규정 도우미</span>
          {turns.length > 0 && (
            <button type="button" className="gm-plain" style={ICON_BTN} title="대화 지우기" aria-label="대화 지우기" onClick={clearAsk}>
              ↺
            </button>
          )}
          <button
            type="button"
            className="gm-plain"
            style={ICON_BTN}
            title="닫기"
            aria-label="닫기"
            onClick={() => {
              setClosed(true);
              setConfirming(false);
              setFeedback('창을 닫았습니다. 도우미는 사이드바 메뉴에 없고 오른쪽 아래 버튼으로만 엽니다.');
            }}>
            ✕
          </button>
        </div>

        {confirming && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
              padding: '10px 13px',
              borderBottom: '1px solid var(--app-line)',
              background: 'var(--app-bg)',
              fontSize: 12.5,
              color: 'var(--app-n300)',
            }}>
            <span style={{flex: 1, minWidth: '12em'}}>(예시 확인 창) 대화를 지웁니다. 되살릴 수 없습니다.</span>
            <Btn
              variant="ghost"
              style={{padding: '4px 10px', fontSize: 12}}
              onClick={() => {
                setConfirming(false);
                setFeedback('지우지 않았습니다. 대화가 그대로 남아 있습니다.');
              }}>
              취소
            </Btn>
            <Btn variant="ghost-danger" style={{padding: '4px 10px', fontSize: 12}} onClick={clear}>
              지우기
            </Btn>
          </div>
        )}

        <div ref={listRef} style={{padding: 13, maxHeight: 420, overflowY: 'auto'}}>
          {turns.length === 0 && (
            <div style={{fontSize: 12.5, color: 'var(--app-n400)'}}>
              <div style={{marginBottom: 8}}>이런 것을 물어볼 수 있어요</div>
              <button
                type="button"
                className="gm-plain"
                onClick={() => ask(EXAMPLE_QUESTION)}
                style={{
                  border: '1px solid var(--app-line-strong)',
                  borderRadius: 999,
                  padding: '4px 11px',
                  fontSize: 12.5,
                  color: 'var(--app-n300)',
                }}>
                {EXAMPLE_QUESTION}
              </button>
            </div>
          )}
          {turns.map((t, i) => (
            <div key={t.id} style={{marginTop: i > 0 ? 16 : 0}}>
              <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 10}}>
                <span
                  style={{
                    background: 'var(--app-accent)',
                    color: '#fff',
                    borderRadius: 14,
                    borderBottomRightRadius: 4,
                    padding: '8px 12px',
                    fontSize: 13,
                    maxWidth: '85%',
                  }}>
                  {t.question}
                </span>
              </div>
              <Answer turn={t} onToggle={() => toggle(t.id)} />
            </div>
          ))}
        </div>

        <div style={{display: 'flex', gap: 7, alignItems: 'flex-end', padding: '11px 13px', borderTop: '1px solid var(--app-line)'}}>
          <input
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                e.preventDefault();
                ask(input);
              }
            }}
            placeholder="규정에 대해 물어보세요"
            aria-label="규정에 대해 물어보세요"
            style={{
              flex: 1,
              minWidth: 0,
              border: '1px solid var(--app-line-strong)',
              borderRadius: 10,
              padding: '9px 11px',
              fontSize: 13,
              color: 'var(--app-ink)',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
          />
          <Btn variant="primary" style={{fontSize: 12, padding: '8px 13px'}} onClick={() => ask(input)}>
            전송
          </Btn>
        </div>
      </div>
    </MockFrame>
  );
}
