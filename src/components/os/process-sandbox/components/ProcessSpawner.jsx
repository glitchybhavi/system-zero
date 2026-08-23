import React, { useState } from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';
import { TASK_PRESETS } from '../engine/schedulerEngine';

export default function ProcessSpawner() {
  const { state, spawnProcess } = useProcessSandbox();
  const { readyQueue, settings } = state;

  const isStarved = readyQueue.length >= settings.readyQueueLimit;
  const [taskName, setTaskName] = useState('Render promo reel');

  const handleSelectPreset = (preset) => {
    setTaskName(preset.name);
  };

  const handleSpawn = (e) => {
    e.preventDefault();
    if (isStarved) return;

    // Pick preset defaults or standard baseline
    const matched = TASK_PRESETS.find((p) => p.name === taskName);
    const burst = matched ? matched.burstTime : 100;
    const priority = matched ? matched.priority : 5;

    spawnProcess({
      name: taskName.trim() || 'Worker Task',
      priority,
      burstTime: burst,
      parentPid: null,
    });
  };

  return (
    <div className="sandbox-panel spawner-panel" aria-labelledby="spawner-title">
      <div className="panel-header">
        <div>
          <h3 id="spawner-title" className="panel-title">1. Spawn a Process</h3>
          <p className="panel-caption">Creates a new process and adds it to the Ready Queue.</p>
        </div>
      </div>

      {isStarved && (
        <div className="starvation-warning-banner" role="alert">
          <span className="warning-icon">⛔</span>
          <div className="warning-text">
            <strong>Ready Queue Full ({readyQueue.length}/{settings.readyQueueLimit} slots)</strong>
            <p>The scheduler ran out of queue space. Click "Kill" on any process below to free a slot.</p>
          </div>
        </div>
      )}

      {/* Quick Task Presets */}
      <div className="preset-selector-section">
        <span className="section-label">Pick a realistic task:</span>
        <div className="preset-buttons-grid" role="group" aria-label="Task Presets">
          {TASK_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.name}
              type="button"
              className={`preset-btn ${taskName === preset.name ? 'is-selected' : ''}`}
              onClick={() => handleSelectPreset(preset)}
              disabled={isStarved}
            >
              <span className="preset-icon">{preset.icon}</span>
              <span className="preset-btn-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSpawn} className="spawner-form">
        <div className="form-group">
          <label htmlFor="task-name-input" className="form-label">
            Or type a custom task name:
          </label>
          <input
            id="task-name-input"
            type="text"
            className="form-input"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="e.g. ffmpeg_encoder, iot_poller"
            disabled={isStarved}
            required
          />
        </div>

        <button
          type="submit"
          className={`spawn-submit-btn ${isStarved ? 'is-disabled' : ''}`}
          disabled={isStarved}
          aria-disabled={isStarved}
        >
          <span className="btn-icon">⚡</span>
          <span className="btn-text">
            {isStarved ? 'Queue Full (Starvation Lock)' : 'Spawn Process (fork & queue)'}
          </span>
        </button>
        <span className="btn-micro-caption">
          {isStarved
            ? 'Free a slot below to unblock spawning.'
            : 'Allocates a new PID, PCB, and places it in the Ready state.'}
        </span>
      </form>
    </div>
  );
}
