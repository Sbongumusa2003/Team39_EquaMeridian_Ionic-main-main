export interface BackupFileDto {
  fileName: string;
  sizeBytes: number;
  createdAtUtc: string;
}

export interface RestoreBackupRequest {
  fileName: string;
  confirmOverride: boolean;
}
