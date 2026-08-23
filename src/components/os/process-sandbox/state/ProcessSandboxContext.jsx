import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  sandboxReducer,
  getInitialState,
  GUIDED_STEPS,
} from './sandboxReducer';
import { useSimulationClock } from '../hooks/useSimulationClock';

const ProcessSandboxContext = createContext(null);

export function ProcessSandboxProvider({ children }) {
  const [state, dispatch] = useReducer(sandboxReducer, null, getInitialState);

  // Clock tick advances simulation by 30ms
  const handleTick = useCallback((deltaMs) => {
    dispatch({ type: 'ADVANCE_TICK', payload: deltaMs });
  }, []);

  const clock = useSimulationClock({
    onTick: handleTick,
    baseIntervalMs: 450,
    initialRunning: false,
  });

  // Action dispatch helpers
  const spawnProcess = useCallback((params) => {
    dispatch({ type: 'SPAWN_PROCESS', payload: params });
  }, []);

  const killProcess = useCallback((pid) => {
    dispatch({ type: 'KILL_PROCESS', payload: { pid } });
  }, []);

  const blockProcess = useCallback((pid, reason) => {
    dispatch({ type: 'BLOCK_PROCESS', payload: { pid, reason } });
  }, []);

  const unblockProcess = useCallback((pid) => {
    dispatch({ type: 'UNBLOCK_PROCESS', payload: { pid } });
  }, []);

  const reapProcess = useCallback((pid) => {
    dispatch({ type: 'REAP_PROCESS', payload: { pid } });
  }, []);

  const setAlgorithm = useCallback((algo) => {
    dispatch({ type: 'SET_ALGORITHM', payload: algo });
  }, []);

  const setTimeQuantum = useCallback((quantum) => {
    dispatch({ type: 'SET_TIME_QUANTUM', payload: quantum });
  }, []);

  const setDifficulty = useCallback((difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
  }, []);

  const setMode = useCallback((mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const setGuidedStep = useCallback((stepIdx) => {
    dispatch({ type: 'SET_GUIDED_STEP', payload: stepIdx });
  }, []);

  const selectPid = useCallback((pid) => {
    dispatch({ type: 'SELECT_PID', payload: pid });
  }, []);

  const ipcSetMode = useCallback((mode) => {
    dispatch({ type: 'IPC_SET_MODE', payload: mode });
  }, []);

  const ipcLockMutex = useCallback((pid) => {
    dispatch({ type: 'IPC_LOCK_MUTEX', payload: { pid } });
  }, []);

  const ipcUnlockMutex = useCallback((pid) => {
    dispatch({ type: 'IPC_UNLOCK_MUTEX', payload: { pid } });
  }, []);

  const ipcWriteSharedMemory = useCallback((pid, data) => {
    dispatch({ type: 'IPC_WRITE_SHARED_MEMORY', payload: { pid, data } });
  }, []);

  const ipcSendMessage = useCallback((fromPid, toPid, text) => {
    dispatch({ type: 'IPC_SEND_MESSAGE', payload: { fromPid, toPid, text } });
  }, []);

  const clearLog = useCallback(() => {
    dispatch({ type: 'CLEAR_LOG' });
  }, []);

  const resetSimulation = useCallback(() => {
    clock.pause();
    dispatch({ type: 'RESET_SIMULATION' });
  }, [clock]);

  const loadScenario = useCallback((scenarioName) => {
    clock.pause();
    dispatch({ type: 'LOAD_PRESET_SCENARIO', payload: scenarioName });
  }, [clock]);

  const exportSessionJson = useCallback(() => {
    const sessionData = {
      exportedAt: new Date().toISOString(),
      platform: 'System Zero Process Management Sandbox',
      metrics: state.metrics,
      settings: state.settings,
      processes: state.processes,
      readyQueue: state.readyQueue,
      waitQueue: state.waitQueue,
      log: state.log,
    };
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-zero-process-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const copyLogToClipboard = useCallback(() => {
    const logText = state.log
      .map((l) => `[${l.timestamp}] [${l.type}] ${l.message}`)
      .reverse()
      .join('\n');
    navigator.clipboard.writeText(logText);
  }, [state.log]);

  const value = {
    state,
    clock,
    guidedSteps: GUIDED_STEPS,
    spawnProcess,
    killProcess,
    blockProcess,
    unblockProcess,
    reapProcess,
    setAlgorithm,
    setTimeQuantum,
    setDifficulty,
    setMode,
    setGuidedStep,
    selectPid,
    ipcSetMode,
    ipcLockMutex,
    ipcUnlockMutex,
    ipcWriteSharedMemory,
    ipcSendMessage,
    clearLog,
    resetSimulation,
    loadScenario,
    exportSessionJson,
    copyLogToClipboard,
  };

  return (
    <ProcessSandboxContext.Provider value={value}>
      {children}
    </ProcessSandboxContext.Provider>
  );
}

export function useProcessSandbox() {
  const context = useContext(ProcessSandboxContext);
  if (!context) {
    throw new Error('useProcessSandbox must be used within a ProcessSandboxProvider');
  }
  return context;
}
