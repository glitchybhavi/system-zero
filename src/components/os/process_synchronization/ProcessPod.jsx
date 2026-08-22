import { getPodPosClass, getPodStatusText } from './syncUtils';

export default function ProcessPod({ proc, track = 0, isExiting = false }) {
  if (!proc) return null;

  const currentTrack = proc.track !== undefined ? proc.track : track;
  const topPos = currentTrack === 0 ? '32%' : '68%';
  const isWaiting = proc.status === 'waiting';

  return (
    <div
      className={`animated-pod ${getPodPosClass(proc.status)} ${proc.fading ? 'pod-fading' : ''}`}
      style={{
        top: topPos,
        background: 'rgba(20, 20, 25, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        boxShadow: `0 4px 14px rgba(0, 0, 0, 0.4), 0 2px 10px ${proc.color}30`,
      }}
      title={!isExiting ? `Process P${proc.id} (Line ${proc.line})` : undefined}
      role="status"
      aria-label={`Process ${proc.id}, state ${proc.status}, local register ${proc.local ?? 'empty'}`}
    >
      <div className="pod-id-tag" style={{ color: proc.color }}>
        P{proc.id}
      </div>

      <div className="pod-info-group">
        <span className="pod-register-val">
          Local: {proc.local !== null && proc.local !== undefined ? `₹${proc.local}` : '--'}
        </span>
        <span className={`pod-state-pill ${isWaiting ? 'waiting' : ''}`}>
          {getPodStatusText(proc.status)}
        </span>
      </div>
export default function ProcessPod({ id, state, local }) {
  const isExecuting = state >= 2 && state <= 4;
  return (
    <div 
      className={`process-pod pod-p${id}`} 
      data-state={state} 
      role="status" 
      aria-label={`Process ${id}, state ${state}`}
    >
      P{id} {isExecuting ? `(₹${local})` : ''}
    </div>
  );
}