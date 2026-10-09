import {useState, useSyncExternalStore, type ReactNode} from 'react';
import {Badge, Btn, MockFrame} from '../..';

/* ============ 두 예시 화면이 함께 보는 접수 상태 ============
 * 폼 상세에서 «접수 시작»을 누르면 아래 회원 화면도 바로 바뀌도록, 이 페이지의 두 예시 화면이 한 값을 나눠 본다.
 * 두 화면이 모두 사라지면(다른 페이지로 가면) 처음 상태(마감)로 돌아간다.
 */

let intakeOpen = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) intakeOpen = false;
  };
}

function setIntakeOpen(open: boolean): void {
  intakeOpen = open;
  listeners.forEach((l) => l());
}

function useIntakeOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => intakeOpen,
    () => false,
  );
}

/* ============ 기획안 시스템 폼 상세 ============ */

const LOCK_TITLE = '접수 상태 변경(FORM_STATUS_CHANGE) 권한이 필요합니다';

/**
 * 기획안 시스템 폼 상세 — /forms/{formId}.
 * 설명서 «기획안 접수를 여는 순서»(접수 시작과 마감), «접수 상태 변경은 폼 편집과 다른 권한», «복제하면 일반 폼»을 따른다.
 */
export function ProposalFormMock(): ReactNode {
  const open = useIntakeOpen();
  const [noPermission, setNoPermission] = useState(false);
  // 아래 회원 화면에서 접수 상태를 바꾸면 이 화면의 안내는 맞지 않게 되므로, 안내를 남긴 때의 상태를 같이 적어 둔다.
  const [note, setNote] = useState<{text: ReactNode; open: boolean}>();

  const say = (text: ReactNode, at: boolean = open) => setNote({text, open: at});

  const toggle = () => {
    if (noPermission) {
      say(
        '잠겨 있습니다. 문항을 고치는 것은 폼 편집(FORM_WRITE), 접수를 열고 닫는 것은 접수 상태 변경(FORM_STATUS_CHANGE) 권한입니다. 폼은 고칠 수 있는데 이 버튼만 잠겨 있다면 접수 상태 변경 권한이 없는 것입니다.',
      );
      return;
    }
    if (open) {
      setIntakeOpen(false);
      say('«마감»을 눌렀습니다. 시스템 폼은 지울 수 없으므로 그만 받을 때는 삭제가 아니라 마감을 씁니다. 마감한 뒤에도 다시 접수를 시작할 수 있습니다.', false);
      return;
    }
    setIntakeOpen(true);
    say(
      '«접수 시작»을 눌렀습니다. 이제 회원이 학술 앱의 «기획안 제출» 화면에서 기획안을 낼 수 있고, 제출된 기획안이 기획안 검토 목록에 표시됩니다. 아래 회원 화면도 함께 바뀝니다.',
      true,
    );
  };

  const edit = () =>
    say(
      '시스템 폼도 제목 · 접수 기간 · 라벨 · 접수 상태는 평소처럼 바꿀 수 있고, 문항 문구를 수정하거나 문항을 추가할 수도 있습니다. 막히는 것은 삭제와 시스템이 쓰는 문항의 삭제 둘뿐입니다.',
    );

  const copy = () =>
    say(
      '복제는 열려 있지만, 사본은 코드가 가리키지 않는 보통 폼입니다. 사본의 접수를 열어도 학술 앱의 기획안 화면은 열리지 않습니다. 접수는 «시스템» 배지가 붙은 원본에서 시작하세요.',
    );

  return (
    <MockFrame
      caption="기획안 시스템 폼 상세 — /forms/{formId}"
      hint="«접수 시작»을 눌러 접수를 열고 닫아 보세요. «수정»과 «복제»도 눌러 볼 수 있습니다. 삭제 버튼은 없습니다."
      feedback={note && note.open === open ? note.text : undefined}
      onReset={() => {
        setIntakeOpen(false);
        setNoPermission(false);
        setNote(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() => {
            setNoPermission(!noPermission);
            say(
              noPermission
                ? '접수 상태 변경 권한이 있는 사람으로 돌아왔습니다. 버튼이 다시 풀립니다.'
                : '폼 편집 권한만 있고 접수 상태 변경 권한은 없는 사람으로 봅니다. 접수 버튼만 잠깁니다. 잠긴 버튼을 눌러 보세요.',
            );
          }}>
          {noPermission ? '접수 상태 변경 권한이 있는 사람으로 보기' : '접수 상태 변경 권한이 없는 사람으로 보기'}
        </button>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 560, margin: '0 auto'}}>
      <div className="mk-card">
        <div style={{display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8}}>
          <Badge tone="outline-accent">시스템</Badge>
          <Badge tone={open ? 'blue' : 'grey'}>{open ? '접수중' : '마감'}</Badge>
        </div>
        <div style={{fontSize: 18, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 4}}>스터디·프로젝트·트랙 기획안</div>
        <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 12}}>문항 6개 · 응답 0건</div>

        <div
          style={{
            borderRadius: 12,
            background: 'var(--app-bg)',
            padding: '11px 13px',
            fontSize: 12.5,
            color: 'var(--app-n400)',
            lineHeight: 1.7,
            marginBottom: 14,
          }}>
          <Badge tone="outline-accent">시스템</Badge> 시스템이 사용하는 폼이라 지울 수 없습니다 — 대신 접수를 마감하세요. 제목·접수 기간·라벨·접수
          상태는 그대로 바꿀 수 있습니다.
        </div>

        <div style={{display: 'flex', gap: 6}}>
          <Btn variant="primary" locked={noPermission} title={noPermission ? LOCK_TITLE : undefined} onClick={toggle}>
            {open ? '마감' : '접수 시작'}
          </Btn>
          <Btn variant="ghost" onClick={edit}>
            수정
          </Btn>
          <Btn variant="ghost" onClick={copy}>
            복제
          </Btn>
        </div>
      </div>
    </MockFrame>
  );
}

/* ============ 학술 앱 — 기획안 제출 ============ */

const PROPOSAL_FIELDS = ['활동명', '유형 (스터디 / 프로젝트 / 트랙)', '모집 정원', '운영 계획', '커리큘럼'];

/**
 * 접수가 닫혀 있을 때의 학술 앱 — /proposals/new.
 * 위 폼 상세와 접수 상태를 함께 본다. 설명서 ««기획안을 낼 수 없다»는 문의가 들어오면 여기부터»를 따른다.
 */
export function ProposalMemberMock(): ReactNode {
  const open = useIntakeOpen();

  return (
    <MockFrame
      caption={open ? '접수가 열려 있을 때의 학술 앱 — /proposals/new' : '접수가 닫혀 있을 때의 학술 앱 — /proposals/new'}
      hint="위 폼 상세에서 «접수 시작»을 누르거나 아래 띠의 버튼을 눌러, 회원 화면이 어떻게 바뀌는지 보세요."
      feedback={
        open
          ? '접수가 열렸습니다. 회원은 이 «기획안 제출» 화면에서 활동명 · 유형 · 모집 정원 · 운영 계획 · 커리큘럼을 적어 기획안을 냅니다.'
          : '접수가 닫혀 있습니다. 회원 화면이 이렇게 보인다면 권한 문제가 아니라 접수가 닫혀 있는 것입니다. 폼 목록에서 기획안 폼의 «접수 시작»을 누르면 곧바로 풀립니다.'
      }
      onReset={() => setIntakeOpen(false)}
      demo={
        <button type="button" onClick={() => setIntakeOpen(!open)}>
          {open ? '운영진이 «마감»을 누름' : '운영진이 «접수 시작»을 누름'}
        </button>
      }
      innerStyle={{minWidth: 'auto', maxWidth: 470, margin: '0 auto'}}>
      {open ? (
        <div className="mk-card">
          <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 4}}>기획안 제출</div>
          <p style={{fontSize: 12.5, color: 'var(--app-n400)', margin: '0 0 12px'}}>(예시) 접수가 열려 있으면 기획안 양식이 열립니다</p>
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            {PROPOSAL_FIELDS.map((f) => (
              <div key={f}>
                <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginBottom: 3}}>{f}</div>
                <div className="gm-input" style={{height: 30}} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mk-card" style={{textAlign: 'center'}}>
          <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 7}}>지금은 기획안을 받지 않습니다</div>
          <p style={{fontSize: 12.5, color: 'var(--app-n400)', lineHeight: 1.75, margin: '0 0 12px'}}>
            운영진이 기획안 접수를 시작하면 이 화면에서 작성해 제출할 수 있습니다 — 접수가 열리면 다시 열어주세요
          </p>
          <span style={{fontSize: 12.5, color: 'var(--app-accent)'}}>이미 낸 기획안 보기</span>
        </div>
      )}
    </MockFrame>
  );
}
