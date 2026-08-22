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