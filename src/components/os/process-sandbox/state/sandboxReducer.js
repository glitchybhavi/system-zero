import {
  PROCESS_STATES,
  createProcess,
  stepSimulation,
  formatHex,
} from '../engine/schedulerEngine';

export const INITIAL_SETTINGS = {
  algorithm: 'RR',
  timeQuantum: 40,
  readyQueueLimit: 5,
  difficulty: 'beginner', // 'beginner' (limit 5) | 'challenge' (limit 3)
  mode: 'guided', // 'guided' | 'freeplay'
};

export const INITIAL_IPC_STATE = {
  mode: 'shared_memory', // 'shared_memory' | 'message_passing'
  isLocked: false,
  lockedByPid: null,
  sharedBuffer: 'KERNEL_BUFFER_INIT: [0x00, 0x00, 0x00, 0x00]',
  lastWriteByPid: null,
  raceConditionDetected: false,
  messageQueue: [
    { id: 1, fromPid: 1001, toPid: 1002, text: 'HELLO_FROM_PARENT', timestamp: 'T+0ms' },
  ],
};

export const INITIAL_METRICS = {
  totalContextSwitches: 0,
  totalOverheadUs: 0,
  totalCpuTime: 0,
  completedProcessesCount: 0,
  starvationEncounters: 0,
};

export const GUIDED_STEPS = [
  {
    step: 0,
    title: '1. The Fork Principle & PCB Allocation',
    objective: 'Spawn 3 distinct processes from the spawner panel.',
    hint: 'Click the quick presets or type custom task names and click "Spawn Process (fork)". Watch the unique sequential PID and non-overlapping hex memory allocated for each.',
    isCompleted: (state) => state.processes.length >= 3,
  },
  {
    step: 1,
    title: '2. Cause Ready Queue Starvation',
    objective: 'Spawn tasks until the Ready Queue hits capacity (5/5).',
    hint: 'Real OS kernels have finite queue depth. Spawn processes until the queue locks and the Starvation Alert triggers.',
    isCompleted: (state) => state.readyQueue.length >= state.settings.readyQueueLimit,
  },
  {
    step: 2,
    title: '3. Process Lifecycle & Manual Terminate',
    objective: 'Free a slot by manually clicking "Kill (SIGKILL)" on any ready process.',
    hint: 'Notice how terminating a process immediately frees its queue slot and allocated PCB, clearing the starvation lock.',
    isCompleted: (state) => state.metrics.completedProcessesCount >= 1 || state.processes.some(p => p.state === PROCESS_STATES.TERMINATED),
  },
  {
    step: 3,
    title: '4. Live Round Robin Scheduling & Preemption',
    objective: 'Start the simulation clock and observe time quantum preemption.',
    hint: 'Click "Play" on the simulation clock. Watch the CPU run PID instructions, expire its 40ms quantum, and swap back to the Ready Queue.',
    isCompleted: (state) => state.metrics.totalContextSwitches >= 2,
  },
  {
    step: 4,
    title: '5. Zombie Processes & Kernel Reaping',
    objective: 'Switch to the "Zombie / Orphan Lab" tab and create a Zombie process, then Reap it.',
    hint: 'When a child process exits before its parent calls wait(), its exit code remains in the PCB table as a Zombie. Click "Reap" to clean it.',
    isCompleted: (state) => state.log.some(l => l.type === 'REAPED' || l.type === 'ZOMBIE_CREATED'),
  },
];

export function getInitialState() {
  const initialP1 = createProcess({
    name: 'Init System Core',
    priority: 8,
    burstTime: 140,
    customPid: 1001,
  });

  const initialP2 = createProcess({
    name: 'Sensor Streamer',
    priority: 5,
    burstTime: 80,
    customPid: 1002,
    existingProcesses: [initialP1],
  });

  return {
    processes: [initialP1, initialP2],
    readyQueue: [1001, 1002],
    waitQueue: [],
    runningPid: null,
    cpuState: {
      isContextSwitching: false,
      switchFromPid: null,
      switchToPid: null,
      switchPhase: 'idle', // 'idle' | 'saving' | 'loading'
      activeRegisters: { EAX: '0x00000000', EBX: '0x00000000', ESP: '0x7FFFF000', EBP: '0x7FFFF000' },
      activePc: '0x00400000',
    },
    metrics: { ...INITIAL_METRICS },
    settings: { ...INITIAL_SETTINGS },
    ipcState: { ...INITIAL_IPC_STATE },
    guidedStepIndex: 0,
    selectedPid: 1001,
    log: [
      {
        id: 1,
        timestamp: '00:00.000',
        type: 'SYSTEM',
        message: 'System Zero Kernel initialized. Microkernel ready.',
      },
      {
        id: 2,
        timestamp: '00:00.050',
        type: 'PCB_ALLOCATED',
        pid: 1001,
        message: 'PID 1001 allocated (Init System Core) — Range 0x70000000–0x7003FFFF',
      },
      {
        id: 3,
        timestamp: '00:00.080',
        type: 'PCB_ALLOCATED',
        pid: 1002,
        message: 'PID 1002 allocated (Sensor Streamer) — Range 0x70040000–0x7007FFFF',
      },
    ],
  };
}

function formatLogTimestamp() {
  const d = new Date();
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${m}:${s}.${ms}`;
}

export function sandboxReducer(state, action) {
  const ts = formatLogTimestamp();
  const nextLogId = state.log.length + 1;

  switch (action.type) {
    case 'SPAWN_PROCESS': {
      const { name, priority, burstTime, parentPid } = action.payload;
      const queueLimit = state.settings.readyQueueLimit;

      // Check starvation / queue capacity
      if (state.readyQueue.length >= queueLimit) {
        return {
          ...state,
          metrics: {
            ...state.metrics,
            starvationEncounters: state.metrics.starvationEncounters + 1,
          },
          log: [
            {
              id: nextLogId,
              timestamp: ts,
              type: 'STARVATION_ALERT',
              message: `[STARVATION] Cannot spawn "${name}": Ready Queue full (${state.readyQueue.length}/${queueLimit} slots). Free a slot to proceed.`,
            },
            ...state.log,
          ],
        };
      }

      const newProcess = createProcess({
        name,
        priority,
        burstTime,
        parentPid,
        existingProcesses: state.processes,
      });

      // If parent exists, update parent's childrenPids
      let updatedProcesses = state.processes.map((p) => {
        if (parentPid && p.pid === parentPid) {
          return { ...p, childrenPids: [...(p.childrenPids || []), newProcess.pid] };
        }
        return p;
      });
      updatedProcesses.push(newProcess);

      return {
        ...state,
        processes: updatedProcesses,
        readyQueue: [...state.readyQueue, newProcess.pid],
        selectedPid: newProcess.pid,
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'FORK_SPAWN',
            pid: newProcess.pid,
            message: `fork() -> PID ${newProcess.pid} ("${newProcess.name}") created. Mem: ${newProcess.memory.readableSpan}. State: READY`,
          },
          ...state.log,
        ],
      };
    }

    case 'KILL_PROCESS': {
      const pidToKill = Number(action.payload.pid);
      const target = state.processes.find((p) => p.pid === pidToKill);
      if (!target || target.state === PROCESS_STATES.TERMINATED) return state;

      const wasRunning = state.runningPid === pidToKill;

      // Check for orphan adoption if killed process had children
      const updatedProcesses = state.processes.map((p) => {
        if (p.pid === pidToKill) {
          return {
            ...p,
            state: PROCESS_STATES.TERMINATED,
            remainingTime: 0,
            isZombie: false,
          };
        }
        // If this killed process was the parent of active children, children become orphans (adopted by PID 1)
        if (p.ppid === pidToKill && p.state !== PROCESS_STATES.TERMINATED) {
          return { ...p, ppid: 1, isOrphan: true };
        }
        return p;
      });

      const updatedReadyQueue = state.readyQueue.filter((id) => id !== pidToKill);
      const updatedWaitQueue = state.waitQueue.filter((id) => id !== pidToKill);

      return {
        ...state,
        processes: updatedProcesses,
        readyQueue: updatedReadyQueue,
        waitQueue: updatedWaitQueue,
        runningPid: wasRunning ? null : state.runningPid,
        metrics: {
          ...state.metrics,
          completedProcessesCount: state.metrics.completedProcessesCount + 1,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'KILL_SIGNAL',
            pid: pidToKill,
            message: `SIGKILL delivered to PID ${pidToKill} ("${target.name}"). State → TERMINATED. Queue slot freed.`,
          },
          ...state.log,
        ],
      };
    }

    case 'BLOCK_PROCESS': {
      const pidToBlock = Number(action.payload.pid);
      const reason = action.payload.reason || 'Simulated Disk I/O Wait';
      const target = state.processes.find((p) => p.pid === pidToBlock);
      if (!target || target.state === PROCESS_STATES.TERMINATED || target.state === PROCESS_STATES.WAITING) return state;

      const wasRunning = state.runningPid === pidToBlock;

      const updatedProcesses = state.processes.map((p) =>
        p.pid === pidToBlock ? { ...p, state: PROCESS_STATES.WAITING, waitReason: reason } : p
      );

      const updatedReadyQueue = state.readyQueue.filter((id) => id !== pidToBlock);
      const updatedWaitQueue = state.waitQueue.includes(pidToBlock)
        ? state.waitQueue
        : [...state.waitQueue, pidToBlock];

      return {
        ...state,
        processes: updatedProcesses,
        readyQueue: updatedReadyQueue,
        waitQueue: updatedWaitQueue,
        runningPid: wasRunning ? null : state.runningPid,
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'WAIT_BLOCK',
            pid: pidToBlock,
            message: `PID ${pidToBlock} blocked on [${reason}]. State: WAITING (moved to I/O Wait Queue).`,
          },
          ...state.log,
        ],
      };
    }

    case 'UNBLOCK_PROCESS': {
      const pidToUnblock = Number(action.payload.pid);
      const target = state.processes.find((p) => p.pid === pidToUnblock);
      if (!target || target.state !== PROCESS_STATES.WAITING) return state;

      if (state.readyQueue.length >= state.settings.readyQueueLimit) {
        return {
          ...state,
          log: [
            {
              id: nextLogId,
              timestamp: ts,
              type: 'STARVATION_ALERT',
              message: `[I/O READY FAILED] Cannot wake PID ${pidToUnblock}: Ready Queue full (${state.readyQueue.length}/${state.settings.readyQueueLimit}).`,
            },
            ...state.log,
          ],
        };
      }

      const updatedProcesses = state.processes.map((p) =>
        p.pid === pidToUnblock ? { ...p, state: PROCESS_STATES.READY, waitReason: null } : p
      );

      return {
        ...state,
        processes: updatedProcesses,
        waitQueue: state.waitQueue.filter((id) => id !== pidToUnblock),
        readyQueue: [...state.readyQueue, pidToUnblock],
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IO_COMPLETE',
            pid: pidToUnblock,
            message: `I/O Complete interrupt for PID ${pidToUnblock}. State → READY (re-entered Ready Queue).`,
          },
          ...state.log,
        ],
      };
    }

    case 'REAP_PROCESS': {
      const pidToReap = Number(action.payload.pid);
      const target = state.processes.find((p) => p.pid === pidToReap);
      if (!target) return state;

      const updatedProcesses = state.processes.filter((p) => p.pid !== pidToReap);

      return {
        ...state,
        processes: updatedProcesses,
        readyQueue: state.readyQueue.filter((id) => id !== pidToReap),
        waitQueue: state.waitQueue.filter((id) => id !== pidToReap),
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'REAPED',
            pid: pidToReap,
            message: `Parent called wait(). Zombie PID ${pidToReap} reaped and PCB memory deallocated.`,
          },
          ...state.log,
        ],
      };
    }

    case 'SET_ALGORITHM': {
      const newAlgo = action.payload;
      return {
        ...state,
        settings: { ...state.settings, algorithm: newAlgo },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'SCHEDULER_CONFIG',
            message: `Scheduler algorithm switched to: ${newAlgo}`,
          },
          ...state.log,
        ],
      };
    }

    case 'SET_TIME_QUANTUM': {
      const newQuantum = Math.max(10, Math.min(100, Number(action.payload)));
      return {
        ...state,
        settings: { ...state.settings, timeQuantum: newQuantum },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'SCHEDULER_CONFIG',
            message: `Round Robin time quantum adjusted to ${newQuantum}ms`,
          },
          ...state.log,
        ],
      };
    }

    case 'SET_DIFFICULTY': {
      const diff = action.payload; // 'beginner' | 'challenge'
      const limit = diff === 'challenge' ? 3 : 5;
      const quantum = diff === 'challenge' ? 20 : 40;
      return {
        ...state,
        settings: {
          ...state.settings,
          difficulty: diff,
          readyQueueLimit: limit,
          timeQuantum: quantum,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'SYSTEM',
            message: `Difficulty preset switched to: ${diff.toUpperCase()} (Ready Queue Hard Cap: ${limit} slots, Quantum: ${quantum}ms)`,
          },
          ...state.log,
        ],
      };
    }

    case 'SET_MODE': {
      return {
        ...state,
        settings: { ...state.settings, mode: action.payload },
      };
    }

    case 'SET_GUIDED_STEP': {
      return {
        ...state,
        guidedStepIndex: Math.max(0, Math.min(GUIDED_STEPS.length - 1, action.payload)),
      };
    }

    case 'SELECT_PID': {
      return {
        ...state,
        selectedPid: Number(action.payload),
      };
    }

    case 'ADVANCE_TICK': {
      const tickDeltaMs = action.payload || 20;

      const result = stepSimulation({
        processes: state.processes,
        readyQueue: state.readyQueue,
        runningPid: state.runningPid,
        algorithm: state.settings.algorithm,
        timeQuantum: state.settings.timeQuantum,
        tickDeltaMs,
      });

      const newEvents = (result.events || []).map((ev, idx) => ({
        id: nextLogId + idx,
        timestamp: ts,
        ...ev,
      }));

      // Update CPU visualizer registers
      const runningProc = result.processes.find((p) => p.pid === result.runningPid);
      const activeRegisters = runningProc
        ? runningProc.registers
        : state.cpuState.activeRegisters;
      const activePc = runningProc ? runningProc.pc : state.cpuState.activePc;

      const newSwitches = result.contextSwitched
        ? state.metrics.totalContextSwitches + 1
        : state.metrics.totalContextSwitches;
      const newOverhead = result.contextSwitched
        ? state.metrics.totalOverheadUs + result.overheadUs
        : state.metrics.totalOverheadUs;

      return {
        ...state,
        processes: result.processes,
        readyQueue: result.readyQueue,
        runningPid: result.runningPid,
        cpuState: {
          isContextSwitching: result.contextSwitched,
          switchFromPid: result.previousPid,
          switchToPid: result.runningPid,
          switchPhase: result.contextSwitched ? 'saving' : 'idle',
          activeRegisters,
          activePc,
        },
        metrics: {
          ...state.metrics,
          totalContextSwitches: newSwitches,
          totalOverheadUs: Number(newOverhead.toFixed(1)),
          totalCpuTime: state.metrics.totalCpuTime + (result.runningPid ? tickDeltaMs : 0),
        },
        log: newEvents.length ? [...newEvents, ...state.log] : state.log,
      };
    }

    case 'IPC_SET_MODE': {
      return {
        ...state,
        ipcState: {
          ...state.ipcState,
          mode: action.payload,
          raceConditionDetected: false,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IPC',
            message: `IPC Architecture mode toggled to: ${action.payload.toUpperCase().replace('_', ' ')}`,
          },
          ...state.log,
        ],
      };
    }

    case 'IPC_LOCK_MUTEX': {
      const pid = Number(action.payload.pid);
      return {
        ...state,
        ipcState: {
          ...state.ipcState,
          isLocked: true,
          lockedByPid: pid,
          raceConditionDetected: false,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IPC_MUTEX',
            message: `[MUTEX ACQUIRED] PID ${pid} locked Shared Memory mutex lock. Critical section active.`,
          },
          ...state.log,
        ],
      };
    }

    case 'IPC_UNLOCK_MUTEX': {
      const pid = Number(action.payload?.pid || state.ipcState.lockedByPid);
      return {
        ...state,
        ipcState: {
          ...state.ipcState,
          isLocked: false,
          lockedByPid: null,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IPC_MUTEX',
            message: `[MUTEX RELEASED] PID ${pid} released Shared Memory mutex. Buffer unlocked.`,
          },
          ...state.log,
        ],
      };
    }

    case 'IPC_WRITE_SHARED_MEMORY': {
      const { pid, data } = action.payload;
      const isSafe = state.ipcState.isLocked && state.ipcState.lockedByPid === pid;

      if (!isSafe) {
        // Race condition!
        return {
          ...state,
          ipcState: {
            ...state.ipcState,
            sharedBuffer: `⚠️ [CORRUPTED_RACE_CONDITION: 0x${Math.floor(Math.random()*0xffffff).toString(16)}]`,
            lastWriteByPid: pid,
            raceConditionDetected: true,
          },
          log: [
            {
              id: nextLogId,
              timestamp: ts,
              type: 'RACE_CONDITION_ALERT',
              message: `🔥 [RACE CONDITION DETECTED] PID ${pid} wrote to Shared Memory WITHOUT acquiring mutex lock! Data buffer corrupted.`,
            },
            ...state.log,
          ],
        };
      }

      return {
        ...state,
        ipcState: {
          ...state.ipcState,
          sharedBuffer: data,
          lastWriteByPid: pid,
          raceConditionDetected: false,
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IPC_WRITE',
            message: `[SAFE WRITE] PID ${pid} wrote to locked buffer: "${data}"`,
          },
          ...state.log,
        ],
      };
    }

    case 'IPC_SEND_MESSAGE': {
      const { fromPid, toPid, text } = action.payload;
      const newMsg = {
        id: state.ipcState.messageQueue.length + 1,
        fromPid,
        toPid,
        text,
        timestamp: ts,
      };

      return {
        ...state,
        ipcState: {
          ...state.ipcState,
          messageQueue: [...state.ipcState.messageQueue, newMsg],
        },
        log: [
          {
            id: nextLogId,
            timestamp: ts,
            type: 'IPC_MSG',
            message: `[MESSAGE PASSING] Kernel mailbox received packet from PID ${fromPid} -> PID ${toPid}: "${text}" (no manual locks required)`,
          },
          ...state.log,
        ],
      };
    }

    case 'CLEAR_LOG': {
      return {
        ...state,
        log: [
          {
            id: 1,
            timestamp: ts,
            type: 'SYSTEM',
            message: 'Kernel event log cleared.',
          },
        ],
      };
    }

    case 'RESET_SIMULATION': {
      return getInitialState();
    }

    case 'LOAD_PRESET_SCENARIO': {
      const scenarioName = action.payload;
      const baseState = getInitialState();

      if (scenarioName === 'starvation') {
        // Create 5 processes to instantly fill queue
        const p1 = createProcess({ name: 'Video Encoder 1', priority: 5, burstTime: 180, customPid: 1001 });
        const p2 = createProcess({ name: 'Video Encoder 2', priority: 5, burstTime: 180, customPid: 1002, existingProcesses: [p1] });
        const p3 = createProcess({ name: 'Video Encoder 3', priority: 5, burstTime: 180, customPid: 1003, existingProcesses: [p1, p2] });
        const p4 = createProcess({ name: 'Video Encoder 4', priority: 5, burstTime: 180, customPid: 1004, existingProcesses: [p1, p2, p3] });
        const p5 = createProcess({ name: 'Video Encoder 5', priority: 5, burstTime: 180, customPid: 1005, existingProcesses: [p1, p2, p3, p4] });

        return {
          ...baseState,
          processes: [p1, p2, p3, p4, p5],
          readyQueue: [1001, 1002, 1003, 1004, 1005],
          log: [
            {
              id: 1,
              timestamp: ts,
              type: 'STARVATION_ALERT',
              message: 'Scenario Loaded: "Ready Queue Starvation Wall" — 5 processes queued, hard cap reached.',
            },
          ],
        };
      }

      if (scenarioName === 'zombie_demo') {
        const parent = createProcess({ name: 'Parent Web Server', priority: 7, burstTime: 300, customPid: 1001 });
        const child = createProcess({ name: 'Worker Child Script', priority: 5, burstTime: 40, parentPid: 1001, customPid: 1002, existingProcesses: [parent] });
        child.state = PROCESS_STATES.ZOMBIE;
        child.isZombie = true;
        child.remainingTime = 0;

        return {
          ...baseState,
          processes: [parent, child],
          readyQueue: [1001],
          log: [
            {
              id: 1,
              timestamp: ts,
              type: 'ZOMBIE_CREATED',
              pid: 1002,
              message: 'Scenario Loaded: "Zombie Process" — Child PID 1002 terminated, awaiting parent PID 1001 reap.',
            },
          ],
        };
      }

      return baseState;
    }

    default:
      return state;
  }
}
