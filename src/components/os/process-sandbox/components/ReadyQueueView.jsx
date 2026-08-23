import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function ReadyQueueView() {
  const { state, killProcess, blockProcess, selectPid } = useProcessSandbox();
  const { readyQueue, processes, settings, runningPid, selectedPid } = state;
  const limit = settings.readyQueueLimit;
  const isFull = readyQueue.length >= limit;

  const processMap = new Map(processes.map((p) => [p.pid, p]));

  return (
    <div className={`sandbox-panel queue-panel ${isFull ? 'queue-locked' : ''}`} aria-labelledby="ready-queue-title">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="panel-badge-code">OS_SCHED</span>
          <h3 id="ready-queue-title" className="panel-title">Ready Queue</h3>
        </div>
        <div className="queue-capacity-pill font-mono">
          <span className={`capacity-indicator ${isFull ? 'is-full' : ''}`} />
          <span>{readyQueue.length} / {limit} Slots</span>
        </div>
      </div>

      <div className="queue-slots-container" role="region" aria-label="Ready Queue Slots">
        {Array.from({ length: limit }).map((_, index) => {
          const pid = readyQueue[index];
          const proc = pid ? processMap.get(pid) : null;
          const isSelected = proc && proc.pid === selectedPid;
          const isHead = index === 0;

          if (!proc) {
            return (
              <div key={`empty-slot-${index}`} className="queue-slot empty-slot">
                <span className="slot-index font-mono">Slot {index + 1}</span>
                <span className="slot-empty-label font-mono">-- [ AVAILABLE ] --</span>
              </div>
            );
          }

          return (
            <div
              key={`ready-${proc.pid}`}
              className={`queue-slot filled-slot ${isSelected ? 'is-selected' : ''} ${isHead ? 'is-head' : ''}`}
              onClick={() => selectPid(proc.pid)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === 'Enter' && selectPid(proc.pid)}
              aria-label={`Ready Process PID ${proc.pid}, ${proc.name}`}
            >
              <div className="slot-header">
                <div className="slot-pid-wrap">
                  {isHead && <span className="head-dispatch-badge font-mono">NEXT DISPATCH</span>}
                  <span className="slot-pid font-mono">PID {proc.pid}</span>
                </div>
                <span className="slot-priority font-mono">P{proc.priority}</span>
              </div>

              <div className="slot-body">
                <span className="slot-name">{proc.name}</span>
                <div className="slot-meta-row font-mono">
                  <span>Rem: {proc.remainingTime}ms</span>
                  <span>PC: {proc.pc.slice(0, 8)}</span>
                </div>
              </div>

              <div className="slot-actions">
                <button
                  type="button"
                  className="slot-action-btn block-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    blockProcess(proc.pid, 'Manual Disk I/O');
                  }}
                  title="Simulate I/O Wait (move to Waiting state)"
                >
                  ⏳ Block I/O
                </button>
                <button
                  type="button"
                  className="slot-action-btn kill-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    killProcess(proc.pid);
                  }}
                  title="Send SIGKILL (Terminate & free queue slot)"
                >
                  ✕ Kill
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
