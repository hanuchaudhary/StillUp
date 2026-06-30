import { useEffect, useState } from "react";

interface UseNextCheckCountdownProps {
  lastCheckedAt: string | null;
  interval: number;
}

export function useNextCheckCountdown({
  lastCheckedAt,
  interval,
}: UseNextCheckCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!lastCheckedAt) {
      setSecondsRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const lastCheck = new Date(lastCheckedAt).getTime();
      const nextCheck = lastCheck + interval * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((nextCheck - now) / 1000));
      return remaining;
    };

    setSecondsRemaining(calculateRemaining());

    const timer = setInterval(() => {
      setSecondsRemaining(calculateRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [lastCheckedAt, interval]);

  return secondsRemaining;
}

export function formatCountdown(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds <= 0) return "...";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}
