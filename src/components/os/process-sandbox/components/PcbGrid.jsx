import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';
import PcbCard from './PcbCard';

export default function PcbGrid() {
  const { state } = useProcessSandbox();
  const { processes, selectedPid, readyQueue, settings } = state;

  return (
    <div className="sandbox-panel pcb-grid-panel" aria-labelledby="process-list-title">
      <div className="panel-header">
        <div>
          <h3 id="process-list-title" className="panel-title">Process List (PCB Table)</h3>
          <p className="panel-caption">Every process the OS is currently tracking in memory.</p>
        </div>
        <div className="queue-count-badge font-mono">
          <span>Ready Queue: {readyQueue.length} / {settings.readyQueueLimit}</span>
        </div>
      </div>

      {/* PCB Cards Grid */}
      {processes.length === 0 ? (
        <div className="pcb-empty-state font-mono">
          <span>No processes in memory. Spawn one above to get started.</span>
        </div>
      ) : (
        <div className="pcb-cards-grid">
          {processes.map((proc) => (
            <PcbCard
              key={proc.pid}
              process={proc}
              isSelected={proc.pid === selectedPid}
            />
          ))}
        </div>
      )}
    </div>
  );
}
