import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function CpuCoreVisualizer() {
  const { state, blockProcess, killProcess } = useProcessSandbox();
  const { runningPid, processes, settings } = state;

  const runningProc = processes.find((p) => p.pid === runningPid);

  const burstProgress = runningProc
    ? Math.max(0, Math.min(100, Math.round(((runningProc.burstTime - runningProc.remainingTime) / runningProc.burstTime) * 100)))
    : 0;

  const quantumProgress = runningProc && settings.algorithm === 'RR'
    ? Math.min(100, Math.round(((runningProc.quantumUsed || 0) / settings.timeQuantum) * 100))
    : 0;

  return (
    <div className="sandbox-panel cpu-core-card" aria-labelledby="cpu-core-title">
      <div className="panel-header">
        <div>
          <h3 id="cpu-core-title" className="panel-title">CPU Running Slot</h3>
          <p className="panel-caption">The one process currently executing instructions on the hardware processor.</p>
        </div>
      </div>

      {runningProc ? (
        <div className="running-process-display">
          <div className="running-header">
            <div className="running-pid-badge font-mono">
              <span className="live-dot" />
              <span>RUNNING: PID {runningProc.pid}</span>
            </div>
            <span className="running-name font-heading">{runningProc.name}</span>
          </div>

          {/* Progress bar */}
          <div className="cpu-progress-section">
            <div className="progress-labels font-mono">
              <span>Execution Progress</span>
              <span>{burstProgress}% ({runningProc.remainingTime}ms remaining)</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${burstProgress}%` }}
              />
            </div>
          </div>

          {/* Quantum gauge for Round Robin */}
          {settings.algorithm === 'RR' && (
            <div className="cpu-quantum-gauge font-mono">
              <div className="quantum-label-row">
                <span>Time Quantum ({settings.timeQuantum}ms slice)</span>
                <span>{runningProc.quantumUsed || 0}ms / {settings.timeQuantum}ms</span>
              </div>
              <div className="quantum-bar-track">
                <div
                  className="quantum-bar-fill"
                  style={{ width: `${quantumProgress}%` }}
                />
              </div>
              <span className="quantum-caption">When this bar fills up, the CPU preempts and swaps to the next process.</span>
            </div>
          )}

          {/* Actions on Running Process */}
          <div className="running-actions-row">
            <div className="action-btn-with-caption">
              <button
                type="button"
                className="running-action-btn block-btn font-mono"
                onClick={() => blockProcess(runningProc.pid, 'Simulated Disk I/O')}
              >
                ⏳ Block I/O
              </button>
              <span className="action-caption">Pretends it's waiting on disk/network</span>
            </div>

            <div className="action-btn-with-caption">
              <button
                type="button"
                className="running-action-btn kill-btn font-mono"
                onClick={() => killProcess(runningProc.pid)}
              >
                ✕ Kill
              </button>
              <span className="action-caption">Ends this process immediately</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="cpu-idle-display font-mono">
          <div className="idle-indicator" />
          <span className="idle-title">CPU IDLE — NO ACTIVE PROCESS</span>
          <span className="idle-desc">Click "▶ Play" above or spawn a process to start execution.</span>
        </div>
      )}
    </div>
  );
}
