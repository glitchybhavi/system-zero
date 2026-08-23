import React from 'react';
import { useProcessSandbox } from '../state/ProcessSandboxContext';

export default function GuidedWalkthrough() {
  const { state, guidedSteps, setGuidedStep, setMode } = useProcessSandbox();
  const { guidedStepIndex, settings } = state;

  if (settings.mode !== 'guided') return null;

  const currentStep = guidedSteps[guidedStepIndex] || guidedSteps[0];
  const isDone = currentStep.isCompleted(state);

  return (
    <div className="guided-banner" role="region" aria-label="Guided Scenario Instructions">
      <div className="guided-header">
        <div className="guided-step-counter font-mono">
          <span className="step-tag">GUIDED LAB SCENARIO</span>
          <span className="step-num">Step {guidedStepIndex + 1} of {guidedSteps.length}</span>
        </div>

        <div className="guided-mode-toggle font-mono">
          <button
            type="button"
            className="freeplay-switch-btn"
            onClick={() => setMode('freeplay')}
            title="Disable guided tooltips and unlock all controls"
          >
            Switch to Free-Play Mode ➔
          </button>
        </div>
      </div>

      <div className="guided-body">
        <div className="guided-main-content">
          <h4 className="guided-title font-heading">{currentStep.title}</h4>
          <p className="guided-objective font-body">{currentStep.objective}</p>
          <p className="guided-hint font-mono text-faint">💡 <strong>Action:</strong> {currentStep.hint}</p>
        </div>

        <div className="guided-status-box font-mono">
          {isDone ? (
            <div className="step-complete-badge">
              <span className="badge-icon">🎉</span>
              <span>Objective Met!</span>
              {guidedStepIndex < guidedSteps.length - 1 && (
                <button
                  type="button"
                  className="next-step-btn"
                  onClick={() => setGuidedStep(guidedStepIndex + 1)}
                >
                  Continue to Step {guidedStepIndex + 2} ➔
                </button>
              )}
            </div>
          ) : (
            <div className="step-pending-badge">
              <span className="pulse-dot" />
              <span>Awaiting Step Action...</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="guided-progress-dots" role="tablist">
        {guidedSteps.map((s, idx) => {
          const stepDone = s.isCompleted(state);
          const isCurrent = idx === guidedStepIndex;
          return (
            <button
              key={s.step}
              type="button"
              className={`prog-dot ${isCurrent ? 'is-current' : ''} ${stepDone ? 'is-done' : ''}`}
              onClick={() => setGuidedStep(idx)}
              title={s.title}
              role="tab"
              aria-selected={isCurrent}
            >
              <span className="font-mono">{idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
