// This Page showcases visualization of Race Condition or Critical Section Problem. 
// A balance vault has been set as a critical section and user can see race condition occuring in both manual and auto mode. 
// Expected and Loss currencies of all transactions are shown. User can even visualize live code while simulation is going on

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

const CODE_SNIPPET = [
  { line: 1, text: 'void deposit() {', comment: '// Thread entry' },
  { line: 2, text: '  int local = balance;', comment: '// Read shared balance (Load)' },
  { line: 3, text: '  local = local + 10;', comment: '// Perform local operation' },
  { line: 4, text: '  balance = local;', comment: '// Write back to shared memory (Shared Vault)' },
  { line: 5, text: '}', comment: '// Thread exit' },
];

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
      </footer>
    </section>
  );
}