import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';
import { PROCESS_STATES } from '../engine/schedulerEngine';

export default function StateDiagramOverlay() {
  const { state } = useProcessSandbox();
  const { processes, runningPid, selectedPid } = state;

  const targetProc = processes.find((p) => p.pid === selectedPid) || processes.find((p) => p.pid === runningPid);
  const activeState = targetProc
    ? targetProc.state
    : (runningPid ? PROCESS_STATES.RUNNING : 'NONE');

  const readyCount = processes.filter((p) => p.state === PROCESS_STATES.READY).length;
  const runningCount = processes.filter((p) => p.state === PROCESS_STATES.RUNNING).length;
  const waitCount = processes.filter((p) => p.state === PROCESS_STATES.WAITING).length;
  const termCount = processes.filter((p) => p.state === PROCESS_STATES.TERMINATED).length;

  return (
    <div className="sandbox-panel state-diagram-panel" aria-labelledby="state-diag-title">
      <div className="panel-header">
        <div>
          <h3 id="state-diag-title" className="panel-title">2. State Transition Diagram</h3>
          <p className="panel-caption">Live map of where each process is right now in its lifecycle.</p>
        </div>
        <div className="active-tracking-pill font-mono">
          <span>Highlighting: </span>
          <strong>{targetProc ? `PID ${targetProc.pid} (${targetProc.name})` : 'None selected'}</strong>
        </div>
      </div>

      <div className="state-diagram-wrapper">
        <div className="state-nodes-flow">
          {/* NEW */}
          <div className={`state-node node-new ${activeState === 'NEW' ? 'is-active-node' : ''}`}>
            <span className="node-badge font-mono">NEW</span>
            <span className="node-sub font-mono">Being created</span>
          </div>

          <div className="state-arrow-wrap">
            <span className="state-arrow">➔</span>
            <span className="arrow-sub font-mono">Admitted</span>
          </div>

          {/* READY */}
          <div className={`state-node node-ready ${activeState === 'READY' ? 'is-active-node' : ''}`}>
            <span className="node-badge font-mono">READY ({readyCount})</span>
            <span className="node-sub font-mono">Waiting in queue</span>
          </div>

          <div className="state-arrow-wrap">
            <span className="state-arrow">➔</span>
            <span className="arrow-sub font-mono">Scheduler picks</span>
          </div>

          {/* RUNNING */}
          <div className={`state-node node-running ${activeState === 'RUNNING' ? 'is-active-node' : ''}`}>
            <div className="node-glow-ring" />
            <span className="node-badge font-mono">RUNNING ({runningCount})</span>
            <span className="node-sub font-mono">On CPU Core #0</span>
          </div>

          <div className="state-arrow-wrap">
            <span className="state-arrow">➔</span>
            <span className="arrow-sub font-mono">Done or Killed</span>
          </div>

          {/* TERMINATED */}
          <div className={`state-node node-term ${activeState === 'TERMINATED' ? 'is-active-node' : ''}`}>
            <span className="node-badge font-mono">TERMINATED ({termCount})</span>
            <span className="node-sub font-mono">Memory freed</span>
          </div>
        </div>

        {/* Branch Rows: Waiting & Preemption */}
        <div className="state-branches-row">
          <div className="branch-card preemption-branch font-mono">
            <span className="branch-icon">⤶</span>
            <span>Time slice expires: <strong>Running ➔ Ready</strong></span>
          </div>

          {/* WAITING NODE */}
          <div className={`state-node node-waiting ${activeState === 'WAITING' ? 'is-active-node' : ''}`}>
            <span className="node-badge font-mono">WAITING ({waitCount})</span>
            <span className="node-sub font-mono">Blocked on I/O</span>
          </div>

          <div className="branch-card io-branch font-mono">
            <span>I/O finishes: <strong>Waiting ➔ Ready</strong></span>
            <span className="branch-icon">⤷</span>
          </div>
        </div>
      </div>
    </div>
  );
}
