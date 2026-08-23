import React, { useState } from 'react';

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Why does the OS kernel assign isolated virtual memory ranges to each spawned PCB?',
    options: [
      {
        id: 'a',
        text: 'To accelerate CPU clock frequency on multi-core processors.',
        isCorrect: false,
        explanation: 'CPU clock speed is a hardware frequency property and is unrelated to virtual memory isolation.',
      },
      {
        id: 'b',
        text: 'To prevent one buggy or malicious process from corrupting another process’s code, stack, and heap.',
        isCorrect: true,
        explanation: 'Correct! Memory protection via base/limit registers and MMU page tables guarantees process isolation so one faulting program cannot overwrite another.',
      },
      {
        id: 'c',
        text: 'To avoid generating unique Process Identifiers (PIDs).',
        isCorrect: false,
        explanation: 'PIDs are kernel integer identifiers allocated independently of memory ranges.',
      },
    ],
  },
  {
    id: 'q2',
    question: 'What constitutes the direct computational cost (overhead) during a Context Switch?',
    options: [
      {
        id: 'a',
        text: 'Saving the active CPU registers/PC to the old PCB, restoring new registers, and flushing cache/TLB entries.',
        isCorrect: true,
        explanation: 'Correct! During a context switch, the CPU spends non-productive cycles saving the current register state, loading the incoming process context, and suffering cache misses.',
      },
      {
        id: 'b',
        text: 'Recompiling the source code of the incoming process.',
        isCorrect: false,
        explanation: 'Processes in the ready queue are already compiled machine binaries; compilation never happens during context switching.',
      },
      {
        id: 'c',
        text: 'Zero time cost — modern CPUs perform instantaneous register swapping without latency.',
        isCorrect: false,
        explanation: 'Context switching always incurs pure overhead (typically several microseconds), during which the CPU does no useful application work.',
      },
    ],
  },
  {
    id: 'q3',
    question: 'What creates a "Zombie" process in POSIX-compliant Operating Systems?',
    options: [
      {
        id: 'a',
        text: 'A process that exceeds its CPU quantum in Round Robin scheduling.',
        isCorrect: false,
        explanation: 'When a quantum expires, the process simply transitions from Running back to the Ready queue.',
      },
      {
        id: 'b',
        text: 'A child process that terminated, but whose parent has not yet called wait() to read its exit code.',
        isCorrect: true,
        explanation: 'Correct! The kernel retains the child’s minimal PCB and exit status so the parent can inspect it. It remains a "zombie" until the parent calls wait() (reaping).',
      },
      {
        id: 'c',
        text: 'A process with priority 0 that never receives CPU time.',
        isCorrect: false,
        explanation: 'That is called CPU starvation, not a zombie process.',
      },
    ],
  },
  {
    id: 'q4',
    question: 'What happens to an "Orphan" process when its parent process terminates first?',
    options: [
      {
        id: 'a',
        text: 'The orphan process is immediately terminated by the kernel with SIGKILL.',
        isCorrect: false,
        explanation: 'Orphaned processes are not killed; background daemons often deliberately orphan themselves to run independently.',
      },
      {
        id: 'b',
        text: 'It is adopted by the init process (PID 1 / systemd), which periodically reaps its exit status upon completion.',
        isCorrect: true,
        explanation: 'Correct! PID 1 adopts orphaned processes and serves as their default parent to ensure their exit status is reaped when they finish.',
      },
      {
        id: 'c',
        text: 'It takes over the parent’s PID and execution stack.',
        isCorrect: false,
        explanation: 'PIDs and stacks are strictly immutable and never inherited in this manner.',
      },
    ],
  },
  {
    id: 'q5',
    question: 'Why did an unsynchronized write in the IPC Shared Memory playground trigger a race condition?',
    options: [
      {
        id: 'a',
        text: 'Because shared memory requires manual mutex locking to enforce mutual exclusion on the shared buffer.',
        isCorrect: true,
        explanation: 'Correct! Shared memory provides zero-copy high performance, but the operating system does not automatically synchronize writes. Programmers must acquire a mutex or semaphore.',
      },
      {
        id: 'b',
        text: 'Because message queues are physically faster than RAM buffers.',
        isCorrect: false,
        explanation: 'Shared memory is faster than message passing because message passing copies data into and out of kernel space.',
      },
      {
        id: 'c',
        text: 'Because the Ready Queue reached starvation limit.',
        isCorrect: false,
        explanation: 'Ready queue depth is a scheduling constraint, completely decoupled from memory concurrency.',
      },
    ],
  },
];

export default function KnowledgeQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (optionId) => {
    if (hasSubmitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;
    setHasSubmitted(true);
    const chosen = currentQ.options.find((o) => o.id === selectedOption);
    if (chosen?.isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setCurrentIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
  };

  const chosenOptionObj = currentQ.options.find((o) => o.id === selectedOption);

  return (
    <div className="sandbox-panel quiz-panel" aria-labelledby="quiz-title">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="panel-badge-code">KNOWLEDGE_CHECK</span>
          <h3 id="quiz-title" className="panel-title">OS Concepts Diagnostic Quiz</h3>
        </div>
        <div className="quiz-progress-pill font-mono">
          <span>Question {currentIdx + 1} / {QUIZ_QUESTIONS.length}</span>
          <span className="score-tag">Score: {score}</span>
        </div>
      </div>

      <div className="quiz-card font-mono">
        <div className="quiz-question-text font-body">
          <strong>{currentQ.question}</strong>
        </div>

        <div className="quiz-options-list" role="radiogroup" aria-label={currentQ.question}>
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            let optionStateClass = '';
            if (hasSubmitted) {
              if (opt.isCorrect) optionStateClass = 'option-correct';
              else if (isSelected && !opt.isCorrect) optionStateClass = 'option-incorrect';
            } else if (isSelected) {
              optionStateClass = 'option-selected';
            }

            return (
              <button
                key={opt.id}
                type="button"
                className={`quiz-option-btn ${optionStateClass}`}
                onClick={() => handleSelect(opt.id)}
                role="radio"
                aria-checked={isSelected}
                disabled={hasSubmitted}
              >
                <span className="opt-letter font-mono">{opt.id.toUpperCase()}</span>
                <span className="opt-text font-body">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Section */}
        {hasSubmitted && (
          <div className={`quiz-feedback-box ${chosenOptionObj?.isCorrect ? 'feedback-success' : 'feedback-error'}`}>
            <div className="feedback-status-row font-mono">
              <span className="feedback-icon">{chosenOptionObj?.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}</span>
            </div>
            <p className="feedback-explanation font-body">
              {chosenOptionObj?.explanation}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="quiz-controls-row font-mono">
          {!hasSubmitted ? (
            <button
              type="button"
              className="quiz-action-btn submit-btn"
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Check Answer
            </button>
          ) : (
            <button
              type="button"
              className="quiz-action-btn next-btn"
              onClick={handleNext}
            >
              {currentIdx === QUIZ_QUESTIONS.length - 1 ? 'Restart Quiz ↺' : 'Next Question ➔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
