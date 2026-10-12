import {useState, type ReactNode} from 'react';
import {Btn, Check, Chip, MockFrame} from '../..';

const STATUSES = ['재학', '일반휴학', '군휴학', '졸업', '탈퇴', '제명'] as const;
type Status = (typeof STATUSES)[number];

/**
 * 예시 인원. 옛 그림의 숫자(재학만 고르면 명부 42명, 회장·부회장 2명 포함, 임시회원 3명과 고르지 않은 상태 18명이
 * 빠지고 전체 63명)에 맞춘 값이다. 회장·부회장 2명은 아래 수에 넣지 않고 따로 센다.
 */
const COUNTS: Record<Status, number> = {재학: 40, 일반휴학: 6, 군휴학: 5, 졸업: 4, 탈퇴: 2, 제명: 1};
const OFFICERS = 2;
const TEMP = 3;
const TOTAL = OFFICERS + TEMP + STATUSES.reduce((n, s) => n + COUNTS[s], 0);

const YEARS = ['2026', '2025'] as const;
const SEMESTERS = ['1', '2'] as const;

/** 제목 괄호. 재학만이면 양식 그대로 «(재학생)», 더 고르면 고른 상태를 잇고, 전부 고르면 괄호가 없다 */
function titleSuffix(picked: Status[]): string {
  if (picked.length === STATUSES.length) return '';
  if (picked.length === 1 && picked[0] === '재학') return '(재학생)';
  return `(${picked.join('·')})`;
}

/**
 * 회원명부 내보내기 — /members/roster-export.
 * 설명서의 칸 표(처음에는 재학만, 직책은 회장·부회장·정회원 고정, 미리보기 인원, 연도·학기는 파일 이름과 제목에만)와
 * «회장이 없으면 내려받을 수 없다», «하나도 고르지 않으면 내려받을 수 없다»를 따른다.
 */
export function RosterExportMock(): ReactNode {
  const [picked, setPicked] = useState<Status[]>(['재학']);
  const [year, setYear] = useState<(typeof YEARS)[number]>('2026');
  const [sem, setSem] = useState<(typeof SEMESTERS)[number]>('2');
  const [hasPresident, setHasPresident] = useState(true);
  const [feedback, setFeedback] = useState<ReactNode>();

  const ordered = STATUSES.filter((s) => picked.includes(s));
  const inRoster = OFFICERS + ordered.reduce((n, s) => n + COUNTS[s], 0);
  const skipped = STATUSES.filter((s) => !picked.includes(s)).reduce((n, s) => n + COUNTS[s], 0);
  const fileName = `${year}년도_학술분과_SSCC_${sem}학기_동아리회원명부.xlsx`;
  const title = `${year}년도 ${sem}학기 SSCC 회원명부${titleSuffix(ordered)}`;

  const toggle = (s: Status) => {
    const next = picked.includes(s) ? picked.filter((p) => p !== s) : [...picked, s];
    setPicked(next);
    setFeedback(
      next.length === 0
        ? '포함할 회원 상태를 하나도 고르지 않았습니다. 이대로는 내려받을 수 없습니다.'
        : `«${s}»을 ${next.includes(s) ? '골랐습니다' : '뺐습니다'}. 명단 미리보기의 인원과 시트 제목 괄호가 함께 바뀝니다.`,
    );
  };

  const download = () => {
    if (!hasPresident) {
      setFeedback('회장이 없어 내려받을 수 없습니다. 역할 관리에서 회장을 배정하고 다시 여세요.');
      return;
    }
    if (picked.length === 0) {
      setFeedback('포함할 회원 상태를 하나 이상 골라야 내려받을 수 있습니다.');
      return;
    }
    setFeedback(
      `«${fileName}»을 내려받습니다. 연합회 원본 양식 그대로이고 회장, 부회장, 나머지(학번순) 순서로 채워집니다. 누가 언제 몇 명을 내려받았는지 기록이 남습니다.`,
    );
  };

  const blocked = !hasPresident || picked.length === 0;

  return (
    <MockFrame
      caption="회원명부 내보내기 — 아무것도 바꾸지 않으면 연합회 제출용 (숫자는 예시)"
      hint="회원 상태를 고르거나 빼며 명단 미리보기와 파일 이름을 보고, «내려받기»를 눌러 보세요."
      feedback={feedback}
      onReset={() => {
        setPicked(['재학']);
        setYear('2026');
        setSem('2');
        setHasPresident(true);
        setFeedback(undefined);
      }}
      demo={
        <button
          type="button"
          onClick={() => {
            setHasPresident(!hasPresident);
            setFeedback(
              hasPresident
                ? '오늘 기준으로 «회장» 역할이 배정된 회원이 없는 경우입니다. 미리보기에 «회장이 없어 내려받을 수 없습니다»가 뜹니다.'
                : '회장이 다시 배정된 경우로 돌아왔습니다.',
            );
          }}>
          {hasPresident ? '«회장» 역할 배정을 해제해 보기' : '회장을 다시 배정하기'}
        </button>
      }
      innerStyle={{maxWidth: 640}}>
      <div style={{fontSize: 12.5, color: 'var(--app-n400)', marginBottom: 10}}>연락처·학번이 담긴 파일입니다. 내려받은 기록이 남습니다.</div>
      <div className="mk-card" style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div>
          <div className="mk-section-label">포함할 회원 상태</div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 12.5, color: 'var(--app-n300)'}}>
            {STATUSES.map((s) => (
              <Check key={s} on={picked.includes(s)} onToggle={() => toggle(s)} label={s} />
            ))}
          </div>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 6}}>
            회장·부회장은 고른 상태와 관계없이 항상 포함됩니다. 임시회원은 포함되지 않습니다.
          </div>
        </div>
        <div>
          <div className="mk-section-label">직책 표기법</div>
          <div
            style={{
              border: '1px solid var(--app-accent-strong)',
              background: 'var(--app-accent-soft)',
              borderRadius: 10,
              padding: '9px 12px',
            }}>
            <div style={{fontSize: 13, fontWeight: 500, color: 'var(--app-ink)'}}>동아리연합회 표기법</div>
            <div style={{fontSize: 11.5, color: 'var(--app-n500)', marginTop: 2}}>
              회장·부회장 외 모든 회원을 ‘정회원’으로 적습니다. 회원 등급(준회원·활동회원 등)과 관계없습니다.
            </div>
          </div>
        </div>
        <div>
          <div className="mk-section-label">명단 미리보기</div>
          {hasPresident ? (
            <dl className="mk-kv" style={{border: '1px solid var(--app-line)', borderRadius: 10, padding: '10px 12px'}}>
              <dt>명단 기준</dt>
              <dd>오늘(2026-10-09) 회원</dd>
              <dt>명부 인원</dt>
              <dd>
                <b>{inRoster}명</b> (회장·부회장 {OFFICERS}명 포함)
              </dd>
              <dt>빠지는 회원</dt>
              <dd>
                임시회원 {TEMP}명{skipped > 0 ? `, 고르지 않은 상태 ${skipped}명` : ''}
              </dd>
              <dt>전체 회원</dt>
              <dd>{TOTAL}명</dd>
            </dl>
          ) : (
            <div
              className="gm-flash"
              style={{border: '1px solid var(--app-danger)', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: 'var(--app-danger)'}}>
              회장이 없어 내려받을 수 없습니다.
            </div>
          )}
        </div>
        <div>
          <div className="mk-section-label">파일 이름</div>
          <div style={{display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap'}}>
            {YEARS.map((y) => (
              <Chip
                key={y}
                active={year === y}
                onClick={() => {
                  setYear(y);
                  setFeedback(`${y}년을 골랐습니다. 파일 이름과 시트 제목만 바뀌고, 명단은 그대로 오늘 기준입니다.`);
                }}>
                {y}년
              </Chip>
            ))}
            {SEMESTERS.map((t) => (
              <Chip
                key={t}
                active={sem === t}
                onClick={() => {
                  setSem(t);
                  setFeedback(`${t}학기를 골랐습니다. 파일 이름과 시트 제목만 바뀌고, 명단은 그대로 오늘 기준입니다.`);
                }}>
                {t}학기
              </Chip>
            ))}
          </div>
          <div style={{fontSize: 12.5, color: 'var(--app-ink)', fontWeight: 500, wordBreak: 'break-all'}}>{fileName}</div>
          <div style={{fontSize: 11.5, color: 'var(--app-n500)'}}>제목: {title}</div>
        </div>
        <div>
          <Btn
            variant="primary"
            locked={blocked}
            title={!hasPresident ? '회장이 없어 내려받을 수 없습니다' : picked.length === 0 ? '포함할 회원 상태를 하나 이상 고르세요' : undefined}
            onClick={download}>
            내려받기
          </Btn>
        </div>
      </div>
    </MockFrame>
  );
}
