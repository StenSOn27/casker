export class RestoreFailedError extends Error {
  constructor(public readonly reason: string) {
    super(`Restore failed: ${reason}`);
    this.name = 'RestoreFailedError';
  }
}
