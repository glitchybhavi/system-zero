import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom simulation clock hook with play, pause, single-step, and speed controls.
 */
export function useSimulationClock({
  onTick,
  baseIntervalMs = 400,
  initialRunning = false,
}) {
  const [isRunning, setIsRunning] = useState(initialRunning);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2, 4
  const [tickCount, setTickCount] = useState(0);

  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const play = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const togglePlay = useCallback(() => setIsRunning((prev) => !prev), []);

  const step = useCallback(() => {
    setIsRunning(false);
    setTickCount((prev) => prev + 1);
    if (onTickRef.current) {
      onTickRef.current(40);
    }
  }, []);

  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(newSpeed);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const intervalTime = Math.max(50, Math.round(baseIntervalMs / speed));
    const timerId = setInterval(() => {
      setTickCount((prev) => prev + 1);
      if (onTickRef.current) {
        onTickRef.current(30);
      }
    }, intervalTime);

    return () => clearInterval(timerId);
  }, [isRunning, speed, baseIntervalMs]);

  return {
    isRunning,
    speed,
    tickCount,
    play,
    pause,
    togglePlay,
    step,
    changeSpeed,
  };
}
