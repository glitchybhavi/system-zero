import { useEffect } from 'react';
import ProcessPod from './ProcessPod';
import BalanceBox from './BalanceBox';
import ExecutionPath from './ExecutionPath';
import CodeViewer from './CodeViewer';


export default function SimulationLayout({
  simState,
  onTick,
  auto,
  setAuto,
  speed,
  setSpeed,
  code,
  getLineForState,
  gate0Open,
  gate1Open,
  syncUI
}) {
  
  useEffect(() => {
    if (!auto) return;
    const interval = setInterval(onTick, 1500 / speed);
    return () => clearInterval(interval);
  }, [auto, speed, onTick]);

  const p0Line = getLineForState(simState.p0.state);
  const p1Line = getLineForState(simState.p1.state);

  return (
    <section className="sim-container" aria-label="Synchronization Simulation Workspace">
      <div className="sim-arena glass-panel" role="region" aria-label="Process Execution Arena">
        <ExecutionPath gate0Open={gate0Open} gate1Open={gate1Open} />
        <BalanceBox balance={simState.balance} />
        
        <ProcessPod id={0} state={simState.p0.state} local={simState.p0.local} />
        <ProcessPod id={1} state={simState.p1.state} local={simState.p1.local} />

        {syncUI && (
          <aside className="sync-state-panel glass-panel" aria-label="Shared Synchronization Variables">
            {syncUI}
          </aside>
        )}

        <aside className="terminated-queue" aria-label="Recent Process Completions">
          {simState.completed.slice(-2).map((item, idx) => (
            <article key={idx} className={`term-card glass-panel ${item.id === 0 ? 'active-p0' : 'active-p1'}`}>
              P{item.id} deposited ₹10.<br/>
              <strong>Bal: ₹{item.final}</strong>
            </article>
          ))}
        </aside>
      </div>

      <footer className="sim-bottom-panel">
        <form className="controls-panel glass-panel" onSubmit={(e) => e.preventDefault()}>
          <div className="control-group">
            <label>Execution Mode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                className={`btn ${!auto ? 'active' : ''}`} 
                onClick={() => setAuto(false)} 
                style={{ flex: 1 }}
              >
                Manual
              </button>
              <button 
                type="button" 
                className={`btn ${auto ? 'active' : ''}`} 
                onClick={() => setAuto(true)} 
                style={{ flex: 1 }}
              >
                Auto
              </button>
            </div>
          </div>
          
          {!auto ? (
            <div className="control-group">
              <label>Manual Step</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => onTick(0)} 
                  style={{ flex: 1, borderColor: 'var(--coral)' }}
                >
                  Step P0
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => onTick(1)} 
                  style={{ flex: 1, borderColor: 'var(--mint)' }}
                >
                  Step P1
                </button>
              </div>
            </div>
          ) : (
            <div className="control-group">
              <label htmlFor="speed-slider">Simulation Speed ({speed}x)</label>
              <div className="slider-container">
                <span>0.5x</span>
                <input 
                  id="speed-slider"
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.5" 
                  value={speed} 
                  onChange={(e) => setSpeed(parseFloat(e.target.value))} 
                />
                <span>2.0x</span>
              </div>
            </div>
          )}
        </form>

        <CodeViewer code={code} p0Line={p0Line} p1Line={p1Line} />
      </footer>
    </section>
  );
}