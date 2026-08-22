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