import React, { useState } from 'react';
import './StateTransitionDiagram.css';

const TRANSITIONS = [
  {
    id: 'admit',
    label: 'Admitted',
    from: 'NEW',
    to: 'READY',
    desc: 'The OS creates the Process Control Block (PCB) and allocates memory, placing the process in the Ready queue.',
  },
  {
    id: 'dispatch',
    label: 'Scheduler Dispatch',
    from: 'READY',
    to: 'RUNNING',
    desc: 'The CPU scheduler picks the process from the Ready queue and assigns a CPU core to execute its instructions.',
  },
  {
    id: 'interrupt',
    label: 'Interrupt / Time Quantum Expired',
    from: 'RUNNING',
    to: 'READY',
    desc: 'The running process is preempted by a clock timer interrupt (Round Robin quantum end) or higher-priority thread.',
  },
  {
    id: 'io_wait',
    label: 'I/O or Event Wait',
    from: 'RUNNING',
    to: 'WAITING',
    desc: 'Process issues a blocking system call (e.g. disk read, socket wait) and yields CPU until I/O completes.',
  },
  {
    id: 'io_done',
    label: 'I/O or Event Completion',
    from: 'WAITING',
    to: 'READY',
    desc: 'The hardware controller signals completion via interrupt. OS moves process back to Ready queue to await CPU.',
  },
  {
    id: 'exit',
    label: 'Exit / Terminate',
    from: 'RUNNING',
    to: 'TERMINATED',
    desc: 'Process finishes main() execution or calls exit(). OS reclaims resources and waits for parent to harvest status.',
  },
];

const STATES = [
  { id: 'NEW', title: 'New', badge: 'Created', color: '#a855f7' },
  { id: 'READY', title: 'Ready', badge: 'Queued for CPU', color: '#38bdf8' },
  { id: 'RUNNING', title: 'Running', badge: 'On CPU Core', color: '#22c55e' },
  { id: 'WAITING', title: 'Waiting (Blocked)', badge: 'I/O Pending', color: '#f59e0b' },
  { id: 'TERMINATED', title: 'Terminated', badge: 'Exited', color: '#ef4444' },
];

export default function StateTransitionDiagram() {
  const [activeTransition, setActiveTransition] = useState(TRANSITIONS[1]); // Default dispatch

  return (
    <div className="std-container">
      <div className="std-header">
        <h4 className="std-title font-mono">Interactive Process State Transitions</h4>
        <p className="std-subtitle">
          Click any transition button below to trace how kernel events move a process between states:
        </p>
      </div>

      {/* State Node Grid */}
      <div className="std-nodes-grid">
        {STATES.map((st) => {
          const isFrom = activeTransition?.from === st.id;
          const isTo = activeTransition?.to === st.id;
          const isHighlighted = isFrom || isTo;

          return (
            <div
              key={st.id}
              className={`std-node-card ${isHighlighted ? 'is-active' : ''} ${isTo ? 'is-target' : ''}`}
              style={{
                '--state-accent': st.color,
              }}
            >
              <div className="std-node-header">
                <span className="std-node-title">{st.title}</span>
                <span className="std-node-badge">{st.badge}</span>
              </div>
              {isFrom && <div className="std-role-tag role-source">Source State</div>}
              {isTo && <div className="std-role-tag role-target">Target State →</div>}
            </div>
          );
        })}
      </div>

      {/* Event Selector Controls */}
      <div className="std-events-bar">
        <span className="std-events-label font-mono">TRIGGER KERNEL EVENT:</span>
        <div className="std-buttons-flex">
          {TRANSITIONS.map((tr) => (
            <button
              key={tr.id}
              type="button"
              className={`std-event-btn ${activeTransition.id === tr.id ? 'active' : ''}`}
              onClick={() => setActiveTransition(tr)}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Box */}
      {activeTransition && (
        <div className="std-explanation-box">
          <div className="std-exp-badge">
            <span>{activeTransition.from}</span>
            <span className="std-arrow font-mono"> ──[{activeTransition.label}]──► </span>
            <span>{activeTransition.to}</span>
          </div>
          <p className="std-exp-text">{activeTransition.desc}</p>
        </div>
      )}
    </div>
  );
}
