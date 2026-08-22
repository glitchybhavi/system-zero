export const INITIAL_BALANCE = 100;
export const INCREMENT_VALUE = 10;

export const generateProcessColor = (hue = Math.floor(Math.random() * 360)) => {
  return `hsl(${hue}, 45%, 70%)`;
};

export const getPodPosClass = (status) => {
  if (status === 'spawning') return 'pod-pos-spawning';
  if (status === 'ready' || status === 'waiting') return 'pod-pos-ready';
  if (status === 'terminated') return 'pod-pos-terminated';
  return 'pod-pos-bay';
};

export const getPodStatusText = (status) => {
  if (status === 'spawning' || status === 'ready') return 'Ready';
  if (status === 'waiting') return 'Waiting';
  if (status === 'terminated') return 'Exiting';
  return 'Executing';
};
