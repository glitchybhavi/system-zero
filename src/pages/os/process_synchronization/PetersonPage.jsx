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

const PETERSON_CODE = [
  { line: 1, text: 'flag[i] = true;' },
  { line: 2, text: 'turn = 1 - i;' },
  { line: 3, text: 'while (flag[1-i] && turn == 1-i);' },
  { line: 4, text: 'balance = balance + 10;' },
  { line: 5, text: 'flag[i] = false;' },
];

export default function PetersonPage() {
  const [mode, setMode] = useState('manual');
  const [speed, setSpeed] = useState(1);
  const [sharedBalance, setSharedBalance] = useState(INITIAL_BALANCE);
  const [completedCount, setCompletedCount] = useState(0);
  const [vaultPulse, setVaultPulse] = useState(false);
  const [lostUpdateCount, setLostUpdateCount] = useState(0);

  const [alarmActive, setAlarmActive] = useState(false);
  const alarmTimerRef = useRef(null);

  const nextPidRef = useRef(2);

  const flagRef = useRef([false, false]);
  const turnRef = useRef(0);
  const [flagDisplay, setFlagDisplay] = useState([false, false]);
  const [turnDisplay, setTurnDisplay] = useState(0);

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

  const syncFlagDisplay = () => setFlagDisplay([...flagRef.current]);
  const syncTurnDisplay = () => setTurnDisplay(turnRef.current);

  const stepTrack = useCallback((trackId) => {
    const isTrack0 = trackId === 0;
    const currentProc = isTrack0 ? proc0 : proc1;
    const setProc = isTrack0 ? setProc0 : setProc1;
    const setProcExiting = isTrack0 ? setProc0Exiting : setProc1Exiting;
    const setOtherProc = isTrack0 ? setProc1 : setProc0;
    const animTimer = isTrack0 ? animTimer0 : animTimer1;
    const setBusPacket = isTrack0 ? setBusPacket0 : setBusPacket1;

    if (currentProc.line >= 6 || currentProc.status === 'spawning' || currentProc.fading) {
      return;
    }

    if (currentProc.line === 5) {
      flagRef.current[trackId] = false;
      syncFlagDisplay();

      setOtherProc((other) => {
        if (other && other.status === 'waiting') {
          return { ...other, status: 'ready' };
        }
        return other;
      });

      const exitingProc = { ...currentProc, line: 6, status: 'terminated' };
      setProcExiting(exitingProc);
      setTimeout(() => setProcExiting(null), 1600);

      const newId = nextPidRef.current++;
      setTimeout(() => {
        setProc((p) => (p && p.id === newId ? { ...p, status: 'ready' } : p));
      }, 1300);

      setProc({
        id: newId,
        track: trackId,
        line: 1,
        local: null,
        status: 'spawning',
        color: generateProcessColor(),
        fading: false,
      });
      return;
    }

    if (currentProc.line === 1) {
      flagRef.current[trackId] = true;
      syncFlagDisplay();

      setProc({
        ...currentProc,
        line: 2,
        status: 'ready',
      });
    } else if (currentProc.line === 2) {
      turnRef.current = 1 - trackId;
      syncTurnDisplay();

      setOtherProc((other) => {
        if (other && other.status === 'waiting') {
          return { ...other, status: 'ready' };
        }
        return other;
      });

      setProc({
        ...currentProc,
        line: 3,
        status: 'ready',
      });
    } else if (currentProc.line === 3) {
      const otherWants = flagRef.current[1 - trackId];
      const isOthersTurn = turnRef.current === (1 - trackId);

      if (otherWants && isOthersTurn) {
        setProc({
          ...currentProc,
          status: 'waiting',
        });
        return;
      }

      setProc({
        ...currentProc,
        line: 4,
        status: 'in-bay',
      });
    } else if (currentProc.line === 4) {
      const writeVal = sharedBalance + INCREMENT_VALUE;

      setProc({
        ...currentProc,
        line: 5,
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
    flagRef.current = [false, false];
    turnRef.current = 0;
    setFlagDisplay([false, false]);
    setTurnDisplay(0);
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
      const p0CanStep = proc0.line < 6 && !proc0.fading && proc0.status !== 'spawning';
      const p1CanStep = proc1.line < 6 && !proc1.fading && proc1.status !== 'spawning';

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

  const gate0Locked = flagDisplay[0] && flagDisplay[1] && turnDisplay === 1;
  const gate1Locked = flagDisplay[0] && flagDisplay[1] && turnDisplay === 0;
  const isGateLocked = gate0Locked || gate1Locked || proc0.status === 'in-bay' || proc1.status === 'in-bay';

  const activeInBay = proc0.status === 'in-bay' ? proc0 : proc1.status === 'in-bay' ? proc1 : null;
  const activePacket = busPacket0.type ? busPacket0 : busPacket1;

  const staticTracks = [
    { id: 0, top: '34%', locked: gate0Locked },
    { id: 1, top: '66%', locked: gate1Locked },
  ];

  return (
    <section className="sim-container" aria-label="Peterson's Algorithm Interactive Visualizer">
      <div className="sim-arena" role="region" aria-label="Conveyor Stage Arena">
        <aside
          aria-label="Shared Synchronization Variables"
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(20,20,25,0.95)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 20,
            minWidth: '160px',
          }}
        >
          <header
            style={{
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              marginBottom: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              paddingBottom: '8px',
            }}
          >
            Shared Variables
          </header>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
            <span style={{ color: '#ff8fa3', fontFamily: 'monospace', fontSize: '0.85rem' }}>flag[0]</span>
            <output
              style={{
                color: flagDisplay[0] ? '#4ade80' : '#94a3b8',
                fontWeight: 700,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {flagDisplay[0] ? 'true' : 'false'}
            </output>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '16px' }}>
            <span style={{ color: '#6ee7b7', fontFamily: 'monospace', fontSize: '0.85rem' }}>flag[1]</span>
            <output
              style={{
                color: flagDisplay[1] ? '#4ade80' : '#94a3b8',
                fontWeight: 700,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {flagDisplay[1] ? 'true' : 'false'}
            </output>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              gap: '16px',
            }}
          >
            <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>turn</span>
            <output style={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem' }}>
              {turnDisplay}
            </output>
          </div>
        </aside>

        <ArenaTrackLayer gate0Locked={isGateLocked} tracks={staticTracks} singleBay={true} />

        {proc0Exiting && (
          <ProcessPod key={`proc-exit-${proc0Exiting.id}`} proc={{ ...proc0Exiting, top: '50%' }} isExiting={true} />
        )}
        <ProcessPod
          key={`proc-${proc0.id}`}
          proc={{ ...proc0, top: proc0.status === 'in-bay' ? '50%' : '34%' }}
        />

        {proc1Exiting && (
          <ProcessPod key={`proc-exit-${proc1Exiting.id}`} proc={{ ...proc1Exiting, top: '50%' }} isExiting={true} />
        )}
        <ProcessPod
          key={`proc-${proc1.id}`}
          proc={{ ...proc1, top: proc1.status === 'in-bay' ? '50%' : '66%' }}
        />

        <CriticalSectionZone
          activeProc={activeInBay}
          singleBay={true}
          busPacket0={activePacket}
          sharedBalance={sharedBalance}
          expectedBalance={expectedBalance}
          drift={drift}
          vaultPulse={vaultPulse}
          alarmActive={alarmActive}
          title="Shared Vault"
          variableName="Balance"
          csLabel="Critical Section"
          bay0Label={
            activeInBay
              ? `Central Bay: P${activeInBay.id} (Executing)`
              : 'Central Bay (Available)'
          }
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
          maxLine0={6}
          maxLine1={6}
          onReset={resetSimulation}
        />

        <CodeViewer
          title="peterson.c"
          code={PETERSON_CODE}
          proc0={proc0}
          proc1={proc1}
          maxLine={5}
          ariaLabel="Peterson's Algorithm Source Code Trace"
        />
      </footer>
    </section>
  );
}
