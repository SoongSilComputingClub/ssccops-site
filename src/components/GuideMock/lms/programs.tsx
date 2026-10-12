import {useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '..';

type State = '확정' | '대기' | '취소';
type Member = {name: string; leader?: boolean; joined: string; state: State};

const INITIAL: Member[] = [
  {name: '김철수', leader: true, joined: '03.10', state: '확정'},
  {name: '이영희', joined: '03.10', state: '확정'},
  {name: '박민수', joined: '03.10', state: '취소'},
];

/** 그리지 않은 확정 팀원 수. 옛 그림의 «팀원 7명»에 맞춘다 */
const HIDDEN = 5;
/** «팀원 추가»로 찾아 넣는 예시 회원. 지원서를 내지 않은 회원도 넣을 수 있다 */
const LATE_JOINER = '홍길동';

const STATE_TONE: Record<State, 'blue' | 'grey' | 'outline'> = {확정: 'blue', 대기: 'outline', 취소: 'grey'};

/**
 * 팀원 관리 — /studio/members.
 * 설명서의 동작 표(팀원 추가는 바로 확정, 확정과 대기 사이 옮기기, 제외해도 지난 출석은 남음, 다시 넣기)와
 * «진행 중일 때만 됩니다», «누가 언제 넣고 뺐는지 이력으로 남습니다»를 따른다.
 * 대기 팀원의 제외처럼 설명서에 적히지 않은 동작은 그리지 않는다.
 */
export function MembersMock(): ReactNode {
  const [members, setMembers] = useState<Member[]>(INITIAL);
  const [running, setRunning] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<ReactNode>();

  const active = members.filter((m) => m.state !== '취소').length + HIDDEN;
  const cols = '1.1fr .8fr .7fr .7fr 1.3fr';

  const locked = () =>
    setFeedback('수료된 프로그램이라 팀원 관리가 잠겨 있습니다. 진행 중일 때만 됩니다. 학술국장에게 재시작을 요청하세요.');

  const change = (name: string, state: State, log: string, message: string) => {
    if (!running) {
      locked();
      return;
    }
    setMembers(members.map((m) => (m.name === name ? {...m, state} : m)));
    setHistory([log, ...history]);
    setFeedback(message);
  };

  const add = () => {
    if (!running) {
      locked();
      return;
    }
    if (members.some((m) => m.name === LATE_JOINER)) {
      setFeedback(`${LATE_JOINER} 님은 이미 팀원입니다. 다시 해 보려면 «처음으로»를 누르세요.`);
      return;
    }
    setMembers([...members, {name: LATE_JOINER, joined: '04.02', state: '확정'}]);
    setHistory([`${LATE_JOINER} 넣음`, ...history]);
    setFeedback(
      `동아리 회원 ${LATE_JOINER} 님을 이름으로 찾아 넣었습니다. 지원서를 내지 않은 회원도 넣을 수 있고, 승인 없이 바로 확정 팀원이 됩니다.`,
    );
  };

  return (
    <MockFrame
      caption="팀원 관리 — /studio/members"
      hint="«팀원 추가», «대기로», «제외», «다시 넣기»를 눌러 보고 아래 이력을 보세요."
      feedback={feedback}
      onReset={() => {
        setMembers(INITIAL);
        setRunning(true);
        setHistory([]);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() => {
            setRunning(!running);
            setFeedback(
              running
                ? '학술국장이 이 프로그램을 종료 승인해 수료가 됐습니다. 팀원 관리가 잠깁니다.'
                : '학술국장이 재시작해 다시 진행 중이 됐습니다. 팀원을 다시 넣고 뺄 수 있습니다.',
            );
          }}>
          {running ? '학술국장이 종료 승인하기' : '학술국장이 재시작하기'}
        </button>
      }>
      <div className="mk-card" style={{padding: 0, overflow: 'hidden'}}>
        <div
          style={{
            padding: '13px 15px',
            borderBottom: '1px solid var(--app-line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <div>
            <div style={{fontSize: 15, fontWeight: 600, color: 'var(--app-ink)'}}>팀원 {active}명</div>
            <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 3}}>
              알고리즘 문제풀이 스터디{running ? '' : ' · 수료'}
            </div>
          </div>
          <Btn variant="primary" locked={!running} title={running ? undefined : '진행 중인 프로그램에서만 됩니다'} onClick={add}>
            팀원 추가
          </Btn>
        </div>
        <div className="mk-row mk-th" style={{gridTemplateColumns: cols, padding: '9px 15px'}}>
          <span>이름</span>
          <span>역할</span>
          <span>합류일</span>
          <span>상태</span>
          <span>동작</span>
        </div>
        {members.map((m) => (
          <div key={m.name} className="mk-row" style={{gridTemplateColumns: cols, padding: '9px 15px'}}>
            <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{m.name}</span>
            <span>
              <Badge tone={m.leader ? 'blue' : 'grey'}>{m.leader ? '스터디장' : '팀원'}</Badge>
            </span>
            <span>{m.joined}</span>
            <span>
              <Badge tone={STATE_TONE[m.state]}>{m.state}</Badge>
            </span>
            <span style={{display: 'flex', gap: 4, flexWrap: 'wrap'}}>
              {!m.leader && m.state === '확정' && (
                <>
                  <Chip
                    onClick={() =>
                      change(m.name, '대기', `${m.name} 대기로 옮김`, `${m.name} 님을 대기로 옮겼습니다. 확정과 대기 사이를 옮길 수 있습니다.`)
                    }>
                    대기로
                  </Chip>
                  <Chip
                    onClick={() =>
                      change(
                        m.name,
                        '취소',
                        `${m.name} 제외`,
                        `${m.name} 님을 제외했습니다. 참가가 취소됩니다. 지난 출석 기록은 남고, 다음 회차 출석 명단에서만 빠집니다.`,
                      )
                    }>
                    제외
                  </Chip>
                </>
              )}
              {m.state === '대기' && (
                <Chip onClick={() => change(m.name, '확정', `${m.name} 확정으로 옮김`, `${m.name} 님을 다시 확정 팀원으로 옮겼습니다.`)}>
                  확정으로
                </Chip>
              )}
              {m.state === '취소' && (
                <Chip
                  onClick={() => change(m.name, '확정', `${m.name} 다시 넣음`, `잘못 제외한 ${m.name} 님을 다시 확정 팀원으로 돌렸습니다.`)}>
                  다시 넣기
                </Chip>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="mk-card" style={{marginTop: 12}}>
        <div className="mk-section-label">명단 변경 이력</div>
        {history.length === 0 ? (
          <div style={{fontSize: 12.5, color: 'var(--app-n500)'}}>아직 바뀐 것이 없습니다.</div>
        ) : (
          <ul style={{margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--app-n300)'}}>
            {history.map((h, i) => (
              <li key={`${history.length - i}`}>스터디장 김철수 · {h}</li>
            ))}
          </ul>
        )}
      </div>
    </MockFrame>
  );
}
