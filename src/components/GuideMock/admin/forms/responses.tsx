import {Fragment, useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame} from '../..';

type ResponseStatus = '작성중' | '제출' | '수정요청' | '승인' | '반려';
type ResponseChip = '전체' | '제출' | '승인' | '반려' | '작성중';

type ResponseRow = {id: number; name: string; studentId: string; info: string; submittedAt: string; status: ResponseStatus};

// 앞의 두 줄은 옛 설명서의 그림 그대로다(이름과 학번만 예시 값으로 바꿨다). 상태를 바꿔 보도록 제출 · 수정요청 · 작성중 줄을 더했다.
const INITIAL_ROWS: ResponseRow[] = [
  {id: 1, name: '최지우', studentId: '20250001', info: '전기공학부 · 신입 · 활동', submittedAt: '08.14 21:03', status: '승인'},
  {id: 2, name: '한도윤', studentId: '20250002', info: '산업정보시스템 · 신입 · 활동', submittedAt: '08.15 10:41', status: '반려'},
  {id: 3, name: '정다은', studentId: '20250003', info: '컴퓨터학부 · 신입 · 활동', submittedAt: '08.15 14:20', status: '제출'},
  {id: 4, name: '윤서준', studentId: '20250004', info: '소프트웨어학부 · 신입 · 활동', submittedAt: '08.16 09:12', status: '제출'},
  {id: 5, name: '오세린', studentId: '20250005', info: '전자정보공학부 · 신입 · 활동', submittedAt: '08.16 18:30', status: '수정요청'},
  {id: 6, name: '강예준', studentId: '20250006', info: '컴퓨터학부 · 신입 · 활동', submittedAt: '—', status: '작성중'},
];

const CHIPS: ResponseChip[] = ['전체', '제출', '승인', '반려'];

const STATUS_TONE: Record<ResponseStatus, 'blue' | 'red' | 'amber' | 'outline' | 'grey'> = {
  작성중: 'grey',
  제출: 'amber',
  수정요청: 'outline',
  승인: 'blue',
  반려: 'red',
};

const COLS = '1fr .8fr 1.4fr 1fr .8fr';
const SMALL = {padding: '4px 9px', fontSize: 11.5};

/**
 * 응답 목록 — /forms/{id}/responses. 칩으로 거르고, 상태 배지를 눌러 변경 창을 연다.
 * 상태 변화 기준 «폼과 응답»을 따른다: 승인 · 반려는 되돌릴 수 없고, 고치게 하려면 수정요청을 쓴다. 작성 중 응답은 심사 대상이 아니다.
 */
export function ResponseListMock(): ReactNode {
  const [rows, setRows] = useState<ResponseRow[]>(INITIAL_ROWS);
  const [chip, setChip] = useState<ResponseChip>('전체');
  const [openId, setOpenId] = useState<number | null>(null);
  const [flashId, setFlashId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<ReactNode>();

  const visible = rows.filter((r) => {
    if (chip === '전체') return r.status !== '작성중';
    return r.status === chip;
  });

  const setStatus = (id: number, status: ResponseStatus, patch?: Partial<ResponseRow>) => {
    setRows(rows.map((r) => (r.id === id ? {...r, ...patch, status} : r)));
    setFlashId(id);
    setOpenId(null);
  };

  const pickChip = (c: ResponseChip) => {
    setChip(c);
    setOpenId(null);
    setFlashId(null);
    if (c === '작성중') {
      setFeedback('작성중은 응답자가 쓰다 말고 아직 내지 않은 응답입니다. 심사 대상이 아니라서 점선 칩으로 따로 봅니다.');
    } else {
      setFeedback(`«${c}» 칩을 골랐습니다. ${rows.filter((r) => (c === '전체' ? r.status !== '작성중' : r.status === c)).length}건이 보입니다.`);
    }
  };

  const clickBadge = (r: ResponseRow) => {
    if (r.status === '작성중') {
      setOpenId(null);
      setFeedback('작성 중(미제출) 응답은 아직 제출되지 않아 심사 대상이 아닙니다. 상태를 바꿀 것이 없습니다.');
      return;
    }
    if (r.status === '수정요청') {
      setOpenId(null);
      setFeedback(
        `${r.name}의 응답은 «수정요청» 상태입니다. 응답자가 고쳐서 다시 낼 차례입니다. 점선 띠의 «응답자가 고쳐서 다시 냄»을 눌러 보세요.`,
      );
      return;
    }
    if (openId === r.id) {
      setOpenId(null);
      setFeedback(undefined);
      return;
    }
    setOpenId(r.id);
    setFeedback(
      r.status === '제출'
        ? '변경 창이 열렸습니다. «승인» · «수정요청» · «반려» 가운데 하나를 고르세요.'
        : `이미 «${r.status}»된 응답입니다. 승인 · 반려 뒤에는 검토 패널이 잠겨 상태를 바꿀 수 없습니다.`,
    );
  };

  const lockedReason = (r: ResponseRow) =>
    `이미 «${r.status}»된 응답이라 잠겨 있습니다. 승인 · 반려 뒤에는 검토 패널이 잠기고 되돌릴 수 없습니다.`;

  const approve = (r: ResponseRow) => {
    if (r.status !== '제출') return setFeedback(lockedReason(r));
    setStatus(r.id, '승인');
    setFeedback(`${r.name}의 응답을 승인했습니다. 승인 뒤에는 검토 패널이 잠깁니다. 실제 화면에서는 되돌릴 수 없습니다.`);
  };

  const requestFix = (r: ResponseRow) => {
    if (r.status !== '제출') return setFeedback(lockedReason(r));
    setStatus(r.id, '수정요청');
    setFeedback(
      `${r.name}에게 수정요청을 보냈습니다. 응답자가 고쳐서 다시 낼 수 있습니다. 내용을 고치게 하려면 반려가 아니라 수정요청을 씁니다.`,
    );
  };

  const reject = (r: ResponseRow) => {
    if (r.status !== '제출') return setFeedback(lockedReason(r));
    setStatus(r.id, '반려');
    setFeedback(`${r.name}의 응답을 반려했습니다. 반려된 응답은 다시 제출할 수 없습니다. 실제 화면에서는 되돌릴 수 없습니다.`);
  };

  const resubmit = () => {
    const target = rows.find((r) => r.status === '수정요청');
    if (!target) return;
    setStatus(target.id, '제출', {submittedAt: '08.17 11:05'});
    setFeedback(`${target.name}이 응답을 고쳐서 다시 냈습니다. 다시 «제출» 상태가 되어 처리를 기다립니다.`);
  };

  const submitDraft = () => {
    const target = rows.find((r) => r.status === '작성중');
    if (!target) return;
    setStatus(target.id, '제출', {submittedAt: '08.17 13:40'});
    setFeedback(`${target.name}이 작성을 마치고 제출했습니다. 이제 심사 대상이라 «전체»와 «제출» 칩에 보입니다.`);
  };

  const reset = () => {
    setRows(INITIAL_ROWS);
    setChip('전체');
    setOpenId(null);
    setFlashId(null);
    setFeedback(undefined);
  };

  return (
    <MockFrame
      caption="응답 목록 — /forms/{id}/responses (상태 클릭 시 변경 창)"
      hint="칩으로 걸러 보고, 줄 끝의 상태 배지를 눌러 변경 창을 열어 보세요. «제출» 응답만 바꿀 수 있습니다."
      feedback={feedback}
      onReset={reset}
      demo={
        <>
          <button type="button" onClick={resubmit} disabled={!rows.some((r) => r.status === '수정요청')}>
            응답자가 고쳐서 다시 냄
          </button>
          <button type="button" onClick={submitDraft} disabled={!rows.some((r) => r.status === '작성중')}>
            작성 중이던 응답자가 제출함
          </button>
        </>
      }>
      <div style={{display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap'}}>
        {CHIPS.map((c) => (
          <Chip key={c} active={chip === c} onClick={() => pickChip(c)}>
            {c}
          </Chip>
        ))}
        <Chip active={chip === '작성중'} onClick={() => pickChip('작성중')} style={{borderStyle: 'dashed'}}>
          작성중
        </Chip>
      </div>
      <div className="mk-card">
        <div className="mk-row mk-th" style={{gridTemplateColumns: COLS}}>
          <span>이름</span>
          <span>학번</span>
          <span>학과·등급·상태</span>
          <span>제출일시</span>
          <span>상태</span>
        </div>
        {visible.map((r) => {
          const locked = r.status !== '제출';
          return (
            <Fragment key={r.id}>
              <div
                key={`${r.id}-${r.status}`}
                className={flashId === r.id ? 'mk-row gm-flash' : 'mk-row'}
                style={{gridTemplateColumns: COLS}}>
                <span style={{color: 'var(--app-ink)'}}>{r.name}</span>
                <span>{r.studentId}</span>
                <span>{r.info}</span>
                <span>{r.submittedAt}</span>
                <span>
                  <button
                    type="button"
                    className="gm-plain"
                    aria-expanded={openId === r.id}
                    title="상태를 누르면 변경 창이 열립니다"
                    onClick={() => clickBadge(r)}>
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  </button>
                </span>
              </div>
              {openId === r.id && (
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    margin: '0 0 8px',
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--app-bg)',
                    fontSize: 12.5,
                    color: 'var(--app-n400)',
                  }}>
                  <span style={{marginRight: 4}}>상태 바꾸기</span>
                  <Btn
                    variant="primary"
                    style={SMALL}
                    locked={locked}
                    title={locked ? '승인 · 반려 뒤에는 바꿀 수 없습니다' : undefined}
                    onClick={() => approve(r)}>
                    승인
                  </Btn>
                  <Btn
                    variant="ghost"
                    style={SMALL}
                    locked={locked}
                    title={locked ? '승인 · 반려 뒤에는 바꿀 수 없습니다' : undefined}
                    onClick={() => requestFix(r)}>
                    수정요청
                  </Btn>
                  <Btn
                    variant="ghost-danger"
                    style={SMALL}
                    locked={locked}
                    title={locked ? '승인 · 반려 뒤에는 바꿀 수 없습니다' : undefined}
                    onClick={() => reject(r)}>
                    반려
                  </Btn>
                  <span style={{flex: 1}} />
                  <button
                    type="button"
                    className="gm-plain"
                    style={{fontSize: 12, color: 'var(--app-n500)'}}
                    onClick={() => {
                      setOpenId(null);
                      setFeedback(undefined);
                    }}>
                    닫기
                  </button>
                </div>
              )}
            </Fragment>
          );
        })}
        {visible.length === 0 && <div className="mk-row">해당하는 응답이 없습니다.</div>}
      </div>
    </MockFrame>
  );
}
