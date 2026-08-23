import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArenaTrackLayer,
  ProcessPod,
  CriticalSectionZone,
  CodeViewer,
  INITIAL_BALANCE,
  INCREMENT_VALUE,
} from '../../../components/os/process_synchronization';

const MUTEX_CODE = [
  { line: 1, text: 'acquire(mutex);' },
  { line: 2, text: 'balance = balance + 10;' },
  { line: 3, text: 'release(mutex);' },
];

const THREAD_COLORS = [
  '#ff8fa3', '#6ee7b7', '#38bdf8', '#fbbf24', '#c084fc',
  '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#f87171',
  '#2dd4bf', '#818cf8', '#fb923c', '#4ade80', '#e879f9',
  '#38bdf8', '#facc15', '#a3e635', '#f43f5e', '#06b6d4',
];

const calculateTrackTop = (trackIndex, totalTracks) => {
  if (totalTracks <= 1) return '50%';
  if (totalTracks === 2) return trackIndex === 0 ? '34%' : '66%';
  if (totalTracks === 3) return trackIndex === 0 ? '25%' : trackIndex === 1 ? '50%' : '75%';
  if (totalTracks === 4) return trackIndex === 0 ? '20%' : trackIndex === 1 ? '40%' : trackIndex === 2 ? '60%' : '80%';
  const step = 68 / Math.max(1, totalTracks - 1);
  return `${Math.round(16 + trackIndex * step)}%`;
};

const generateSabotageMap = () => {
  const map = {};
  const guaranteed = Math.floor(Math.random() * 10) + 6;
  map[guaranteed] = Math.floor(Math.random() * 4) + 2;

  for (let pid = 6; pid <= 15; pid++) {
    if (pid !== guaranteed && Math.random() < 0.25) {
      map[pid] = Math.floor(Math.random() * 4) + 2;
    }
  }
  return map;
};

export default function MutexPage() {
  const [trackCount, setTrackCount] = useState(4);
  const [mode, setMode] = useState('manual');
  const [speed, setSpeed] = useState(1);
  const [sharedBalance, setSharedBalance] = useState(INITIAL_BALANCE);
  const [completedCount, setCompletedCount] = useState(0);
  const [vaultPulse, setVaultPulse] = useState(false);

  const [mutexAvailable, setMutexAvailable] = useState(true);
  const [lockOwner, setLockOwner] = useState(null);
  const [gateLocked, setGateLocked] = useState(false);
  const [waitQueue, setWaitQueue] = useState([]);
  const [sabotageMap, setSabotageMap] = useState(() => generateSabotageMap());
  const [activeDelayRemaining, setActiveDelayRemaining] = useState(null);

  const [procs, setProcs] = useState(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      track: i,
      laneTop: calculateTrackTop(i, 4),
      line: 1,
      local: null,
      status: 'ready',
      color: THREAD_COLORS[i % THREAD_COLORS.length],
      fading: false,
      isSabotaged: false,
      stopwatch: null,
    }));
  });

  const [exitingProcs, setExitingProcs] = useState([]);
  const [busPacket, setBusPacket] = useState({ type: null, id: 0, color: '', value: null });

  const animTimerRef = useRef(null);
  const nextPidRef = useRef(4);
  const delayTimerRef = useRef(null);
  const isDelayingRef = useRef(false);

  const mutexAvailableRef = useRef(true);
  const lockOwnerRef = useRef(null);
  const gateLockedRef = useRef(false);
  const waitQueueRef = useRef([]);
  const procsRef = useRef(procs);
  const sabotageMapRef = useRef(sabotageMap);

  mutexAvailableRef.current = mutexAvailable;
  lockOwnerRef.current = lockOwner;
  gateLockedRef.current = gateLocked;
  waitQueueRef.current = waitQueue;
  procsRef.current = procs;
  sabotageMapRef.current = sabotageMap;

  const initSimulation = useCallback((activeLanes) => {
    if (delayTimerRef.current) clearInterval(delayTimerRef.current);
    delayTimerRef.current = null;
    isDelayingRef.current = false;
    setActiveDelayRemaining(null);

    const newMap = generateSabotageMap();
    setSabotageMap(newMap);
    sabotageMapRef.current = newMap;

    nextPidRef.current = activeLanes;
    mutexAvailableRef.current = true;
    lockOwnerRef.current = null;
    gateLockedRef.current = false;
    waitQueueRef.current = [];

    setMutexAvailable(true);
    setLockOwner(null);
    setGateLocked(false);
    setWaitQueue([]);
    setSharedBalance(INITIAL_BALANCE);
    setCompletedCount(0);
    setVaultPulse(false);
    setBusPacket({ type: null, id: 0, color: '', value: null });
    setExitingProcs([]);

    const initial = Array.from({ length: activeLanes }, (_, i) => ({
      id: i,
      track: i,
      laneTop: calculateTrackTop(i, activeLanes),
      line: 1,
      local: null,
      status: 'ready',
      color: THREAD_COLORS[i % THREAD_COLORS.length],
      fading: false,
      isSabotaged: Boolean(newMap[i]),
      stopwatch: null,
    }));

    setProcs(initial);
  }, []);

  const handleTrackCountChange = (count) => {
    if (count === trackCount) return;
    setTrackCount(count);
    initSimulation(count);
  };

  const executeCriticalSectionWrite = useCallback((ownerIndex, currentProcs) => {
    const ownerProc = currentProcs[ownerIndex];
    const writeVal = sharedBalance + INCREMENT_VALUE;
    setSharedBalance(writeVal);
    setVaultPulse(true);
    setTimeout(() => setVaultPulse(false), 500);

    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setBusPacket({ type: 'store', id: Date.now(), color: ownerProc.color, value: writeVal });
    animTimerRef.current = setTimeout(
      () => setBusPacket({ type: null, id: 0, color: '', value: null }),
      800
    );

    currentProcs[ownerIndex] = {
      ...ownerProc,
      line: 3,
      local: writeVal,
      status: 'in-bay',
      statusText: 'EXECUTING',
      stopwatch: null,
    };
    setProcs([...currentProcs]);
  }, [sharedBalance]);

  const advanceSimulation = useCallback(() => {
    if (isDelayingRef.current) return;

    const currentProcs = [...procsRef.current];
    const ownerId = lockOwnerRef.current;

    if (ownerId !== null) {
      const ownerIndex = currentProcs.findIndex((p) => p.id === ownerId);
      if (ownerIndex === -1) return;

      const ownerProc = currentProcs[ownerIndex];

      if (ownerProc.line === 2) {
        const delaySeconds = sabotageMapRef.current[ownerProc.id];

        if (delaySeconds && !ownerProc.delayCompleted) {
          isDelayingRef.current = true;
          let remaining = delaySeconds;
          setActiveDelayRemaining(remaining);

          currentProcs[ownerIndex] = {
            ...ownerProc,
            stopwatch: `${remaining.toFixed(1)}s`,
            statusText: `HOLDING LOCK (${remaining.toFixed(1)}s)`,
          };
          setProcs([...currentProcs]);

          delayTimerRef.current = setInterval(() => {
            remaining = Math.max(0, +(remaining - 0.2).toFixed(1));
            setActiveDelayRemaining(remaining);

            setProcs((prev) =>
              prev.map((p) =>
                p.id === ownerProc.id
                  ? {
                      ...p,
                      stopwatch: remaining > 0 ? `${remaining.toFixed(1)}s` : null,
                      statusText: remaining > 0 ? `HOLDING LOCK (${remaining.toFixed(1)}s)` : 'EXECUTING',
                    }
                  : p
              )
            );

            if (remaining <= 0) {
              clearInterval(delayTimerRef.current);
              delayTimerRef.current = null;
              isDelayingRef.current = false;
              setActiveDelayRemaining(null);

              const latestProcs = [...procsRef.current];
              const latestOwnerIdx = latestProcs.findIndex((p) => p.id === ownerProc.id);
              if (latestOwnerIdx !== -1) {
                latestProcs[latestOwnerIdx].delayCompleted = true;
                executeCriticalSectionWrite(latestOwnerIdx, latestProcs);
              }
            }
          }, 200);

          return;
        }

        executeCriticalSectionWrite(ownerIndex, currentProcs);
        return;
      }

      if (ownerProc.line === 3) {
        const exitingPod = {
          ...ownerProc,
          line: 4,
          status: 'terminated',
        };

        setExitingProcs((prev) => [...prev, exitingPod]);
        setTimeout(() => {
          setExitingProcs((prev) => prev.filter((p) => p.id !== exitingPod.id));
        }, 1500);

        setCompletedCount((c) => c + 1);

        const newId = nextPidRef.current++;
        const currentTrackIndex = ownerProc.track;
        const staticLaneTop = calculateTrackTop(currentTrackIndex, trackCount);

        currentProcs[ownerIndex] = {
          id: newId,
          track: currentTrackIndex,
          laneTop: staticLaneTop,
          line: 1,
          local: null,
          status: 'ready',
          color: THREAD_COLORS[newId % THREAD_COLORS.length],
          fading: false,
          isSabotaged: Boolean(sabotageMapRef.current[newId]),
          stopwatch: null,
        };

        lockOwnerRef.current = null;
        mutexAvailableRef.current = true;
        gateLockedRef.current = false;

        setLockOwner(null);
        setMutexAvailable(true);
        setGateLocked(false);

        const sortedCandidates = currentProcs
          .filter((p) => p.status === 'ready' || p.status === 'waiting')
          .sort((a, b) => a.id - b.id);

        const remainingQueueIds = sortedCandidates.slice(1).map((p) => p.id).slice(0, 5);
        waitQueueRef.current = remainingQueueIds;
        setWaitQueue(remainingQueueIds);

        setProcs([...currentProcs]);
        return;
      }
    } else {
      const sortedCandidates = currentProcs
        .filter((p) => p.status === 'ready' || p.status === 'waiting')
        .sort((a, b) => a.id - b.id);

      if (sortedCandidates.length > 0) {
        const nextProc = sortedCandidates[0];
        const nextIdx = currentProcs.findIndex((p) => p.id === nextProc.id);

        const remainingQueueIds = sortedCandidates.slice(1).map((p) => p.id).slice(0, 5);
        waitQueueRef.current = remainingQueueIds;
        setWaitQueue(remainingQueueIds);

        currentProcs.forEach((p, idx) => {
          if (idx !== nextIdx && (p.status === 'ready' || p.status === 'waiting')) {
            currentProcs[idx] = { ...p, status: 'waiting', statusText: 'WAITING', line: 1 };
          }
        });

        lockOwnerRef.current = nextProc.id;
        mutexAvailableRef.current = false;
        gateLockedRef.current = true;

        setLockOwner(nextProc.id);
        setMutexAvailable(false);
        setGateLocked(true);

        currentProcs[nextIdx] = {
          ...currentProcs[nextIdx],
          line: 2,
          status: 'in-bay',
          statusText: 'EXECUTING',
        };

        setProcs([...currentProcs]);
      }
    }
  }, [sharedBalance, trackCount, executeCriticalSectionWrite]);

  const stepManualThread = useCallback((threadId) => {
    if (isDelayingRef.current) return;

    const currentProcs = [...procsRef.current];
    const procIndex = currentProcs.findIndex((p) => p.id === threadId);
    if (procIndex === -1) return;

    const currentProc = currentProcs[procIndex];
    if (currentProc.status === 'spawning' || currentProc.fading || currentProc.line >= 4) {
      return;
    }

    if (currentProc.status === 'in-bay') {
      advanceSimulation();
      return;
    }

    if (mutexAvailableRef.current && lockOwnerRef.current === null) {
      const sortedCandidates = currentProcs
        .filter((p) => p.status === 'ready' || p.status === 'waiting')
        .sort((a, b) => a.id - b.id);

      const lowestProc = sortedCandidates[0];
      const targetIdx = currentProcs.findIndex((p) => p.id === lowestProc.id);

      const remainingQueueIds = sortedCandidates.slice(1).map((p) => p.id).slice(0, 5);
      waitQueueRef.current = remainingQueueIds;
      setWaitQueue(remainingQueueIds);

      currentProcs.forEach((p, idx) => {
        if (idx !== targetIdx && (p.status === 'ready' || p.status === 'waiting')) {
          currentProcs[idx] = { ...p, status: 'waiting', statusText: 'WAITING', line: 1 };
        }
      });

      lockOwnerRef.current = lowestProc.id;
      mutexAvailableRef.current = false;
      gateLockedRef.current = true;

      setLockOwner(lowestProc.id);
      setMutexAvailable(false);
      setGateLocked(true);

      currentProcs[targetIdx] = {
        ...currentProcs[targetIdx],
        line: 2,
        status: 'in-bay',
        statusText: 'EXECUTING',
      };
      setProcs([...currentProcs]);
    } else {
      if (!waitQueueRef.current.includes(currentProc.id) && waitQueueRef.current.length < 5) {
        const nextQueue = [...waitQueueRef.current, currentProc.id].sort((a, b) => a - b);
        waitQueueRef.current = nextQueue;
        setWaitQueue(nextQueue);
      }

      currentProcs[procIndex] = {
        ...currentProc,
        status: 'waiting',
        statusText: 'WAITING',
      };
      setProcs([...currentProcs]);
    }
  }, [advanceSimulation]);

  const resetSimulation = useCallback(() => {
    initSimulation(trackCount);
  }, [initSimulation, trackCount]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const interval = setInterval(() => {
      advanceSimulation();
    }, 1100 / speed);

    return () => clearInterval(interval);
  }, [mode, speed, advanceSimulation]);

  const activeInBayProc = procs.find((p) => p.status === 'in-bay');
  const expectedBalance = INITIAL_BALANCE + completedCount * INCREMENT_VALUE;

  const staticTracks = Array.from({ length: trackCount }, (_, i) => ({
    id: i,
    top: calculateTrackTop(i, trackCount),
  }));

  const visualFifoOrder = [...waitQueue].reverse();

  return (
    <section className="sim-container" aria-label="Mutex Lock Interactive Visualizer">
      <div className="sim-arena" role="region" aria-label="Mutex Execution Arena">
        <aside className="mutex-hud-panel" aria-label="Mutex Lock State HUD">
          <header className="mutex-hud-header">
            <span>Mutex State</span>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: !gateLocked ? '#34d399' : '#f87171',
                boxShadow: !gateLocked
                  ? '0 0 8px rgba(52, 211, 153, 0.8)'
                  : '0 0 8px rgba(248, 113, 113, 0.8)',
              }}
            />
          </header>
          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Gate</span>
            <output
              style={{
                color: !gateLocked ? '#34d399' : '#f87171',
                fontWeight: 700,
              }}
            >
              {!gateLocked ? 'UNLOCKED' : 'LOCKED'}
            </output>
          </div>
          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Lock Owner</span>
            <output
              style={{
                color: lockOwner !== null ? procs.find((p) => p.id === lockOwner)?.color || '#38bdf8' : '#64748b',
                fontWeight: 700,
              }}
            >
              {lockOwner !== null ? `P${lockOwner}` : 'None'}
            </output>
          </div>
          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Wait Queue</span>
            <output style={{ color: waitQueue.length > 0 ? '#f87171' : '#34d399', fontWeight: 700 }}>
              {waitQueue.length}/5
            </output>
          </div>

          {activeDelayRemaining !== null && activeInBayProc && (
            <div className="sabotage-hud-badge" style={{ marginTop: '8px', borderColor: 'rgba(251, 191, 36, 0.6)', background: 'rgba(251, 191, 36, 0.15)', color: '#fde68a' }}>
              <span> Lock Contention: P{activeInBayProc.id}</span>
              <span>{activeDelayRemaining.toFixed(1)}s</span>
            </div>
          )}
        </aside>

        <ArenaTrackLayer gate0Locked={gateLocked} tracks={staticTracks} singleBay={true} />

        {exitingProcs.map((proc) => (
          <ProcessPod key={`exit-${proc.id}`} proc={{ ...proc, top: '50%' }} isExiting={true} />
        ))}

        {procs.map((proc) => {
          const currentTop = proc.status === 'in-bay' ? '50%' : proc.laneTop;
          return (
            <ProcessPod key={`proc-${proc.id}`} proc={{ ...proc, top: currentTop }} />
          );
        })}

        <CriticalSectionZone
          activeProc={activeInBayProc}
          singleBay={true}
          busPacket0={busPacket}
          sharedBalance={sharedBalance}
          expectedBalance={expectedBalance}
          drift={0}
          vaultPulse={vaultPulse}
          alarmActive={false}
          title="Shared Vault"
          variableName="Balance"
          csLabel="Critical Section"
          bay0Label={activeInBayProc ? `Central Bay: P${activeInBayProc.id}` : 'Central Bay (Available)'}
        />

        <div className={`mutex-queue-bar ${waitQueue.length > 0 ? 'has-items' : ''}`} role="region" aria-label="Mutex Wait Queue">
          <header className="mutex-queue-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="queue-next-indicator">WAIT QUEUE</span>
            <span
              className="queue-badge"
              style={{
                background: waitQueue.length > 0 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(52, 211, 153, 0.2)',
                color: waitQueue.length > 0 ? '#fda4af' : '#a7f3d0',
                border: `1px solid ${waitQueue.length > 0 ? 'rgba(244, 63, 94, 0.4)' : 'rgba(52, 211, 153, 0.4)'}`,
              }}
            >
              {waitQueue.length}/5
            </span>
          </header>

          <div className="mutex-queue-list" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 2px' }}>
            {waitQueue.length === 0 ? (
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Empty
              </span>
            ) : (
              <>
                {visualFifoOrder.map((id, idx) => {
                  const p = procs.find((proc) => proc.id === id) || { id, color: THREAD_COLORS[id % THREAD_COLORS.length] };
                  const isHead = id === waitQueue[0];
                  const procColor = p.color || THREAD_COLORS[id % THREAD_COLORS.length];

                  return (
                    <div key={`queue-node-${id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        className={`queue-slot-badge ${isHead ? 'head-slot' : ''}`}
                        style={{
                          '--chip-border': procColor,
                          '--chip-color': procColor,
                          '--chip-bg': `${procColor}18`,
                          '--chip-glow': `${procColor}40`,
                          borderColor: isHead ? procColor : `${procColor}80`,
                          background: isHead ? `${procColor}24` : `${procColor}14`,
                          color: procColor,
                          boxShadow: isHead ? `0 0 16px ${procColor}55, inset 0 0 8px ${procColor}25` : `0 2px 8px rgba(0, 0, 0, 0.45), 0 0 8px ${procColor}25`,
                        }}
                      >
                        <span style={{ fontWeight: 800, fontSize: '0.86rem', color: procColor }}>P{id}</span>
                        {isHead && (
                          <span
                            style={{
                              fontSize: '0.66rem',
                              color: procColor,
                              fontWeight: 800,
                              background: `${procColor}30`,
                              padding: '1px 5px',
                              borderRadius: '4px',
                              border: `1px solid ${procColor}80`,
                            }}
                          >
                            NEXT
                          </span>
                        )}
                      </div>

                      {idx < visualFifoOrder.length - 1 && (
                        <span style={{ color: '#64748b', fontWeight: 700 }}>&ndash;</span>
                      )}
                    </div>
                  );
                })}

                <span className="queue-connector-arrow">&rarr;</span>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="sim-bottom-panel">
        <form className="controls-panel glass-panel" onSubmit={(e) => e.preventDefault()}>
          <header className="control-section-header">Mutex Controls</header>

          <div className="control-group">
            <label htmlFor="track-count-select">Active Tracks (Max 5)</label>
            <div className="dark-select-wrapper">
              <select
                id="track-count-select"
                className="dark-select-dropdown"
                value={trackCount}
                onChange={(e) => handleTrackCountChange(Number(e.target.value))}
              >
                {[2, 3, 4, 5].map((count) => (
                  <option key={`opt-${count}`} value={count}>
                    {count} Active Tracks
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-group">
            <label>Execution Mode</label>
            <div className="segmented-control" role="group" aria-label="Execution Mode">
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

          {mode === 'manual' ? (
            <div className="control-group">
              <label>Manual Process Step</label>
              <div className="thread-step-grid">
                {procs.map((p) => {
                  const isDisabled = p.status === 'spawning' || p.status === 'terminated' || p.fading || isDelayingRef.current;
                  return (
                    <button
                      key={`btn-step-${p.id}`}
                      type="button"
                      className="btn-track"
                      disabled={isDisabled}
                      onClick={() => stepManualThread(p.id)}
                      style={{
                        '--btn-border': p.color,
                        '--btn-color': p.color,
                        '--btn-glow': `${p.color}30`,
                        fontSize: '0.78rem',
                        padding: '6px 8px',
                      }}
                      title={`Step Process P${p.id} (${p.status})`}
                    >
                      Step P{p.id}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="control-group">
              <label htmlFor="sim-speed-slider">Simulation Speed ({speed}x)</label>
              <div className="slider-wrapper">
                <input
                  id="sim-speed-slider"
                  type="range"
                  className="custom-range-slider"
                  min="0.5"
                  max="2"
                  step="0.5"
                  value={speed}
                  style={{
                    '--fill-percent': `${((speed - 0.5) / (2.0 - 0.5)) * 100}%`,
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
            ↺ Reset Mutex Simulation (₹100)
          </button>
        </form>

        <CodeViewer
          title="mutex_lock.c"
          code={MUTEX_CODE}
          procs={procs}
          maxLine={3}
          ariaLabel="Mutex Lock Algorithm Code Trace"
        />
      </footer>
    </section>
  );
}