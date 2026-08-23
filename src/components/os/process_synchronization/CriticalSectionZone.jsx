import AnimatedBalance from './AnimatedBalance';

export default function CriticalSectionZone({
  proc0,
  proc1,
  activeProc,
  activeBay = 0,
  singleBay = false,
  bays = null,
  busPackets = null,
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
  bay0Label,
  bay1Label,
}) {
  if (bays && Array.isArray(bays) && bays.length > 0) {
    return (
      <section
        className={`critical-section-zone ${alarmActive ? 'vault-alarm-active' : ''}`}
        aria-label="Critical Section Shared Memory Zone"
      >
        <div
          className="cs-bays-column"
          style={{
            justifyContent: 'space-around',
            gap: '6px',
            padding: '2px 0',
          }}
          role="group"
          aria-label="Multi Execution Docking Bays"
        >
          {bays.map((b, idx) => {
            const isOccupied = Boolean(b.proc);
            const bText = b.label || (isOccupied ? `Bay ${idx}: P${b.proc.id}` : `Bay ${idx} (Available)`);
            const bColor = isOccupied ? b.proc.color : '#34d399';

            return (
              <article
                key={`multi-bay-${idx}`}
                className={`docking-socket socket-bay-${idx}`}
                style={{
                  height: bays.length === 3 ? '46px' : '56px',
                  ...(isOccupied
                    ? {
                        borderColor: `${b.proc.color}80`,
                        background: `${b.proc.color}20`,
                        boxShadow: `0 0 16px ${b.proc.color}35`,
                      }
                    : {}),
                }}
              >
                <span className="socket-bay-name" style={{ color: bColor, fontSize: '0.84rem' }}>
                  {bText}
                </span>
                <span
                  className="socket-status-dot"
                  style={{
                    background: bColor,
                    boxShadow: isOccupied ? `0 0 10px ${b.proc.color}` : '0 0 6px #34d399',
                  }}
                />
              </article>
            );
          })}
        </div>

        <div
          className="cs-connectors-column"
          style={{
            justifyContent: 'space-around',
            gap: '6px',
            padding: '6px 0',
          }}
          role="presentation"
        >
          {bays.map((_, idx) => {
            const pkt = busPackets?.[idx] || (idx === 0 ? busPacket0 : busPacket1);
            return (
              <div key={`conduit-wrap-${idx}`} className="bus-conduit-wrapper">
                <div className="bus-conduit" style={{ height: '7px' }}>
                  {pkt?.type && (
                    <div key={`pkt-multi-${idx}-${pkt.id}`} className={`currency-token flow-${pkt.type}`}>
                      <span
                        className="currency-pill"
                        style={pkt.color ? { borderColor: `${pkt.color}80`, color: pkt.color } : {}}
                      >
                        ₹{pkt.type === 'load' ? pkt.value : '10'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

  if (singleBay) {
    const isOccupied = Boolean(activeProc);
    const bText = bay0Label || (isOccupied ? `Bay 0: P${activeProc.id} (Executing)` : 'Bay 0 (Available)');
    const bColor = isOccupied ? activeProc.color : '#34d399';

    return (
      <section
        className={`critical-section-zone ${alarmActive ? 'vault-alarm-active' : ''}`}
        aria-label="Critical Section Shared Memory Zone"
      >
        <div className="cs-bays-column" style={{ justifyContent: 'center' }} role="group" aria-label="Single Central Execution Bay">
          <article
            className="docking-socket socket-p0"
            style={{
              height: '66px',
              ...(isOccupied ? { borderColor: `${activeProc.color}80`, background: `${activeProc.color}20`, boxShadow: `0 0 20px ${activeProc.color}35` } : {}),
            }}
          >
            <span className="socket-bay-name" style={{ color: bColor, fontSize: '0.95rem' }}>
              {bText}
            </span>
            <span
              className="socket-status-dot"
              style={{
                background: bColor,
                boxShadow: isOccupied ? `0 0 10px ${activeProc.color}` : '0 0 6px #34d399',
              }}
            />
          </article>
        </div>

        <div className="cs-connectors-column" style={{ justifyContent: 'center' }} role="presentation">
          <div className="bus-conduit-wrapper">
            <div className="bus-conduit" style={{ height: '10px' }}>
              {busPacket0?.type && (
                <div key={`pkt0-${busPacket0.id}`} className={`currency-token flow-${busPacket0.type}`}>
                  <span className="currency-pill" style={busPacket0.color ? { borderColor: `${busPacket0.color}80`, color: busPacket0.color } : {}}>
                    ₹{busPacket0.type === 'load' ? busPacket0.value : '10'}
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

  const isBay0Active = Boolean(activeProc && activeBay === 0);
  const isBay1Active = Boolean(activeProc && activeBay === 1);

  const b0Text = bay0Label || (isBay0Active ? `Bay 0: P${activeProc.id}` : activeProc ? 'Bay 0 (Locked)' : 'Bay 0 (Ready)');
  const b1Text = bay1Label || (isBay1Active ? `Bay 1: P${activeProc.id}` : activeProc ? 'Bay 1 (Locked)' : 'Bay 1 (Ready)');

  const b0Color = isBay0Active ? activeProc.color : proc0?.color || 'var(--text-muted)';
  const b1Color = isBay1Active ? activeProc.color : proc1?.color || 'var(--text-muted)';

  return (
    <section
      className={`critical-section-zone ${alarmActive ? 'vault-alarm-active' : ''}`}
      aria-label="Critical Section Shared Memory Zone"
    >
      <div className="cs-bays-column" role="group" aria-label="Execution Docking Bays">
        <article
          className="docking-socket socket-p0"
          style={isBay0Active ? { borderColor: `${activeProc.color}70`, background: `${activeProc.color}18`, boxShadow: `0 0 15px ${activeProc.color}25` } : {}}
        >
          <span className="socket-bay-name" style={{ color: b0Color }}>
            {b0Text}
          </span>
          <span className="socket-status-dot" style={{ background: b0Color }} />
        </article>

        <article
          className="docking-socket socket-p1"
          style={isBay1Active ? { borderColor: `${activeProc.color}70`, background: `${activeProc.color}18`, boxShadow: `0 0 15px ${activeProc.color}25` } : {}}
        >
          <span className="socket-bay-name" style={{ color: b1Color }}>
            {b1Text}
          </span>
          <span className="socket-status-dot" style={{ background: b1Color }} />
        </article>
      </div>

      <div className="cs-connectors-column" role="presentation">
        <div className="bus-conduit-wrapper">
          <div className="bus-conduit">
            {busPacket0?.type && (
              <div key={`pkt0-${busPacket0.id}`} className={`currency-token flow-${busPacket0.type}`}>
                <span className="currency-pill" style={busPacket0.color ? { borderColor: `${busPacket0.color}80`, color: busPacket0.color } : {}}>
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
                <span className="currency-pill" style={busPacket1.color ? { borderColor: `${busPacket1.color}80`, color: busPacket1.color } : {}}>
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



