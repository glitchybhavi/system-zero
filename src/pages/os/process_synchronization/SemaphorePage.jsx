import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArenaTrackLayer,
  ProcessPod,
  CriticalSectionZone,
  CodeViewer,
  INITIAL_BALANCE,
  INCREMENT_VALUE,
} from '../../../components/os/process_synchronization';

const SEMAPHORE_CODE = [
  { line: 1, text: 'wait(S);' },
  { line: 2, text: 'balance = balance + 10;' },
  { line: 3, text: 'signal(S);' },
];

const THREAD_COLORS = [
  '#ff8fa3', '#6ee7b7', '#38bdf8', '#fbbf24', '#c084fc',
  '#f472b6', '#34d399', '#60a5fa', '#a78bfa', '#f87171',
  '#2dd4bf', '#818cf8', '#fb923c', '#4ade80', '#e879f9',
  '#38bdf8', '#facc15', '#a3e635', '#f43f5e', '#06b6d4',
];

const BAY_TOPS = ['22%', '50%', '78%'];
const TOTAL_BAYS = 3;

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
  const targetId = Math.floor(Math.random() * 10) + 6;
  map[targetId] = Math.floor(Math.random() * 4) + 2;

  for (let id = 6; id <= 15; id++) {
    if (id !== targetId && Math.random() < 0.25) {
      map[id] = Math.floor(Math.random() * 4) + 2;
    }
  }
  return map;
};

export default function SemaphorePage() {
  const [trackCount, setTrackCount] = useState(4);
  const [mode, setMode] = useState('manual');
  const [speed, setSpeed] = useState(1);
  const [sharedBalance, setSharedBalance] = useState(INITIAL_BALANCE);
  const [completedCount, setCompletedCount] = useState(0);
  const [vaultPulse, setVaultPulse] = useState(false);

  const [semCount, setSemCount] = useState(TOTAL_BAYS);
  const [bayOwners, setBayOwners] = useState([null, null, null]);
  const [waitQueue, setWaitQueue] = useState([]);
  const [sabotageMap, setSabotageMap] = useState(() => generateSabotageMap());
  const [activeDelay, setActiveDelay] = useState(null);

  const [procs, setProcs] = useState(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      track: i,
      laneTop: calculateTrackTop(i, 4),
      bayIndex: null,
      line: 1,
      local: null,
      status: 'ready',
      color: THREAD_COLORS[i % THREAD_COLORS.length],
      fading: false,
      stopwatch: null,
    }));
  });

  const [exitingProcs, setExitingProcs] = useState([]);
  const [busPackets, setBusPackets] = useState([
    { type: null, id: 0, color: '', value: null },
    { type: null, id: 0, color: '', value: null },
    { type: null, id: 0, color: '', value: null },
  ]);

  const nextPidRef = useRef(4);
  const semCountRef = useRef(TOTAL_BAYS);
  const bayOwnersRef = useRef([null, null, null]);
  const waitQueueRef = useRef([]);
  const procsRef = useRef(procs);
  const sharedBalanceRef = useRef(sharedBalance);
  const sabotageMapRef = useRef(sabotageMap);
  const delayTimersRef = useRef({});

  semCountRef.current = semCount;
  bayOwnersRef.current = bayOwners;
  waitQueueRef.current = waitQueue;
  procsRef.current = procs;
  sharedBalanceRef.current = sharedBalance;
  sabotageMapRef.current = sabotageMap;

  const initSimulation = useCallback((laneCount) => {
    Object.values(delayTimersRef.current).forEach((timerId) => clearInterval(timerId));
    delayTimersRef.current = {};

    const newMap = generateSabotageMap();
    setSabotageMap(newMap);
    sabotageMapRef.current = newMap;
    setActiveDelay(null);

    nextPidRef.current = laneCount;
    semCountRef.current = TOTAL_BAYS;
    bayOwnersRef.current = [null, null, null];
    waitQueueRef.current = [];

    setSemCount(TOTAL_BAYS);
    setBayOwners([null, null, null]);
    setWaitQueue([]);
    setSharedBalance(INITIAL_BALANCE);
    setCompletedCount(0);
    setVaultPulse(false);
    setBusPackets([
      { type: null, id: 0, color: '', value: null },
      { type: null, id: 0, color: '', value: null },
      { type: null, id: 0, color: '', value: null },
    ]);
    setExitingProcs([]);

    const initial = Array.from({ length: laneCount }, (_, i) => ({
      id: i,
      track: i,
      laneTop: calculateTrackTop(i, laneCount),
      bayIndex: null,
      line: 1,
      local: null,
      status: 'ready',
      color: THREAD_COLORS[i % THREAD_COLORS.length],
      fading: false,
      stopwatch: null,
    }));

    setProcs(initial);
  }, []);

  const handleTrackCountChange = (count) => {
    if (count === trackCount) return;
    setTrackCount(count);
    initSimulation(count);
  };

  const advanceSimulation = useCallback(() => {
    const currentProcs = [...procsRef.current];
    const currentBays = [...bayOwnersRef.current];

    const procsAtLine3 = currentProcs.filter(
      (p) => p.status === 'in-bay' && p.line === 3 && p.bayIndex !== null
    );

    if (procsAtLine3.length > 0) {
      procsAtLine3.forEach((exitingProc) => {
        const exitingBayIdx = exitingProc.bayIndex;
        const ownerIndex = currentProcs.findIndex((p) => p.id === exitingProc.id);

        const exitingPod = {
          ...exitingProc,
          line: 4,
          status: 'terminated',
          top: BAY_TOPS[exitingBayIdx],
        };

        setExitingProcs((prev) => [...prev, exitingPod]);
        setTimeout(() => {
          setExitingProcs((prev) => prev.filter((p) => p.id !== exitingPod.id));
        }, 1500);

        setCompletedCount((c) => c + 1);

        const newId = nextPidRef.current++;
        const currentTrackIndex = exitingProc.track;
        const staticLaneTop = calculateTrackTop(currentTrackIndex, trackCount);

        currentProcs[ownerIndex] = {
          id: newId,
          track: currentTrackIndex,
          laneTop: staticLaneTop,
          bayIndex: null,
          line: 1,
          local: null,
          status: 'ready',
          color: THREAD_COLORS[newId % THREAD_COLORS.length],
          fading: false,
          stopwatch: null,
        };

        currentBays[exitingBayIdx] = null;

        const currentQueue = [...waitQueueRef.current];
        if (currentQueue.length > 0) {
          const nextPid = currentQueue.shift();
          waitQueueRef.current = currentQueue;
          setWaitQueue([...currentQueue]);

          const nextProcIdx = currentProcs.findIndex((p) => p.id === nextPid);
          if (nextProcIdx !== -1) {
            currentBays[exitingBayIdx] = nextPid;
            currentProcs[nextProcIdx] = {
              ...currentProcs[nextProcIdx],
              bayIndex: exitingBayIdx,
              line: 2,
              status: 'in-bay',
              statusText: 'EXECUTING',
            };
          }
        } else {
          const newCount = Math.min(TOTAL_BAYS, semCountRef.current + 1);
          semCountRef.current = newCount;
          setSemCount(newCount);
        }
      });

      bayOwnersRef.current = [...currentBays];
      setBayOwners([...currentBays]);
      setProcs([...currentProcs]);
      return;
    }

    const procsAtLine2 = currentProcs.filter(
      (p) => p.status === 'in-bay' && p.line === 2 && p.bayIndex !== null
    );

    if (procsAtLine2.length > 0) {
      let runningBalance = sharedBalanceRef.current;
      let hasWrite = false;

      procsAtLine2.forEach((p) => {
        const delaySeconds = sabotageMapRef.current[p.id];

        if (delaySeconds && !p.delayCompleted) {
          if (!delayTimersRef.current[p.id]) {
            let rem = delaySeconds;
            setActiveDelay({ pid: p.id, bay: p.bayIndex, rem });

            delayTimersRef.current[p.id] = setInterval(() => {
              rem = Math.max(0, +(rem - 0.2).toFixed(1));
              setActiveDelay(rem > 0 ? { pid: p.id, bay: p.bayIndex, rem } : null);

              setProcs((prev) =>
                prev.map((proc) =>
                  proc.id === p.id
                    ? {
                        ...proc,
                        stopwatch: rem > 0 ? `${rem.toFixed(1)}s` : null,
                        statusText: rem > 0 ? `HOLDING BAY (${rem.toFixed(1)}s)` : 'EXECUTING',
                      }
                    : proc
                )
              );

              if (rem <= 0) {
                clearInterval(delayTimersRef.current[p.id]);
                delete delayTimersRef.current[p.id];

                setProcs((prev) =>
                  prev.map((proc) =>
                    proc.id === p.id
                      ? {
                          ...proc,
                          delayCompleted: true,
                          line: 3,
                          local: sharedBalanceRef.current + INCREMENT_VALUE,
                          status: 'in-bay',
                          statusText: 'EXECUTING',
                          stopwatch: null,
                        }
                      : proc
                  )
                );

                const nextVal = sharedBalanceRef.current + INCREMENT_VALUE;
                setSharedBalance(nextVal);
                setVaultPulse(true);
                setTimeout(() => setVaultPulse(false), 500);

                setBusPackets((prevPackets) => {
                  const nextPackets = [...prevPackets];
                  nextPackets[p.bayIndex] = { type: 'store', id: Date.now() + p.bayIndex, color: p.color, value: nextVal };
                  return nextPackets;
                });

                setTimeout(() => {
                  setBusPackets((prevPackets) => {
                    const nextPackets = [...prevPackets];
                    nextPackets[p.bayIndex] = { type: null, id: 0, color: '', value: null };
                    return nextPackets;
                  });
                }, 800);
              }
            }, 200);
          }

          return;
        }

        const pIdx = currentProcs.findIndex((proc) => proc.id === p.id);
        const writeVal = runningBalance + INCREMENT_VALUE;
        runningBalance = writeVal;
        hasWrite = true;

        setBusPackets((prev) => {
          const next = [...prev];
          next[p.bayIndex] = { type: 'store', id: Date.now() + p.bayIndex, color: p.color, value: writeVal };
          return next;
        });

        setTimeout(() => {
          setBusPackets((prev) => {
            const next = [...prev];
            next[p.bayIndex] = { type: null, id: 0, color: '', value: null };
            return next;
          });
        }, 800);

        currentProcs[pIdx] = {
          ...p,
          line: 3,
          local: writeVal,
          status: 'in-bay',
          statusText: 'EXECUTING',
          stopwatch: null,
        };
      });

      if (hasWrite) {
        setSharedBalance(runningBalance);
        setVaultPulse(true);
        setTimeout(() => setVaultPulse(false), 500);
      }

      setProcs([...currentProcs]);
      return;
    }

    const emptyBays = [];
    for (let i = 0; i < TOTAL_BAYS; i++) {
      if (currentBays[i] === null) emptyBays.push(i);
    }

    if (emptyBays.length > 0 && semCountRef.current > 0) {
      const candidates = currentProcs
        .filter((p) => p.status === 'ready' || p.status === 'waiting')
        .sort((a, b) => a.id - b.id);

      if (candidates.length > 0) {
        while (emptyBays.length > 0 && candidates.length > 0 && semCountRef.current > 0) {
          const bayIdx = emptyBays.shift();
          const cand = candidates.shift();
          const pIdx = currentProcs.findIndex((p) => p.id === cand.id);

          currentBays[bayIdx] = cand.id;
          semCountRef.current = Math.max(0, semCountRef.current - 1);

          currentProcs[pIdx] = {
            ...currentProcs[pIdx],
            bayIndex: bayIdx,
            line: 2,
            status: 'in-bay',
            statusText: 'EXECUTING',
          };
        }

        setSemCount(semCountRef.current);
        bayOwnersRef.current = [...currentBays];
        setBayOwners([...currentBays]);

        const remainingBlocked = candidates.map((p) => p.id).slice(0, 5);
        waitQueueRef.current = remainingBlocked;
        setWaitQueue(remainingBlocked);

        candidates.forEach((cand) => {
          const idx = currentProcs.findIndex((p) => p.id === cand.id);
          if (idx !== -1) {
            currentProcs[idx] = {
              ...currentProcs[idx],
              status: 'waiting',
              statusText: 'WAITING',
              line: 1,
            };
          }
        });

        setProcs([...currentProcs]);
      }
    }
  }, [trackCount]);

  const stepProcess = useCallback((processId) => {
    const currentProcs = [...procsRef.current];
    const procIndex = currentProcs.findIndex((p) => p.id === processId);
    if (procIndex === -1) return;

    const currentProc = currentProcs[procIndex];
    if (currentProc.status === 'spawning' || currentProc.fading || currentProc.line >= 4) {
      return;
    }

    if (currentProc.status === 'in-bay') {
      if (currentProc.line === 2) {
        const writeVal = sharedBalanceRef.current + INCREMENT_VALUE;
        setSharedBalance(writeVal);
        setVaultPulse(true);
        setTimeout(() => setVaultPulse(false), 500);

        setBusPackets((prev) => {
          const next = [...prev];
          next[currentProc.bayIndex] = { type: 'store', id: Date.now(), color: currentProc.color, value: writeVal };
          return next;
        });

        setTimeout(() => {
          setBusPackets((prev) => {
            const next = [...prev];
            next[currentProc.bayIndex] = { type: null, id: 0, color: '', value: null };
            return next;
          });
        }, 800);

        currentProcs[procIndex] = {
          ...currentProc,
          line: 3,
          local: writeVal,
          status: 'in-bay',
          statusText: 'EXECUTING',
          stopwatch: null,
        };
        setProcs([...currentProcs]);
        return;
      }

      if (currentProc.line === 3) {
        advanceSimulation();
        return;
      }
    }

    const currentBays = [...bayOwnersRef.current];
    const emptyBayIdx = currentBays.findIndex((owner) => owner === null);

    if (emptyBayIdx !== -1 && semCountRef.current > 0) {
      currentBays[emptyBayIdx] = currentProc.id;
      bayOwnersRef.current = [...currentBays];
      setBayOwners([...currentBays]);

      const newCount = Math.max(0, semCountRef.current - 1);
      semCountRef.current = newCount;
      setSemCount(newCount);

      const newQueue = waitQueueRef.current.filter((id) => id !== currentProc.id);
      waitQueueRef.current = newQueue;
      setWaitQueue(newQueue);

      currentProcs[procIndex] = {
        ...currentProc,
        bayIndex: emptyBayIdx,
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

  const expectedBalance = INITIAL_BALANCE + completedCount * INCREMENT_VALUE;

  const staticTracks = Array.from({ length: trackCount }, (_, i) => ({
    id: i,
    top: calculateTrackTop(i, trackCount),
  }));

  const baysLocked = [
    bayOwners[0] !== null,
    bayOwners[1] !== null,
    bayOwners[2] !== null,
  ];

  const baysData = [
    {
      id: 0,
      proc: procs.find((p) => p.bayIndex === 0 && p.status === 'in-bay') || null,
      label: bayOwners[0] !== null ? `Bay 0: P${bayOwners[0]}` : 'Bay 0 (Available)',
    },
    {
      id: 1,
      proc: procs.find((p) => p.bayIndex === 1 && p.status === 'in-bay') || null,
      label: bayOwners[1] !== null ? `Bay 1: P${bayOwners[1]}` : 'Bay 1 (Available)',
    },
    {
      id: 2,
      proc: procs.find((p) => p.bayIndex === 2 && p.status === 'in-bay') || null,
      label: bayOwners[2] !== null ? `Bay 2: P${bayOwners[2]}` : 'Bay 2 (Available)',
    },
  ];

  const visualFifoOrder = [...waitQueue].reverse();
  const isGateLocked = semCount === 0;

  return (
    <main className="sim-container" aria-label="Counting Semaphore Interactive Visualizer">
      <section className="sim-arena" aria-label="Counting Semaphore Execution Arena">
        <aside className="mutex-hud-panel" aria-label="Semaphore State HUD">
          <header className="mutex-hud-header">
            <span>Semaphore (S)</span>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: semCount > 0 ? '#34d399' : '#f87171',
                boxShadow: semCount > 0
                  ? '0 0 8px rgba(52, 211, 153, 0.8)'
                  : '0 0 8px rgba(248, 113, 113, 0.8)',
              }}
            />
          </header>

          <div
            style={{
              textAlign: 'center',
              padding: '6px 0 10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                fontSize: '2.6rem',
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                lineHeight: 1,
                color: semCount > 0 ? '#34d399' : '#f87171',
                textShadow: semCount > 0
                  ? '0 0 16px rgba(52, 211, 153, 0.45)'
                  : '0 0 16px rgba(248, 113, 113, 0.45)',
              }}
            >
              S = {semCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
              {semCount} of 3 Bays Free
            </span>
          </div>

          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Gate</span>
            <output style={{ color: !isGateLocked ? '#34d399' : '#f87171', fontWeight: 700 }}>
              {!isGateLocked ? 'UNLOCKED' : 'LOCKED'}
            </output>
          </div>

          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Bay 0</span>
            <output style={{ color: bayOwners[0] !== null ? procs.find((p) => p.id === bayOwners[0])?.color || '#38bdf8' : '#64748b', fontWeight: 700 }}>
              {bayOwners[0] !== null ? `P${bayOwners[0]}` : 'Open'}
            </output>
          </div>

          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Bay 1</span>
            <output style={{ color: bayOwners[1] !== null ? procs.find((p) => p.id === bayOwners[1])?.color || '#38bdf8' : '#64748b', fontWeight: 700 }}>
              {bayOwners[1] !== null ? `P${bayOwners[1]}` : 'Open'}
            </output>
          </div>

          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Bay 2</span>
            <output style={{ color: bayOwners[2] !== null ? procs.find((p) => p.id === bayOwners[2])?.color || '#38bdf8' : '#64748b', fontWeight: 700 }}>
              {bayOwners[2] !== null ? `P${bayOwners[2]}` : 'Open'}
            </output>
          </div>

          <div className="mutex-hud-row">
            <span style={{ color: '#94a3b8' }}>Wait Queue</span>
            <output style={{ color: waitQueue.length > 0 ? '#f87171' : '#34d399', fontWeight: 700 }}>
              {waitQueue.length}/5
            </output>
          </div>

          {activeDelay && (
            <div className="sabotage-hud-badge" style={{ marginTop: '8px', borderColor: 'rgba(251, 191, 36, 0.6)', background: 'rgba(251, 191, 36, 0.15)', color: '#fde68a' }}>
              <span>⚡ Delay: P{activeDelay.pid} (Bay {activeDelay.bay})</span>
              <span>⏱️ {activeDelay.rem.toFixed(1)}s</span>
            </div>
          )}
        </aside>

        <ArenaTrackLayer
          multiBay={3}
          gate0Locked={isGateLocked}
          baysLocked={baysLocked}
          tracks={staticTracks}
        />

        {exitingProcs.map((proc) => (
          <ProcessPod key={`exit-${proc.id}`} proc={proc} isExiting={true} />
        ))}

        {procs.map((proc) => {
          const currentTop = proc.status === 'in-bay' && proc.bayIndex !== null
            ? BAY_TOPS[proc.bayIndex]
            : proc.laneTop;

          return (
            <ProcessPod key={`proc-${proc.id}`} proc={{ ...proc, top: currentTop }} />
          );
        })}

        <CriticalSectionZone
          bays={baysData}
          busPackets={busPackets}
          sharedBalance={sharedBalance}
          expectedBalance={expectedBalance}
          drift={0}
          vaultPulse={vaultPulse}
          alarmActive={false}
          title="Shared Vault"
          variableName="Balance"
          csLabel="Counting Semaphore (N=3 Bays)"
        />

        <section className={`mutex-queue-bar ${waitQueue.length > 0 ? 'has-items' : ''}`} aria-label="Semaphore Wait Queue">
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
        </section>
      </section>

      <footer className="sim-bottom-panel">
        <aside className="controls-panel glass-panel">
          <header className="control-section-header">Semaphore Controls</header>

          <div className="control-group">
            <label htmlFor="track-count-select">Active Tracks (Max 5)</label>
            <div className="dark-select-wrapper">
              <select
                id="track-count-select"
                className="dark-select-dropdown"
                value={trackCount}
                onChange={(e) => handleTrackCountChange(Number(e.target.value))}
              >
                {[3, 4, 5].map((count) => (
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
                  const isDisabled = p.status === 'spawning' || p.status === 'terminated' || p.fading;
                  return (
                    <button
                      key={`btn-step-${p.id}`}
                      type="button"
                      className="btn-track"
                      disabled={isDisabled}
                      onClick={() => stepProcess(p.id)}
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
            ↺ Reset Semaphore Simulation (₹100)
          </button>
        </aside>

        <CodeViewer
          title="counting_semaphore.c"
          code={SEMAPHORE_CODE}
          procs={procs}
          maxLine={3}
          ariaLabel="Counting Semaphore Algorithm Code Trace"
        />
      </footer>
    </main>
  );
}