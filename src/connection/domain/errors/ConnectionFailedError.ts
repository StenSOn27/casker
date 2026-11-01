export class ConnectionFailedError extends Error {
  constructor(public readonly reason: string) {
    super(`Connection failed: ${reason}`);
    this.name = 'ConnectionFailedError';
  }
}
