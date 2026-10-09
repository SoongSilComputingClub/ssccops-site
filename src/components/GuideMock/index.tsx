import {useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import './mock.css';

/**
 * 사용 설명서의 예시 화면 틀과 부품.
 *
 * 옛 설명서(메타 레포 docs/user-guide/index.html)의 화면 스케치를 옮기면서, 설명서가 말하는 동작을
 * 직접 눌러 볼 수 있게 했다. 예시 화면은 서버와 이어지지 않는다. 눌러도 실제 데이터는 바뀌지 않는다.
 *
 * - 예시 화면은 설명서 본문의 규칙만 따른다. 본문에 없는 동작을 지어내지 않는다.
 * - 예시 이름과 번호는 홍길동처럼 누가 봐도 가짜인 값만 쓴다(AGENTS.md 공개 경계).
 * - 사이트 검색은 이 틀(.gm-frame)을 색인하지 않는다(docusaurus.config.ts의 ignoreCssSelectors).
 */

type MockFrameProps = {
  /** 화면 아래 한 줄. 옛 설명서의 mock-caption 그대로 */
  caption: ReactNode;
  /** 무엇을 눌러 보면 되는지. 있으면 «눌러 볼 수 있습니다» 머리가 붙는다 */
  hint?: ReactNode;
  /** 방금 누른 것이 무엇을 바꿨는지. 화면 낭독기가 읽도록 aria-live로 둔다 */
  feedback?: ReactNode;
  /** «처음으로». 예시 화면을 처음 상태로 되돌린다 */
  onReset?: () => void;
  /** 화면 밖에서 일어나는 일(다른 사람의 투표, 시간이 지남 등)을 흉내 내는 조작. 점선 띠에 둔다 */
  demo?: ReactNode;
  /** 옛 설명서 mock-inner의 style (max-width, margin: 0 auto 등) */
  innerStyle?: CSSProperties;
  children: ReactNode;
};

export function MockFrame({caption, hint, feedback, onReset, demo, innerStyle, children}: MockFrameProps): ReactNode {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const interactive = Boolean(hint);

  // 좁은 화면에서 옆으로 밀 수 있을 때만 «옆으로 밀어서 볼 수 있습니다»를 단다.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const check = () => setScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <figure className="gm gm-frame" style={{padding: 0}}>
      <div className="gm-head">
        <span className={interactive ? 'gm-head-tag' : 'gm-head-tag static'}>
          {interactive ? '눌러 볼 수 있습니다' : '예시 화면'}
        </span>
        {hint && <span className="gm-head-hint">{hint}</span>}
        {onReset && (
          <button type="button" className="gm-reset" onClick={onReset}>
            처음으로
          </button>
        )}
      </div>
      <div className="gm-body" ref={bodyRef}>
        {scrollable && <p className="gm-scroll-hint">옆으로 밀어서 볼 수 있습니다</p>}
        <div className="mock-inner" style={innerStyle}>
          {children}
        </div>
      </div>
      {demo && (
        <div className="gm-demo">
          <span className="gm-demo-label">화면 밖에서 일어나는 일</span>
          {demo}
        </div>
      )}
      <figcaption className="gm-foot">
        <p className="mock-caption">{caption}</p>
        {interactive && (
          <p className="gm-feedback" aria-live="polite">
            {feedback ?? '예시 화면입니다. 눌러도 실제 데이터는 바뀌지 않습니다.'}
          </p>
        )}
      </figcaption>
    </figure>
  );
}

/* ============ 부품 ============ */

type BadgeTone = 'blue' | 'grey' | 'red' | 'amber' | 'outline' | 'outline-accent' | 'outline-red';

export function Badge({tone, children, style}: {tone: BadgeTone; children: ReactNode; style?: CSSProperties}): ReactNode {
  return (
    <span className={`mk-badge mk-b-${tone}`} style={style}>
      {children}
    </span>
  );
}

export function Pill({tone, children, style}: {tone: 'blue' | 'outline'; children: ReactNode; style?: CSSProperties}): ReactNode {
  return (
    <span className={`mk-pill mk-p-${tone}`} style={style}>
      {children}
    </span>
  );
}

type ChipProps = {
  active?: boolean;
  /** 없으면 눌리지 않는 그림(span)으로 그린다 */
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function Chip({active, onClick, disabled, title, style, children}: ChipProps): ReactNode {
  const className = active ? 'mk-chip active' : 'mk-chip';
  if (!onClick) {
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled} title={title} aria-pressed={active} style={style}>
      {children}
    </button>
  );
}

type BtnProps = {
  variant?: 'primary' | 'ghost' | 'ghost-danger' | 'plain';
  /** 없으면 눌리지 않는 그림(span)으로 그린다 */
  onClick?: () => void;
  disabled?: boolean;
  /** 잠긴 버튼에 마우스를 올리면 뜨는 이유. 제품 화면도 말풍선으로 사유를 보여 준다 */
  title?: string;
  /**
   * 잠긴 모양으로 그리되 눌리기는 한다. 손가락으로 쓰는 화면에는 말풍선이 없으므로, 잠긴 버튼을 누르면
   * onClick에서 «왜 잠겼는지»를 feedback으로 알려 준다. disabled는 아예 눌리지 않을 때만 쓴다.
   */
  locked?: boolean;
  style?: CSSProperties;
  children: ReactNode;
};

export function Btn({variant = 'plain', onClick, disabled, title, locked, style, children}: BtnProps): ReactNode {
  const className = (variant === 'plain' ? 'mk-btn' : `mk-btn ${variant}`) + (locked ? ' gm-locked' : '');
  if (!onClick) {
    return (
      <span className={className} style={style} title={title}>
        {children}
      </span>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled} title={title} aria-disabled={locked || undefined} style={style}>
      {children}
    </button>
  );
}

export function Progress({value, danger, style}: {value: number; danger?: boolean; style?: CSSProperties}): ReactNode {
  return (
    <span className={danger ? 'mk-progress danger' : 'mk-progress'} style={style}>
      <span style={{width: `${Math.max(0, Math.min(100, value))}%`}} />
    </span>
  );
}

/** 체크칸. onToggle이 없으면 그림으로만 그린다 */
export function Check({on, onToggle, label, disabled, title}: {on: boolean; onToggle?: () => void; label: ReactNode; disabled?: boolean; title?: string}): ReactNode {
  const box = <span className={on ? 'gm-check on' : 'gm-check'}>{on ? '✓' : ''}</span>;
  if (!onToggle) {
    return (
      <span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
        {box}
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      className="gm-plain"
      role="checkbox"
      aria-checked={on}
      onClick={onToggle}
      disabled={disabled}
      title={title}
      style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      {box}
      {label}
    </button>
  );
}
