import React, { useState } from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';
import { PROCESS_STATES } from '../engine/schedulerEngine';

export default function PcbCard({ process, isSelected }) {
  const { state: sandboxState, killProcess, blockProcess, unblockProcess, selectPid } = useProcessSandbox();
  const [showDetails, setShowDetails] = useState(false);

  const {
    pid,
    name,
    state,
    remainingTime,
    burstTime,
    pc,
    registers,
    memory,
  } = process;

  const isSwitching = sandboxState.cpuState.isContextSwitching;
  const isIncoming = isSwitching && sandboxState.cpuState.switchToPid === pid;
  const isOutgoing = isSwitching && sandboxState.cpuState.switchFromPid === pid;

  const getStateBadgeClass = () => {
    switch (state) {
      case PROCESS_STATES.RUNNING:
        return 'badge-state-running';
      case PROCESS_STATES.READY:
        return 'badge-state-ready';
      case PROCESS_STATES.WAITING:
        return 'badge-state-waiting';
      case PROCESS_STATES.TERMINATED:
      default:
        return 'badge-state-terminated';
    }
  };

  const getStateExplanation = () => {
    switch (state) {
      case PROCESS_STATES.RUNNING:
        return 'Currently executing instructions on CPU Core #0';
      case PROCESS_STATES.READY:
        return 'In Ready Queue, waiting for its next CPU turn';
      case PROCESS_STATES.WAITING:
        return 'Paused, waiting for simulated disk/network I/O';
      case PROCESS_STATES.TERMINATED:
        return 'Finished or killed — memory freed';
      default:
        return state;
    }
  };

  return (
    <div
      className={`pcb-card ${isSelected ? 'is-selected' : ''} ${isIncoming ? 'is-context-switching-in' : ''} ${isOutgoing ? 'is-context-switching-out' : ''}`}
      onClick={() => selectPid(pid)}
      tabIndex={0}
      role="region"
      aria-label={`Process PID ${pid} ${name}`}
      onKeyDown={(e) => e.key === 'Enter' && selectPid(pid)}
    >
      {/* Top Main Row */}
      <div className="pcb-header">
        <div className="pcb-title-group">
          <span className="pcb-pid-badge font-mono">PID {pid}</span>
          <h4 className="pcb-name" title={name}>{name}</h4>
        </div>
        <div className="pcb-status-wrap">
          <span className={`badge-state ${getStateBadgeClass()}`}>
            {state}
          </span>
        </div>
      </div>

      <p className="pcb-state-caption font-mono">{getStateExplanation()}</p>

      {/* Progress Bar */}
      {state !== PROCESS_STATES.TERMINATED && (
        <div className="pcb-progress-box font-mono">
          <div className="pcb-progress-labels">
            <span>Work Remaining:</span>
            <span>{remainingTime}ms / {burstTime}ms</span>
          </div>
          <div className="pcb-progress-track">
            <div
              className="pcb-progress-fill"
              style={{
                width: `${Math.round(((burstTime - remainingTime) / burstTime) * 100)}%`,
                backgroundColor: state === PROCESS_STATES.RUNNING ? 'var(--color-state-running)' : 'var(--color-state-ready)',
              }}
            />
          </div>
        </div>
      )}

      {/* Actions Row */}
      <div className="pcb-actions-row">
        {state !== PROCESS_STATES.TERMINATED ? (
          <>
            {state === PROCESS_STATES.WAITING ? (
              <div className="action-btn-with-caption">
                <button
                  type="button"
                  className="pcb-btn wake-btn font-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    unblockProcess(pid);
                  }}
                >
                  ⚡ Wake (I/O Done)
                </button>
                <span className="action-caption">Moves back to Ready Queue</span>
              </div>
            ) : (
              <div className="action-btn-with-caption">
                <button
                  type="button"
                  className="pcb-btn block-btn font-mono"
                  onClick={(e) => {
                    e.stopPropagation();
                    blockProcess(pid, 'Simulated Disk I/O');
                  }}
                >
                  ⏳ Block I/O
                </button>
                <span className="action-caption">Pretend it's waiting on disk/network</span>
              </div>
            )}

            <div className="action-btn-with-caption">
              <button
                type="button"
                className="pcb-btn kill-btn font-mono"
                onClick={(e) => {
                  e.stopPropagation();
                  killProcess(pid);
                }}
              >
                ✕ Kill
              </button>
              <span className="action-caption">Ends this process immediately</span>
            </div>
          </>
        ) : (
          <span className="terminated-label font-mono">Process Terminated • Slot Freed</span>
        )}
      </div>

      {/* Collapsible Technical Details (Closed by default) */}
      <div className="pcb-tech-toggle-section">
        <button
          type="button"
          className="tech-toggle-btn font-mono"
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
        >
          {showDetails ? 'Hide technical details ▴' : 'Show technical details (PC, registers, memory) ▾'}
        </button>

        {showDetails && (
          <div className="pcb-tech-details-drawer font-mono">
            <div className="tech-item">
              <span className="tech-label">Program Counter (PC):</span>
              <span className="tech-val highlight-cyan">{pc}</span>
              <span className="tech-sub-caption">Memory address of next instruction</span>
            </div>

            <div className="tech-item">
              <span className="tech-label">Private Memory Range:</span>
              <span className="tech-val">{memory.readableSpan}</span>
              <span className="tech-sub-caption">Isolated virtual memory space (256 KB)</span>
            </div>

            <div className="tech-registers-grid">
              <span className="tech-label">CPU Registers (Saved in PCB):</span>
              <div className="reg-mini-boxes">
                <span>EAX: {registers.EAX}</span>
                <span>EBX: {registers.EBX}</span>
                <span>ESP: {registers.ESP}</span>
                <span>EBP: {registers.EBP}</span>
              </div>
              <span className="tech-sub-caption">Values restored to CPU hardware when this process runs</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
