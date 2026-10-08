import type { ExecutionTarget } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export interface CreateBackupCommand {
  connection: DatabaseConnectionProps;
  execution: ExecutionTarget;
  outputDir: string;
}
