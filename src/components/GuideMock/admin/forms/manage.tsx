import {useEffect, useRef, useState, type ReactNode} from 'react';
import {Badge, Btn, Chip, MockFrame, Pill} from '../..';

/* ============ 폼 목록 ============ */

type FormStatus = '작성중' | '접수 예정' | '접수중' | '기간 종료' | '마감';
type StatusChip = '전체' | FormStatus;

const STATUS_CHIPS: StatusChip[] = ['전체', '작성중', '접수 예정', '접수중', '기간 종료', '마감'];
const DEFAULT_CHIPS: StatusChip[] = ['작성중', '접수 예정', '접수중'];

const STATUS_TONE: Record<FormStatus, 'blue' | 'outline' | 'outline-accent' | 'grey'> = {
  작성중: 'outline',
  '접수 예정': 'outline-accent',
  접수중: 'blue',
  '기간 종료': 'grey',
  마감: 'grey',
};

type FormCard = {title: string; status: FormStatus; responses: number; period: string; label: string};

// 앞의 두 장은 옛 설명서의 그림 그대로다. 거르기를 보여 주려고 상태마다 한 장씩 더했다.
const FORMS: FormCard[] = [
  {title: '2026 신입회원 모집', status: '접수중', responses: 42, period: '08.01 09:00 ~ 08.25 23:59', label: '모집'},
  {title: '여름 MT 참가 신청', status: '작성중', responses: 0, period: '접수 기간 미정', label: '행사'},
  {title: '알고리즘 스터디 오리엔테이션 신청', status: '접수 예정', responses: 0, period: '09.01 09:00 ~ 09.10 23:59', label: '행사'},
  {title: '2026 겨울 해커톤 참가 신청', status: '기간 종료', responses: 31, period: '01.02 09:00 ~ 01.10 23:59', label: '행사'},
  {title: '2026 상반기 활동 만족도 조사', status: '마감', responses: 18, period: '06.01 09:00 ~ 06.15 23:59', label: '내부'},
];

/**
 * 폼 목록 — /forms. 설명서 «접수 상태 칩 — 여러 개를 함께 켭니다»를 따른다.
 * 칩은 체크박스처럼 켜고 끄며, 처음에는 작성중 · 접수 예정 · 접수중이 켜져 있고, 마지막 하나는 꺼지지 않는다.
 */
export function FormListMock(): ReactNode {
  const [on, setOn] = useState<StatusChip[]>(DEFAULT_CHIPS);
  const [feedback, setFeedback] = useState<ReactNode>();

  const visible = on.includes('전체') ? FORMS : FORMS.filter((f) => on.includes(f.status));
  const ordered = (chips: StatusChip[]) => STATUS_CHIPS.filter((c) => chips.includes(c));

  const toggle = (c: StatusChip) => {
    if (on.includes(c) && on.length === 1) {
      setFeedback(`«${c}» 칩이 마지막 하나라 꺼지지 않습니다. 아무것도 안 켜진 목록은 뜻이 없기 때문입니다.`);
      return;
    }
    if (c === '전체') {
      setOn(['전체']);
      setFeedback(`«전체» 칩을 켰습니다. 기간 종료 · 마감처럼 끝난 폼까지 ${FORMS.length}장이 모두 보입니다.`);
      return;
    }
    if (on.includes('전체')) {
      setOn([c]);
      setFeedback(`«${c}» 칩을 켰습니다. «전체»가 꺼지고 «${c}» 폼만 남습니다.`);
      return;
    }
    const next = on.includes(c) ? on.filter((x) => x !== c) : ordered([...on, c]);
    setOn(next);
    const count = FORMS.filter((f) => next.includes(f.status)).length;
    setFeedback(`«${c}» 칩을 ${on.includes(c) ? '껐습니다' : '켰습니다'}. 켜진 칩은 ${next.join(' · ')}, 카드 ${count}장이 보입니다.`);
  };

  return (
    <MockFrame
      caption="폼 목록 — /forms"
      hint="위쪽 칩을 눌러 켜고 꺼 보세요. 여러 개를 함께 켤 수 있고, 마지막 하나는 꺼지지 않습니다."
      feedback={feedback}
      onReset={() => {
        setOn(DEFAULT_CHIPS);
        setFeedback(undefined);
      }}>
      <div style={{display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12}}>
        {STATUS_CHIPS.map((c) => (
          <Chip key={c} active={on.includes(c)} onClick={() => toggle(c)}>
            {c}
          </Chip>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        {visible.map((f) => (
          <div key={f.title} className="mk-card">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
              <Badge tone={STATUS_TONE[f.status]}>{f.status}</Badge>
              <span style={{fontSize: 12, color: 'var(--app-n500)'}}>응답 {f.responses}</span>
            </div>
            <div style={{fontSize: 16, fontWeight: 600, color: 'var(--app-ink)', marginBottom: 6}}>{f.title}</div>
            <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 10}}>{f.period}</div>
            <div style={{display: 'flex', gap: 6}}>
              <Pill tone="blue">{f.label}</Pill>
            </div>
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

/* ============ 폼 편집기 ============ */

type Question = {title: string; required: boolean; meta: string};
type EditorPage = {name: string; questions: Question[]};

const LABELS = ['모집', '행사', '내부'] as const;
type Label = (typeof LABELS)[number];

// 1쪽은 옛 설명서의 그림 그대로다. 페이지 칩을 눌렀을 때 보일 2쪽 문항을 더했다.
const PAGES: EditorPage[] = [
  {
    name: '1. 기본 정보',
    questions: [
      {title: 'Q1. 이름을 입력해 주세요', required: true, meta: '단답형 · 필수'},
      {title: 'Q2. 지원 분야를 선택해 주세요', required: true, meta: '단일 선택 · 필수 · 선택지별 페이지 분기 있음'},
    ],
  },
  {
    name: '2. 지원 동기',
    questions: [
      {title: 'Q3. 지원 동기를 적어 주세요', required: true, meta: '장문형 · 필수'},
      {title: 'Q4. 면접 가능한 날짜를 골라 주세요', required: false, meta: '날짜'},
    ],
  },
];
const NEW_PAGE: EditorPage = {name: '3. 새 페이지', questions: []};

const INITIAL_TITLE = '2026 신입회원 모집';
/** 입력을 멈춘 뒤 «저장됨»이 되기까지. 예시 화면의 값이다 */
const AUTOSAVE_DELAY = 1200;

/**
 * 폼 편집기 — /forms/{id}/edit.
 * 설명서 «편집기 — 페이지와 문항 구성»과 «저장 상태 표시줄»(입력을 멈추면 자동으로 저장)을 따른다.
 */
export function FormEditorMock(): ReactNode {
  const [title, setTitle] = useState(INITIAL_TITLE);
  const [label, setLabel] = useState<Label>('모집');
  const [pages, setPages] = useState<EditorPage[]>(PAGES);
  const [pageIndex, setPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<ReactNode>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  /** 무언가를 바꿨다. 입력을 멈추면 자동으로 저장된다 */
  const changed = (message: string) => {
    clearTimeout(timer.current);
    setSaving(true);
    setFeedback(`${message} 표시줄이 «저장 중…»입니다. 입력을 멈추면 자동으로 저장됩니다.`);
    timer.current = setTimeout(() => {
      setSaving(false);
      setFeedback('입력을 멈춰 자동으로 저장했습니다. 표시줄이 «저장됨»으로 바뀌었습니다. 다른 화면으로 가기 전에 이것을 확인하세요.');
    }, AUTOSAVE_DELAY);
  };

  const saveNow = (message: string) => {
    clearTimeout(timer.current);
    setSaving(false);
    setFeedback(message);
  };

  const reset = () => {
    clearTimeout(timer.current);
    setTitle(INITIAL_TITLE);
    setLabel('모집');
    setPages(PAGES);
    setPageIndex(0);
    setSaving(false);
    setFeedback(undefined);
  };

  const addPage = () => {
    if (pages.length > PAGES.length) {
      setFeedback('예시 화면에서는 페이지를 하나만 더할 수 있습니다.');
      return;
    }
    setPages([...pages, NEW_PAGE]);
    setPageIndex(pages.length);
    changed(`«${NEW_PAGE.name}»를 더했습니다.`);
  };

  const page = pages[pageIndex];

  return (
    <MockFrame
      caption="폼 편집기 — /forms/{id}/edit"
      hint="폼 제목을 고치거나 라벨, 페이지 칩을 눌러 보세요. 위쪽 저장 상태 표시줄이 바뀝니다."
      feedback={feedback}
      onReset={reset}
      innerStyle={{maxWidth: 760}}>
      <div
        role="status"
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          fontSize: 12,
          color: saving ? 'var(--app-amber)' : 'var(--app-n500)',
        }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: saving ? 'var(--app-amber)' : 'var(--app-success)',
          }}
        />
        {saving ? '저장 중…' : '저장됨'}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 14}}>
        <div className="mk-card">
          <div className="mk-section-label">기본정보</div>
          <div style={{fontSize: 12, color: 'var(--app-n500)', marginBottom: 4}}>폼 제목</div>
          <input
            className="gm-input"
            aria-label="폼 제목"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              changed('폼 제목을 고치는 중입니다.');
            }}
            style={{marginBottom: 10}}
          />
          <div className="mk-section-label" style={{marginTop: 12}}>
            폼 라벨
          </div>
          <div style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
            {LABELS.map((l) => (
              <Chip
                key={l}
                active={label === l}
                onClick={() => {
                  if (label === l) return;
                  setLabel(l);
                  changed(`폼 라벨을 «${l}» 칩으로 바꿨습니다.`);
                }}>
                {l}
              </Chip>
            ))}
          </div>
          <div style={{marginTop: 16, display: 'flex', gap: 8}}>
            <Btn
              variant="ghost"
              style={{fontSize: 12, padding: '6px 10px'}}
              onClick={() =>
                saveNow('«지금 저장»을 눌렀습니다. 입력을 멈추기를 기다리지 않고 바로 저장해 표시줄이 «저장됨»입니다.')
              }>
              지금 저장
            </Btn>
            <Btn
              variant="primary"
              style={{fontSize: 12, padding: '6px 10px'}}
              onClick={() =>
                saveNow('저장한 뒤 폼 상세(/forms/{id})로 넘어갑니다. 접수를 시작하거나 마감하는 것은 상세 화면 하단에서 합니다.')
              }>
              저장하고 상세로
            </Btn>
          </div>
        </div>
        <div className="mk-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <span className="mk-section-label" style={{margin: 0}}>
              페이지
            </span>
            <button type="button" className="gm-plain" style={{fontSize: 12, color: 'var(--app-accent)'}} onClick={addPage}>
              + 페이지 추가
            </button>
          </div>
          <div style={{display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap'}}>
            {pages.map((p, i) => (
              <Chip
                key={p.name}
                active={pageIndex === i}
                onClick={() => {
                  setPageIndex(i);
                  setFeedback(`«${p.name}» 페이지의 문항을 봅니다. 페이지를 고르는 것만으로는 저장할 것이 생기지 않습니다.`);
                }}>
                {p.name}
              </Chip>
            ))}
          </div>
          {page.questions.map((q, i) => (
            <div
              key={q.title}
              style={{
                border: '1px solid var(--app-line)',
                borderRadius: 10,
                padding: 10,
                marginBottom: i < page.questions.length - 1 ? 8 : 0,
              }}>
              <div style={{fontSize: 13, color: 'var(--app-ink)', fontWeight: 500}}>
                {q.title} {q.required && <span style={{color: 'var(--app-danger)'}}>*</span>}
              </div>
              <div style={{fontSize: 11, color: 'var(--app-n500)', marginTop: 4}}>{q.meta}</div>
            </div>
          ))}
          {page.questions.length === 0 && (
            <div
              style={{
                border: '1px dashed var(--app-line-strong)',
                borderRadius: 10,
                padding: 10,
                fontSize: 12,
                color: 'var(--app-n500)',
              }}>
              (예시) 아직 문항이 없는 페이지입니다.
            </div>
          )}
        </div>
      </div>
    </MockFrame>
  );
}
