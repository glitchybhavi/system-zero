import AnimatedBalance from './AnimatedBalance';

export default function CriticalSectionZone({
  proc0,
  proc1,
  busPacket0,
  busPacket1,
  sharedBalance,
  expectedBalance,
  drift = 0,
  vaultPulse = false,
  alarmActive = false,
  title = 'Shared Vault',
  variableName = 'Balance',
  csLabel = 'Critical Section',
}) {
  return (
    <section
      className={`critical-section-zone ${alarmActive ? 'vault-alarm-active' : ''}`}
      aria-label="Critical Section Shared Memory Zone"
    >
      <div className="cs-bays-column" role="group" aria-label="Execution Docking Bays">
        <div className="docking-socket socket-p0">
          <span className="socket-bay-name" style={{ color: proc0?.color }}>
            Bay 0
          </span>
          <span className="socket-status-dot" style={{ background: proc0?.color }} />
        </div>

        <div className="docking-socket socket-p1">
          <span className="socket-bay-name" style={{ color: proc1?.color }}>
            Bay 1
          </span>
          <span className="socket-status-dot" style={{ background: proc1?.color }} />
        </div>
      </div>

      <div className="cs-connectors-column" role="presentation">
        <div className="bus-conduit-wrapper">
          <div className="bus-conduit">
            {busPacket0?.type && (
              <div key={`pkt0-${busPacket0.id}`} className={`currency-token flow-${busPacket0.type}`}>
                <span className="currency-pill">
                  ₹{busPacket0.type === 'load' ? busPacket0.value : '10'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bus-conduit-wrapper">
          <div className="bus-conduit">
            {busPacket1?.type && (
              <div key={`pkt1-${busPacket1.id}`} className={`currency-token flow-${busPacket1.type}`}>
                <span className="currency-pill">
                  ₹{busPacket1.type === 'load' ? busPacket1.value : '10'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <article
        className={`shared-vault-memory ${vaultPulse ? 'pulse-update' : ''} ${alarmActive ? 'vault-alarm-flash' : ''}`}
        aria-label={`${title} Storage`}
      >
        <header className="vault-title-label">{title}</header>
        <AnimatedBalance value={sharedBalance} />
        <span className="vault-variable-tag">{variableName}</span>

        <footer className="vault-audit-stats">
          <span className="expected-stat">Expected: ₹{expectedBalance}</span>
          {drift > 0 && <span className="drift-stat">Lost: -₹{drift}</span>}
        </footer>
      </article>

      <footer className={`cs-underneath-title ${alarmActive ? 'alarm-active' : ''}`}>
        {csLabel}
      </footer>
    </section>
  );
}
