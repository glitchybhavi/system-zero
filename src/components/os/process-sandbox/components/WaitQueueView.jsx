import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function WaitQueueView() {
  const { state, unblockProcess, killProcess, selectPid } = useProcessSandbox();
  const { waitQueue, processes, selectedPid } = state;
  const processMap = new Map(processes.map((p) => [p.pid, p]));

  return (
    <div className="sandbox-panel wait-queue-panel" aria-labelledby="wait-queue-title">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="panel-badge-code">I/O_WAIT</span>
          <h3 id="wait-queue-title" className="panel-title">I/O Wait Queue</h3>
        </div>
        <span className="wait-count-pill font-mono">{waitQueue.length} Blocked</span>
      </div>

      {waitQueue.length === 0 ? (
        <div className="wait-empty-state font-mono">
          <span>No processes waiting for I/O interrupts.</span>
        </div>
      ) : (
        <div className="wait-items-list" role="list">
          {waitQueue.map((pid) => {
            const proc = processMap.get(pid);
            if (!proc) return null;
            const isSelected = proc.pid === selectedPid;

            return (
              <div
                key={`wait-${proc.pid}`}
                className={`wait-item-card ${isSelected ? 'is-selected' : ''}`}
                onClick={() => selectPid(proc.pid)}
                tabIndex={0}
                role="listitem"
                onKeyDown={(e) => e.key === 'Enter' && selectPid(proc.pid)}
              >
                <div className="wait-item-header">
                  <div className="wait-pid-title">
                    <span className="wait-state-dot" />
                    <span className="font-mono font-bold">PID {proc.pid}</span>
                    <span className="wait-proc-name">{proc.name}</span>
                  </div>
                  <span className="wait-reason-badge font-mono">{proc.waitReason || 'I/O Wait'}</span>
                </div>

                <div className="wait-item-footer">
                  <span className="font-mono text-faint">Remaining: {proc.remainingTime}ms</span>
                  <div className="wait-actions">
                    <button
                      type="button"
                      className="wake-action-btn font-mono"
                      onClick={(e) => {
                        e.stopPropagation();
                        unblockProcess(proc.pid);
                      }}
                      title="Simulate I/O completion interrupt"
                    >
                      ⚡ Complete I/O (Wake)
                    </button>
                    <button
                      type="button"
                      className="kill-action-btn font-mono"
                      onClick={(e) => {
                        e.stopPropagation();
                        killProcess(proc.pid);
                      }}
                      title="Terminate waiting process"
                    >
                      ✕ Kill
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
