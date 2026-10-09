import {useState, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '../..';

type Perm = {code: string; name: string; inherited?: boolean};

const PERMS: Perm[] = [
  {code: 'WORK_MANAGE', name: '업무 관리'},
  {code: 'MEMBER_MANAGE', name: '회원 관리', inherited: true},
  {code: 'FORM_LABEL_MANAGE', name: '폼 라벨 관리'},
  // 옛 그림의 변경분 요약 «부여 SUB_WORK_TYPE_MANAGE»를 눌러 볼 수 있게 목록에 꺼내 둔 줄
  {code: 'SUB_WORK_TYPE_MANAGE', name: '하위 업무 유형 관리'},
];

/** 이 역할의 실제 부여 권한 가운데 목록에 그리지 않은 것. 옛 그림의 «5개 → 6개»에 숫자를 맞춘다 */
const HIDDEN_EFFECTIVE = 3;

type Direct = Record<string, boolean>;

/** 저장된 직접 부여. 상속 줄(MEMBER_MANAGE)은 직접 부여와 따로 센다 */
const SAVED_INITIAL: Direct = {WORK_MANAGE: true, FORM_LABEL_MANAGE: false, SUB_WORK_TYPE_MANAGE: false};
/** 옛 그림처럼 SUB_WORK_TYPE_MANAGE를 막 체크한, 저장 전 상태에서 시작한다 */
const PENDING_INITIAL: Direct = {...SAVED_INITIAL, SUB_WORK_TYPE_MANAGE: true};

const effective = (direct: Direct) =>
  HIDDEN_EFFECTIVE + PERMS.filter((p) => p.inherited).length + PERMS.filter((p) => !p.inherited && direct[p.code]).length;

/**
 * 역할별 권한 부여 — /members/roles/{id}/authorities.
 * 설명서 개념 표의 «상속: 상위에서 부여 배지가 붙은 항목은 체크를 해제할 수 없습니다»를 따르고, 저장 전 변경분을 요약한다.
 */
export function RoleAuthoritiesMock(): ReactNode {
  const [saved, setSaved] = useState<Direct>(SAVED_INITIAL);
  const [pending, setPending] = useState<Direct>(PENDING_INITIAL);
  const [flash, setFlash] = useState(0);
  const [feedback, setFeedback] = useState<ReactNode>();

  const before = effective(saved);
  const after = effective(pending);
  const changes = PERMS.filter((p) => !p.inherited && saved[p.code] !== pending[p.code]);

  // 권한 이름이 모두 «…관리»로 끝나 조사는 는/를로 적는다.
  const toggle = (p: Perm) => {
    if (p.inherited) {
      setFeedback(
        `«${p.name}»는 상위 권한에서 부여된 항목이라 체크를 해제할 수 없습니다. 권한 트리에서 상위 권한을 가지면 하위 권한도 자동으로 포함됩니다.`,
      );
      return;
    }
    const next = {...pending, [p.code]: !pending[p.code]};
    setPending(next);
    setFlash(flash + 1);
    setFeedback(
      `«${p.name}»를 ${next[p.code] ? '체크' : '체크 해제'}했습니다. 실제 부여 권한 ${before}개 → ${effective(next)}개. «저장»을 눌러야 반영됩니다.`,
    );
  };

  return (
    <MockFrame
      caption="역할별 권한 부여 — 체크는 직접 부여, 파란 배지는 상위 권한에서 상속됨"
      hint="체크칸을 눌러 직접 부여를 바꾸고 오른쪽 변경분 요약을 보세요. «상위에서 부여» 줄과 «되돌리기», «저장»도 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setSaved(SAVED_INITIAL);
        setPending(PENDING_INITIAL);
        setFlash(0);
        setFeedback(undefined);
      }}>
      <div style={{display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14}}>
        <div className="mk-card">
          <div className="mk-section-label">역할별 권한 부여 — 회장</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13}}>
            {PERMS.map((p) => {
              const on = p.inherited || pending[p.code];
              return (
                <button
                  key={p.code}
                  type="button"
                  className="gm-plain"
                  role="checkbox"
                  aria-checked={on}
                  aria-disabled={p.inherited || undefined}
                  title={p.inherited ? '상위 권한에서 부여된 항목은 체크를 해제할 수 없습니다' : undefined}
                  onClick={() => toggle(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 0',
                    borderTop: '1px solid var(--app-line)',
                    width: '100%',
                    cursor: p.inherited ? 'not-allowed' : undefined,
                  }}>
                  <span className={on ? 'gm-check on' : 'gm-check'}>{on ? '✓' : ''}</span>
                  <span style={{color: on ? 'var(--app-ink)' : 'var(--app-n400)'}}>{p.name}</span>
                  <code
                    style={{
                      fontSize: 11,
                      color: 'var(--app-n500)',
                      fontFamily: 'var(--ifm-font-family-monospace)',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                    }}>
                    {p.code}
                  </code>
                  {p.inherited && (
                    <Badge tone="outline-accent" style={{marginLeft: 'auto'}}>
                      상위에서 부여
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mk-card">
          <div className="mk-section-label">변경분 요약</div>
          <div key={flash} className={flash > 0 ? 'gm-flash' : undefined} style={{fontSize: 13, color: 'var(--app-ink)', marginBottom: 10, borderRadius: 6}}>
            실제 부여 권한 {before}개 → {after}개
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5}}>
            {changes.map((p) => (
              <div key={p.code}>
                <Badge tone={pending[p.code] ? 'blue' : 'red'}>{pending[p.code] ? '부여' : '해제'}</Badge>{' '}
                <span style={{color: 'var(--app-n400)', marginLeft: 6}}>{p.code}</span>
              </div>
            ))}
            {changes.length === 0 && <div style={{color: 'var(--app-n500)'}}>바뀐 것이 없습니다.</div>}
          </div>
          <div style={{marginTop: 14, display: 'flex', gap: 8}}>
            <Btn
              variant="ghost"
              style={{fontSize: 12, padding: '6px 12px'}}
              onClick={() => {
                if (changes.length === 0) {
                  setFeedback('되돌릴 변경이 없습니다.');
                  return;
                }
                setPending(saved);
                setFlash(flash + 1);
                setFeedback(`저장하지 않은 변경을 되돌렸습니다. 실제 부여 권한은 저장된 그대로 ${before}개입니다.`);
              }}>
              되돌리기
            </Btn>
            <Btn
              variant="primary"
              style={{fontSize: 12, padding: '6px 12px'}}
              onClick={() => {
                if (changes.length === 0) {
                  setFeedback('저장할 변경이 없습니다.');
                  return;
                }
                setSaved(pending);
                setFlash(flash + 1);
                setFeedback(
                  `저장했습니다. 이 역할을 가진 회원은 이제 실제 부여 권한 ${after}개를 기준으로 버튼과 메뉴가 그려집니다.`,
                );
              }}>
              저장
            </Btn>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}
