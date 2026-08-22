import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArenaTrackLayer,
  ProcessPod,
  CriticalSectionZone,
  SimulationControls,
  CodeViewer,
  generateProcessColor,
  INITIAL_BALANCE,
  INCREMENT_VALUE,
} from '../../../components/os/process_synchronization';
// This Page showcases visualization of Race Condition or Critical Section Problem. 
// A balance vault has been set as a critical section and user can see race condition occuring in both manual and auto mode. 
// Expected and Loss currencies of all transactions are shown. User can even visualize live code while simulation is going on

import { useState, useEffect, useCallback, useRef } from 'react';

const CODE_SNIPPET = [
  { line: 1, text: 'void deposit() {', comment: '// Thread entry' },
  { line: 2, text: '  int local = balance;', comment: '// Read shared balance (Load)' },
  { line: 3, text: '  local = local + 10;', comment: '// Perform local operation' },
  { line: 4, text: '  balance = local;', comment: '// Write back to shared memory (Shared Vault)' },
  { line: 5, text: '}', comment: '// Thread exit' },
];

const generateProcessColor = (hue = Math.floor(Math.random() * 360)) => {
  return `hsl(${hue}, 45%, 70%)`;
};


function AnimatedBalance({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current === value) return;

    const start = prevValueRef.current;
    const end = value;
    const duration = 450;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = end;
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value]);

  return <output className="vault-balance-value" aria-live="polite">₹{displayValue}</output>;
}

const INITIAL_BALANCE = 100;
const INCREMENT_VALUE = 10;

export default function RaceConditionPage() {
  const [mode, setMode] = useState('manual');
  const [speed, setSpeed] = useState(1);
  const [sharedBalance, setSharedBalance] = useState(INITIAL_BALANCE);
  const [completedCount, setCompletedCount] = useState(0);
  const [vaultPulse, setVaultPulse] = useState(false);
  const [lostUpdateCount, setLostUpdateCount] = useState(0);

  const [alarmActive, setAlarmActive] = useState(false);
  const alarmTimerRef = useRef(null);

  const nextPidRef = useRef(2);
  const [proc0, setProc0] = useState({
    id: 0,
    track: 0,
    line: 1,
    local: null,
    status: 'ready',
    color: '#ff8fa3',
    fading: false,
  });
  const [proc0Exiting, setProc0Exiting] = useState(null);

  const [proc1, setProc1] = useState({
    id: 1,
    track: 1,
    line: 1,
    local: null,
    status: 'ready',
    color: '#6ee7b7',
    fading: false,
  });
  const [proc1Exiting, setProc1Exiting] = useState(null);

  const [busPacket0, setBusPacket0] = useState({ type: null, id: 0, color: '', value: null });
  const [busPacket1, setBusPacket1] = useState({ type: null, id: 0, color: '', value: null });

  const animTimer0 = useRef(null);
  const animTimer1 = useRef(null);
  const autoTurnRef = useRef(0);

  // Advance thread along execution pipeline
  const stepTrack = useCallback((trackId) => {
    const isTrack0 = trackId === 0;
    const currentProc = isTrack0 ? proc0 : proc1;
    const setProc = isTrack0 ? setProc0 : setProc1;
    const setProcExiting = isTrack0 ? setProc0Exiting : setProc1Exiting;
    const animTimer = isTrack0 ? animTimer0 : animTimer1;
    const setBusPacket = isTrack0 ? setBusPacket0 : setBusPacket1;

    if (currentProc.line >= 5 || currentProc.status === 'spawning' || currentProc.fading) {
      return;
    }

    if (currentProc.line === 4) {
      const exitingProc = { ...currentProc, line: 5, status: 'terminated' };
      setProcExiting(exitingProc);
      setTimeout(() => setProcExiting(null), 1600);

      const newId = nextPidRef.current++;
      setTimeout(() => {
        setProc((p) => (p && p.id === newId ? { ...p, status: 'ready' } : p));
      }, 1300);

      setProc({
        id: newId,
        track: isTrack0 ? 0 : 1,
        line: 1,
        local: null,
        status: 'spawning',
        color: generateProcessColor(),
        fading: false,
      });
      return;
    }

    const nextLine = currentProc.line + 1;

    if (nextLine === 2) {
      const loadedVal = sharedBalance;
      setProc({
        ...currentProc,
        line: 2,
        local: loadedVal,
        status: 'in-bay',
      });

      if (animTimer.current) clearTimeout(animTimer.current);
      setBusPacket({ type: 'load', id: Date.now(), color: currentProc.color, value: loadedVal });
      animTimer.current = setTimeout(
        () => setBusPacket({ type: null, id: 0, color: '', value: null }),
        950
      );
    } else if (nextLine === 3) {
      const computedVal = (currentProc.local !== null ? currentProc.local : sharedBalance) + INCREMENT_VALUE;
      setProc({
        ...currentProc,
        line: 3,
        local: computedVal,
        status: 'in-bay',
      });
    } else if (nextLine === 4) {
      const writeVal = currentProc.local !== null ? currentProc.local : sharedBalance;

      setProc({
        ...currentProc,
        line: 4,
        local: writeVal,
        status: 'in-bay',
      });

      setCompletedCount((prevCount) => {
        const nextCount = prevCount + 1;
        const expectedAfterWrite = INITIAL_BALANCE + nextCount * INCREMENT_VALUE;
        if (writeVal < expectedAfterWrite) {
          setLostUpdateCount((c) => c + 1);
          if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
          setAlarmActive(true);
          alarmTimerRef.current = setTimeout(() => setAlarmActive(false), 3400);
        }
        return nextCount;
      });

      setSharedBalance(writeVal);
      setVaultPulse(true);
      setTimeout(() => setVaultPulse(false), 600);

      if (animTimer.current) clearTimeout(animTimer.current);
      setBusPacket({ type: 'store', id: Date.now(), color: currentProc.color, value: writeVal });
      animTimer.current = setTimeout(
        () => setBusPacket({ type: null, id: 0, color: '', value: null }),
        950
      );
    }
  }, [proc0, proc1, sharedBalance]);

  const resetSimulation = useCallback(() => {
    if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
    nextPidRef.current = 2;
    setSharedBalance(INITIAL_BALANCE);
    setCompletedCount(0);
    setLostUpdateCount(0);
    setAlarmActive(false);
    setBusPacket0({ type: null, id: 0, color: '', value: null });
    setBusPacket1({ type: null, id: 0, color: '', value: null });
    autoTurnRef.current = 0;

    setProc0({
      id: 0,
      track: 0,
      line: 1,
      local: null,
      status: 'ready',
      color: '#ff8fa3',
      fading: false,
    });

    setProc1({
      id: 1,
      track: 1,
      line: 1,
      local: null,
      status: 'ready',
      color: '#6ee7b7',
      fading: false,
    });
  }, []);

  useEffect(() => {
    if (mode !== 'auto') return;

    const interval = setInterval(() => {
      const p0CanStep = proc0.line < 5 && !proc0.fading && proc0.status !== 'spawning';
      const p1CanStep = proc1.line < 5 && !proc1.fading && proc1.status !== 'spawning';

      if (p0CanStep && (autoTurnRef.current % 2 === 0 || !p1CanStep)) {
        stepTrack(0);
        autoTurnRef.current++;
      } else if (p1CanStep) {
        stepTrack(1);
        autoTurnRef.current++;
      }
    }, 1100 / speed);

    return () => clearInterval(interval);
  }, [mode, speed, proc0, proc1, stepTrack]);

  const expectedBalance = INITIAL_BALANCE + completedCount * INCREMENT_VALUE;
  const drift = Math.max(0, expectedBalance - sharedBalance);
  const getPodPosClass = (status) => {
    if (status === 'spawning') return 'pod-pos-spawning';
    if (status === 'ready') return 'pod-pos-ready';
    if (status === 'terminated') return 'pod-pos-terminated';
    return 'pod-pos-bay';
  };

  const getPodStatusText = (status) => {
    if (status === 'spawning' || status === 'ready') return 'Ready';
    if (status === 'terminated') return 'Exiting';
    return 'Executing';
  };

  const expectedBalance = INITIAL_BALANCE + completedCount * INCREMENT_VALUE;
  const drift = Math.max(0, expectedBalance - sharedBalance);
  const sliderFillPercent = ((speed - 0.5) / (2.0 - 0.5)) * 100;

  return (
    <section className="sim-container" aria-label="Race Condition Interactive Visualizer">
      <div className="sim-arena" role="region" aria-label="Conveyor Stage Arena">
     
        <ArenaTrackLayer gate0Locked={false} gate1Locked={false} />

  
        {proc0Exiting && (
          <ProcessPod key={`proc-exit-${proc0Exiting.id}`} proc={proc0Exiting} track={0} isExiting={true} />
        )}
        <ProcessPod key={`proc-${proc0.id}`} proc={proc0} track={0} />

        {proc1Exiting && (
          <ProcessPod key={`proc-exit-${proc1Exiting.id}`} proc={proc1Exiting} track={1} isExiting={true} />
        )}
        <ProcessPod key={`proc-${proc1.id}`} proc={proc1} track={1} />

        <CriticalSectionZone
          proc0={proc0}
          proc1={proc1}
          busPacket0={busPacket0}
          busPacket1={busPacket1}
          sharedBalance={sharedBalance}
          expectedBalance={expectedBalance}
          drift={drift}
          vaultPulse={vaultPulse}
          alarmActive={alarmActive}
        />
      </div>

    
      <footer className="sim-bottom-panel">
        <SimulationControls
          mode={mode}
          setMode={setMode}
          speed={speed}
          setSpeed={setSpeed}
          onStepTrack={stepTrack}
          proc0={proc0}
          proc1={proc1}
          maxLine0={5}
          maxLine1={5}
          onReset={resetSimulation}
        />

        <CodeViewer
          title="deposit.c"
          code={CODE_SNIPPET}
          proc0={proc0}
          proc1={proc1}
          maxLine={4}
          ariaLabel="Race Condition Source Code Trace"
        />
        <div className="arena-track-layer" role="presentation">
          <div className="rail-conduit rail-conduit-entry rail-p0">
            <div className="pipe-glow-line" />
            <div className="pipe-ring ring-1" />
            <div className="pipe-ring ring-2" />
          </div>
          <div className="rail-conduit rail-conduit-entry rail-p1">
            <div className="pipe-glow-line" />
            <div className="pipe-ring ring-1" />
            <div className="pipe-ring ring-2" />
          </div>

          <div className="track-gate-node gate-p0">
            <div className="gate-pin" />
            <span className="gate-label">Unlocked</span>
          </div>

          <div className="track-gate-node gate-p1">
            <div className="gate-pin" />
            <span className="gate-label">Unlocked</span>
          </div>

          <div className="rail-conduit rail-conduit-exit rail-p0">
            <div className="pipe-glow-line" />
            <div className="pipe-ring ring-1" />
            <div className="pipe-ring ring-2" />
          </div>
          <div className="rail-conduit rail-conduit-exit rail-p1">
            <div className="pipe-glow-line" />
            <div className="pipe-ring ring-1" />
            <div className="pipe-ring ring-2" />
          </div>

          <span className="track-terminated-label terminated-p0">Terminated</span>
          <span className="track-terminated-label terminated-p1">Terminated</span>
        </div>

        {proc0Exiting && (
          <div
            key={`proc-exit-${proc0Exiting.id}`}
            className={`animated-pod ${getPodPosClass(proc0Exiting.status)}`}
            style={{
              top: '32%',
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc0Exiting.color}30`,
            }}
          >
            <div className="pod-id-tag" style={{ color: proc0Exiting.color }}>P{proc0Exiting.id}</div>
            <div className="pod-info-group">
              <span className="pod-register-val">
                Local: {proc0Exiting.local !== null ? `₹${proc0Exiting.local}` : '--'}
              </span>
              <span className="pod-state-pill">{getPodStatusText(proc0Exiting.status)}</span>
            </div>
          </div>
        )}

        <div
          key={`proc-${proc0.id}`}
          className={`animated-pod ${getPodPosClass(proc0.status)}`}
          style={{
            top: '32%',
            background: 'rgba(20, 20, 25, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc0.color}30`,
          }}
          title={`Process P${proc0.id} (Line ${proc0.line})`}
        >
          <div className="pod-id-tag" style={{ color: proc0.color }}>P{proc0.id}</div>
          <div className="pod-info-group">
            <span className="pod-register-val">
              Local: {proc0.local !== null ? `₹${proc0.local}` : '--'}
            </span>
            <span className="pod-state-pill">{getPodStatusText(proc0.status)}</span>
          </div>
        </div>

        {proc1Exiting && (
          <div
            key={`proc-exit-${proc1Exiting.id}`}
            className={`animated-pod ${getPodPosClass(proc1Exiting.status)}`}
            style={{
              top: '68%',
              background: 'rgba(20, 20, 25, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc1Exiting.color}30`,
            }}
          >
            <div className="pod-id-tag" style={{ color: proc1Exiting.color }}>P{proc1Exiting.id}</div>
            <div className="pod-info-group">
              <span className="pod-register-val">
                Local: {proc1Exiting.local !== null ? `₹${proc1Exiting.local}` : '--'}
              </span>
              <span className="pod-state-pill">{getPodStatusText(proc1Exiting.status)}</span>
            </div>
          </div>
        )}

        <div
          key={`proc-${proc1.id}`}
          className={`animated-pod ${getPodPosClass(proc1.status)}`}
          style={{
            top: '68%',
            background: 'rgba(20, 20, 25, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc1.color}30`,
          }}
          title={`Process P${proc1.id} (Line ${proc1.line})`}
        >
          <div className="pod-id-tag" style={{ color: proc1.color }}>P{proc1.id}</div>
          <div className="pod-info-group">
            <span className="pod-register-val">
              Local: {proc1.local !== null ? `₹${proc1.local}` : '--'}
            </span>
            <span className="pod-state-pill">{getPodStatusText(proc1.status)}</span>
          </div>
        </div>

        <section
          className={`critical-section-zone ${alarmActive ? 'vault-alarm-active' : ''}`}
          aria-label="Critical Section Shared Memory Zone"
        >
          <div className="cs-bays-column" role="group" aria-label="Execution Docking Bays">
            <div className="docking-socket socket-p0">
              <span className="socket-bay-name" style={{ color: proc0.color }}>Bay 0</span>
              <span className="socket-status-dot" style={{ background: proc0.color }} />
            </div>

            <div className="docking-socket socket-p1">
              <span className="socket-bay-name" style={{ color: proc1.color }}>Bay 1</span>
              <span className="socket-status-dot" style={{ background: proc1.color }} />
            </div>
          </div>

          <div className="cs-connectors-column" role="presentation">
            <div className="bus-conduit-wrapper">
              <div className="bus-conduit">
                {busPacket0.type && (
                  <div key={`pkt0-${busPacket0.id}`} className={`currency-token flow-${busPacket0.type}`}>
                    <span className="currency-pill">
                      ₹{busPacket0.type === 'load' ? busPacket0.value : '10'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bus-conduit-wrapper">
              <div className="bus-conduit">
                {busPacket1.type && (
                  <div key={`pkt1-${busPacket1.id}`} className={`currency-token flow-${busPacket1.type}`}>
                    <span className="currency-pill">
                      ₹{busPacket1.type === 'load' ? busPacket1.value : '10'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <article
            className={`shared-vault-memory ${vaultPulse ? 'pulse-update' : ''} ${alarmActive ? 'vault-alarm-flash' : ''}`}
            aria-label="Shared Vault Storage"
          >
            <header className="vault-title-label">Shared Vault</header>
            <AnimatedBalance value={sharedBalance} />
            <span className="vault-variable-tag">Balance</span>

            <footer className="vault-audit-stats">
              <span className="expected-stat">Expected: ₹{expectedBalance}</span>
              {drift > 0 && <span className="drift-stat">Lost: -₹{drift}</span>}
            </footer>
          </article>

          <footer className={`cs-underneath-title ${alarmActive ? 'alarm-active' : ''}`}>
            Critical Section
          </footer>
        </section>
      </div>

      <footer className="sim-bottom-panel">
        <form className="controls-panel glass-panel" onSubmit={(e) => e.preventDefault()}>
          <div>
            <header className="control-section-header">Conveyor Controls</header>

            <div className="control-group" style={{ marginTop: '8px' }}>
              <label>Execution Mode</label>
              <div className="segmented-control" role="group" aria-label="Simulation Stepper Mode">
                <button
                  type="button"
                  className={`segmented-btn ${mode === 'manual' ? 'active' : ''}`}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button
                  type="button"
                  className={`segmented-btn ${mode === 'auto' ? 'active' : ''}`}
                  onClick={() => setMode('auto')}
                >
                  Auto
                </button>
              </div>
            </div>
          </div>

          {mode === 'manual' ? (
            <div className="control-group">
              <label>Manual Thread Step</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-track"
                  onClick={() => stepTrack(0)}
                  disabled={proc0.line >= 5 || proc0.fading}
                  style={{
                    flex: 1,
                    '--btn-border': proc0.color,
                    '--btn-color': proc0.color,
                    '--btn-glow': `${proc0.color}30`,
                  }}
                >
                  Step P{proc0.id}
                </button>
                <button
                  type="button"
                  className="btn-track"
                  onClick={() => stepTrack(1)}
                  disabled={proc1.line >= 5 || proc1.fading}
                  style={{
                    flex: 1,
                    '--btn-border': proc1.color,
                    '--btn-color': proc1.color,
                    '--btn-glow': `${proc1.color}30`,
                  }}
                >
                  Step P{proc1.id}
                </button>
              </div>
            </div>
          ) : (
            <div className="control-group">
              <label htmlFor="rc-speed-slider">Simulation Speed ({speed}x)</label>
              <div className="slider-wrapper">
                <input
                  id="rc-speed-slider"
                  type="range"
                  className="custom-range-slider"
                  min="0.5"
                  max="2"
                  step="0.5"
                  value={speed}
                  style={{
                    '--fill-percent': `${sliderFillPercent}%`,
                  }}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                />
                <div className="slider-ticks">
                  <span
                    className={`slider-tick ${speed === 0.5 ? 'active' : ''}`}
                    onClick={() => setSpeed(0.5)}
                  >
                    0.5x
                  </span>
                  <span
                    className={`slider-tick ${speed === 1.0 ? 'active' : ''}`}
                    onClick={() => setSpeed(1.0)}
                  >
                    1.0x
                  </span>
                  <span
                    className={`slider-tick ${speed === 2.0 ? 'active' : ''}`}
                    onClick={() => setSpeed(2.0)}
                  >
                    2.0x
                  </span>
                </div>
              </div>
            </div>
          )}

          <button type="button" className="btn-reset" onClick={resetSimulation}>
            ↺ Reset Simulation (₹100)
          </button>
        </form>

        <figure className="code-viewer-panel glass-panel" aria-label="Race Condition Source Code Trace">
          <header className="code-viewer-header">
            <span className="code-title">deposit.c</span>
            <div className="code-thread-status">
              <span
                className="indicator-pill"
                style={{
                  color: proc0.color,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em'
                }}
              >
                P{proc0.id}: Line {proc0.line <= 5 ? proc0.line : 'Done'}
              </span>
              <span
                className="indicator-pill"
                style={{
                  color: proc1.color,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em'
                }}
              >
                P{proc1.id}: Line {proc1.line <= 5 ? proc1.line : 'Done'}
              </span>
            </div>
          </header>

          <div className="code-content">
            {CODE_SNIPPET.map((item) => {
              const p0Active = proc0.line === item.line && proc0.line < 5;
              const p1Active = proc1.line === item.line && proc1.line < 5;

              let lineStyle = {};

              if (p0Active && p1Active) {
                lineStyle = {
                  background: `linear-gradient(90deg, ${proc0.color}25 0%, ${proc0.color}25 50%, ${proc1.color}25 50%, ${proc1.color}25 100%)`,
                  borderLeft: `3px solid ${proc0.color}`,
                  borderRight: `3px solid ${proc1.color}`,
                };
              } else if (p0Active) {
                lineStyle = {
                  background: `${proc0.color}20`,
                  borderLeft: `3px solid ${proc0.color}`,
                };
              } else if (p1Active) {
                lineStyle = {
                  background: `${proc1.color}20`,
                  borderLeft: `3px solid ${proc1.color}`,
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
        </figure>
      </footer>
    </section>
  );
}