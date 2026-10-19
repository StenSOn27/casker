export class UnsupportedDatabaseError extends Error {
  constructor(type: string) {
    super(`Unsupported database type: ${type}`);
    this.name = 'UnsupportedDatabaseError';
  }
}
