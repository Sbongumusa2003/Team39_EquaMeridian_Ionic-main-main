export interface TimerConfigurationDto {
  timerConfigurationID: number;
  timerKey: string;
  description: string;
  intervalMinutes: number;
  quoteExpiryHours: number;
  isEnabled: boolean;
  lastRunAt?: string | null;
  lastRunExpiredCount?: number | null;
  updatedAt: string;
}

export interface UpdateTimerConfigurationRequest {
  intervalMinutes: number;
  quoteExpiryHours: number;
  isEnabled: boolean;
}
