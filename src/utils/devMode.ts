// Developer mode utilities for testing
// Only available in development environment

const DEV_MODE_KEY = 'tomatoclock-dev-mode';
const TIME_SCALE_KEY = 'tomatoclock-time-scale';

export interface DevModeConfig {
  enabled: boolean;
  timeScale: number; // 1 = normal, 10 = 10x faster, 60 = 1sec = 1min
}

export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

export function getDevModeConfig(): DevModeConfig {
  if (!isDevelopment()) {
    return { enabled: false, timeScale: 1 };
  }

  try {
    const stored = localStorage.getItem(DEV_MODE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }

  return { enabled: false, timeScale: 1 };
}

export function setDevModeConfig(config: DevModeConfig): void {
  if (!isDevelopment()) return;
  localStorage.setItem(DEV_MODE_KEY, JSON.stringify(config));
}

export function toggleDevMode(): DevModeConfig {
  const current = getDevModeConfig();
  const newConfig = { ...current, enabled: !current.enabled };
  setDevModeConfig(newConfig);
  return newConfig;
}

export function setTimeScale(scale: number): void {
  if (!isDevelopment()) return;
  const current = getDevModeConfig();
  setDevModeConfig({ ...current, timeScale: scale });
}

// Preset time scales
export const TIME_SCALES = [
  { label: '1x (Normal)', value: 1 },
  { label: '10x', value: 10 },
  { label: '30x', value: 30 },
  { label: '60x (1s=1min)', value: 60 },
  { label: '300x (1s=5min)', value: 300 },
  { label: '1500x (1s=25min)', value: 1500 },
];
