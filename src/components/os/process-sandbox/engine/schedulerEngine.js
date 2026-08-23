/**
 * System Zero — Pure Scheduler & OS Simulation Engine
 * Decoupled from React UI for pure unit testability and deterministic simulation.
 */

export const PROCESS_STATES = {
  NEW: 'NEW',
  READY: 'READY',
  RUNNING: 'RUNNING',
  WAITING: 'WAITING',
  TERMINATED: 'TERMINATED',
  ZOMBIE: 'ZOMBIE',
};

export const SCHEDULING_ALGORITHMS = {
  FCFS: {
    id: 'FCFS',
    name: 'First-Come, First-Served (FCFS)',
    shortName: 'FCFS',
    description: 'Non-preemptive: Processes execute to completion or I/O in arrival order.',
    hasQuantum: false,
    hasPriority: false,
  },
  RR: {
    id: 'RR',
    name: 'Round Robin (RR)',
    shortName: 'Round Robin',
    description: 'Preemptive: Each process receives a fixed time slice (quantum) before yielding.',
    hasQuantum: true,
    hasPriority: false,
  },
  PRIORITY: {
    id: 'PRIORITY',
    name: 'Priority Scheduling (Preemptive)',
    shortName: 'Priority',
    description: 'Preemptive: Highest priority task on Ready Queue gains CPU immediately.',
    hasQuantum: false,
    hasPriority: true,
  },
};

export const TASK_PRESETS = [
  { name: 'Render promo reel', priority: 4, burstTime: 120, type: 'cpu', icon: '🎬' },
  { name: 'Poll IoT sensor', priority: 9, burstTime: 40, type: 'io', icon: '📡' },
  { name: 'Database indexer', priority: 6, burstTime: 160, type: 'cpu', icon: '🗄️' },
  { name: 'Audio synthesizer', priority: 8, burstTime: 80, type: 'realtime', icon: '🎵' },
  { name: 'Compiler daemon', priority: 3, burstTime: 200, type: 'cpu', icon: '⚙️' },
  { name: 'Network packet flush', priority: 7, burstTime: 60, type: 'io', icon: '🌐' },
  { name: 'Garbage collector', priority: 2, burstTime: 90, type: 'bg', icon: '🧹' },
];

/**
 * Format a number into an 8-character hex string (e.g. 0x00401A20)
 */
export function formatHex(value, digits = 8) {
  const hex = Number(value).toString(16).toUpperCase().padStart(digits, '0');
  return `0x${hex}`;
}

/**
 * Generate guaranteed non-overlapping virtual memory ranges for a process.
 */
export function allocateMemoryRange(pidIndex) {
  // Base offset 0x70000000 with 256KB (0x00040000) segments per process
  const baseVal = 0x70000000 + (pidIndex * 0x00040000);
  const limitVal = baseVal + 0x0003ffff;
  return {
    base: formatHex(baseVal),
    limit: formatHex(limitVal),
    sizeKb: 256,
    readableSpan: `${formatHex(baseVal)} – ${formatHex(limitVal)}`,
  };
}

/**
 * Generate simulated hex registers for a given PID and current instruction.
 */
export function generateRegisters(pid, stepIndex = 0) {
  const baseOffset = (pid * 0x1337) + (stepIndex * 0x04);
  return {
    EAX: formatHex((baseOffset * 3) & 0xffffffff),
    EBX: formatHex((baseOffset ^ 0xdeadbeef) & 0xffffffff),
    ESP: formatHex(0x7ffff000 - (pid * 0x400) - (stepIndex * 0x10)),
    EBP: formatHex(0x7ffff000 - (pid * 0x400)),
  };
}

/**
 * Create a new Process PCB object with strict validation.
 */
export function createProcess({
  name = 'Worker Task',
  priority = 5,
  burstTime = 100,
  parentPid = null,
  existingProcesses = [],
  customPid = null,
}) {
  // Determine next sequential PID (starting at 1001)
  const existingPids = existingProcesses.map((p) => p.pid);
  let nextPid = customPid || 1001;
  while (existingPids.includes(nextPid)) {
    nextPid += 1;
  }

  const pidIndex = existingProcesses.length;
  const memory = allocateMemoryRange(pidIndex);
  const initialPc = formatHex(0x00400000 + (nextPid * 0x200));

  return {
    pid: nextPid,
    ppid: parentPid !== null ? parentPid : 1, // PID 1 is init/systemd
    name: name.trim() || `Task_${nextPid}`,
    state: PROCESS_STATES.READY,
    priority: Math.max(1, Math.min(10, Number(priority) || 5)),
    burstTime: Math.max(20, Number(burstTime) || 100),
    remainingTime: Math.max(20, Number(burstTime) || 100),
    totalCpuTime: 0,
    quantumUsed: 0,
    pc: initialPc,
    initialPc,
    registers: generateRegisters(nextPid, 0),
    memory,
    createdAt: Date.now(),
    waitReason: null,
    isZombie: false,
    isOrphan: false,
    childrenPids: [],
  };
}

/**
 * Select the next process PID to run on the CPU based on the active scheduling algorithm.
 */
export function selectNextProcess({
  readyQueue = [],
  processes = [],
  algorithm = 'RR',
  currentRunningPid = null,
  quantumExpired = false,
}) {
  if (!readyQueue.length) {
    return { nextPid: null, reason: 'IDLE' };
  }

  const pMap = new Map(processes.map((p) => [p.pid, p]));

  // If current process is still valid and not preempted/finished, keep running
  if (currentRunningPid && pMap.has(currentRunningPid)) {
    const current = pMap.get(currentRunningPid);
    if (current.state === PROCESS_STATES.RUNNING && current.remainingTime > 0) {
      if (algorithm === 'FCFS') {
        return { nextPid: currentRunningPid, reason: 'CONTINUE_FCFS' };
      }
      if (algorithm === 'RR' && !quantumExpired) {
        return { nextPid: currentRunningPid, reason: 'CONTINUE_QUANTUM' };
      }
      if (algorithm === 'PRIORITY') {
        // In preemptive priority, check if any ready queue item has strictly higher priority
        const highestReady = readyQueue
          .map((id) => pMap.get(id))
          .filter(Boolean)
          .sort((a, b) => b.priority - a.priority)[0];

        if (!highestReady || current.priority >= highestReady.priority) {
          return { nextPid: currentRunningPid, reason: 'HIGHEST_PRIORITY' };
        }
      }
    }
  }

  // Pick next candidate from Ready Queue
  if (algorithm === 'PRIORITY') {
    const sortedQueue = [...readyQueue]
      .map((id) => pMap.get(id))
      .filter(Boolean)
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority; // higher priority number first
        return a.createdAt - b.createdAt; // FCFS tie breaker
      });

    if (sortedQueue.length > 0) {
      return { nextPid: sortedQueue[0].pid, reason: 'PRIORITY_DISPATCH' };
    }
  }

  // FCFS or Round-Robin: Pick head of readyQueue
  const nextPid = readyQueue[0];
  return { nextPid, reason: 'QUEUE_HEAD_DISPATCH' };
}

/**
 * Calculate estimated context switch overhead in microseconds.
 */
export function calculateContextSwitchCost(fromPid, toPid) {
  if (!fromPid || !toPid || fromPid === toPid) return 0;
  // Realistic simulated context switch cost: 8μs to 16μs (TLB flush, cache invalidate, register save/restore)
  return 12.5;
}

/**
 * Pure simulation tick execution.
 * Advances active execution by tickDeltaMs, returns updated state object and events.
 */
export function stepSimulation({
  processes,
  readyQueue,
  runningPid,
  algorithm,
  timeQuantum = 40,
  tickDeltaMs = 20,
}) {
  const events = [];
  let updatedProcesses = processes.map((p) => ({ ...p, registers: { ...p.registers } }));
  let updatedReadyQueue = [...readyQueue];
  let updatedRunningPid = runningPid;
  let contextSwitched = false;
  let previousPid = null;
  let overheadUs = 0;

  const getProcess = (pid) => updatedProcesses.find((p) => p.pid === pid);
  const setProcessState = (pid, state) => {
    updatedProcesses = updatedProcesses.map((p) => (p.pid === pid ? { ...p, state } : p));
  };

  // 1. If a process is currently running on CPU
  let currentProcess = getProcess(updatedRunningPid);

  if (currentProcess) {
    if (currentProcess.state !== PROCESS_STATES.RUNNING) {
      currentProcess = null;
      updatedRunningPid = null;
    }
  }

  // Check quantum expiration for Round Robin
  let quantumExpired = false;
  if (currentProcess && algorithm === 'RR') {
    if (currentProcess.quantumUsed >= timeQuantum) {
      quantumExpired = true;
      events.push({
        type: 'PREEMPT',
        pid: currentProcess.pid,
        message: `PID ${currentProcess.pid} preempted after ${timeQuantum}ms quantum expired.`,
      });

      // Move back to ready queue
      setProcessState(currentProcess.pid, PROCESS_STATES.READY);
      updatedProcesses = updatedProcesses.map((p) =>
        p.pid === currentProcess.pid ? { ...p, quantumUsed: 0 } : p
      );
      if (!updatedReadyQueue.includes(currentProcess.pid)) {
        updatedReadyQueue.push(currentProcess.pid);
      }
      currentProcess = null;
      updatedRunningPid = null;
    }
  }

  // 2. Select next process to run
  const selection = selectNextProcess({
    readyQueue: updatedReadyQueue,
    processes: updatedProcesses,
    algorithm,
    currentRunningPid: updatedRunningPid,
    quantumExpired,
  });

  const nextPidToRun = selection.nextPid;

  // Handle Context Switch if changing running process
  if (nextPidToRun !== updatedRunningPid) {
    previousPid = updatedRunningPid;
    contextSwitched = true;
    overheadUs = calculateContextSwitchCost(previousPid, nextPidToRun);

    if (previousPid) {
      events.push({
        type: 'CONTEXT_SWITCH_SAVE',
        pid: previousPid,
        message: `[CPU] Saving PCB context for PID ${previousPid} (PC: ${getProcess(previousPid)?.pc || '0x0'})`,
      });
    }

    if (nextPidToRun) {
      // Remove from ready queue
      updatedReadyQueue = updatedReadyQueue.filter((id) => id !== nextPidToRun);
      setProcessState(nextPidToRun, PROCESS_STATES.RUNNING);
      updatedRunningPid = nextPidToRun;

      const target = getProcess(nextPidToRun);
      events.push({
        type: 'CONTEXT_SWITCH_LOAD',
        pid: nextPidToRun,
        message: `[CPU] Restoring PCB context for PID ${nextPidToRun} (${target?.name || ''}). State → RUNNING`,
      });
    } else {
      updatedRunningPid = null;
      events.push({
        type: 'CPU_IDLE',
        message: '[CPU] Ready Queue empty. CPU entering idle loop.',
      });
    }
  }

  // 3. Execute instruction step for currently running process
  if (updatedRunningPid) {
    const runningProc = getProcess(updatedRunningPid);
    if (runningProc && runningProc.state === PROCESS_STATES.RUNNING) {
      const executedMs = Math.min(runningProc.remainingTime, tickDeltaMs);
      const newRemainingTime = Math.max(0, runningProc.remainingTime - executedMs);
      const newTotalCpuTime = runningProc.totalCpuTime + executedMs;
      const newQuantumUsed = (runningProc.quantumUsed || 0) + executedMs;

      // Increment instruction pointer PC and simulated registers
      const stepIndex = Math.floor(newTotalCpuTime / 20);
      const newPc = formatHex(0x00400000 + (runningProc.pid * 0x200) + (stepIndex * 4));
      const newRegisters = generateRegisters(runningProc.pid, stepIndex);

      if (newRemainingTime <= 0) {
        // Process Completed Execution!
        const hasParentWaiting = runningProc.ppid && runningProc.ppid !== 1;
        const becomesZombie = hasParentWaiting; // If parent exists and hasn't reaped it yet, it becomes a zombie

        const finalState = becomesZombie ? PROCESS_STATES.ZOMBIE : PROCESS_STATES.TERMINATED;

        updatedProcesses = updatedProcesses.map((p) => {
          if (p.pid === runningProc.pid) {
            return {
              ...p,
              remainingTime: 0,
              totalCpuTime: newTotalCpuTime,
              state: finalState,
              isZombie: becomesZombie,
              pc: newPc,
              registers: newRegisters,
            };
          }
          return p;
        });

        updatedRunningPid = null;

        if (becomesZombie) {
          events.push({
            type: 'ZOMBIE_CREATED',
            pid: runningProc.pid,
            message: `PID ${runningProc.pid} finished execution. Exit status: 0. State → ZOMBIE (awaiting parent PID ${runningProc.ppid} wait() reap).`,
          });
        } else {
          events.push({
            type: 'PROCESS_TERMINATED',
            pid: runningProc.pid,
            message: `PID ${runningProc.pid} completed execution. PCB freed from memory.`,
          });
        }
      } else {
        // Process continues running
        updatedProcesses = updatedProcesses.map((p) => {
          if (p.pid === runningProc.pid) {
            return {
              ...p,
              remainingTime: newRemainingTime,
              totalCpuTime: newTotalCpuTime,
              quantumUsed: newQuantumUsed,
              pc: newPc,
              registers: newRegisters,
            };
          }
          return p;
        });
      }
    }
  }

  return {
    processes: updatedProcesses,
    readyQueue: updatedReadyQueue,
    runningPid: updatedRunningPid,
    events,
    contextSwitched,
    previousPid,
    overheadUs,
  };
}
