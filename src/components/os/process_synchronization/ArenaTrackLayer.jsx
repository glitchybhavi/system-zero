export default function ArenaTrackLayer({ gate0Locked = false, gate1Locked = false }) {
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
