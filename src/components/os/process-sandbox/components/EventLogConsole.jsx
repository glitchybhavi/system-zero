import React, { useState, useRef, useEffect } from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function EventLogConsole() {
  const { state, clearLog, copyLogToClipboard, exportSessionJson } = useProcessSandbox();
  const { log } = state;

  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef(null);

  const filteredLog = log.filter((entry) => {
    if (filter === 'SCHEDULER') {
      if (!['PREEMPT', 'CONTEXT_SWITCH_SAVE', 'CONTEXT_SWITCH_LOAD', 'CPU_IDLE', 'SCHEDULER_CONFIG'].includes(entry.type)) return false;
    }
    if (filter === 'LIFECYCLE') {
      if (!['FORK_SPAWN', 'KILL_SIGNAL', 'PROCESS_TERMINATED', 'ZOMBIE_CREATED', 'REAPED', 'WAIT_BLOCK', 'IO_COMPLETE', 'PCB_ALLOCATED'].includes(entry.type)) return false;
    }
    if (filter === 'STARVATION') {
      if (!['STARVATION_ALERT'].includes(entry.type)) return false;
    }
    if (filter === 'IPC') {
      if (!['IPC', 'IPC_MUTEX', 'IPC_WRITE', 'IPC_MSG', 'RACE_CONDITION_ALERT'].includes(entry.type)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return entry.message.toLowerCase().includes(q) || (entry.type && entry.type.toLowerCase().includes(q));
    }
    return true;
  });

  const handleCopy = () => {
    copyLogToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogTypeBadgeClass = (type) => {
    switch (type) {
      case 'STARVATION_ALERT':
      case 'RACE_CONDITION_ALERT':
        return 'log-badge-alert';
      case 'CONTEXT_SWITCH_LOAD':
      case 'CONTEXT_SWITCH_SAVE':
      case 'PREEMPT':
        return 'log-badge-sched';
      case 'FORK_SPAWN':
      case 'PCB_ALLOCATED':
        return 'log-badge-spawn';
      case 'KILL_SIGNAL':
      case 'PROCESS_TERMINATED':
        return 'log-badge-kill';
      case 'ZOMBIE_CREATED':
      case 'REAPED':
        return 'log-badge-zombie';
      case 'IPC_MUTEX':
      case 'IPC_WRITE':
      case 'IPC_MSG':
        return 'log-badge-ipc';
      default:
        return 'log-badge-default';
    }
  };

  return (
    <div className="sandbox-panel log-console-panel" aria-labelledby="log-console-title">
      {/* Console Header */}
      <div className="console-header">
        <div className="console-title-wrap">
          <div className="console-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span id="log-console-title" className="console-title font-mono">/dev/kernel/os-monitor.log</span>
          <span className="log-count-tag font-mono">{log.length} events</span>
        </div>

        <div className="console-top-actions">
          <button
            type="button"
            className="console-action-btn font-mono"
            onClick={handleCopy}
            title="Copy formatted log buffer to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy Log'}
          </button>
          <button
            type="button"
            className="console-action-btn font-mono"
            onClick={exportSessionJson}
            title="Download complete session state as JSON"
          >
            💾 Export JSON
          </button>
          <button
            type="button"
            className="console-action-btn clear-btn font-mono"
            onClick={clearLog}
            title="Clear console output"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="console-toolbar font-mono">
        <div className="log-filters" role="tablist">
          {['ALL', 'SCHEDULER', 'LIFECYCLE', 'STARVATION', 'IPC'].map((f) => (
            <button
              key={f}
              type="button"
              className={`log-filter-btn ${filter === f ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="log-search-wrap">
          <input
            type="text"
            className="log-search-input font-mono"
            placeholder="Search kernel logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Log Output Buffer */}
      <div
        className="console-log-body font-mono"
        ref={logContainerRef}
        role="log"
        aria-live="polite"
      >
        {filteredLog.length === 0 ? (
          <div className="log-empty font-mono text-faint">
            -- No log entries matching criteria --
          </div>
        ) : (
          filteredLog.map((entry) => (
            <div key={entry.id} className="log-line">
              <span className="log-timestamp">[{entry.timestamp}]</span>
              <span className={`log-type-tag ${getLogTypeBadgeClass(entry.type)}`}>
                {entry.type}
              </span>
              <span className="log-msg-text">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
