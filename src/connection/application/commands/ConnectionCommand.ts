import type { ExecutionTarget } from '../../../shared/domain/factories/CommandExecutorFactory.js';
import type { DatabaseConnectionProps } from '../../../shared/domain/value-objects/ConnectionConfig.js';

export interface ConnectionCommand {
  connection: DatabaseConnectionProps;
  execution: ExecutionTarget;
}
