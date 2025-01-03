export const formatTime = (seconds: number): { minutes: string; seconds: string } => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return {
    minutes: mins.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0'),
  };
};

export const minutesToSeconds = (minutes: number): number => minutes * 60;