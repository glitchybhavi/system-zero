import React from 'react';
import { Link } from 'react-router-dom';
import { useProcessSandbox } from '../state/ProcessSandboxContext';
import { SCHEDULING_ALGORITHMS } from '../engine/schedulerEngine';

export default function ProcessSandboxHeader() {
  const {
    state,
    clock,
    setAlgorithm,
    setTimeQuantum,
    resetSimulation,
  } = useProcessSandbox();

  const { settings, metrics, processes } = state;
  const activeProcs = processes.filter((p) => p.state !== 'TERMINATED');

  return (
    <header className="sandbox-header-bar">
      {/* Title & Brand Row */}
      <div className="header-brand-row">
        <div className="brand-badge-group">
          <div style={{ marginBottom: '8px' }}>
            <Link
              to="/learn/process-management"
              style={{
                fontSize: '0.85rem',
                color: '#38bdf8',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              ← Back to Theory Module
            </Link>
          </div>
          <span className="kernel-pill font-mono">OS SIMULATOR</span>
          <h1 className="sandbox-main-title">Process Management Sandbox</h1>
          <p className="header-description">
            Spawn tasks, watch the kernel scheduler assign CPU time, and resolve resource starvation.
          </p>
        </div>

        {/* Global Stats Summary */}
        <div className="header-stats-strip font-mono">
          <div className="stat-pill">
            <span className="stat-label">Active Processes:</span>
            <span className="stat-val">{activeProcs.length}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Total Context Switches:</span>
            <span className="stat-val highlight-cyan">{metrics.totalContextSwitches}</span>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="sandbox-controls-strip">
        {/* 1. Clock Engine Controls */}
        <div className="control-group clock-controls font-mono">
          <span className="control-group-title">SIMULATION CLOCK</span>
          <div className="clock-btn-row">
            <button
              type="button"
              className={`clock-btn play-pause-btn ${clock.isRunning ? 'is-running' : ''}`}
              onClick={clock.togglePlay}
            >
              {clock.isRunning ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              type="button"
              className="clock-btn step-btn"
              onClick={clock.step}
            >
              ⏭ Step 1 Tick
            </button>

            <div className="speed-pills" role="group" aria-label="Clock Speed">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`speed-pill ${clock.speed === s ? 'is-active' : ''}`}
                  onClick={() => clock.changeSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <span className="control-caption">Controls the simulated CPU clock speed.</span>
        </div>

        {/* 2. Algorithm Selector */}
        <div className="control-group algo-controls font-mono">
          <span className="control-group-title">SCHEDULING ALGORITHM</span>
          <div className="algo-selector-wrap">
            <div className="algo-buttons" role="tablist">
              {Object.values(SCHEDULING_ALGORITHMS).map((algo) => (
                <button
                  key={algo.id}
                  type="button"
                  className={`algo-btn ${settings.algorithm === algo.id ? 'is-active' : ''}`}
                  onClick={() => setAlgorithm(algo.id)}
                  title={algo.description}
                  role="tab"
                  aria-selected={settings.algorithm === algo.id}
                >
                  {algo.shortName}
                </button>
              ))}
            </div>

            {/* Time Quantum Slider if Round Robin */}
            {settings.algorithm === 'RR' && (
              <div className="quantum-slider-group">
                <div className="quantum-label-row">
                  <label htmlFor="quantum-slider">Time Quantum:</label>
                  <span className="quantum-val">{settings.timeQuantum}ms</span>
                </div>
                <input
                  id="quantum-slider"
                  type="range"
                  min="20"
                  max="100"
                  step="10"
                  className="quantum-slider"
                  value={settings.timeQuantum}
                  onChange={(e) => setTimeQuantum(Number(e.target.value))}
                />
              </div>
            )}
          </div>
          <span className="control-caption">
            {settings.algorithm === 'RR'
              ? 'Round Robin: Each process gets a fixed time slice before yielding.'
              : settings.algorithm === 'FCFS'
              ? 'FCFS: First process to arrive runs until completion or I/O.'
              : 'Priority: Highest priority task runs first.'}
          </span>
        </div>

        {/* 3. Reset Button */}
        <div className="control-group actions-controls font-mono">
          <span className="control-group-title">RESET</span>
          <div className="action-buttons-row">
            <button
              type="button"
              className="util-btn reset-btn"
              onClick={resetSimulation}
              title="Reset sandbox to initial kernel state"
            >
              ↺ Reset Simulator
            </button>
          </div>
          <span className="control-caption">Restores original starting state.</span>
        </div>
      </div>
    </header>
  );
}
