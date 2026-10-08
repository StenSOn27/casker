export class BackupFailedError extends Error {
  constructor(
    public readonly reason: string,
    public readonly filePath: string,
  ) {
    super(`Backup failed: ${reason}`);
    this.name = 'BackupFailedError';
  }
}
