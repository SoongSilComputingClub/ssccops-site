import {useState, type ReactNode} from 'react';
import {Badge, Chip, MockFrame} from '../..';

type App = '운영' | '학술' | '홈페이지';
const APPS: App[] = ['운영', '학술', '홈페이지'];

type Row = {
  name: string;
  /** 저장된 설정. 비어 있으면 «정하지 않음» */
  saved: App[];
  /** 칩으로 고르는 중인 설정. 줄의 «저장»을 눌러야 saved로 간다 */
  draft: App[];
};

// 앞의 둘은 옛 설명서의 그림 그대로다. «정하지 않음»을 보여 주려고 «테스트»를 더했다(설명서 «처음 상태» 표).
const INITIAL: Row[] = [
  {name: '승인 요청', saved: ['운영'], draft: ['운영']},
  {name: '응답 승인', saved: ['홈페이지'], draft: ['홈페이지']},
  {name: '테스트', saved: [], draft: []},
];

const same = (a: App[], b: App[]) => a.length === b.length && a.every((x) => b.includes(x));
const ordered = (apps: App[]) => APPS.filter((a) => apps.includes(a));

/**
 * 알림 유형 — /settings/notification-types.
 * 설명서 «줄마다 따로 저장», «보낸 앱 따름으로를 누르면»(정하지 않음은 만든 앱에만 보임), «한 유형을 여러 앱에 켤 수 있습니다»를 따른다.
 */
export function NotificationTypesMock(): ReactNode {
  const [rows, setRows] = useState<Row[]>(INITIAL);
  const [feedback, setFeedback] = useState<ReactNode>();

  const patch = (i: number, p: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? {...r, ...p} : r)));

  const toggle = (i: number, app: App) => {
    const r = rows[i];
    const on = !r.draft.includes(app);
    const draft = ordered(on ? [...r.draft, app] : r.draft.filter((a) => a !== app));
    patch(i, {draft});
    setFeedback(
      `«${r.name}»의 «${app}» 칩을 ${on ? '켰습니다' : '껐습니다'}. 줄마다 따로 저장합니다 — 이 줄의 «저장»을 눌러야 반영됩니다.` +
        (draft.length > 1 ? ' 한 유형을 여러 앱에 켤 수 있고, 켠 앱 모두에 같은 알림이 뜹니다.' : ''),
    );
  };

  const save = (i: number) => {
    const r = rows[i];
    if (same(r.draft, r.saved)) {
      setFeedback(`«${r.name}» 줄은 바뀐 것이 없습니다.`);
      return;
    }
    patch(i, {saved: r.draft});
    setFeedback(
      r.draft.length === 0
        ? `«${r.name}» 줄을 저장했습니다. 켠 앱이 없어 정하지 않은 상태입니다 — 그 알림을 만든 앱에만 보입니다.`
        : `«${r.name}» 줄을 저장했습니다. 바로 반영됩니다 — 이제 이 알림은 ${r.draft.join(' · ')}에 보입니다.`,
    );
  };

  const follow = (i: number) => {
    const r = rows[i];
    patch(i, {saved: [], draft: []});
    setFeedback(
      `«${r.name}» 줄의 설정을 지우고 정하지 않은 상태로 되돌렸습니다. 이제 그 알림을 만든 앱에만 보입니다 — 학술 앱에서 생긴 일은 학술 앱에, 운영관리에서 생긴 일은 운영관리에. 잘못 바꿨을 때 되돌리는 버튼이기도 합니다.`,
    );
  };

  const cols = '1.4fr 2fr 1.4fr';

  return (
    <MockFrame
      caption="알림 유형 — 줄마다 따로 저장합니다"
      hint="앱 칩을 눌러 켜고 끈 뒤 그 줄의 «저장»을 눌러 보세요. «보낸 앱 따름으로»도 눌러 볼 수 있습니다."
      feedback={feedback}
      onReset={() => {
        setRows(INITIAL);
        setFeedback(undefined);
      }}>
      <div className="mk-card">
        <div className="mk-section-label">알림 유형 — 알림이 보일 앱</div>
        {rows.map((r, i) => (
          <div key={r.name} className="mk-row" style={{gridTemplateColumns: cols}}>
            <span style={{color: 'var(--app-ink)', fontWeight: 500}}>{r.name}</span>
            <span style={{display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap'}}>
              {APPS.map((app) => (
                <Chip key={app} active={r.draft.includes(app)} onClick={() => toggle(i, app)}>
                  {app}
                </Chip>
              ))}
              {r.draft.length === 0 && <span style={{fontSize: 11.5, color: 'var(--app-n500)', marginLeft: 4}}>정하지 않음</span>}
            </span>
            <span style={{display: 'flex', gap: 4, alignItems: 'center'}}>
              <button type="button" className="gm-plain" onClick={() => follow(i)}>
                <Badge tone="outline">보낸 앱 따름으로</Badge>
              </button>
              <button type="button" className="gm-plain" onClick={() => save(i)}>
                <Badge tone="blue">저장</Badge>
              </button>
            </span>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}
