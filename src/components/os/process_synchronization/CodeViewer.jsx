export default function CodeViewer({
  title = 'algorithm.c',
  code = [],
  proc0,
  proc1,
  procs,
  maxLine = 5,
  ariaLabel = 'Source Code Execution Trace',
}) {
  const activeProcs = procs || [proc0, proc1].filter(Boolean);

  return (
    <figure className="code-viewer-panel glass-panel" aria-label={ariaLabel}>
      <header className="code-viewer-header">
        <span className="code-title">{title}</span>
        <div className="code-thread-status" style={{ flexWrap: 'wrap', gap: '6px' }}>
          {activeProcs.map((p) => {
            const pLine = p?.line ?? 0;
            const pDone = pLine > maxLine;
            const pWait = p?.status === 'waiting';
            return (
              <span
                key={p?.id ?? Math.random()}
                className="indicator-pill"
                style={{
                  color: p?.color ?? 'var(--coral)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${p?.color ?? '#ffffff'}40`,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                P{p?.id}: {pWait ? `Line ${pLine} (Wait)` : !pDone ? `Line ${pLine}` : 'Done'}
              </span>
            );
          })}
        </div>
      </header>

      <div className="code-content">
        {code.map((item) => {
          const matchingProcs = activeProcs.filter(
            (p) => p && p.line === item.line && p.line <= maxLine
          );

          let lineStyle = {};

          if (matchingProcs.length === 1) {
            const single = matchingProcs[0];
            lineStyle = {
              background: `${single.color}22`,
              borderLeft: `3px solid ${single.color}`,
            };
          } else if (matchingProcs.length > 1) {
            const colorStops = matchingProcs.map(
              (p, idx) =>
                `${p.color}25 ${(idx / matchingProcs.length) * 100}%, ${p.color}25 ${
                  ((idx + 1) / matchingProcs.length) * 100
                }%`
            );
            lineStyle = {
              background: `linear-gradient(90deg, ${colorStops.join(', ')})`,
              borderLeft: `3px solid ${matchingProcs[0].color}`,
              borderRight: `3px solid ${matchingProcs[matchingProcs.length - 1].color}`,
            };
          }

          return (
            <div key={item.line} className="code-line" style={lineStyle}>
              <span className="line-num">{item.line}</span>
              <span className="line-text">
                {item.text}{' '}
                {item.comment && <span className="comment">{item.comment}</span>}
              </span>
              {matchingProcs.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                  {matchingProcs.map((p) => (
                    <span
                      key={p.id}
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '4px',
                        background: `${p.color}25`,
                        color: p.color,
                        border: `1px solid ${p.color}50`,
                      }}
                    >
                      P{p.id}{p.status === 'waiting' ? ' ⏳' : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}