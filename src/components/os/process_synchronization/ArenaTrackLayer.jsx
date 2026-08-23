export default function ArenaTrackLayer({
  gate0Locked = false,
  gate1Locked = false,
  gate2Locked = false,
  tracks,
  singleBay = false,
  multiBay = 1,
  baysLocked = null,
  activeBay = 0,
}) {
  const trackList = tracks && Array.isArray(tracks) ? tracks : [
    { id: 0, top: '32%', locked: gate0Locked },
    { id: 1, top: '68%', locked: gate1Locked },
  ];

  if (multiBay === 3) {
    const topValues = trackList.map((t) => parseFloat(t.top));
    const minTop = Math.min(...topValues, 14);
    const maxTop = Math.max(...topValues, 86);
    const bayTops = ['22%', '50%', '78%'];
    const lockedArray = baysLocked || [gate0Locked, gate1Locked, gate2Locked];
    const isAllLocked = lockedArray.every(Boolean);

    return (
      <div className="arena-track-layer" role="presentation">
        <div
          className={`funnel-vertical-spine ${isAllLocked ? 'locked' : 'unlocked'}`}
          style={{
            top: `${minTop}%`,
            height: `${maxTop - minTop}%`,
          }}
        />

        {bayTops.map((topVal, idx) => {
          const isBayLocked = Boolean(lockedArray[idx]);
          return (
            <div
              key={`funnel-entry-${idx}`}
              className={`funnel-center-entry ${isBayLocked ? 'locked' : 'unlocked'}`}
              style={{ top: topVal }}
            />
          );
        })}

        {bayTops.map((topVal, idx) => {
          const isBayLocked = Boolean(lockedArray[idx]);
          return (
            <div
              key={`gate-node-${idx}`}
              className={`track-gate-node ${isBayLocked ? 'locked' : 'unlocked'}`}
              style={{ top: topVal, left: 'calc(50% - 325px)' }}
            >
              <div className={`gate-pin ${isBayLocked ? 'locked' : 'unlocked'}`} />
              <span className={`gate-label ${isBayLocked ? 'locked' : 'unlocked'}`}>
                {isBayLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>
          );
        })}

        {trackList.map((t, idx) => {
          const topVal = t.top;
          return (
            <div key={`feeder-${t.id ?? idx}`}>
              <div
                className="rail-conduit rail-conduit-entry"
                style={{ top: topVal, right: 'calc(50% + 325px)' }}
              >
                <div className="pipe-glow-line" />
                <div className="pipe-ring ring-1" />
                <div className="pipe-ring ring-2" />
              </div>
            </div>
          );
        })}

        {bayTops.map((topVal, idx) => (
          <div key={`exit-${idx}`} className="rail-conduit rail-conduit-exit" style={{ top: topVal }}>
            <div className="pipe-glow-line" />
            <div className="pipe-ring ring-1" />
            <div className="pipe-ring ring-2" />
          </div>
        ))}

        {bayTops.map((topVal, idx) => (
          <span key={`term-${idx}`} className="track-terminated-label" style={{ top: topVal }}>
            Terminated
          </span>
        ))}
      </div>
    );
  }

  if (singleBay) {
    const topValues = trackList.map((t) => parseFloat(t.top));
    const minTop = Math.min(...topValues, 14);
    const maxTop = Math.max(...topValues, 86);
    const isLocked = Boolean(gate0Locked);

    return (
      <div className="arena-track-layer" role="presentation">
        <div
          className="funnel-vertical-spine"
          style={{
            top: `${minTop}%`,
            height: `${maxTop - minTop}%`,
          }}
        />

        <div className="funnel-center-entry" />

        <div
          className={`track-gate-node ${isLocked ? 'locked' : 'unlocked'}`}
          style={{ top: '50%', left: 'calc(50% - 325px)' }}
        >
          <div className={`gate-pin ${isLocked ? 'locked' : 'unlocked'}`} />
          <span className={`gate-label ${isLocked ? 'locked' : 'unlocked'}`}>
            {isLocked ? 'Locked' : 'Unlocked'}
          </span>
        </div>

        {trackList.map((t, idx) => {
          const topVal = t.top;
          return (
            <div key={`feeder-${t.id ?? idx}`}>
              <div
                className="rail-conduit rail-conduit-entry"
                style={{ top: topVal, right: 'calc(50% + 325px)' }}
              >
                <div className="pipe-glow-line" />
                <div className="pipe-ring ring-1" />
                <div className="pipe-ring ring-2" />
              </div>
            </div>
          );
        })}

        <div className="rail-conduit rail-conduit-exit" style={{ top: '50%' }}>
          <div className="pipe-glow-line" />
          <div className="pipe-ring ring-1" />
          <div className="pipe-ring ring-2" />
        </div>

        <span className="track-terminated-label" style={{ top: '50%' }}>
          Terminated
        </span>
      </div>
    );
  }

  return (
    <div className="arena-track-layer" role="presentation">
      <div className="rail-conduit rail-conduit-entry rail-p0">
        <div className="pipe-glow-line" />
        <div className="pipe-ring ring-1" />
        <div className="pipe-ring ring-2" />
      </div>
      <div className="rail-conduit rail-conduit-entry rail-p1">
        <div className="pipe-glow-line" />
        <div className="pipe-ring ring-1" />
        <div className="pipe-ring ring-2" />
      </div>

      <div className={`track-gate-node gate-p0 ${gate0Locked ? 'locked' : 'unlocked'}`}>
        <div className={`gate-pin ${gate0Locked ? 'locked' : 'unlocked'}`} />
        <span className={`gate-label ${gate0Locked ? 'locked' : 'unlocked'}`}>
          {gate0Locked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      <div className={`track-gate-node gate-p1 ${gate1Locked ? 'locked' : 'unlocked'}`}>
        <div className={`gate-pin ${gate1Locked ? 'locked' : 'unlocked'}`} />
        <span className={`gate-label ${gate1Locked ? 'locked' : 'unlocked'}`}>
          {gate1Locked ? 'Locked' : 'Unlocked'}
        </span>
      </div>

      <div className="rail-conduit rail-conduit-exit rail-p0">
        <div className="pipe-glow-line" />
        <div className="pipe-ring ring-1" />
        <div className="pipe-ring ring-2" />
      </div>
      <div className="rail-conduit rail-conduit-exit rail-p1">
        <div className="pipe-glow-line" />
        <div className="pipe-ring ring-1" />
        <div className="pipe-ring ring-2" />
      </div>

      <span className="track-terminated-label terminated-p0">Terminated</span>
      <span className="track-terminated-label terminated-p1">Terminated</span>
    </div>
  );
}



