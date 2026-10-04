import type { DatabaseConnectionProps } from '../../domain/value-objects/ConnectionConfig.js';

export type ExecutionTarget = { mode: 'local' } | { mode: 'docker'; container: string };

export interface CreateBackupCommand {
  connection: DatabaseConnectionProps;
  execution: ExecutionTarget;
  outputDir: string;
}
