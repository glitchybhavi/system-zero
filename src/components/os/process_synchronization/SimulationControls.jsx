
export default function SimulationControls({
  mode = 'manual',
  setMode,
  speed = 1,
  setSpeed,
  onStepTrack,
  proc0,
  proc1,
  maxLine0 = 6,
  maxLine1 = 6,
  isP0Disabled = false,
  isP1Disabled = false,
  onReset,
  resetLabel = '↺ Reset Simulation (₹100)',
}) {
  const sliderFillPercent = ((speed - 0.5) / (2.0 - 0.5)) * 100;

  const disableP0 = isP0Disabled || !proc0 || proc0.line >= maxLine0 || proc0.fading;
  const disableP1 = isP1Disabled || !proc1 || proc1.line >= maxLine1 || proc1.fading;

  return (
    <form className="controls-panel glass-panel" onSubmit={(e) => e.preventDefault()}>
      <div>
        <header className="control-section-header">Conveyor Controls</header>

        <div className="control-group" style={{ marginTop: '8px' }}>
          <label>Execution Mode</label>
          <div className="segmented-control" role="group" aria-label="Simulation Stepper Mode">
            <button
              type="button"
              className={`segmented-btn ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
            >
              Manual
            </button>
            <button
              type="button"
              className={`segmented-btn ${mode === 'auto' ? 'active' : ''}`}
              onClick={() => setMode('auto')}
            >
              Auto
            </button>
          </div>
        </div>
      </div>

      {mode === 'manual' ? (
        <div className="control-group">
          <label>Manual Thread Step</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn-track"
              onClick={() => onStepTrack(0)}
              disabled={disableP0}
              style={{
                flex: 1,
                '--btn-border': proc0?.color,
                '--btn-color': proc0?.color,
                '--btn-glow': `${proc0?.color}30`,
              }}
            >
              Step P{proc0?.id ?? 0}
            </button>
            <button
              type="button"
              className="btn-track"
              onClick={() => onStepTrack(1)}
              disabled={disableP1}
              style={{
                flex: 1,
                '--btn-border': proc1?.color,
                '--btn-color': proc1?.color,
                '--btn-glow': `${proc1?.color}30`,
              }}
            >
              Step P{proc1?.id ?? 1}
            </button>
          </div>
        </div>
      ) : (
        <div className="control-group">
          <label htmlFor="sim-speed-slider">Simulation Speed ({speed}x)</label>
          <div className="slider-wrapper">
            <input
              id="sim-speed-slider"
              type="range"
              className="custom-range-slider"
              min="0.5"
              max="2"
              step="0.5"
              value={speed}
              style={{
                '--fill-percent': `${sliderFillPercent}%`,
              }}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
            <div className="slider-ticks">
              <span
                className={`slider-tick ${speed === 0.5 ? 'active' : ''}`}
                onClick={() => setSpeed(0.5)}
              >
                0.5x
              </span>
              <span
                className={`slider-tick ${speed === 1.0 ? 'active' : ''}`}
                onClick={() => setSpeed(1.0)}
              >
                1.0x
              </span>
              <span
                className={`slider-tick ${speed === 2.0 ? 'active' : ''}`}
                onClick={() => setSpeed(2.0)}
              >
                2.0x
              </span>
            </div>
          </div>
        </div>
      )}

      <button type="button" className="btn-reset" onClick={onReset}>
        {resetLabel}
      </button>
    </form>
  );
}
