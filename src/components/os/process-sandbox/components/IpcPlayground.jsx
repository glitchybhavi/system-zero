import React, { useState } from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function IpcPlayground() {
  const {
    state,
    ipcSetMode,
    ipcLockMutex,
    ipcUnlockMutex,
    ipcWriteSharedMemory,
    ipcSendMessage,
  } = useProcessSandbox();

  const { ipcState, processes } = state;
  const activeProcs = processes.filter((p) => p.state !== 'TERMINATED');

  const [writerPid, setWriterPid] = useState(activeProcs[0]?.pid || 1001);
  const [dataPayload, setDataPayload] = useState('PAYLOAD_CHUNK_A: [0x41, 0x42]');

  const [msgFromPid, setMsgFromPid] = useState(activeProcs[0]?.pid || 1001);
  const [msgToPid, setMsgToPid] = useState(activeProcs[1]?.pid || 1002);
  const [msgText, setMsgText] = useState('SYN_ACK_PACKET');

  const handleWriteMemory = () => {
    ipcWriteSharedMemory(Number(writerPid), dataPayload);
  };

  const handleToggleLock = () => {
    if (ipcState.isLocked) {
      ipcUnlockMutex(Number(writerPid));
    } else {
      ipcLockMutex(Number(writerPid));
    }
  };

  const handleSendMsg = (e) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    ipcSendMessage(Number(msgFromPid), Number(msgToPid), msgText);
    setMsgText('');
  };

  return (
    <div className="sandbox-panel ipc-panel" aria-labelledby="ipc-title">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="panel-badge-code">IPC_SUBSYSTEM</span>
          <h3 id="ipc-title" className="panel-title">Interprocess Communication (IPC) Playground</h3>
        </div>

        {/* Mode Switcher */}
        <div className="ipc-mode-switch font-mono" role="tablist">
          <button
            type="button"
            className={`ipc-mode-btn ${ipcState.mode === 'shared_memory' ? 'is-active' : ''}`}
            onClick={() => ipcSetMode('shared_memory')}
            role="tab"
            aria-selected={ipcState.mode === 'shared_memory'}
          >
            ⚡ Shared Memory (Speed + Locks)
          </button>
          <button
            type="button"
            className={`ipc-mode-btn ${ipcState.mode === 'message_passing' ? 'is-active' : ''}`}
            onClick={() => ipcSetMode('message_passing')}
            role="tab"
            aria-selected={ipcState.mode === 'message_passing'}
          >
            📬 Message Passing (Safety + Queues)
          </button>
        </div>
      </div>

      {ipcState.mode === 'shared_memory' ? (
        <div className="ipc-shared-mem-view">
          <div className="ipc-explainer-box">
            <p>
              <strong>The Trade-off:</strong> Shared memory delivers raw zero-copy speed by mapping the same physical RAM page into both process address spaces. But without a <code>mutex</code> lock, concurrent writes cause catastrophic race conditions.
            </p>
          </div>

          {/* Shared Memory Buffer Display */}
          <div className="shared-buffer-card font-mono">
            <div className="buffer-header">
              <div className="buffer-address">
                <span className="addr-tag">RAM Page: 0x80000000 (Shared RW Buffer)</span>
              </div>
              <div className="mutex-indicator">
                <span className={`mutex-status-badge ${ipcState.isLocked ? 'is-locked' : 'is-unlocked'}`}>
                  {ipcState.isLocked ? `🔒 MUTEX LOCKED (PID ${ipcState.lockedByPid})` : '🔓 MUTEX UNLOCKED'}
                </span>
              </div>
            </div>

            <div className={`buffer-content-box ${ipcState.raceConditionDetected ? 'is-corrupted' : ''}`}>
              <pre className="buffer-hex-text">{ipcState.sharedBuffer}</pre>
            </div>

            {ipcState.raceConditionDetected && (
              <div className="race-alert-strip" role="alert">
                <span>⚠️ RACE CONDITION DETECTED! Unsynchronized write collided in shared memory buffer.</span>
              </div>
            )}
          </div>

          {/* Lock & Write Controls */}
          <div className="ipc-controls-grid">
            <div className="form-group">
              <label htmlFor="ipc-writer-pid" className="form-label">
                Writing Process
              </label>
              <select
                id="ipc-writer-pid"
                className="form-select font-mono"
                value={writerPid}
                onChange={(e) => setWriterPid(e.target.value)}
              >
                {activeProcs.map((p) => (
                  <option key={p.pid} value={p.pid}>
                    PID {p.pid} ({p.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="ipc-payload" className="form-label">
                Buffer Payload Data
              </label>
              <input
                id="ipc-payload"
                type="text"
                className="form-input font-mono"
                value={dataPayload}
                onChange={(e) => setDataPayload(e.target.value)}
              />
            </div>
          </div>

          <div className="ipc-actions-bar font-mono">
            <button
              type="button"
              className={`ipc-action-btn lock-btn ${ipcState.isLocked ? 'is-active-lock' : ''}`}
              onClick={handleToggleLock}
            >
              {ipcState.isLocked ? '🔓 Release Mutex Lock' : '🔒 Acquire Mutex Lock (pthread_mutex_lock)'}
            </button>

            <button
              type="button"
              className="ipc-action-btn write-btn"
              onClick={handleWriteMemory}
            >
              ✍️ Write to Shared Buffer
            </button>
          </div>
        </div>
      ) : (
        <div className="ipc-message-passing-view">
          <div className="ipc-explainer-box">
            <p>
              <strong>The Trade-off:</strong> Message passing copies payloads through kernel-managed mailboxes. It requires no synchronization locks from the programmer and eliminates race conditions, but incurs kernel context-switch copy overhead.
            </p>
          </div>

          {/* Mailbox Message Queue */}
          <div className="mailbox-card font-mono">
            <div className="mailbox-header">
              <span>Kernel Mailbox Queue (IPC_MSG_QUEUE)</span>
              <span className="msg-count">{ipcState.messageQueue.length} Packets Delivered</span>
            </div>

            <div className="mailbox-messages-list">
              {ipcState.messageQueue.length === 0 ? (
                <span className="text-faint">Mailbox queue empty.</span>
              ) : (
                ipcState.messageQueue.map((msg) => (
                  <div key={msg.id} className="mailbox-packet-item">
                    <div className="packet-header">
                      <span className="packet-routing">PID {msg.fromPid} ➔ PID {msg.toPid}</span>
                      <span className="packet-ts">{msg.timestamp}</span>
                    </div>
                    <div className="packet-body">
                      <code>"{msg.text}"</code>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Send Message Form */}
          <form onSubmit={handleSendMsg} className="ipc-msg-form">
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Sender (from PID)</label>
                <select
                  className="form-select font-mono"
                  value={msgFromPid}
                  onChange={(e) => setMsgFromPid(e.target.value)}
                >
                  {activeProcs.map((p) => (
                    <option key={p.pid} value={p.pid}>PID {p.pid} ({p.name})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Receiver (to PID)</label>
                <select
                  className="form-select font-mono"
                  value={msgToPid}
                  onChange={(e) => setMsgToPid(e.target.value)}
                >
                  {activeProcs.map((p) => (
                    <option key={p.pid} value={p.pid}>PID {p.pid} ({p.name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Payload</label>
              <div className="msg-input-wrap">
                <input
                  type="text"
                  className="form-input font-mono"
                  placeholder="e.g. DATA_READY_FLAG: 1"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                />
                <button type="submit" className="ipc-action-btn send-btn font-mono">
                  📨 Send Packet (msgsnd)
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
