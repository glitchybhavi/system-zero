export default function CodeViewer({
  title = 'algorithm.c',
  code = [],
  proc0,
  proc1,
  maxLine = 5,
  ariaLabel = 'Source Code Execution Trace',
}) {
  const p0Line = proc0?.line ?? 0;
  const p1Line = proc1?.line ?? 0;
  const p0Done = p0Line > maxLine;
  const p1Done = p1Line > maxLine;

  return (
    <figure className="code-viewer-panel glass-panel" aria-label={ariaLabel}>
      <header className="code-viewer-header">
        <span className="code-title">{title}</span>
        <div className="code-thread-status">
          <span
            className="indicator-pill"
            style={{
              color: proc0?.color ?? 'var(--coral)',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            P{proc0?.id ?? 0}: Line {!p0Done ? p0Line : 'Done'}
          </span>
          <span
            className="indicator-pill"
            style={{
              color: proc1?.color ?? 'var(--mint)',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            P{proc1?.id ?? 1}: Line {!p1Done ? p1Line : 'Done'}
          </span>
        </div>
      </header>

      <div className="code-content">
        {code.map((item) => {
          const p0Active = p0Line === item.line && !p0Done;
          const p1Active = p1Line === item.line && !p1Done;

          let lineStyle = {};

          if (p0Active && p1Active) {
            lineStyle = {
              background: `linear-gradient(90deg, ${proc0?.color}25 0%, ${proc0?.color}25 50%, ${proc1?.color}25 50%, ${proc1?.color}25 100%)`,
              borderLeft: `3px solid ${proc0?.color}`,
              borderRight: `3px solid ${proc1?.color}`,
            };
          } else if (p0Active) {
            lineStyle = {
              background: `${proc0?.color}20`,
              borderLeft: `3px solid ${proc0?.color}`,
            };
          } else if (p1Active) {
            lineStyle = {
              background: `${proc1?.color}20`,
              borderLeft: `3px solid ${proc1?.color}`,
            };
          }

          return (
            <div key={item.line} className="code-line" style={lineStyle}>
              <span className="line-num">{item.line}</span>
              <span className="line-text">
                {item.text}{' '}
                {item.comment && <span className="comment">{item.comment}</span>}
              </span>
            </div>
          );
        })}
      </div>
export default function CodeViewer({ code, p0Line, p1Line }) {
  return (
    <figure className="code-viewer glass-panel" aria-label="Synchronized Code Trace">
      <figcaption style={{ display: 'none' }}>Algorithm execution line tracker</figcaption>
      {code.map((line, idx) => {
        const isP0 = p0Line === idx;
        const isP1 = p1Line === idx;
        let rowClass = 'code-line';
        if (isP0 && isP1) rowClass += ' active-both';
        else if (isP0) rowClass += ' active-p0';
        else if (isP1) rowClass += ' active-p1';

        return (
          <div key={idx} className={rowClass}>
            <span className="line-num">{idx}</span>
            <span className="line-text">{line}</span>
            {isP0 && <span className="indicator ind-p0">P0</span>}
            {isP1 && <span className="indicator ind-p1">P1</span>}
          </div>
        );
      })}
    </figure>
  );
}