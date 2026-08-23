import { getPodPosClass, getPodStatusText } from './syncUtils';

export default function ProcessPod({ proc, track = 0, isExiting = false, style = {} }) {
  if (!proc) return null;

  const currentTrack = proc.track !== undefined ? proc.track : track;
  const topPos = proc.top !== undefined ? proc.top : (currentTrack === 0 ? '32%' : '68%');
  const isWaiting = proc.status === 'waiting' || proc.status === 'busy-waiting';
  const isBusyWait = Boolean(proc.isSabotaged && isWaiting);
  const isBottleneck = Boolean(proc.status === 'in-bay' && proc.stopwatch);

  return (
    <div
      className={`animated-pod ${getPodPosClass(proc.status)} ${proc.fading ? 'pod-fading' : ''}`}
      style={{
        top: topPos,
        background: 'rgba(20, 20, 25, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: isBottleneck ? 'rgba(251, 191, 36, 0.7)' : isBusyWait ? 'rgba(244, 63, 94, 0.6)' : 'rgba(255, 255, 255, 0.08)',
        boxShadow: isBottleneck
          ? `0 4px 16px rgba(0, 0, 0, 0.5), 0 0 18px rgba(251, 191, 36, 0.5)`
          : isBusyWait
          ? `0 4px 14px rgba(0, 0, 0, 0.4), 0 0 16px rgba(244, 63, 94, 0.45)`
          : `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc.color}30`,
        ...style,
      }}
      title={!isExiting ? `Process P${proc.id} (Line ${proc.line})` : undefined}
      role="status"
      aria-label={`Process ${proc.id}, state ${proc.status}, local register ${proc.local ?? 'empty'}`}
    >
      <div className="pod-id-tag" style={{ color: proc.color }}>
        P{proc.id}
      </div>

      <div className="pod-info-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {proc.stopwatch && (
            <span className="sabotage-stopwatch-badge" style={isBottleneck ? { background: 'rgba(251, 191, 36, 0.2)', borderColor: 'rgba(251, 191, 36, 0.7)', color: '#fde68a' } : {}}>
              ⏱️ {proc.stopwatch}
            </span>
          )}
          <span className="pod-register-val">
            Local: {proc.local !== null && proc.local !== undefined ? `₹${proc.local}` : '--'}
          </span>
        </div>
        <span className={`pod-state-pill ${isBottleneck ? 'bottleneck-pill' : isBusyWait ? 'busy-waiting' : isWaiting ? 'waiting' : ''}`}>
          {proc.statusText || (isBottleneck ? `HOLDING LOCK (${proc.stopwatch})` : isBusyWait ? 'BUSY WAITING' : getPodStatusText(proc.status))}
        </span>
      </div>
    </div>
  );
}
